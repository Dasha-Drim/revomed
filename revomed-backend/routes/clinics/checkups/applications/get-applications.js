const express = require('express');
const router = express.Router();
const jwt = require('../../../../modules/jwt.js');
const multer  = require('multer');
const upload = multer();

const ApplicationsCheckup = require('../../../../models/ApplicationsCheckup.js');
const Clients = require('../../../../models/Clients.js');

// POST REQUEST - ADD CHECKUPS IN CLINIC

router.get('/clinics/checkups/applications', upload.array(), async (req, res, next) => {
	let array = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (token && token.role == 'clinic') {
		let applications = await ApplicationsCheckup.model.find({idClinic: token.id}).sort({ $natural: -1 });
		for (item of applications) {
			let client = await Clients.model.findOne({idClient: item.idClient}, {name: 1});
			let application = {
				time: item.time,
				date: item.date,
				adress: item.adress,
				nameCheckup: item.nameCheckup,
				nameClient: client.name,
				id: item.idApplication,
				invite: item.invite
			}
			array.push(application);
		}
		return res.send({success: true, applications: array});		
	} else {
		return res.send({success: false, message: "У вас недостаночно прав"});
	}
});

module.exports = router;