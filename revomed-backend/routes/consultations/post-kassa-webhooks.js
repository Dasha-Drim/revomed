// kassa webhooks
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const consultationModule = require('../../modules/consultation.js');
const multer  = require('multer');
const upload = multer();

const Consultation = require('../../models/Consultations.js');
const Doctor = require('../../models/Doctors.js');

router.post('/kassa/webhooks', async (req, res) => {
	let data = req.body;
	let event = data.event;
	let payment_id = data.object.id;
	console.log('WEBHOOK FROM YANDEX KASSA', data);
	let newTimetable = [];
	let consultation = await Consultation.model.findOne({payment_id: payment_id});
	if (!consultation) return res.sendStatus(200);
	console.log('consultation', consultation);
	if (event == 'payment.canceled') {
		console.log('canceled');
		let doctor = await Doctor.model.findOne({idDoctor: consultation.idDoctor}, {timetable: 1});
		console.log('doctor', doctor)
		for (timetableItem of doctor.timetable) {
			if (timetableItem.time == consultation.date) newTimetable.push({ time: timetableItem.time, booked: false });
			else newTimetable.push(timetableItem);
		}
		let updated = await Doctor.model.updateOne({idDoctor: consultation.idDoctor},{$set: {timetable: newTimetable}}, {upsert: false})
		let removed = await Consultation.model.deleteOne({payment_id: payment_id});
		console.log('updated', updated);
		return res.sendStatus(200);
	} else {
		let status;
		if ((event == 'payment.waiting_for_capture') && (!consultation.status)) status = 'paymentInProcess';
		if (event == 'payment.succeeded') status = 'paymentSuccess';
		if (consultation.process_payment === "paymentInProcess" || consultation.process_payment === "paymentSuccess") {
			let updated = await Consultation.model.updateOne({payment_id: payment_id}, {$set: {process_payment: status}}, {upsert: false});
			return res.sendStatus(200);
		} else {
			let updated = await Consultation.model.updateOne({payment_id: payment_id}, {$set: {process_payment: status}}, {upsert: false});
		  	let result = await consultationModule.getActionsConsultation(payment_id);
			return res.sendStatus(result);
		}
	}
});

module.exports = router;