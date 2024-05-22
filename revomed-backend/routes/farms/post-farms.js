// request for registartion farms
const express = require('express');
const router = express.Router();
const mail = require("../../modules/mail.js");
const jwt = require('../../modules/jwt.js');
const crypto = require('crypto');
const multer  = require('multer');
const upload = multer();

const Farm = require('../../models/Farms.js');
const Seller = require('../../models/Sellers.js');

router.post('/farms', upload.array(), async (req, res) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({ success: false, message: 'Вы не авторизованы' });
	if (token.role !== "admin") return res.send({success: false, message: "У вас недостаточно прав"});
    console.log("req.body", req.body)
    if (!req.body.email || !req.body.managerFio || !req.body.managerPhone || !req.body.INN || !req.body.name || !req.body.license) return res.send({success: false, message: "Вы отправили не все данные"});

    let seller = await  Seller.model.findOne({login: req.body.email.toLowerCase()});
    if (seller) return res.send({ success: false, message: 'Пользователь с таким email адресом уже существует.' });
    let password = Math.random().toString(36).slice(-8);
    let salt = crypto.randomBytes(32).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    let idFarm = 1;
    let idSeller = 1;
    let farms = await Farm.model.find({});
    let users = await Seller.model.find({});

    if (farms.length !== 0) idFarm = farms[farms.length-1].idFarm + 1;
    if (users.length !== 0) idSeller = users[users.length-1].idSeller + 1;

    try {
        let newFarm = {
            idFarm: idFarm,
            email: req.body.email.toLowerCase(),
            managerFio: req.body.managerFio,
            managerPhone: req.body.managerPhone,
            INN: req.body.INN,
            name: req.body.name,
            license: req.body.license,
        }
        await new Farm.model(newFarm).save();
        let newSeller = {
            login: req.body.email.toLowerCase(),
            password: hash, 
            salt: salt, 
            type: "farm", 
            status: 2, 
            idSeller: idSeller, 
            ID: idFarm
        }
        await new Seller.model(newSeller).save();
        mail('regDoc', req.body.email.toLowerCase(), "Вы зарегистрировались", {login: req.body.email.toLowerCase(), password: password});
        return res.send({success: true});
    } catch(err) {
        console.log("err registration_farm", err)
        return res.send({success: false})
    }
})


module.exports = router;