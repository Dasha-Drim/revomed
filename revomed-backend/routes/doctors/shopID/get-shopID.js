// get doctor's price
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');

const Doctor = require('../../../models/Doctors.js');

router.get('/doctors/shopID', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if ((token.role == 'doctor') || (token.role == 'clinicDoctor')) {
		Doctor.model.findOne({idDoctor: token.id}, {shopID: 1}, (err, doctor) => {
			if ((!doctor) || (!doctor.shopID)) return res.send({success: true, shopID: false});
			else return res.send({success: true, shopID: true});
		})
	}
});

module.exports = router;
