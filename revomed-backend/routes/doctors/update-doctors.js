//request for update doctor info
const express = require('express');
const router = express.Router();
const imageSettings  = require('../../modules/image-settings.js');
const jwt = require('../../modules/jwt.js');
const multer  = require('multer');
const crypto = require('crypto');
const mail = require("../../modules/mail.js");

const Doctor = require('../../models/Doctors.js');
const Seller = require('../../models/Sellers.js');
const Clinic = require('../../models/Clinics.js');

let upload = multer({ dest: 'uploads/' });
let storageConfig = multer.diskStorage({
	destination: (req, file, cb) =>{
		cb(null, "./uploads");
	},
	filename: function (req, file, cb) {
		let extArray = file.originalname.split(".");
		let extension = extArray[extArray.length - 1];
		cb(null, Date.now()+ '.' +extension)
	}
});
let fileFilter = (req, file, cb) => {
	if(file.mimetype === "image/png" || file.mimetype === "image/jpg"|| file.mimetype === "image/jpeg"){
		cb(null, true);
	} else{
		return cb(new Error('WRONG_MIME_TYPE'), false);
	}
}
let uploadLimits = {
  fileSize: 6 * 1024 * 1024, // 6 MB (max file size)
}
let cpUpload = multer({dest: './uploads', storage:storageConfig, limits: uploadLimits, fileFilter: fileFilter});

function validPassword(password, hash, salt) {
	let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
	return hash === hashVerify;
}
router.put('/doctors', cpUpload.single('avatarFile'), function (err, req, res, next) {
	if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
		if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
			next();
	})

