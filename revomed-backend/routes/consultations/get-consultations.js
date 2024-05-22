// get consultation in personal page (future and past)
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');
const {DateTime} = require('luxon');

const Consultation = require('../../models/Consultations.js');
const Doctor = require('../../models/Doctors.js');
const Category = require('../../models/Categories.js');
const Client = require('../../models/Clients.js');
const Clinic = require('../../models/Clinics.js');


let sortDateForHistory = (a, b) => {
	a = DateTime.fromISO(a.date)
	b = DateTime.fromISO(b.date)
	if (a < b) return 1;
	if (a > b) return -1;
}
let sortDateForFuture = (a, b) => {
	a = DateTime.fromISO(a.date)
	b = DateTime.fromISO(b.date)
	if (a > b) return 1;
	if (a < b) return -1;
}

router.get('/consultations', (req, res, next) => {
	let pastConsultations = [];
	let futureConsultations = [];
	let consultation = {};
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	if (token.role == 'client') {
		let getConsultationforClient = async () => {
			const consultations = await Consultation.model.find({idClient: token.id});
			for (const item of consultations) {
				let files = [];
				const category = await Category.model.findOne({name: item.category});
				const client = await Client.model.findOne({idClient: item.idClient});
				if (item.step !== 1) {
					consultation = {};
					consultation = {
						idConsultation: item.idConsultation,
						link: item.link,
						date: item.date,
						offline: item.offline,
						adress: item.adress || null,
						doctorId: item.idDoctor,
						category: category.nameRu,
						timezone: client.timezone,
					}
					if (category.license) consultation.canFilesBeAttached = true;
					else consultation.canFilesBeAttached = false;
					item.files.forEach(file => {
						let oneFile = {
							name: file.name,
							path: config.config.backend + file.path
						}
						files.push(oneFile);
					})
					consultation.files = files;
					const doctor = await Doctor.model.findOne({idDoctor: item.idDoctor});
					consultation.nameDoctor = doctor.name;
					consultation.avatarFile = config.config.backend + doctor.avatar;

					if (doctor.doctorType == 'clinic') {
						let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic});
						consultation.clinicName = clinic.name;
					}
					
					if (item.step == 5) {
						consultation.duration = category.duration;
						consultation.price = item.price;
						consultation.specialization = category.nameRu;
						if (item.recomendation) consultation.recommendation = item.recomendation;
						else consultation.recomendation = "";
						pastConsultations.push(consultation);
					} else {
						futureConsultations.push(consultation);
					}
				}
			}
			futureConsultations.sort(sortDateForFuture);
			pastConsultations.sort(sortDateForHistory);
			return res.send({success: true, pastConsultations: pastConsultations, futureConsultations: futureConsultations});
		}
		getConsultationforClient();
	}
	if ((token.role == 'doctor') || (token.role == 'clinicDoctor')) {
		let getConsultationforDoctors = async () => {
			const doctor = await Doctor.model.findOne({idDoctor: token.id}, {category: 1});
			const category = await Category.model.findOne({name: doctor.category}, {license: 1});
			const consultations = await Consultation.model.find({idDoctor: token.id});
			for (const item of consultations) {
				let files = [];
				if ((item.step !== 1) && (item.step !== 5)){
					consultation = {};
					consultation = {
						idConsultation: item.idConsultation,
						link: item.link,
						date: item.date,
						offline: item.offline,
					}
					if (category.license) consultation.canFilesBeAttached = true;
					else consultation.canFilesBeAttached = false;
					item.files.forEach(file => {
						let oneFile = {
							name: file.name,
							path: config.config.backend + file.path
						}
						files.push(oneFile);
					})
					consultation.files = files;
					const client = await Client.model.findOne({idClient: item.idClient});
					consultation.nameClient = client.name;
					consultation.timezone = client.timezone;
					futureConsultations.push(consultation);
				}
			}
			futureConsultations.sort(sortDateForFuture);
			return res.send({success: true, futureConsultations: futureConsultations});
		}
		getConsultationforDoctors();
	}
	if (token.role == 'clinic') {
		let getConsultationforClinic = async () => {
			const consultations = await Consultation.model.find({idClinic: token.id, step: 5});
			for (const item of consultations) {
				consultation = {};
				consultation = {
					date: item.date,
					price: item.price,
					commission: item.commission || 0,
					profit: item.profit || 0,
					offline: item.offline,
				}
				const doctor = await Doctor.model.findOne({idDoctor: item.idDoctor});
				consultation.nameDoctor = doctor.name;
				consultation.idDoctor = item.idDoctor;
				consultation.academicDegree = doctor.academicDegree;
				pastConsultations.push(consultation);
			}
			pastConsultations.sort(sortDateForHistory);
			return res.send({success: true, pastConsultations: pastConsultations});
		}
		getConsultationforClinic();
	}
});

module.exports = router;





