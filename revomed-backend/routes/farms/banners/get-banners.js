// request for registartion doctor and clinicDoctor
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const {config} = require('../../../config/config.js');

const Banner = require('../../../models/Banners.js');


router.get('/farms/banners', async (req, res, next) => {

    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "farm") return res.send({success: false, message: "У вас недостаточно прав"});
    let bannersArr = [];
    //await Banner.model.deleteMany({});
    let banners = await Banner.model.find({idFarm: token.id});

    console.log("banners", banners)

    for (banner of banners) {
        //let name = banner.name.slice(0, 55);
        let item = {
            name: banner.name,
            idBanner: banner.idBanner,
            status: banner.status,
            subcategories: banner.subcategories.length,
        }
        bannersArr.push(item);
    }
    return res.send({success: true, banners: bannersArr});
})


module.exports = router;