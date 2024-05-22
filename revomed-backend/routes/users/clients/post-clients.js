// request for auth client
const express = require('express');
const router = express.Router();
const passport = require('../../../modules/passport.js');
const jwt = require('../../../modules/jwt.js');

const axios = require('axios');

const Client = require('../../../models/Clients.js');

router.post('/auth/clients', async (req, res, next) => {
	let token;
	if (!req.body.code) {
		if (!req.body.captcha) return res.send({success: false, message: 'Вы не прошли проверку'});

		let response = await axios({
	        method: "post",
	        url: "https://www.google.com/recaptcha/api/siteverify",
	        params: {secret: "6LfSK7kkAAAAAN_TJpv210997nEjOPPqqwWPhaqm", response: req.body.captcha},
	    })

		console.log("response", response.data)
		console.log("response", response.data.success)

		if (!response.data.success) return res.send({success: false, message: 'Вы не прошли проверку'});
		else {
			passport.authenticate('login-users', {session: false }, function(err, user, info) {
			if (info) return res.send({success: false, message: info.message});
			if (!user) { 
				return res.send({success: false, message: 'Incorrect data'}) 
			} else {
				jwt.issueJWT(user.idClient, res, req.headers["user-agent"], 'client');
				return res.send({success: true});
			}
		})(req, res, next);
		}


		
	} else {
		token = jwt.updateAuthJWT(req.cookies.token, res, req.headers["user-agent"]);
		if (!token) {
			return res.send({success: false, message: 'Вы не авторизованы'});
		}
		Client.model.findOne({idClient: token.id}, (err, user) => {
			if (token.attempt < 5) {
				if (user.code == req.body.code) {
					token = jwt.updateAuthJWT(req.cookies.token, res, req.headers["user-agent"], true);
					Client.model.updateOne({idClient: token.id}, {$unset: {code:1}}, (err, update) => {
						if (!err) return res.send({success: true});
						return res.send({success: false, message: "Не удалось обновить данные"})
					})
				} else {
					token = jwt.updateAuthJWT(req.cookies.token, res, req.headers["user-agent"]);
					return res.send({success: false, message: 'Неверный код'});
				}
			} else {
				Client.model.updateOne({idClient: token.id}, {$set: {blocked: true}}, (err, user) => {
					setTimeout(() => {
						Client.model.updateOne({idClient: token.id}, {$set: {blocked: false}}, (err, user) => {})
					}, 60000);
					return res.send({success: false, message: 'Вы истратили попытки входа'});
				})
			}
		})
	}
});

module.exports = router;