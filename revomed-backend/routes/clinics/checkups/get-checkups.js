const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const Checkups = require('../../../models/Checkups.js');
const Clinics = require('../../../models/Clinics.js');

// POST REQUEST - ADD CHECKUPS IN CLINIC

router.get('/clinics/checkups', upload.array(), async (req, res, next) => {

	let id = 1;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (token && token.role == 'clinic' && !req.query.idClinic) {
		let checkups = await Checkups.model.find({idClinic: token.id}, {
			name: 1, 
			annotation: 1, 
			consultation: 1, 
			idCheckup: 1,
			price: 1,
			surveys: 1,
		});
		return res.send({success: true, checkups: checkups});		
	} else {
		let clinic = await Clinics.model.findOne({idClinic: req.query.idClinic});
		if (!clinic.modules.checkups) return res.send({success: true, checkups: []});
		let checkups = await Checkups.model.find({idClinic: req.query.idClinic}, {
			name: 1, 
			annotation: 1, 
			consultation: 1, 
			idCheckup: 1,
			price: 1,
			surveys: 1,
		});
		return res.send({success: true, checkups: checkups});
	}
});

module.exports = router;