// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const imageSettings  = require('../../../modules/image-settings.js');

const Product = require('../../../models/Products.js');

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

router.post('/farms/products', cpUpload.single('photo'), function(err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' });
    next();
})

router.post('/farms/products', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "farm") return res.send({success: false, message: "У вас недостаточно прав"});
    console.log("req.body", req.body)
    console.log("req.file", req.file)
    if (!req.body.name || !req.body.description || !req.body.shops || !req.body.subcategories || (!req.file || !req.file.path)) return res.send({success: false, message: "Вы отправили не все данные"})
    let products = await Product.model.find({});
    let id = 1;
    let product = {
        name: req.body.name,
        description: req.body.description,
        shops: JSON.parse(req.body.shops),
        subcategories: JSON.parse(req.body.subcategories),
        photo: '/' + req.file.path,
        idFarm: token.id,
        idProduct: products.length == 0 ? id : products[products.length-1].idProduct + 1,
    }
    let filenames = imageSettings.compressImage(req.file, 'product');
    product.photo = '/uploads/' + filenames.imageJpeg;
    product.photoWebp = '/uploads/' + filenames.imageWebp;

    try {
        await new Product.model(product).save();
        return res.send({success: true});
    } catch (err) {
        console.log("err", err);
        return res.send(500, {success: false, message: err});
    }

})


module.exports = router;