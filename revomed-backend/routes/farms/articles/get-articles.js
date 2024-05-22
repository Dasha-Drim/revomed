// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const jwt = require('../../../modules/jwt.js');
const {config} = require('../../../config/config.js');

const Article = require('../../../models/Articles.js');


router.get('/farms/articles', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "farm") return res.send({success: false, message: "У вас недостаточно прав"});
    let articlesArr = [];
    let articles = await Article.model.find({idFarm: token.id});

    for (article of articles) {
       
        let item = {
            name: article.name,
            annotation: article.annotation,
            idArticle: article.idArticle,
            status: article.status,
        }
        articlesArr.push(item);
    }
    return res.send({success: true, articles: articlesArr});
})


module.exports = router;