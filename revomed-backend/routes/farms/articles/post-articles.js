// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const sanitizeHtml = require('sanitize-html');
const imageSettings  = require('../../../modules/image-settings.js');

const Articles = require('../../../models/Articles.js');

let upload = multer({ dest: 'uploads/' });
let storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        let extArray = file.originalname.split(".");
        let extension = extArray[extArray.length - 1];
        cb(null, Date.now() + '.' + extension)
    }
});
let fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        return cb(new Error('WRONG_MIME_TYPE'), false);
    }
}
let uploadLimits = {
    fileSize: 10 * 1024 * 1024, // 1 MB (max file size)
}
let cpUpload = multer({ dest: './uploads', storage: storageConfig, limits: uploadLimits, fileFilter: fileFilter });

router.post('/farms/articles', cpUpload.single('photo'), function(err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' });
    next();
})

router.post('/farms/articles', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "farm") return res.send({success: false, message: "У вас недостаточно прав"});
    console.log("req.body", req.body)
    console.log("req.file", req.file)
    if (!req.body.name || !req.body.description || !req.body.subcategories || !req.file) return res.send({success: false, message: "Вы отправили не все данные"})
    let articles = await Articles.model.find({});
    let id = 1;
    let currentDeacription = [];
    JSON.parse(req.body.description).blocks.filter(el => el.type == 'paragraph').forEach(item => currentDeacription.push(item.data.text))
    let clean = sanitizeHtml(currentDeacription.join(''), {allowedTags: [ 'p' ]})
    let annotation = clean.slice(0, 220);
    if (annotation.length < clean.length) {
        annotation += '...';
    }

    let filenames = imageSettings.compressImage(req.file, 'post')
    console.log("filenames", filenames);
    let photo = '/uploads/' + filenames.imageJpeg;
    let photoWebp = '/uploads/' + filenames.imageWebp;

    let article = {
        name: req.body.name,
        description: JSON.parse(req.body.description),
        subcategories: JSON.parse(req.body.subcategories),
        annotation: annotation,
        photo: photo,
        photoWebp: photoWebp,
        idFarm: token.id,
        author: token.id,
        idArticle: articles.length == 0 ? id : articles[articles.length-1].idArticle + 1,
    }
    // //author: String,
    try {
        await new Articles.model(article).save();
        return res.send({success: true});
    } catch (err) {
        console.log("err", err);
        return res.send(500, {success: false, message: err});
    }

})


module.exports = router;