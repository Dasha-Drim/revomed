// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const jwt = require('../../../modules/jwt.js');
const { config } = require('../../../config/config.js');

const Article = require('../../../models/Articles.js');
const Farms = require('../../../models/Farms.js');
const MainCategories = require('../../../models/MainCategories.js');
const Subcategories = require('../../../models/Subcategories.js');

router.get('/farms/articles/:id([0-9]+)', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if ((token.role !== "farm") && (token.role !== "admin") && (token.role !== "client")) return res.send({ success: false, message: "У вас недостаточно прав" });
    //let articlesArr = [];
    let article = await Article.model.findOne({ idArticle: req.params.id });

    let item = {
        name: article.name,
        description: article.description,
        subcategories: article.subcategories,
        idArticle: article.idArticle,
        status: article.status,
        photo: config.backend + article.photo,
        photoWebp: config.backend + article.photoWebp,
        date:  article.date,
        message: {
            type: article.status === "show" ? "success" : article.status == "rejected" ? "error" : "checking",
            text: article.status === "show" ? "Всё отлично, статья опубликована. Если Вы внесёте изменения, она отправится на повторную проверку" : article.status == "checking" ? "Мы проверяем статью. Если всё отлично, статус сам изменится на “Опубликовано”" : article.message ? article.message : "",
        }
    }

    let farm = await Farms.model.findOne({idFarm: article.idFarm});
    item.author = farm.name;

    if (token.role == "admin") {
        let subcategoriesList = [];
        for (id of article.subcategories) {
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

    return res.send({ success: true, article: item });
})


module.exports = router;