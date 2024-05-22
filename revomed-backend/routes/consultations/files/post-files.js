// post files for consultation
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js'); 
const multer  = require('multer');

const Consultation = require('../../../models/Consultations.js');

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
	let extArray = file.originalname.split(".");
	let extension = extArray[extArray.length - 1];
	if ((extension === 'svg') || (extension === 'gif')) {
		return cb(new Error('WRONG_MIME_TYPE'), false);
	} else {
		cb(null, true);
	}
}

let uploadLimits = {
  fileSize: 6 * 1024 * 1024, // 6 MB (max file size)
}

let cpUpload = multer({dest: './uploads', storage:storageConfig, limits: uploadLimits, fileFilter: fileFilter});

router.post('/consultations/files', cpUpload.any(), (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	let files = [];
	if (token.role == 'client') {
		req.files.forEach((file) =>{
			let path = file.path.replace(/[\\]/g,'/');
			let photo = '/' + path;
			let name = file.originalname;
			let oneFile = {
				path: photo,
				name: name,
			}
			files.push(oneFile);
		})
		Consultation.model.updateOne({idConsultation: req.body.idConsultation}, {$set: {files: files}}, {upsert: false}, (err, updated) => {
			if (!err) return res.send({success: true});
			return res.send({success: false, message: 'Не удалось прикрепить файлы'});
		})
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;