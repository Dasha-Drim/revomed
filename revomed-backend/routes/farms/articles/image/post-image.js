//request for update doctor info
const express = require('express');
const router = express.Router();
const imageSettings = require('../../../../modules/image-settings.js');
const jwt = require('../../../../modules/jwt.js');
const {config} = require('../../../../config/config.js');
const multer = require('multer');

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
    fileSize: 6 * 1024 * 1024, // 6 MB (max file size)
}
let cpUpload = multer({ dest: './uploads', storage: storageConfig, limits: uploadLimits, fileFilter: fileFilter });


router.post('/farms/articles/image', cpUpload.single('image'), function(err, req, res, next) {

    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
    next();
})

router.post('/farms/articles/image', async (req, res, next) => {
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

    console.log("req.file", req.file);
    console.log("req.body", req.body);
    if (req.file) {

        let filenames = imageSettings.compressImage(req.file, "post");
        console.log("filenames", filenames);
        let photo = '/uploads/' + filenames.imageJpeg;
        let photoWebp = '/uploads/' + filenames.imageWebp;
        let url = config.backend + photo;
        setTimeout(() => {return res.send({ success: 1, file: {url}})}, 1000)
    }
    /*{
    "success" : 1,
    "file": {
        "url" : "https://www.tesla.com/tesla_theme/assets/img/_vehicle_redesign/roadster_and_semi/roadster/hero.jpg",
        // ... and any additional fields you want to store, such as width, height, color, extension, etc
    }
}*/
    
})

module.exports = router;