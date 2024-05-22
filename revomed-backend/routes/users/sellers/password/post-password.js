// request for change password
const express = require('express');
const router = express.Router();
const mail = require("../../../../modules/mail.js");
const config = require("../../../../config/config.js");
const multer  = require('multer');
const upload = multer();

const Client = require('../../../../models/Clients.js');
const Seller = require('../../../../models/Sellers.js');

let getRandomString = (count) => {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < count; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

router.post('/sellers/password', upload.array(), (req, res, next) => {
	Seller.model.findOne({login: req.body.email}, (err, seller) => {
		if (seller) {
			let link = getRandomString(16);
			mail('forgetPassword', req.body.email, "Восснановление пароля REVOMED.RU", {link: config.config.frontend + '/password/recovery/' + link});
			Seller.model.updateOne({login: req.body.email}, {$set: {link: link}}, {upsert: false}, (err, updated) => {
				return res.send({success: true})
			})
		} else {
			return res.send({success: false, message: "Пользователя с таким email не существует"})
		}
	})
	
});

module.exports = router;