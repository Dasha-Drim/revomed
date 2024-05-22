//request for auth sellers(doctor, clinicDoctor and clinic)
const express = require('express');
const router = express.Router();
const passport = require('../../../modules/passport.js');
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Seller = require('../../../models/Sellers.js');
const Doctor = require('../../../models/Doctors.js');
const Clinic = require('../../../models/Clinics.js');
const Farm = require('../../../models/Farms.js');

router.post('/auth/sellers', upload.array(), (req, res, next) => {
	passport.authenticate('login-sellers', {session: false }, function(err, user, info) {
		if (!user) { 
			return res.send({success: false, message: info.message}) 
		} else {
		console.log('user___', user)		
			if (user.type == "doctor") {
				Doctor.model.findOne({email: user.login}, (err, doc) => {
					if (doc.doctorType == "clinic") {
						jwt.issueJWT(doc.idDoctor, res, req.headers["user-agent"], 'clinicDoctor', true);
						return res.send({success: true});
					} else {
						jwt.issueJWT(doc.idDoctor, res, req.headers["user-agent"], 'doctor', true);
						return res.send({success: true});
					}
				})
			} else if (user.type == "clinic") {
				Clinic.model.findOne({managerEmail: user.login}, (err, clinic) => {
					jwt.issueJWT(clinic.idClinic, res, req.headers["user-agent"], 'clinic', true);
					return res.send({success: true});
				})
			} else if (user.type == "farm") {
				Farm.model.findOne({email: user.login}, (err, farm) => {
					jwt.issueJWT(farm.idFarm, res, req.headers["user-agent"], 'farm', true);
					return res.send({success: true});
				})
			}
		}
	})(req, res, next);
});

module.exports = router;