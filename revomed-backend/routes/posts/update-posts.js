//request for update post info from admin panel
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const jwt = require('../../modules/jwt.js');
const imageSettings  = require('../../modules/image-settings.js');
const sanitizeHtml = require('sanitize-html');

const Post = require('../../models/Posts.js');

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
  fileSize: 8 * 1024 * 1024, // 8 MB (max file size)
}

let cpUpload = multer({dest: './uploads', storage:storageConfig, limits: uploadLimits, fileFilter: fileFilter});

router.put('/posts', cpUpload.single('photo'), (err, req, res, next) => {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 8 МБ' });
    next();
})
router.put('/posts', async (req, res, next) => {
	let updateInfo = {};
	let currentDeacription = [];
	if (req.file) {
		await imageSettings.correctOrientation(req.file);
		//let filename = imageSettings.compressImage(req.file, 'post');
		let filenames = imageSettings.compressImage(req.file, 'post')
		updateInfo.photo = '/uploads/' + filenames.imageJpeg;
		updateInfo.photoWebp = '/uploads/' + filenames.imageWebp;
	}
	if (req.body.title) updateInfo.title = req.body.title;
	if (req.body.description) {
		updateInfo.description = JSON.parse(req.body.description);
		JSON.parse(req.body.description).blocks.filter(el => el.type == 'paragraph').forEach(item => currentDeacription.push(item.data.text))
		let clean = sanitizeHtml(currentDeacription.join(''), {allowedTags: [ 'p' ]})
		let annotation = clean.slice(0, 220);
		if (annotation.length < clean.length) annotation += '...';
		updateInfo.annotation = annotation;
	}
	if (req.body.typeAuthor) updateInfo.typeAuthor = req.body.typeAuthor;
	if (req.body.author) updateInfo.author = req.body.author;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'admin') {
		let id = JSON.parse(req.body.id);
		await Post.model.updateOne({idPost: +id}, updateInfo, {upsert: false})
		return res.send({success: true})

	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;