router.put('/doctors', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	let updateInfoDoctor = {};
	let updateInfoAdmin = {};
	let updateInfoClinic = {};
	let workExperience = [];
	let education = [];
	let directions, salt, hash, hashVerify, status;;

	let updateDoctor = (updateInfo, id, clinicId = 0, clinic = false, mailSend = false, status = 0) => {
		Doctor.model.updateOne({idDoctor: id}, {$set: updateInfo}, {upsert: false}, (err, doc) => {
			if (err) {
				return res.send({success: false, message: 'Не удалось изменить данные'})
			} else {
				if (clinic) {
					Clinic.model.findOne({idClinic: clinicId}, (err, clinic) => {
						let price, priceOffline;
						let arrDoctor = clinic.doctors;
						let presence = arrDoctor.indexOf(id);
						if (presence == -1) {
							arrDoctor.push(id);
							if (req.body.category) {
								clinic.priceOffline.forEach(onePrice => {
									if (onePrice.category == req.body.category) priceOffline = onePrice.price;
								})
								clinic.price.forEach(onePrice => {
									if (onePrice.category == req.body.category) price = onePrice.price;
								})
							}
						}
						let clinicInfo = {
							doctors: arrDoctor,
							doctorsTotal: arrDoctor.length,
						}
						
						let doctorInfo = {
							shopID: clinic.shopID || "",
						}
						if (priceOffline) doctorInfo.priceOffline = priceOffline;
						if (price) doctorInfo.price = price;

						Clinic.model.updateOne({idClinic: clinicId}, {$set: clinicInfo}, {upsert: false}, (err, clinicUpdate) => {
							Doctor.model.updateOne({idDoctor: id}, {$set: doctorInfo}, {upsert: false}, (err, doctorUpdated) => {
								if ((mailSend) && (status == 2)) mail('approved', updateInfo.email, "Заявка одобрена", {}, updateInfo.fio);
								if ((mailSend) && (status == 3)) mail('reject', updateInfo.email, "Заявка отклонена", {}, updateInfo.fio);
								return res.send({success: true});
							})
						})
					})
				} else if ((clinicId) && (!clinic)) {
					Clinic.model.findOne({idClinic: clinicId}, (err, clinic) => {
						let arrDoctor = clinic.doctors;
						let presence = arrDoctor.indexOf(id);
						arrDoctor.splice(presence, 1);
						let clinicInfo = {
							doctors: arrDoctor,
							doctorsTotal: arrDoctor.length,
						}
						Clinic.model.updateOne({idClinic: clinicId}, {$set: clinicInfo}, {upsert: false}, (err, clinicUpdate) => {
							Doctor.model.updateOne({idDoctor: id}, {$set: {shopID: ""}}, {upsert: false}, (err, doctorUpdated) => {
								if ((mailSend) && (status == 2)) mail('approved', updateInfo.email, "Заявка одобрена", {}, updateInfo.fio);
								if ((mailSend) && (status == 3)) mail('reject', updateInfo.email, "Заявка отклонена", {}, updateInfo.fio);
								return res.send({success: true});
							})
						})
					})
				} else {
					if ((mailSend) && (status == 2)) mail('approved', updateInfo.email, "Заявка одобрена", {}, updateInfo.fio);
					if ((mailSend) && (status == 3)) mail('reject', updateInfo.email, "Заявка отклонена", {}, updateInfo.fio);
					return res.send({success: true});
				}
			}
		})
	}

	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
		if (!req.body.link) {
			let doctor = await Doctor.model.findOne({idDoctor: token.id})
			if (req.body.country) updateInfoDoctor.country = req.body.country;
			if (req.body.city) updateInfoDoctor.city = req.body.city;
			if (req.file) {
				await imageSettings.correctOrientation(req.file);
				/*let filename = imageSettings.compressImage(req.file, "doctor");
				updateInfoDoctor.avatar = '/uploads/' + filename;*/
				
				let filenames = imageSettings.compressImage(req.file, "doctor");
				console.log("filenames", filenames);
				updateInfoDoctor.avatar = '/uploads/' + filenames.imageJpeg;
				updateInfoDoctor.avatarWebp = '/uploads/' + filenames.imageWebp;
			}
			if (req.body.description) updateInfoDoctor.description = req.body.description;
			if (req.body.price) updateInfoDoctor.price = req.body.price;
			if (req.body.directions) {
				directions = JSON.parse(req.body.directions);
				updateInfoDoctor.directions = directions;
			}
			if (req.body.workExperience) {
				workExperience = JSON.parse(req.body.workExperience);
				updateInfoDoctor.workExperience = workExperience;
			}
			if (req.body.education) {
				education = JSON.parse(req.body.education);
				updateInfoDoctor.education = education;
			}
			if (req.body.timetable) updateInfoDoctor.timetable = req.body.timetable;
			if (req.body.newPassword) {
				let user = await Seller.model.findOne({login: doctor.email})
				hashVerify = crypto.pbkdf2Sync(req.body.oldPassword, user.salt, 10000, 64, 'sha512').toString('hex');
				if (hashVerify == user.password) {
					salt = crypto.randomBytes(32).toString('hex');
					hash = crypto.pbkdf2Sync(req.body.newPassword, salt, 10000, 64, 'sha512').toString('hex');
					await Seller.model.updateOne({login: doctor.email}, {$set: {password: hash, salt: salt}}, {upsert: false}) 
					updateDoctor(updateInfoDoctor, req.body.idDoctor);
				} else {
					return res.send({success: false, message: 'Старый пароль не правильный'});
				}
			} else {
				updateDoctor(updateInfoDoctor, token.id);
			}
		} else {
			let user = await Seller.model.findOne({link: req.body.link});
			salt = crypto.randomBytes(32).toString('hex');
			hash = crypto.pbkdf2Sync(req.body.newPassword, salt, 10000, 64, 'sha512').toString('hex');
			await Seller.model.updateOne({link: req.body.link}, {$set: {hash: hash, salt: salt}}, {upsert: false})
			updateDoctor(updateInfoDoctor, token.id);
		}
	} else if (token.role == "admin") {
		console.log("req.body", req.body);
		let modules = {
			promo: false,
		};
		if (req.body.promo) {
			modules.promo = JSON.parse(req.body.promo);
		}
		updateInfoAdmin.modules = modules;

		updateInfoAdmin.sex = req.body.sex;
		if (req.body.fio) updateInfoAdmin.fio = req.body.fio;
		if (req.body.name) updateInfoAdmin.name = req.body.name;
		if (req.body.category) {
			let doctorInfoCategory = await Doctor.model.findOne({idDoctor: req.body.idDoctor}, {category: 1});
			console.log("req.body.category", req.body.category);
			console.log("doctorInfoCategory", doctorInfoCategory);
			if (req.body.category !== doctorInfoCategory.category) {
				updateInfoAdmin.category = req.body.category;
				updateInfoAdmin.timetable = [];
			}
		}
		if (req.body.experience) updateInfoAdmin.experience = req.body.experience;
		if (req.body.country) updateInfoAdmin.country = req.body.country;
		if (req.body.email) updateInfoAdmin.email = req.body.email;
		if (req.body.city) updateInfoAdmin.city = req.body.city;
		if (req.body.shopID) updateInfoAdmin.shopID = String(req.body.shopID);
		if (req.body.licenseNumber) updateInfoAdmin.licenseNumber = req.body.licenseNumber;
		if (req.file) {
			updateInfoAdmin.avatar = '/' + req.file.path;
			await imageSettings.correctOrientation(req.file);
			let filename = imageSettings.compressImage(req.file, "doctor");
			updateInfoAdmin.avatar = '/uploads/' + filename;
		}
		if (req.body.description) updateInfoAdmin.description = req.body.description;
		if (req.body.price) updateInfoAdmin.price = req.body.price;

		if (req.body.idClinic !== '') {
			updateInfoAdmin.idClinic = req.body.idClinic;
			updateInfoAdmin.doctorType = 'clinic';

			
		} else {
			updateInfoAdmin.idClinic = null;
			updateInfoAdmin.doctorType = 'individual';
		}
		if (req.body.academicDegree) {
			if (req.body.academicDegree == 'doctor') updateInfoAdmin.academicDegree = 'Доктор медицинских наук';
			if (req.body.academicDegree == 'candidate') updateInfoAdmin.academicDegree = 'Кандидат медицинских наук';
			if (req.body.academicDegree == ' ') updateInfoAdmin.academicDegree = '';
		}
		if (req.body.directions) {
			directions = JSON.parse(req.body.directions);
			updateInfoAdmin.directions = directions;
		}
		if (req.body.workExperience) {
			workExperience = JSON.parse(req.body.workExperience);
			updateInfoAdmin.workExperience = workExperience;
		}
		if (req.body.education) {
			education = JSON.parse(req.body.education);
			updateInfoAdmin.education = education;
		}
		if (req.body.email) {
			let updatedEmail = await Seller.model.updateOne({ID: req.body.idDoctor, type: "doctor"}, {$set: {login: req.body.email}}, {upsert: false});
			updateInfoAdmin.email = req.body.email;
		}
		let status;
		if (req.body.status == "new") status = 1;
		if (req.body.status == "accepted") status = 2;
		if (req.body.status == "blocked") status = 3;
		let seller = await Seller.model.updateOne({ID: req.body.idDoctor, type: "doctor"}, {$set: {status: status}}, {upsert: false});
		console.log('updateInfoAdmin', updateInfoAdmin)
		if (+req.body.idClinic) {
			if (seller.nModified == 1) {
				updateDoctor(updateInfoAdmin, req.body.idDoctor, req.body.idClinic, true, true, status);
			} else {
				updateDoctor(updateInfoAdmin, req.body.idDoctor, req.body.idClinic, true);
			}
		} else {
			let doctorInfo = await Doctor.model.findOne({idDoctor: req.body.idDoctor}, {idClinic: 1})
			if (!doctorInfo) {
				if (seller.nModified == 1) {
					updateDoctor(updateInfoAdmin, req.body.idDoctor, 0, false, true, status);
				} else {
					updateDoctor(updateInfoAdmin, req.body.idDoctor);
				}
			}
			else {
				if (seller.nModified == 1) {
					updateDoctor(updateInfoAdmin, req.body.idDoctor, doctorInfo.idClinic, false, true, status);
				} else {
					updateDoctor(updateInfoAdmin, req.body.idDoctor, doctorInfo.idClinic);
				}
			}
		}
	} else if (token.role == "clinic") {
		console.log("req.body", req.body);
		if (req.body.adress && req.body.adress !== "") updateInfoClinic.adress = req.body.adress;
		else updateInfoClinic.adress = null;
		updateDoctor(updateInfoClinic, req.body.idDoctor);
	}
})

module.exports = router;
