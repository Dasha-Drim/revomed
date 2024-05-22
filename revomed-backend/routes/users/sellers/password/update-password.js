//request for update password, if user forget its
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer  = require('multer');
const upload = multer();

const Seller = require('../../../../models/Sellers.js');

router.put('/sellers/password/:link', upload.array(), async (req, res, next) => {
	salt = crypto.randomBytes(32).toString('hex');
	hash = crypto.pbkdf2Sync(req.body.newPassword, salt, 10000, 64, 'sha512').toString('hex');
	await Seller.model.updateOne({link: req.params.link}, {$set: {password: hash, salt: salt}, $unset: {link: 1}}, {upsert: false});
	return res.send({success: true, message: "Вы успешно сменили пароль. Перейдите на страницу авторизации"});
});

module.exports = router;