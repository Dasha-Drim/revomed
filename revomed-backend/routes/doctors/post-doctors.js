// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const passport = require('../../modules/passport.js');
const verify  = require('../../modules/verify.js');
const mail = require("../../modules/mail.js");
const imageSettings  = require('../../modules/image-settings.js');
const petrovich = require('petrovich');
const multer  = require('multer');
const sharp = require('sharp');
ObjectId = require('mongodb').ObjectID;

const Doctor = require('../../models/Doctors.js');
const Category = require('../../models/Categories.js');
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

router.post('/doctors', cpUpload.any(), function (err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
    next();
})
router.post('/doctors', (req, res, next) => {
	
	let avatar, license, path, clinicDoctors;
	let passportPhotos = [];
	let workExperience = [];
	let education = [];
	let newDoctor = {};

	let updateDoctor = (doctor, user) => {
		Doctor.model.updateOne({_id: ObjectId(user._id)}, doctor, (err, doc) => {
			if (err) return res.send(500, {error: err});
			//mail('admin', 'revomed@yandex.ru', "Новая регистрация на revomed.ru", {text: "Зарегистрировался новый врач " + doctor.fio});
			return res.send({success: true});
		});
	}

	Category.model.findOne({ 'name' :  req.body.category }, (err, item) => {
		if (err) return done(err);
		if (!item) return res.send({success: false, message: 'Category not found'})
			let errVerifyDocInfo = verify.verifyDataDoctor(req.body);
		if (errVerifyDocInfo) {
			return res.send({success: false, message: errVerifyDocInfo})
		} else {
			passport.authenticate('registration-doctor', {session: false }, async (err, user, info) => {
				if (!user) return res.send({success: false, message: info.message});
				newDoctor = {
					fio: req.body.fio,
					category: req.body.category,
					experience: req.body.experience,
					country: req.body.country,
					city: req.body.city,
					licenseNumber: req.body.licenseNumber,
					sex: 1,
					rating: 5.0,
					academicDegree: (req.body.academicDegree == 'doctor') ? 'Доктор медицинских наук' : (req.body.academicDegree == 'candidate') ? 'Кандидат медицинских наук' : "",
				}

				workExperience.push({name: req.body.lastJob, start: "", end: "", current: false});
				workExperience.push({name: req.body.currentJob, start: "", end: "", current: true});

				req.body.education.forEach(el => { if (el !== "") education.push({name: el, start: "", end: ""})})

				let name = req.body.fio.split(' ', 2);
				name = name.join(' ');

				let lastArr = req.body.fio.split(' ');
				let sex = petrovich.detect_gender(lastArr[lastArr.length-1]);
				if (sex == "male") newDoctor.sex = 0;

				newDoctor.workExperience = workExperience;
				newDoctor.education = education;
				newDoctor.name = name;
				newDoctor.price = item.price;

				for (file of req.files) {
					if (file.fieldname == 'avatarFile') {
						let filenames = imageSettings.compressImage(file, "doctor");
						console.log("filenames", filenames);
						newDoctor.avatar = '/uploads/' + filenames.imageJpeg;
						newDoctor.avatarWebp = '/uploads/' + filenames.imageWebp;
					}
					if (file.fieldname == 'licenseFile') newDoctor.licenseFile = '/' + file.path;
					if (file.fieldname == 'passportFile') {
						path = '/' + file.path;
						passportPhotos.push(path);
					}
					await imageSettings.correctOrientation(file);
				}
				if (passportPhotos.length !== 0) newDoctor.passportFile = passportPhotos;
				if (req.body.link) {
					let clinic = await Clinic.model.findOne({link: req.body.link})
					newDoctor.doctorType = 'clinic';
					newDoctor.idClinic = clinic.idClinic;
					newDoctor.shopID = clinic.shopID || "";
					clinic.priceOffline.forEach(onePrice => {
						if (onePrice.category == req.body.category) newDoctor.priceOffline = onePrice.price;
					})
					clinic.price.forEach(onePrice => {
						if (onePrice.category == req.body.category) newDoctor.price = onePrice.price;
					})
					updateDoctor(newDoctor, user);
				} else {
					updateDoctor(newDoctor, user);
				}
			})(req, res, next);
		}
	})
});

module.exports = router;