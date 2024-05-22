// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer = require('multer');
const imageSettings  = require('../../../modules/image-settings.js');

const Banner = require('../../../models/Banners.js');

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

router.post('/farms/banners', cpUpload.single('photo'), function(err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 1 МБ' });
    next();
})

router.post('/farms/banners', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "farm") return res.send({ success: false, message: "У вас недостаточно прав" });
    console.log("req.body", req.body)
    console.log("stringyfy", );
    if (!req.body.name || !req.body.link || !req.body.subcategories || !req.file.path) return res.send({ success: false, message: "Вы отправили не все данные" })
    if (!JSON.parse(req.body.subcategories).length) return res.send({ success: false, message: "Вы не указали категории" })
    let banners = await Banner.model.find({});
    let id = 1;

    let banner = {
        name: req.body.name,
        link: req.body.link,
        subcategories: JSON.parse(req.body.subcategories),
        idFarm: token.id,
        idBanner: banners.length == 0 ? id : banners[banners.length - 1].idBanner + 1,
    }

    let filenames = imageSettings.compressImage(req.file, 'banner');
    banner.photo = '/uploads/' + filenames.imageJpeg;
    banner.photoWebp = '/uploads/' + filenames.imageWebp;

    try {

        await new Banner.model(banner).save();
        return res.send({ success: true });
    } catch (err) {
        console.log("err", err);
        return res.send(500, { success: false, message: err });
    }

})


module.exports = router;