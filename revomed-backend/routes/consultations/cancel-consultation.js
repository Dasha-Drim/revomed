// booked consultation
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const consultation = require('../../modules/consultation.js');
const multer  = require('multer');
const upload = multer();

const Consultation = require('../../models/Consultations.js');
const Doctor = require('../../models/Doctors.js');

router.post('/cancel/consultations', upload.array(), async (req, res, next) => {
	let newTimetable = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Забронировать консультацию может только зарегистрированный пользователь'});
	}
	if (token.role == 'client') {
		console.log('req.body', req.body)
		console.log('cancel');
		let doctor = await Doctor.model.findOne({idDoctor: req.body.idDoctor}, {timetable: 1});
		for (timetableItem of doctor.timetable) {
  			if (timetableItem.time == req.body.date) newTimetable.push({ time: timetableItem.time, booked: false });
  			else newTimetable.push(timetableItem);
  		}
  		let updated = await Doctor.model.updateOne({idDoctor: consultation.idDoctor},{$set: {timetable: newTimetable}}, {upsert: false});
  		await Consultation.model.deleteOne({idDoctor: req.body.idDoctor, date: req.body.date});
		return res.sendStatus(200)
	} else if ((token.role == 'doctor') || (token.role == 'clinic') || (token.role == 'clinicDoctor') || (token.role == 'admin')) {
		return res.send({success: false, message: 'Только пользователи могут отменить бронирование'})
	}
	
});

module.exports = router;