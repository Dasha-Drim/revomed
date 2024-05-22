// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const {config} = require('../../../config/config.js');

const Banner = require('../../../models/Banners.js');
const MainCategories = require('../../../models/MainCategories.js');
const Subcategories = require('../../../models/Subcategories.js');

router.get('/farms/banners/:id([0-9]+)', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if ((token.role !== "farm") && (token.role !== "admin") && (token.role !== "client")) return res.send({success: false, message: "У вас недостаточно прав"});

    let banner = await Banner.model.findOne({idBanner: req.params.id});
    console.log("banner", banner)
    let item = {
        name: token.role == "client" ? "" : banner.name,
        link: banner.link,
        photo: config.backend + banner.photo,
        idBanner:  banner.idBanner,
        subcategories: token.role == "client" ? "" : banner.subcategories,
        status: banner.status,
        message: {
            type: banner.status === "show" ? "success" : banner.status == "rejected" ? "error" : "checking",
            text: banner.status === "show" ? "Всё отлично, баннер опубликован. Если Вы внесёте изменения, он отправится на повторную проверку" : banner.status == "checking" ? "Мы проверяем баннер. Если всё отлично, статус сам изменится на “Опубликовано”" : banner.message ? banner.message : "",
        }
    }
    if (token.role == "admin") {
        let subcategoriesList = [];
        for (id of banner.subcategories) {
            let subcategory = await Subcategories.model.findOne({idSubcategory: +id});
            let category = await MainCategories.model.findOne({idCategory: +subcategory.idCategory});
            console.log("category", category)
            console.log("subcategory", subcategory)
            let index = subcategoriesList.findIndex(item => item.idCategory == +subcategory.idCategory);
            if (index == -1) {
                subcategoriesList.push({idCategory: +subcategory.idCategory, name: category.name, subcategories: [{name: subcategory.name}]});
            } else {
                subcategoriesList[index].subcategories.push({name: subcategory.name});
            }
        }
        item.subcategories = subcategoriesList;
    }
    return res.send({success: true, banner: item});
})


module.exports = router;