const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Checkups = require('../../../models/Checkups.js');
const Clinics = require('../../../models/Clinics.js');

// POST REQUEST - ADD CHECKUPS IN CLINIC

router.get('/clinics/checkups/:id([0-9]+)', upload.array(), async (req, res, next) => {

	let id = 1;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (token && token.role == 'clinic') {
		let checkup = await Checkups.model.findOne({idCheckup: req.params.id}, {
			name: 1, 
			annotation: 1, 
			description: 1, 
			consultation: 1, 
			idCheckup: 1,
			idClinic: 1,
			price: 1,
			surveys: 1,
			symptoms: 1,
		});
		let clinic = await Clinics.model.findOne({idClinic: checkup.idClinic}, {name: 1, adresses: 1, modules: 1});
		let arrAdresses = [];
		for (item of clinic.adresses) {
			let adress = {name: item.name, value: item.adress};
			arrAdresses.push(adress);
		}
		let info = {
			name: checkup.name,
			description: checkup.description, 
			annotation: checkup.annotation, 
			consultation: checkup.consultation, 
			idCheckup: checkup.idCheckup,
			idClinic: checkup.idClinic,
			price: checkup.price,
			surveys: checkup.surveys,
			symptoms: checkup.symptoms,
			adresses: arrAdresses,
			nameClinic: clinic.name
		}
		return res.send({success: true, checkup: info});		
	} else {

		let checkup = await Checkups.model.findOne({idCheckup: req.params.id}, {name: 1, description: 1, consultation: 1, idCheckup: 1, idClinic: 1, price: 1, surveys: 1, symptoms: 1});
		let clinic = await Clinics.model.findOne({idClinic: checkup.idClinic}, {name: 1, adresses: 1, modules: 1});
		if (!clinic.modules.checkups) return res.send({success: false});
		let arrAdresses = [];
		for (item of clinic.adresses) {
			let adress = {name: item.name, value: item.adress};
			arrAdresses.push(adress);
		}
		let info = {
			name: checkup.name,
			description: checkup.description, 
			consultation: checkup.consultation, 
			idCheckup: checkup.idCheckup,
			idClinic: checkup.idClinic,
			price: checkup.price,
			surveys: checkup.surveys,
			symptoms: checkup.symptoms,
			adresses: arrAdresses,
			nameClinic: clinic.name
		}
		return res.send({success: true, checkup: info});
	}
});

module.exports = router;