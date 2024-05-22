// get info about one clinic
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');
const {DateTime} = require('luxon');

const getSale = require('../../modules/sale.js');

const Clinic = require('../../models/Clinics.js');
const Seller = require('../../models/Sellers.js');
const Doctor = require('../../models/Doctors.js');
const Post = require('../../models/Posts.js');
const Review = require('../../models/Reviews.js');
const Category = require('../../models/Categories.js');
const Consultation = require('../../models/Consultations.js');

router.get('/clinics/:id([0-9]+)', async (req, res, next) => {//
	let directions = [];
	let doctors = [];
	let blog = [];
	let reviews = [];

	let newUser = false;
	let idUser = null;
	
	let doctor, post;

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) newUser = true;
	if (token.role == "client") {
		idUser = token.id;
		let consultations = await Consultation.model.find({idClient: token.id});
		if (consultations.length == 0) newUser = true;
	} else newUser = true;

	let getClinic = async (id, clinic, admin = false) => {
		const item = await Clinic.model.findOne({idClinic: id});
		if (!item) return res.sendStatus(404);
		clinic.id = item.idClinic
		clinic.name = item.name
		clinic.city = item.city
		clinic.country = item.country
		clinic.description = item.description
		clinic.adresses = item.adresses
		clinic.modules = item.modules
		clinic.logo = config.config.backend + item.logo
		clinic.logoWebp = config.config.backend + item.logoWebp
		if (admin) {
			clinic.managerFio = item.managerFio
			clinic.managerPosition = item.managerPosition
			clinic.managerEmail = item.managerEmail
			clinic.licenseNumber = item.licenseNumber
			clinic.licenseFile =  config.config.backend + item.licenseFile
			clinic.shopID = item.shopID
			clinic.price = item.price
		}
		const docs = await Doctor.model.find({idClinic: item.idClinic});
		console.log("docs", docs)
		if (!docs) return false;
		for (const doc of docs) {
			let seller = await Seller.model.findOne({ID: doc.idDoctor});
			if (seller.status == 2) {
				let saleInfo = await getSale(idUser, newUser, doc.idDoctor);
				const category = await Category.model.findOne({name: doc.category}, {nameRu: 1, duration: 1});
				directions = directions.concat(doc.directions);
				doctor = {
					id: doc.idDoctor,
					name: doc.name,
					academicDegree: doc.academicDegree,
					rating: doc.rating.toFixed(1),
					experience: doc.experience,
					directions: doc.directions,
					avatar: config.config.backend + doc.avatar,
					avatarWebp: config.config.backend + doc.avatarWebp,
					price: saleInfo && saleInfo.sale.sum > 0 ? Math.round((doc.price + 0.2*doc.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (doc.price + 0.2*doc.price).toFixed(0),
					oldPrice: saleInfo && saleInfo.sale.sum > 0 ? (doc.price + 0.2*doc.price).toFixed(0) : null,
					sale: saleInfo && saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null,
					cumulativeSale: saleInfo.cumulative,
					reviewsTotal: doc.reviewsTotal,
					patientsTotal: doc.pacientsTotal,
					category: category.nameRu,
					duration: category.duration,
				}
				doctor.clinic = {name: clinic.name, id: item.idClinic};
				doctor.cumulativeSale.clinic = clinic.name;
						

				if (item.offline) {
					if (!doc.priceOffline) {
						let prices = clinic.priceOffline || clinic.price;
						let doctorUpdateInfo = {};
						for (onePrice of prices) {
							if (onePrice.category == doc.category) doctorUpdateInfo.priceOffline = onePrice.price;
						}
						await Doctor.model.updateOne({idDoctor: doc.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
						doctor.priceOffline = doctorUpdateInfo.priceOffline;
					} else {
						doctor.priceOffline = doc.priceOffline;
					}
				} else doctor.priceOffline = null;
							

				doctor.priceOffline = (item.offline) ? doc.priceOffline : null;
				doctor.adress = (item.offline) ? doc.adress : null;
				doctor.offline = (item.offline) ? true : false;

				let currentTimetable = [];
				for (let time of doc.timetable) {
					if ((!time.booked) && (DateTime.fromISO(time.time) > DateTime.now())) currentTimetable.push(time.time);
				};
				doctor.timetable = currentTimetable;

				
				doctors.push(doctor);
				
				let reviewsDoctor = await Review.model.find({idDoctor:  doc.idDoctor}).sort({date: -1});
				console.log("reviews", reviews)
				let reviewsDoctorArr = [];
				for (review of reviewsDoctor) {
					let oneReview = {
						text: review.text,
						mark: review.mark,
						date: review.date,
						nameDoctor: doc.name,
						clientName: review.clientName,
					}
					reviewsDoctorArr.push(oneReview);
				}
				reviews = [...reviews, ...reviewsDoctorArr];
			}
		}
		clinic.doctors = doctors;
		clinic.doctorsTotal = doctors.length;
		clinic.directions = directions;
		let reviewsClinic = await Review.model.find({idClinic: id}).sort({date: -1});
		let reviewsArr = [];
		for (one of reviewsClinic) {
			reviewsArr.push(
				{
					text: one.text,
					mark: one.mark,
					date: one.date,
					clientName: one.clientName,
				}
			)
		}
		clinic.reviews = [...reviewsArr, ...reviews];
		clinic.reviewsTotal = clinic.reviews.length;
		const posts = await Post.model.find({author: String(item.idClinic)})
		if (!posts) return false;
		for (const postsInfo of posts) {
			post = {
				id: postsInfo.idPost,
				title: postsInfo.title,
				description: postsInfo.annotation,
				photo: config.config.backend + postsInfo.photo,
				photoWebp: config.config.backend + postsInfo.photoWebp,
				date: postsInfo.date,
				author: item.name,
			}
			blog.push(post);
		}
		clinic.posts = blog;
		return res.send({success: true, clinic: clinic})
	}

	
	if (token.role == "admin") {
		Seller.model.findOne({idSeller: req.params.id}, (err, info) => {
			let clinic = { status: (info.status == 1) ? "new" : (info.status == 2) ? "accepted" : (info.status == 3) ? "blocked" : "new"};
			getClinic(info.ID, clinic, true);
		})
	} else if ((token.role == "clinic") && (!req.query.public))  {
		Clinic.model.findOne({idClinic: req.params.id}).exec((err, item) => {
			if (err) {
				console.log('err', err)
				return res.send({success: false, message: "Что-то пошло не так попробуйте позже"})
			};

			let clinic = {
				id: item.idClinic,
				email: item.managerEmail,
				managerFio: item.managerFio,
				managerPhone: item.managerPhone,
				managerPosition: item.managerPosition,
				name: item.name,
				city: item.city,
				country: item.country,
				description: item.description,
				price: item.price,
				priceOffline: (!item.priceOffline || item.priceOffline.length === 0) ? item.price : item.priceOffline,
				adresses: item.adresses || null,
				offline: ((!item.offline) || (item.offline === false)) ? false : true,
			}
			if (!item.logo) clinic.logo = "";
			else clinic.logo = config.config.backend + item.logo;
			Doctor.model.find({idClinic: item.idClinic}).exec((err, docs) => {
				if (docs.length !== 0) {
					docs.forEach((doc) => {
						directions = directions.concat(doc.directions);
						doctor = {
							id: doc.idDoctor,
							name: doc.name,
							academicDegree: doc.academicDegree,
							rating: doc.rating,
							experience: doc.experience,
							directions: doc.directions,
							avatar: config.config.backend + doc.avatar,
							avatarWebp: config.config.backend + doc.avatarWebp,
							price: doc.price,
							reviewsTotal: doc.reviewsTotal,
							patientsTotal: doc.pacientsTotal,
						}
						let currentTimetable = [];
						for (let time of doc.timetable) {
							if ((!time.booked) && (DateTime.fromISO(time.time) > DateTime.now())) currentTimetable.push(time.time);
						};
						doctor.timetable = currentTimetable;
						doctors.push(doctor);
					})
					clinic.doctors = doctors;
					clinic.directions = directions;
					return res.send({success: true, clinic: clinic})
				} else {
					clinic.doctors = doctors;
					return res.send({success: true, clinic: clinic})
				}
			})
		});
	} else {
		let clinic = {};
		getClinic(req.params.id, clinic);
	}
});

module.exports = router;