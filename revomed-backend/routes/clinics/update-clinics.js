// update info clinic
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const multer  = require('multer');
const crypto = require('crypto');
const imageSettings  = require('../../modules/image-settings.js');

const Clinic = require('../../models/Clinics.js');
const Seller = require('../../models/Sellers.js');
const Doctor = require('../../models/Doctors.js');
const Categories = require('../../models/Categories.js');

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

router.put('/clinics', cpUpload.single('avatarFile'), function (err, req, res, next) {
	if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
		if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
			next();
	})

router.put('/clinics', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	let updateInfoClinic = {};
	let updateInfoAdmin = {};
	let item;
	let priceArr = [];

	console.log("req.body CCC", req.body)

	let updateClinic = (updateInfo, id) => {
		console.log("updateInfo", updateInfo)
		console.log("id", id)
		Clinic.model.updateOne({idClinic: id}, updateInfo, {upsert: false}, (err, clinicInfo) => {
			console.log("clinicInfo", clinicInfo);
			console.log("err", err);
			if (err) return res.send({success: false, message: 'Не удалось изменить данные'});
			return res.send({success: true});
		})
	}
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "clinic") {
		let clinic = await Clinic.model.findOne({idClinic: token.id});
		if (req.body.city) updateInfoClinic.city = req.body.city;
		if (req.body.country) updateInfoClinic.country = req.body.country;
		if ((req.body.offline === false)) updateInfoClinic.offline = 0;
		if ((req.body.offline) && (req.body.offline === true)) {
			updateInfoClinic.offline = 1;
			console.log("clinic.priceOffline", clinic.priceOffline)
			if (!clinic.priceOffline || clinic.priceOffline.length === 0) {
				let priceDefault = []
				let categories = await Categories.model.find();
				categories.forEach((el) => { priceDefault.push({ category: el.name, price: el.price, title: el.nameRu})});
				updateInfoClinic.priceOffline = priceDefault;
				let doctors = await Doctor.model.find({idClinic: token.id});
				for (doctor of doctors) {
					let doctorUpdateInfo = {};
					for (onePrice of updateInfoClinic.priceOffline) {
						if (onePrice.category == doctor.category) doctorUpdateInfo.priceOffline = onePrice.price;
					}
					await Doctor.model.updateOne({idDoctor: doctor.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
				}
			}
		}
		if (req.body.managerPosition) updateInfoClinic.managerPosition = req.body.managerPosition;
		if (req.body.adresses) {
			let adresses = JSON.parse(req.body.adresses);
			console.log("req.body.adresses", req.body.adresses)
			let newAdressesArray = [];
			for (let i = 1; i <= adresses.length; i++) {
				console.log("adresses[i]", adresses[i-1])
				if (!adresses[i-1].value && !adresses[i-1].adress) return res.send({success: false, message: 'Вы не указали адрес'});
				if (!adresses[i-1].name) return res.send({success: false, message: 'Вы не указали название адреса'});
				let adressItem = {name: adresses[i-1].name, adress: adresses[i-1].adress, value: adresses[i-1].value, id: i};
				newAdressesArray.push(adressItem);
				for (doctor of clinic.doctors) {
					let doctorItem = await Doctor.model.findOne({idDoctor: doctor});
					if (doctorItem.adress && (doctorItem.adress.id == i)) {
						await Doctor.model.updateOne({idDoctor: doctor}, {$set: {adress: {adress: adresses[i-1].adress, id: i}}}, {upsert: false});
					}
				}
			}
			updateInfoClinic.adresses = newAdressesArray;
		}
		if (req.body.managerPhone) updateInfoClinic.managerPhone = req.body.managerPhone;
		if (req.body.managerFio) {
			updateInfoClinic.managerFio = req.body.managerFio;
			let name = req.body.managerFio.split(' ', 2); 
			name = name[name.length-1];
			updateInfoClinic.managerName = name;
		}
		if (req.body.description) updateInfoClinic.description = req.body.description;
		if (req.file) {
			await imageSettings.correctOrientation(req.file);
			let filenames = imageSettings.compressImage(req.file, "clinic");
			//updateInfoClinic.logo = '/uploads/' + filename;

			updateInfoClinic.logo = '/uploads/' + filenames.imageJpeg;
			updateInfoClinic.logoWebp = '/uploads/' + filenames.imageWebp;
		}
		if (req.body.newPassword) {
			let user = await Seller.model.findOne({ID: clinic.idClinic});
			hashVerify = crypto.pbkdf2Sync(req.body.oldPassword, user.salt, 10000, 64, 'sha512').toString('hex');
			if (hashVerify == user.password) {
				salt = crypto.randomBytes(32).toString('hex');
				hash = crypto.pbkdf2Sync(req.body.newPassword, salt, 10000, 64, 'sha512').toString('hex');
				let seller = await Seller.model.updateOne({ID: clinic.idClinic}, {$set: {password: hash, salt: salt}})
				updateClinic(updateInfoClinic,token.id);
			} else {
				return res.send({success: false, message: 'Старый пароль не правильный'});
			}
		} else if (req.body.price) {
			for (price of clinic.price) {
				if (price.category == req.body.price.category) {
					item = {
						category: req.body.price.category,
						price: req.body.price.price,
						title: price.title,
					}
					priceArr.push(item)
				} else {
					priceArr.push(price)
				}
			}
			updateInfoClinic.price = priceArr;
			let doctors = await Doctor.model.find({idClinic: token.id});
			for (doctor of doctors) {
				let doctorUpdateInfo = {};
				for (onePrice of updateInfoClinic.price) {
					if (onePrice.category == doctor.category) doctorUpdateInfo.price = onePrice.price;
				}
				await Doctor.model.updateOne({idDoctor: doctor.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
			}
			updateClinic(updateInfoClinic, token.id);
		} else if (req.body.priceOffline) {
			let priceDefault = clinic.priceOffline;
			if (!priceDefault) {
				priceDefault = [];
				let category = await Categories.model.find();
				category.forEach((el) => { priceDefault.push({ category: el.name, price: el.price, title: el.nameRu})});
				priceDefault = priceDefault;
			}
			for (price of priceDefault) {
				if (price.category == req.body.priceOffline.category) {
					item = {
						category: req.body.priceOffline.category,
						price: req.body.priceOffline.price,
						title: price.title,
					}
					priceArr.push(item)
				} else {
					priceArr.push(price)
				}
			}
			updateInfoClinic.priceOffline = priceArr;
			let doctors = await Doctor.model.find({idClinic: token.id});
			for (doctor of doctors) {
				let doctorUpdateInfo = {};
				for (onePrice of updateInfoClinic.priceOffline) {
					if (onePrice.category == doctor.category) doctorUpdateInfo.priceOffline = onePrice.price;
				}
				await Doctor.model.updateOne({idDoctor: doctor.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
			}
			updateClinic(updateInfoClinic, token.id);
		} else {
			updateClinic(updateInfoClinic, token.id);
		}
	} else if (token.role == "admin") {
		console.log("req.body", req.body)
		let modules = {
			checkups: false,
			promo: false,
		};
		if (req.body.name) updateInfoAdmin.name = req.body.name;
		if (req.body.shopID) updateInfoAdmin.shopID = String(req.body.shopID);
		if (req.body.city) updateInfoAdmin.city = req.body.city;
		if (req.body.managerEmail) updateInfoAdmin.managerEmail = req.body.managerEmail;
		if (req.body.country) updateInfoAdmin.country = req.body.country;
		if (req.body.description) updateInfoAdmin.description = req.body.description;
		if (req.body.checkups) {
			modules.checkups = JSON.parse(req.body.checkups);
		}
		if (req.body.promo) {
			modules.promo = JSON.parse(req.body.promo);
		}
		updateInfoAdmin.modules = modules;
		console.log("modules", modules)
		if (req.file) {
			await imageSettings.correctOrientation(req.file);
			let filenames = imageSettings.compressImage(req.file, "clinic");
			updateInfoAdmin.logo = '/uploads/' + filenames.imageJpeg;
			updateInfoAdmin.logoWebp = '/uploads/' + filenames.imageWebp;
			//updateInfoAdmin.logo = '/uploads/' + filename;
		}
		if (req.body.licenseNumber) updateInfoAdmin.licenseNumber = req.body.licenseNumber;
		if (req.body.managerFio) updateInfoAdmin.managerFio = req.body.managerFio;
		if (req.body.managerPosition) updateInfoAdmin.managerPosition = req.body.managerPosition;
		if (req.body.price) {
			let price = JSON.parse(req.body.price);
			updateInfoAdmin.price = price;
		}
		let status = (req.body.status == "new") ? 1 : (req.body.status == "accepted") ? 2 : (req.body.status == "blocked") ? 3 : 1;
		await Seller.model.updateOne({ID: req.body.idClinic, type: "clinic"}, {$set: {status: status}}, {upsert: false});
		let clinic = await Clinic.model.findOne({idClinic: req.body.idClinic}, {doctors: 1});
		for (doctor of clinic.doctors) {
			await Doctor.model.updateOne({idDoctor: doctor}, {$set: {shopID: updateInfoAdmin.shopID}}, {upsert: false})
		}
		if (req.body.managerEmail) {
			updateInfoAdmin.managerEmail = req.body.managerEmail;
			await Seller.model.updateOne({ID: req.body.idClinic, type: "clinic"}, {$set: {login: req.body.managerEmail}}, {upsert: false});
		}
		updateClinic(updateInfoAdmin, req.body.idClinic);
	}
})

module.exports = router;