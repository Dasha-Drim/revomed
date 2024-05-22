// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const {config} = require('../../../config/config.js');

const {DateTime} = require('luxon');

const Products = require('../../../models/Products.js');
const Articles = require('../../../models/Articles.js');
const Banners = require('../../../models/Banners.js');
const Farms = require('../../../models/Farms.js');

router.get('/checking', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "admin") return res.send({success: false, message: "У вас недостаточно прав"});
    let arr = [];

    let products = await Products.model.find({});
    let articles = await Articles.model.find({});
    let banners = await Banners.model.find({});

    for (product of products) {
        let name = product.name.slice(0, 55);
        let item = {
            name: product.name,
            photo: config.backend + product.photo,
            idProduct: product.idProduct,
            status: product.status,
            date: product.date,
            type: "product"
        }
        let farm = await Farms.model.findOne({idFarm: product.idFarm});
        item.farm = farm.name;
        arr.push(item);
    }
    for (article of articles) {
        let name = product.name.slice(0, 55);
        let item = {
            name: article.name,
            photo: config.backend + article.photo,
            idArticle: article.idArticle,
            status: article.status,
            date: article.date,
            type: "article"
        }
        let farm = await Farms.model.findOne({idFarm: article.idFarm});
        item.farm = farm.name;
        arr.push(item);
    }
    for (banner of banners) {
        let name = product.name.slice(0, 55);
        let item = {
            name: banner.name,
            photo: config.backend + banner.photo,
            idBanner: banner.idBanner,
            status: banner.status,
            date: banner.date,
            type: "banner"
        }
        let farm = await Farms.model.findOne({idFarm: banner.idFarm});
        item.farm = farm.name;
        arr.push(item);
    }

    arr.sort((a, b) => {
        return a.date-b.date
    })

    arr.reverse();


    return res.send({success: true, items: arr});
})


module.exports = router;