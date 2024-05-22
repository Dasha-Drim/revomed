// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const {config} = require('../../../config/config.js');

const Product = require('../../../models/Products.js');
const MainCategories = require('../../../models/MainCategories.js');
const Subcategories = require('../../../models/Subcategories.js');

router.get('/farms/products/:id([0-9]+)', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if ((token.role !== "farm") && (token.role !== "admin") && (token.role !== "client")) return res.send({success: false, message: "У вас недостаточно прав"});

    let product = await Product.model.findOne({idProduct: req.params.id});
    console.log("product", product)
    let item = {
        name: product.name,
        description: product.description,
        shops: product.shops,
        photo: config.backend + product.photo,
        subcategories: product.subcategories,
        idProduct: product.idProduct,
        status: product.status,
        message: {
            type: product.status === "show" ? "success" : product.status == "rejected" ? "error" : "checking",
            text: product.status === "show" ? "Всё отлично, продукт опубликован. Если Вы внесёте изменения, он отправится на повторную проверку" : product.status == "checking" ? "Мы проверяем продукт. Если всё отлично, статус сам изменится на “Опубликовано”" : product.message ? product.message : "",
        }
    }
    if (token.role == "admin") {
        let subcategoriesList = [];
        for (id of product.subcategories) {
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
    return res.send({success: true, product: item});
})


module.exports = router;