const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js'); 
const multer  = require('multer');
const imageSettings  = require('../../modules/image-settings.js');
const sanitizeHtml = require('sanitize-html');

const Post = require('../../models/Posts.js');

// POST REQUEST - ADD POST IN BLOG

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

router.post('/posts', cpUpload.single('photo'), function (err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 8 МБ' });
    next();
})

router.post('/posts', async (req, res, next) => {

	let id = 1;
	let path = req.file.path.replace(/[\\]/g,'/');

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'admin') {
		await imageSettings.correctOrientation(req.file);
		let filenames = imageSettings.compressImage(req.file, 'post')
		console.log("filenames", filenames);
		let photo = '/uploads/' + filenames.imageJpeg;
		let photoWebp = '/uploads/' + filenames.imageWebp;
		//newDoctor.avatarWebp = '/uploads/' + filenames.imageWebp;
		//let photo = '/uploads/' + filename;
		let posts = await Post.model.find({})
		if (posts.length !== 0) id = posts[posts.length-1].idPost + 1;
		let post = {
			title: req.body.title,
			description: JSON.parse(req.body.description),
			category: req.body.category,
			photo: photo,
			photoWebp: photoWebp,
			typeAuthor: req.body.typeAuthor,
			idPost: id,
		}

		let currentDeacription = [];
		JSON.parse(req.body.description).blocks.filter(el => el.type == 'paragraph').forEach(item => currentDeacription.push(item.data.text))
		let clean = sanitizeHtml(currentDeacription.join(''), {allowedTags: [ 'p' ]})
		let annotation = clean.slice(0, 220);
		if (annotation.length < clean.length) {
			annotation += '...';
		}
		post.annotation = annotation;
		if (req.body.idDoctor) post.author = req.body.idDoctor;
		if (req.body.idClinic) post.author = req.body.idClinic;
		if (req.body.author) post.author = req.body.author;
		let newPost = new Post.model(post);
		try {
			let savePost = await newPost.save()
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось добавить пост'});
		}		
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;