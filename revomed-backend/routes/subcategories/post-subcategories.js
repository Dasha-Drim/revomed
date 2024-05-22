// request for registartion farms
const express = require('express');
const router = express.Router();
const mail = require("../../modules/mail.js");
const jwt = require('../../modules/jwt.js');
const crypto = require('crypto');
const multer  = require('multer');
const imageSettings  = require('../../modules/image-settings.js');
const CyrillicToTranslit = require('cyrillic-to-translit-js')

const MainCategories = require('../../models/MainCategories.js');
const Subcategories = require('../../models/Subcategories.js');

const cyrillicToTranslit = new CyrillicToTranslit();

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
  fileSize: 6 * 1024 * 1024, // 6 MB (max file size)
}
let cpUpload = multer({dest: './uploads', storage:storageConfig, limits: uploadLimits, fileFilter: fileFilter});

router.post('/subcategories', cpUpload.any(), function (err, req, res, next) {
    if (err.message === 'WRONG_MIME_TYPE') return res.send({ success: false, message: 'Файл неправильного формата. Доступные форматы для загрузки: PNG, JPG, JPEG.' })
    if (err.code === 'LIMIT_FILE_SIZE') return res.send({ success: false, message: 'Файл слишком большой. Максимальный размер файла: 6 МБ' })
    next();
})

router.post('/subcategories', async (req, res) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
	if (token.role !== "admin") return res.send({success: false, message: "У вас недостаточно прав"});
    

    let array = JSON.parse(req.body.categories);
    console.log("array", array)

    for (let i = 0; i < array.length; i++) {
        let idCategory = array[i].id ? array[i].id : null
        if (!idCategory) {
            let categories = await MainCategories.model.find({});
            idCategory = categories.length ? categories[categories.length - 1].idCategory+1 : 1;
            console.log("idCategory", idCategory)
            await MainCategories.model({idCategory: idCategory, name: array[i].name}).save();
        } else {
            await MainCategories.model.updateOne({idCategory: idCategory}, {$set: {name: array[i].name}}, {upsert: false});
        }
        console.log("array[i].subcategories", array[i].subcategories)
        for (let y = 0; y < array[i].subcategories.length; y++) {
            let idSubcategory = array[i].subcategories[y].id ? array[i].subcategories[y].id : null;
            let strUrl = array[i].name + " " + array[i].subcategories[y].name;
            let url = cyrillicToTranslit.transform(strUrl, '-').toLowerCase();
            console.log("url", url)
            if (!idSubcategory) {
                let subcategories = await Subcategories.model.find({});
                console.log("subcategories subcategories subcategories.length", subcategories.length)
                idSubcategory = subcategories.length ? subcategories[subcategories.length - 1].idSubcategory+1 : 1;
                console.log("idSubcategory", idSubcategory)
                await Subcategories.model({idCategory: idCategory, idSubcategory: idSubcategory, name: array[i].subcategories[y].name, url: url}).save();
            } else {
                await Subcategories.model.updateOne({idSubcategory: idSubcategory}, {$set: {name: array[i].subcategories[y].name, url: url}}, {upsert: false});
            }
            let file = req.files.find(item => item.fieldname == "photo_"+i+"_"+y);
            console.log("file", file)
            if (file) {
                let filenames = imageSettings.compressImage(file, "clinic");
                console.log("filenames", filenames);
                await Subcategories.model.updateOne({idSubcategory: idSubcategory}, {$set: {photo: '/uploads/' + filenames.imageJpeg}}, {upsert: false});
            }
        }
    }

    return res.send({success: true});

})


module.exports = router;