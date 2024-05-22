// update info clinic
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer = require('multer');
const crypto = require('crypto');
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

router.put('/farms/articles', cpUpload.single('photo'), function(err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 1 МБ' })
    next();
})

router.put('/farms/articles', async (req, res, next) => {
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

    let info = {};

    if (!token) {
        return res.send({ success: false, message: 'Вы не авторизованы' });
    } else if (token.role == "farm") {

    	console.log("req.body", req.body)

        if (!req.body.idArticle) res.send({ success: false, message: 'Не удалось обновить информацию' });

        if (req.body.name) info.name = req.body.name;
        if (req.body.subcategories) info.subcategories = JSON.parse(req.body.subcategories);
        if (req.body.description) {
            info.description = JSON.parse(req.body.description);

            let currentDeacription = [];
            JSON.parse(req.body.description).blocks.filter(el => el.type == 'paragraph').forEach(item => currentDeacription.push(item.data.text))
            let clean = sanitizeHtml(currentDeacription.join(''), { allowedTags: ['p'] })
            let annotation = clean.slice(0, 220);
            if (annotation.length < clean.length) {
                annotation += '...';
            }
            info.annotation = annotation;
        }

        if (req.file) {
            //info.photo = '/' + req.file.path;
            let filenames = imageSettings.compressImage(req.file, 'post')
            console.log("filenames", filenames);
            info.photo = '/uploads/' + filenames.imageJpeg;
            info.photoWebp = '/uploads/' + filenames.imageWebp;
        }
        info.status = "checking";

        await Articles.model.updateOne({ idArticle: +req.body.idArticle }, { $set: info }, { upsert: false });
        return res.send({ success: true })

    } else if (token.role == "admin") {
    	console.log("req.body", req.body)
        if (!req.body.idArticle) res.send({ success: false, message: 'Не удалось обновить информацию' });
        if (req.body.status) info.status = req.body.status;
        if (req.body.message) info.message = req.body.message;
        await Articles.model.updateOne({ idArticle: +req.body.idArticle }, { $set: info }, { upsert: false });
        return res.send({ success: true })
    }
})

module.exports = router;