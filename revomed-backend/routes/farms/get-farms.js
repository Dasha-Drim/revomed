// request for get farms in admin panel
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');

const Farm = require('../../models/Farms.js');

router.get('/farms', async (req, res, next) => {
    let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
    if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
    if (token.role !== "admin") return res.send({ success: false, message: 'У вас недостаточно прав' });
    let farmsArr = [];
    let farms = await Farm.model.find({});
    for (farm of farms) {
        let item = {
            name: farm.name,
            managerFio: farm.managerFio,
        }
        farmsArr.push(item);
    }
    return res.send({ success: true, farms: farmsArr });
});
module.exports = router;