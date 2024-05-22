// request for get post info
const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');
const config = require('../../config/config.js');
const jwt = require('../../modules/jwt.js');

const getSale = require('../../modules/sale.js');

const Post = require('../../models/Posts.js');
const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');
const Category = require('../../models/Categories.js');
const Consultation = require('../../models/Consultations.js');

router.get('/posts/:id', async (req, res, next) => {
	let author = {};
	let timetable = [];
	let clinicDoctors = [];
	let newUser = false;
	let idUser = null;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) newUser = true;
	if (token.role == "client") {
		idUser = token.id;
		let consultations = await Consultation.model.find({idClient: token.id});
		if (consultations.length == 0) newUser = true;
	}

	let getPost = async () => {
		const item = await Post.model.findOne({idPost: req.params.id});
		if (!item) return res.sendStatus(404);
		//let image = config.config.backend + item.photo;
		let post = {
			title: item.title,
			description: item.description,
			category: item.category,
			photo: config.config.backend + item.photo,
			photoWebp: config.config.backend + item.photoWebp,
			date: item.date,
		}
		if (item.typeAuthor == 'admin') {
			author.type = 'admin';
			author.name = item.author;
			post.author = author;
			return res.send({success: true, post: post});
		} else if (item.typeAuthor == 'doctor') {
			author.type = 'doctor';
			const doctor = await Doctor.model.findOne({idDoctor: +item.author});
			author.name = doctor.name;
			author.id = doctor.idDoctor;
			author.avatar = config.config.backend + doctor.avatar;
			author.avatarWebp = config.config.backend + doctor.avatarWebp;
			author.academicDegree = doctor.academicDegree;
			author.experience = doctor.experience;
			author.directions = doctor.directions;
			author.rating = doctor.rating.toFixed(1);
			//author.price = newUser ? Math.round((doctor.price + 0.2*doctor.price)*0.9).toFixed(0) : (doctor.price + 0.2*doctor.price).toFixed(0);
			//author.oldPrice = newUser ? (doctor.price + 0.2*doctor.price).toFixed(0) : null;
			author.patientsTotal = doctor.pacientsTotal;

			let saleInfo = await getSale(idUser, newUser, doctor.idDoctor);

			author.price = saleInfo.sale.sum > 0 ? Math.round((doctor.price + 0.2*doctor.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (doctor.price + 0.2*doctor.price).toFixed(0);
			author.oldPrice = saleInfo.sale.sum > 0 ? (doctor.price + 0.2*doctor.price).toFixed(0) : null;
			author.sale = saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null;
			author.cumulativeSale = saleInfo.cumulative;

			author.reviewsTotal = doctor.reviewsTotal;
			for (const time of doctor.timetable) {
				if ((!time.booked) && (DateTime.fromISO(time.time) > DateTime.now())) timetable.push(time.time);
			};
			author.timetable = timetable;
			const category = await Category.model.findOne({name: doctor.category}, {nameRu: 1, duration: 1});
			author.category = category.nameRu;
			author.duration = category.duration;
			if (doctor.doctorType == 'clinic') {
				const clinic = await Clinic.model.findOne({idClinic: doctor.idClinic});
				author.clinic = {
					name: clinic.name,
					id: clinic.idClinic
				}
				author.clinicName = clinic.name;
				post.author = author;
				return res.send({success: true, post: post});
			} else {
				post.author = author;
				return res.send({success: true, post: post});
			}
		} else if (item.typeAuthor == 'clinic') {
			author.type = 'clinic';
			const clinic = await Clinic.model.findOne({idClinic: +item.author});
			author.name = clinic.name;
			author.idClinic = clinic.idClinic;
			author.logo = config.config.backend + clinic.logo;
			author.logoWebp = config.config.backend + clinic.logoWebp;
			author.city = clinic.city;
			author.country = clinic.country;
			const category = await Category.model.findOne({name: item.category});
			author.category = {
				name: item.name,
				nameRu: category.nameRu,
			}
			post.author = author;
			const doctors = await Doctor.model.find({category: item.category, idClinic: clinic.idClinic});
			for (const doc of doctors) {
				let clinicDoctor = {
					name: doc.name,
					clinic: {
						name: clinic.name,
						id: clinic.idClinic,
					},
					id: doc.idDoctor,
					avatar: config.config.backend + doc.avatar,
					avatarWebp: config.config.backend + doc.avatarWebp,
					academicDegree: doc.academicDegree,
					experience: doc.experience,
					directions: doc.directions,
					rating: doc.rating.toFixed(1),
					oldPrice: newUser ? (doc.price + 0.2*doc.price).toFixed(0) : null,
					price: newUser ? Math.round((doc.price + 0.2*doc.price)*0.9).toFixed(0) : (doc.price + 0.2*doc.price).toFixed(0),
					patientsTotal: doc.pacientsTotal,
					reviewsTotal: doc.reviewsTotal,
					category: category.nameRu,
					duration: category.duration,
				};
				let saleInfo = await getSale(idUser, newUser, doc.idDoctor);

				clinicDoctor.price = saleInfo.sale.sum > 0 ? Math.round((doc.price + 0.2*doc.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (doc.price + 0.2*doc.price).toFixed(0);
				clinicDoctor.oldPrice = saleInfo.sale.sum > 0 ? (doc.price + 0.2*doc.price).toFixed(0) : null;
				clinicDoctor.sale = saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null;
				clinicDoctor.cumulativeSale = saleInfo.cumulative;
				
				clinicDoctor.priceOffline = (clinic.offline) ? doc.priceOffline : null;
				clinicDoctor.adress = (clinic.offline) ? doc.adress : null;
				clinicDoctor.offline = (clinic.offline) ? true : false;

				for (const time of doc.timetable) {
					if ((!time.booked) && (DateTime.fromISO(time.time) > DateTime.now())) timetable.push(time.time);
				};
				clinicDoctor.timetable = timetable;
				clinicDoctors.push(clinicDoctor);
			}
			author.doctors = clinicDoctors;
			return res.send({success: true, post: post});
		}
	}
	getPost();
});

module.exports = router;