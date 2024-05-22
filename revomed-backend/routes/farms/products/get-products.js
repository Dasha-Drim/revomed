// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const {config} = require('../../../config/config.js');

const Product = require('../../../models/Products.js');


router.get('/farms/products', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "farm") return res.send({success: false, message: "У вас недостаточно прав"});
    let productsArr = [];
    let products = await Product.model.find({idFarm: token.id});

    for (product of products) {
        let name = product.name.slice(0, 55);
        let item = {
            name: name.length < product.name.length ? name + "..." : name,
            photo: config.backend + product.photo,
            idProduct: product.idProduct,
            status: product.status
        }
        productsArr.push(item);
    }
    return res.send({success: true, products: productsArr});
})


module.exports = router;