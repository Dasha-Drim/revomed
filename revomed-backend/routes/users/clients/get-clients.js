// request for grt info for lk client
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');

const Client = require('../../../models/Clients.js');

router.get('/clients', (req, res, next) => {
	let patients = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (token.role == "admin") {
		Client.model.find().exec((err, clients) => {
			clients.forEach((client) => {
				let patient = {
					name: client.name,
					phone: client.phone,
					sex: (client.sex === 1) ? "Женский" : (client.sex === 0) ? "Мужской" : "-",
				}
				if (client.dateBirth) patient.dateBirth = client.dateBirth;
				patients.push(patient);
			});
			return res.send({success: true, patients: patients, count: clients.length});
		});
	} else {
		return res.send({success: false, message: 'У вас недостаточно прав'});
	}
});

module.exports = router;