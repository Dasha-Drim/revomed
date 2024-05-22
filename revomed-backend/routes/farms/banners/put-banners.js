// update info clinic
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const crypto = require('crypto');
const imageSettings  = require('../../../modules/image-settings.js');

const Banners = require('../../../models/Banners.js');

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
	console.log("filefilefilefile", file)
	if(file.mimetype === "image/png" || file.mimetype === "image/jpg"|| file.mimetype === "image/jpeg" || file.mimetype === "image/gif"){
		cb(null, true);
	} else{
		return cb(new Error('WRONG_MIME_TYPE'), false);
	}
}
let uploadLimits = {
  fileSize: 10 * 1024 * 1024, // 10 MB (max file size)
}
let cpUpload = multer({dest: './uploads', storage:storageConfig, limits: uploadLimits, fileFilter: fileFilter});

router.put('/farms/banners', cpUpload.single('photo'), function (err, req, res, next) {
	if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
		if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 1 МБ' })
			next();
	})

router.put('/farms/banners', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	let info = {};

	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "farm") {

		if (!req.body.idBanner) res.send({success: false, message: 'Не удалось обновить информацию'});

		if (req.body.name) info.name = req.body.name;
		if (req.body.link) info.link = req.body.link;
		if (req.body.subcategories) info.subcategories =  JSON.parse(req.body.subcategories);

		/*if (req.file) {
			info.photo = '/' + req.file.path;
		}*/

		if (req.file) {
			console.log("req.file", req.file)

        if (req.file.mimetype === "image/gif") info.photo = '/' + req.file.path;
        else {
        	let filenames = imageSettings.compressImage(req.file, 'banner');
        	console.log("filenamesfilenames", filenames)
            info.photo = '/uploads/' + filenames.imageJpeg;
            info.photoWebp = '/uploads/' + filenames.imageWebp;
        }
      }

		info.status = "checking";

		await Banners.model.updateOne({idBanner: +req.body.idBanner}, {$set: info}, {upsert: false});
		return res.send({success: true})
		
	} else if (token.role == "admin") {
			if (!req.body.idBanner) res.send({success: false, message: 'Не удалось обновить информацию'});
			if (req.body.status) info.status = req.body.status;
			if (req.body.message) info.message = req.body.message;
			await Banners.model.updateOne({idBanner: +req.body.idBanner}, {$set: info}, {upsert: false});
			return res.send({success: true})
	}
})

module.exports = router;