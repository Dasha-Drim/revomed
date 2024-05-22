// get doctor's price
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');

const Doctor = require('../../../models/Doctors.js');

router.get('/doctors/prices', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if ((token.role == 'doctor') || (token.role == 'clinicDoctor')) {
		Doctor.model.findOne({idDoctor: token.id}, {price: 1}, (err, doctor) => {
			return res.send({success: true, price: doctor.price});
		})
	}
});

module.exports = router;
