// request for get doctor info
const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');

const getSale = require('../../modules/sale.js');

const Doctor = require('../../models/Doctors.js');
const Review = require('../../models/Reviews.js');
const Category = require('../../models/Categories.js');
const Clinic = require('../../models/Clinics.js');
const Seller = require('../../models/Sellers.js');
const Consultation = require('../../models/Consultations.js');
const Client = require('../../models/Clients.js');

router.get('/doctors/:id([0-9]+)', async (req, res, next) => {
	let newUser = false;
	let idUser = null;
	let favorites = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (req.query.public) {
		if (!token) newUser = true;
		if (token.role == "client") {
			idUser = token.id;
			let consultations = await Consultation.model.find({idClient: token.id});
			if (consultations.length == 0) newUser = true;
			let client = await Client.model.findOne({idClient: token.id}, {favoriteDoctors: 1});
			favorites = client.favoriteDoctors;
		} else newUser = true;
		let getDoctorPublic = async () => {
			let timetable = [];
			let item = await Doctor.model.findOne({idDoctor: req.params.id});
			if (!item) return res.sendStatus(404);
			let category = await Category.model.findOne({name: item.category}, {nameRu: 1, duration: 1});
			//let image = config.config.backend + item.avatar;
			let saleInfo = await getSale(idUser, newUser, item.idDoctor);
			let doctor = {
				id: item.idDoctor,
				name: item.name,
				academicDegree: item.academicDegree,
				rating: item.rating.toFixed(1),
				directions: item.directions,
				experience: item.experience,
				avatar: config.config.backend + item.avatar,
				avatarWebp: config.config.backend + item.avatarWebp,
				price: saleInfo.sale.sum > 0 ? Math.round((item.price + 0.2*item.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (item.price + 0.2*item.price).toFixed(0),
				oldPrice: saleInfo.sale.sum > 0 ? (item.price + 0.2*item.price).toFixed(0) : null,
				sale: saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null,
				cumulativeSale: saleInfo.cumulative,
				timetable: item.timetable,
				reviewsTotal: item.reviewsTotal,
				patientsTotal: item.pacientsTotal,
				education: item.education,
				workExperience: item.workExperience,
				description: item.description,
				category: category.nameRu,
				duration: category.duration,
				isInFavoritesNow: token.role == "client" ? favorites.indexOf(item.idDoctor) !== -1 : null,
			}

			for (const time of doctor.timetable) {
				if ((!time.booked) && (DateTime.fromISO(time.time) > DateTime.now())) timetable.push(time.time);
			};
			let clinic = await Clinic.model.findOne({idClinic: item.idClinic});
			doctor.clinic = (item.doctorType == 'clinic') ? {name: clinic.name, id: item.idClinic} : null;

			doctor.cumulativeSale.clinic = (item.doctorType == 'clinic') ? clinic.name : null;

			
			if ((item.doctorType == 'clinic') && (clinic.offline)) {
				if (!item.priceOffline) {
					let prices = clinic.priceOffline || clinic.price;
					let doctorUpdateInfo = {};
					for (onePrice of prices) {
						if (onePrice.category == item.category) doctorUpdateInfo.priceOffline = onePrice.price;
					}
					await Doctor.model.updateOne({idDoctor: item.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
					doctor.priceOffline = doctorUpdateInfo.priceOffline;
				} else {
					doctor.priceOffline = item.priceOffline;
				}
			} else doctor.priceOffline = null;
			


			doctor.priceOffline = ((item.doctorType == 'clinic') && (clinic.offline)) ? item.priceOffline : null;
			doctor.adress = ((item.doctorType == 'clinic') && (clinic.offline)) ? item.adress : null;
			doctor.offline = ((item.doctorType == 'clinic') && (clinic.offline)) ? true : false;
			doctor.timetable = timetable;
			let reviews = await Review.model.find({idDoctor: req.params.id}).sort({date: -1});
			doctor.reviews = [];
			if (reviews.length > 0) {
				for (const review of reviews) {
					let oneReview = {
						doctorName: review.doctorName,
						clientName: review.clientName,
						date: review.date,
						mark: review.mark,
						text: review.text,
					}
					doctor.reviews.push(oneReview);
				}
				return {success: true, doctor: doctor};
			}
			
			return {success: true, doctor: doctor};
		}
		getDoctorPublic().then(result => {return res.send(result)});
	} else if ((token.role == 'doctor') || (token.role == 'clinicDoctor')) {
		Doctor.model.findOne({idDoctor: req.params.id}, (err, item) => {
			if (!item) return res.sendStatus(404);
			let image = config.config.backend + item.avatar;
			let doctor = {
				id: item.idDoctor,
				fio: item.fio,
				name: item.name,
				category: item.category,
				avatarFile: image,
				country: item.country,
				city: item.city,
				sex: item.sex,
				email: item.email,
				experience: item.experience,
				academicDegree: (item.academicDegree == "Кандидат медицинских наук") ? "candidate" : (item.academicDegree == "Доктор медицинских наук") ? "doctor" : "",
				directions: item.directions,
				workExperience: item.workExperience,
				education: item.education,
				description: item.description,
			}
			return res.send({success: true, doctor: doctor});
		})
	}
	if (token.role == 'admin') {
		let passportArr = [];
		Seller.model.findOne({idSeller: req.params.id}, {ID: 1, status: 1}, (err, seller) => {
			Doctor.model.findOne({idDoctor: seller.ID}, (err, item) => {
				let image = config.config.backend + item.avatar;
				let doctor = {
					id: item.idDoctor,
					fio: item.fio,
					name: item.name,
					avatarFile: image,
					country: item.country,
					city: item.city,
					sex: item.sex,
					email: item.email,
					experience: item.experience,
					academicDegree: (item.academicDegree == "Кандидат медицинских наук") ? "candidate" : (item.academicDegree == "Доктор медицинских наук") ? "doctor" : "",
					directions: item.directions,
					licenseNumber: item.licenseNumber,
					licenseFile: config.config.backend + item.licenseFile,
					price: item.price,
					passportFiles: passportArr,
					workExperience: item.workExperience,
					education: item.education,
					shopID: item.shopID,
					description: item.description,
					shopId: item.shopId,
					modules: item.modules,
					status: (seller.status == 1) ? "new" : (seller.status == 2) ? "accepted" : (seller.status == 3) ? "blocked" : null,
				}
				if (item.passportFile.length > 0) item.passportFile.forEach((photo) => { passportArr.push(config.config.backend + photo)});
				doctor.passportFiles = passportArr;
				Category.model.findOne({name: item.category}, {nameRu: 1}, (err, category) => {
					Clinic.model.findOne({idClinic: item.idClinic}, {name: 1}, (err, clinic) => {
						doctor.category = category.nameRu;
						doctor.categoryValue = item.category;
						doctor.type = (item.doctorType == "clinic") ? "clinicDoctor" : "doctor";
						doctor.idClinic = (item.doctorType == "clinic") ? item.idClinic : null;
						doctor.nameClinic = (item.doctorType == "clinic") ? clinic.name : null;
						return res.send({success: true, doctor: doctor});
					})
				})
			})
		})
	}
});

module.exports = router;

