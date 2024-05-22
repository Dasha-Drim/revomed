// request foe update info client (only client)
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const Client = require('../../../models/Clients.js');
const multer  = require('multer');
const upload = multer();

router.put('/clients', upload.array(), (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	let updateInfo = {};
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "client") {
		if (req.body.name) updateInfo.name = req.body.name;
		if (req.body.birthday) updateInfo.dateBirth = req.body.birthday;
		if (req.body.sex) updateInfo.sex = +req.body.sex;
		Client.model.updateOne({idClient: token.id}, updateInfo, {upsert: false}, (err, user) => {
			if (err) {
				return res.send({success: false, message: 'Ошибка'});
			} else {
				return res.send({success: true})
			}
		})
	}
});

module.exports = router;