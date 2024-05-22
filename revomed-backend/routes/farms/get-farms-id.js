// request for get farms in admin panel
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const {config} = require('../../config/config.js');

const Farm = require('../../models/Farms.js');
const Seller = require('../../models/Sellers.js');

router.get('/farms/:id([0-9]+)', async (req, res, next) => {
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });

    if (token.role == "admin") {
        let seller = await Seller.model.findOne({idSeller: req.params.id});
        let farm = await Farm.model.findOne({idFarm: seller.ID});
        //console.log("farm", farm)
        let farmInfo = {
            status: (seller.status == 1) ? "new" : (seller.status == 2) ? "accepted" : (seller.status == 3) ? "blocked" : "new",
            email: farm.email,
            idFarm: farm.idFarm,
            license: farm.license,
            managerFio: farm.managerFio,
            managerPhone: farm.managerPhone,
            name: farm.name,
            INN: farm.INN,
            logo: farm.logo ? config.backend + farm.logo : "",
        }
        return res.send({ success: true, farm: farmInfo });
    } else if (token.role == "farm") {
        let farm = await Farm.model.findOne({ idFarm: token.id });
        let farmInfo = {
            email: farm.email,
            idFarm: farm.idFarm,
            license: farm.license,
            managerFio: farm.managerFio,
            managerPhone: farm.managerPhone,
            name: farm.name,
            INN: farm.INN,
            logo: farm.logo ? config.backend + farm.logo : "",
        }
        return res.send({ success: true, farm: farmInfo });
    } else {
        return res.send({ success: false, message: 'У вас недостаточно прав' });
    }

});
module.exports = router;