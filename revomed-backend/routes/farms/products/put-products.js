// update info clinic
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const crypto = require('crypto');
const imageSettings  = require('../../../modules/image-settings.js');

const Products = require('../../../models/Products.js');

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
  fileSize: 10 * 1024 * 1024, // 1 MB (max file size)
}
let cpUpload = multer({dest: './uploads', storage:storageConfig, limits: uploadLimits, fileFilter: fileFilter});

router.put('/farms/products', cpUpload.single('photo'), function (err, req, res, next) {
	if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
		if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 1 МБ' })
			next();
	})

router.put('/farms/products', async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	let info = {};

	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "farm") {

		if (!req.body.idProduct) res.send({success: false, message: 'Не удалось обновить информацию'});

		if (req.body.name) info.name = req.body.name;
		if (req.body.description) info.description = req.body.description;
		if (req.body.shops) info.shops = JSON.parse(req.body.shops);
		if (req.body.subcategories) info.subcategories =  JSON.parse(req.body.subcategories);

		

		if (req.file) {
         let filenames = imageSettings.compressImage(req.file, 'product')
            info.photo = '/uploads/' + filenames.imageJpeg;
            info.photoWebp = '/uploads/' + filenames.imageWebp;
        }

		info.status = "checking";

		await Products.model.updateOne({idProduct: +req.body.idProduct}, {$set: info}, {upsert: false});
		return res.send({success: true})
		
	} else if (token.role == "admin") {
			if (!req.body.idProduct) res.send({success: false, message: 'Не удалось обновить информацию'});
			if (req.body.status) info.status = req.body.status;
			if (req.body.message) info.message = req.body.message;
			await Products.model.updateOne({idProduct: +req.body.idProduct}, {$set: info}, {upsert: false});
			return res.send({success: true})
	}
})

module.exports = router;