//waiting list
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const mail = require("../../../modules/mail.js");
const multer  = require('multer');
const upload = multer();

const Doctor = require('../../../models/Doctors.js');
const Client = require('../../../models/Clients.js');
const Clinics = require('../../../models/Clinics.js');
const Waiting = require('../../../models/Waiting.js');

router.post('/doctors/waiting', upload.array(), async (req, res, next) => {	
	let docRating, reviewsTotal;
	let allMarks = 0;
	let count = 0;
	let id = 1;
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) return res.send({success: false, message: 'Вы не авторизованы'});
	if (token.role == "client") {
		console.log("req.body", req.body);
		console.log("token", token);
		let waiting = await Waiting.model.findOne({idDoctor: req.body.idDoctor, idClient: token.id});
		if (!waiting) await Waiting.model({idDoctor: req.body.idDoctor, idClient: token.id}).save();

		let doctor = await Doctor.model.findOne({idDoctor: req.body.idDoctor}); //email
		let client = await Client.model.findOne({idClient: token.id});
		if (doctor.doctorType == "clinic") {
			let clinic = await Clinics.model.findOne({idClinic: doctor.idClinic}); //managerEmail
			mail('waitingClinic', clinic.managerEmail, "К врачу " + doctor.fio + " хотят попасть на приём / записаться на консультацию", {nameDoctor: doctor.fio});
		} else {
			mail('waitingDoc', doctor.email, "Пациент " + client.name + " хочет попасть к вам на консультацию, выставите расписание", {});
		}
		return res.send({success: true});
	} else return res.send({success: false, message: 'Вы не авторизованы'});
})


module.exports = router;