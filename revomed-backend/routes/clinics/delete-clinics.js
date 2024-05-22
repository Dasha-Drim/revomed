const express = require('express');
const router = express.Router();
const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');

router.delete('/doctors', function(req, res, next) {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Incorrect token'});
	}
	if (token.role == 'admin') {
		Doctor.model.updateMany({doctorType:'clinic', idClinic: req.body.id}, {$set: {doctorType : 'individual'}}, {$unset: {idClinic: 1}}, {upsert: false}, (err, doc) => {
			if (err) {
				return res.send({success: false, message:"Не удалось удалить клинику"})
			} else {
				Clinic.model.remove({idClinic: req.body.id}, function(err) {
					if (!err) {
						res.send({success: true});
					}
					else {
						res.send({success: false, message: err});
					}
				})
			}
		})
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'})
	}
	
})

module.exports = router;