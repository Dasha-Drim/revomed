// booked consultation
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const consultation = require('../../modules/consultation.js');
const multer  = require('multer');
const upload = multer();

const Consultation = require('../../models/Consultations.js');
const Doctor = require('../../models/Doctors.js');
const Category = require('../../models/Categories.js');

router.post('/consultations', upload.array(), async (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Забронировать консультацию может только зарегистрированный пользователь'});
	}
	if (token.role == 'client') {
		let newUser = false;
		let consultations = await Consultation.model.find({idClient: token.id});
		if (consultations.length == 0) newUser = true;
		let booked = await consultation.bookedConsultation(req.body.date, req.body.offline, req.body.idDoctor, token.id, newUser)
		return res.send(booked);

	} else if ((token.role == 'doctor') || (token.role == 'clinic') || (token.role == 'clinicDoctor') || (token.role == 'admin')) {
		return res.send({success: false, message: 'Только пользователи могут забронировать консультацию'})
	}
	
});

module.exports = router;