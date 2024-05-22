// get doctor's price
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');

const Clinic = require('../../../models/Clinics.js');

router.get('/clinics/shopID', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'clinic') {
		Clinic.model.findOne({idClinic: token.id}, {shopID: 1}, (err, clinic) => {
			if ((!clinic) || (!clinic.shopID)) return res.send({success: true, shopID: false});
			else return res.send({success: true, shopID: true});
		})
	}
});

module.exports = router;
