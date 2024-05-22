// registation clinic
const express = require('express');
const router = express.Router();
const passport = require('../../modules/passport.js');
const verify  = require('../../modules/verify.js');
const petrovich = require('petrovich');
const mail = require("../../modules/mail.js");
const multer  = require('multer');
ObjectId = require('mongodb').ObjectID;

const Clinic = require('../../models/Clinics.js');
const Category = require('../../models/Categories.js');

let upload = multer({ dest: 'uploads/' });
let storageConfig = multer.diskStorage({
	destination: (req, file, cb) =>{
		cb(null, "./uploads");
	},
	filename: (req, file, cb) => {
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

let randomString = (i) => {
	let rnd = '';
	while (rnd.length < i) 
		rnd += Math.random().toString(9).substring(2);
	return rnd.substring(0, i);
};
router.post('/clinics', cpUpload.single('licenseFile'), function (err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
    next();
})
router.post('/clinics',  (req, res, next) => {
	let license;
	let priceDefault = [];

	let errVerifyClinicInfo = verify.verifyDataClinic(req.body);
	if (errVerifyClinicInfo) {
		return res.send({success: false, message: errVerifyClinicInfo})
	} else {
		passport.authenticate('registration-clinic', {session: false }, (err, user, info) => {
			if (!user) {
				return res.send({success: false, message: info.message});
			}
			let newClinic = {
				name: req.body.name,
				managerFio: req.body.managerFio,
				managerPosition: req.body.managerPosition,
				managerPhone: req.body.managerPhone,
				typeOrg: req.body.typeOrg,
				country: req.body.country,
				city: req.body.city,
				licenseNumber: req.body.licenseNumber,
				licenseFile: '/' + req.file.path,
			}
			let name = req.body.managerFio.split(' ', 2); 
			name = name[name.length-1];

			let link = Math.random().toString(36).slice(-10);

			newClinic.managerName = name;
			newClinic.link = link;

			Category.model.find().exec((err, items) => {
				items.forEach((el) => { priceDefault.push({ category: el.name, price: el.price, title: el.nameRu})});
				newClinic.price = priceDefault;
				newClinic.priceOffline = priceDefault;
				Clinic.model.updateOne({_id: ObjectId(user._id)}, newClinic, {upsert: false}, (err, clinic) => {
					if (err) return res.send(500, {error: err});
					mail('admin', 'daria@unicreate.ru', "Новая регистрация на revomed.ru", {text: "Зарегистрировалась новая клиника " + newClinic.name});
					return res.send({success: true});
				});
			})
		})(req, res, next);
	}
});

module.exports = router;