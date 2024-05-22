const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');

const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');

router.delete('/doctors', function(req, res, next) {
	let doctors = [];
	let deleteDoctor = (id) => {
		Doctor.model.remove({idDoctor: id}, function(err) {
			if (!err) {
				res.send({success: true});
			}
			else {
				res.send({success: false, message: err});
			}
		});
	}
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'admin') {
		Doctor.model.findOne({idDoctor: req.body.id}, (err, doctor) => {
			if (doctor.doctorType == "clinic") {
				Clinic.model.findOne({idClinic: doctor.idClinic}, (err, clinic) => {
					clinic.doctors.forEach((oneDoctor) => {
						if (oneDoctor !== eq.body.id) doctors.push(oneDoctor);
					})
					Clinic.model.updateone({idClinic: doctor.idClinic}, {$set: {doctors: doctors}}, {upsert: false}, (err, clinicNew) => {
						if (err) return res.send({success: false, message: 'Не удалось удалить данные'})
							deleteDoctor(req.body.id);
					})
				})
			} else {
				deleteDoctor(req.body.id);
			}
		})
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'})
	}
	
});

module.exports = router;