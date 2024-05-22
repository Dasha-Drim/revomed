const express = require('express');
const router = express.Router();
const jwt = require('../../../../modules/jwt.js');
const mail = require("../../../../modules/mail.js");
const multer  = require('multer');
const upload = multer();

const Checkups = require('../../../../models/Checkups.js');
const Clinics = require('../../../../models/Clinics.js');
const ApplicationsCheckup = require('../../../../models/ApplicationsCheckup.js');

// POST REQUEST - ADD APPLICATION CHECKUP IN CLINIC

router.post('/clinics/checkups/applications', upload.array(), async (req, res, next) => {

	let id = 1;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы. Записатся на обследование может только зарегистрированный пользователь'});
	}
	if (token.role == 'client') {
		let checkup = await Checkups.model.findOne({idCheckup: req.body.idCheckup});
		let applications = await ApplicationsCheckup.model.find({});
		let clinic = await Clinics.model.findOne({idClinic: checkup.idClinic});

		if (applications.length !== 0) id = applications.length + 1;
		let ID = checkup.idCheckup + "-" + id.toString();

		if (req.body.date == '' || req.body.time == '' ||req.body.adress == '') return res.send({success: false, message: 'Не все данные указаны'});

		let application = {
			date: req.body.date,
			time: req.body.time,
			adress: req.body.adress,
			idClient: token.id,
			idClinic: checkup.idClinic,
			nameCheckup: checkup.name,
			idApplication: ID,
		}
		try {
			await new ApplicationsCheckup.model(application).save();
			// отправить email клиники о новой записи на чекап
			mail('checkupBooked', clinic.managerEmail, "Новая запись на обследование");
			return res.send({success: true});
		} catch(err) {
			return res.send({success: false, message: 'Не удалось записаться на обследование'});
		}
		return res.send({success: true});
	} else {
		return res.send({success: false, message: 'Записатся на обследование может только пользователь'});
	}
});

module.exports = router;