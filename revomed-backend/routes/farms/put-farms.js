// update info clinic
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const multer  = require('multer');
const crypto = require('crypto');
const imageSettings  = require('../../modules/image-settings.js');

const Farm = require('../../models/Farms.js');
const Seller = require('../../models/Sellers.js');

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

router.put('/farms', cpUpload.single('logo'), function (err, req, res, next) {
	if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
		if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
			next();
	})

router.put('/farms', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	console.log("req.body CCC", req.body)
	console.log("req.file CCC", req.file)
	console.log("req.files CCC", req.files)

	let info = {};

	let updateFarm = async (updateInfo, id) => {
		try {
			console.log("updateInfo", updateInfo)
			await Farm.model.updateOne({idFarm: id}, {$set: updateInfo}, {upsert: false});
			return res.send({success: true});
		} catch(err) {
			console.log("err put-farm", err)
			return res.send({success: false, message: 'Не удалось изменить данные'});
		}
	}


	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "farm") {
		let farm = await Farm.model.findOne({idFarm: token.id});
		if (req.body.managerFio) info.managerFio = req.body.managerFio;
		if (req.body.managerPhone) info.managerPhone = req.body.managerPhone;

		
		if (req.file) {
			let filenames = imageSettings.compressImage(req.file, "clinic");
			console.log("filenames", filenames)
			info.logo = '/uploads/' + filenames.imageJpeg;
		}
		if (req.body.newPassword) {
			let user = await Seller.model.findOne({ID: farm.idFarm, type: "farm"});
			hashVerify = crypto.pbkdf2Sync(req.body.oldPassword, user.salt, 10000, 64, 'sha512').toString('hex');
			if (hashVerify == user.password) {
				salt = crypto.randomBytes(32).toString('hex');
				hash = crypto.pbkdf2Sync(req.body.newPassword, salt, 10000, 64, 'sha512').toString('hex');
				let seller = await Seller.model.updateOne({ID: farm.idFarm, type: "farm"}, {$set: {password: hash, salt: salt}})
				await updateFarm(info, token.id);
			} else {
				return res.send({success: false, message: 'Старый пароль не правильный'});
			}
		} else {
			await updateFarm(info, token.id);
		}
	} else if (token.role == "admin") {
		if (req.body.managerFio) info.managerFio = req.body.managerFio;
		if (req.body.managerPhone) info.managerPhone = req.body.managerPhone;
		if (req.body.name) info.name = req.body.name;
		if (req.body.license) info.license = req.body.license;
		if (req.body.INN) info.INN = req.body.INN;

		if (req.file) {
			let filenames = imageSettings.compressImage(req.file, "clinic");
			info.logo = '/uploads/' + filenames.imageJpeg;
		}

		if (req.body.email) {
			info.email = req.body.email;
			await Seller.model.updateOne({ID: req.body.idFarm, type: "clinic"}, {$set: {login: req.body.email}}, {upsert: false});
		}

		let status = (req.body.status == "new") ? 1 : (req.body.status == "accepted") ? 2 : (req.body.status == "blocked") ? 3 : 1;
		await Seller.model.updateOne({ID: req.body.idFarm, type: "farm"}, {$set: {status: status}}, {upsert: false});

		await updateFarm(info, req.body.idFarm);
	}
})

module.exports = router;