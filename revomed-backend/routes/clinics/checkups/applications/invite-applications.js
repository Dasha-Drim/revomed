const express = require('express');
const router = express.Router();
const jwt = require('../../../../modules/jwt.js');
const smsc = require('../../../../modules/smsc_api.js');
const multer  = require('multer');
const upload = multer();

const ApplicationsCheckup = require('../../../../models/ApplicationsCheckup.js');
const Clinics = require('../../../../models/Clinics.js');
const Clients = require('../../../../models/Clients.js');

// POST REQUEST - ADD APPLICATION CHECKUP IN CLINIC

smsc.configure({
	login : 'Revomed',
	password : 'Aviator212',
	ssl : true,
	charset : 'utf-8',
});

let sendSMS = (phone, text) => {
	smsc.send_sms({
		phones : [phone],
		mes : text,
		sender : "Revomed.ru"
	}, function (data, raw, err, code) {
		if (err) return console.log(err, 'code: '+code);
    	console.log(data); // object
    	console.log(raw); // string in JSON format
    });
}

router.post('/clinics/checkups/applications/invite', upload.array(), async (req, res, next) => {

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	if (token && token.role == 'clinic') {
		console.log(req.body.id);
		let application = await ApplicationsCheckup.model.findOne({idApplication: req.body.id});
		let clinic = await Clinics.model.findOne({idClinic: application.idClinic});
		let client = await Clients.model.findOne({idClient: application.idClient});
		
		sendSMS(client.phone.slice(1), clinic.name + "\n" + application.nameCheckup + "\nНазовите номер приглашения: " + application.idApplication + "\nДля связи: " + clinic.managerPhone + "\nАдрес: " + application.adress);

		await ApplicationsCheckup.model.updateOne({idApplication: req.body.id}, {invite: true});
		return res.send({success: true});
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;