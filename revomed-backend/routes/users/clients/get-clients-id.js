// request for grt info for lk client
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');

const Client = require('../../../models/Clients.js');

router.get('/clients/:id([0-9]+)', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "client") {
		Client.model.findOne({idClient: req.params.id}, (err, user) => {
			let info = {
				phone: user.phone,
				sex: ((user.sex === 0) || (user.sex === 1)) ? user.sex : "",
				birthday: (!user.dateBirth) ? "" : user.dateBirth,
				name: (!user.name) ? "" : user.name,
			}
			return res.send({success: true, client: info});
		})
	} else {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
});

module.exports = router;