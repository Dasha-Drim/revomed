// get info about current consultation
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');

const Consultation = require('../../models/Consultations.js');
const Doctor = require('../../models/Doctors.js');
const Category = require('../../models/Categories.js');
const Client = require('../../models/Clients.js');
const Review = require('../../models/Reviews.js');

router.get('/consultations/:link', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'client') {
		let getConsultationUser = async () => {
			let consultation = await Consultation.model.findOne({link: req.params.link}, {idDoctor: 1, date: 1, timeEnd: 1, price: 1});
			let review = await Review.model.findOne({link: req.params.link});

			if (!consultation) return res.sendStatus(404);
			if (review) return res.sendStatus(404);

			let doctor = await Doctor.model.findOne({idDoctor: consultation.idDoctor}, {name: 1, avatar: 1, rating: 1, category: 1})
			let category = await Category.model.findOne({name: doctor.category}, {nameRu: 1})
			let consultationItem = {
				doctorName: doctor.name,
				avatar: config.config.backend + doctor.avatar,
				rating: doctor.rating.toFixed(1),
				category: category.nameRu,
				timeStart: consultation.date,
				timeEnd: consultation.timeEnd,
				price: consultation.price,
			}
			return res.send({success: true, consultation: consultationItem});
		}
		getConsultationUser();
	}
	if ((token.role == 'doctor') || (token.role == 'clinicDoctor')) {
		let files = [];
		let getConsultationDoctor = async () => {
			let consultation = await Consultation.model.findOne({link: req.params.link}, {idDoctor: 1, idClient: 1, date: 1, timeEnd: 1, files: 1, price: 1});
			let review = await Review.model.findOne({link: req.params.link});

			if (!consultation) return res.sendStatus(404);
			if (review) return res.sendStatus(404);

			let client = await Client.model.findOne({idClient: consultation.idClient});
			let consultationItem = {
				clientName: client.name,
				timeStart: consultation.date,
				timeEnd: consultation.timeEnd,
				price: consultation.price,
			}
			for (file of consultation.files) {
				let oneFile = {
					name: file.name,
					path: config.config.backend + file.path
				}
				files.push(oneFile);
			}
			consultationItem.files = files;
			return res.send({success: true, consultation: consultationItem});
		}
		getConsultationDoctor();
	}
});

module.exports = router;





