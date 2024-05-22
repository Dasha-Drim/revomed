// request for get reviews
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');

const Review = require('../../models/Reviews.js');
const Doctor = require('../../models/Doctors.js');
const Categories = require('../../models/Categories.js');
const Clinic = require('../../models/Clinics.js');
const Seller = require('../../models/Sellers.js');

router.get('/reviews', async (req, res, next) => {
	let reviews = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	if (req.query.page === "home") {
		let items = await Review.model.find({mark: {$in: [4, 5]}}).sort({ $natural: -1 });
			for (item of items) {
				if (!item.idDoctor) continue;
				let doctor = await Doctor.model.findOne({idDoctor: item.idDoctor});
				let specialization = await Categories.model.findOne({name: doctor.category});
				let review = {
						avatar: config.config.backend + doctor.avatar,
						avatarWebp: config.config.backend + doctor.avatarWebp,
						category: specialization.nameRu,
						doctorName: item.doctorName,
						clientName: item.clientName,
						date: item.date,
						mark: item.mark,
						text: item.text,
					}
					reviews.push(review)
			}
			return res.send({success: true, reviews: reviews});
	}

	if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
		let items = await Review.model.find({idDoctor: token.id}).sort({ $natural: -1 });
		for (item of items) {
			let review = {
					doctorName: item.doctorName,
					clientName: item.clientName,
					date: item.date,
					mark: item.mark,
					text: item.text,
				}
				reviews.push(review)
		}
			
			return res.send({success: true, reviews: reviews});
	} else if (token.role == "admin") {
		let items = await Review.model.find().sort({ $natural: -1 });
			
			for (item of items) {
				let clinicName = null;
				let id;

				if (item.idClinic) {
					let clinic = await Clinic.model.findOne({idClinic: +item.idClinic}, {name: 1});
					clinicName = clinic.name;
					let seller = await Seller.model.findOne({ID: +item.idClinic, type: "clinic"});
					id = seller.idSeller;
				} else {
					let seller = await Seller.model.findOne({ID: +item.idDoctor, type: "doctor"});
					id = seller.idSeller;
				}
				let review = {
					doctorName: item.doctorName,
					clientName: item.clientName,
					clinicName: clinicName ? clinicName : null,
					id: id,
					idReview: item.idReview,
					mark: item.mark,
					text: item.text,
				}
				reviews.push(review)
			}
			
			return res.send({success: true, reviews: reviews});

		} else if (token.role == "client") {
			let items = await Review.model.find({idClient: token.id}).sort({ $natural: -1 });
			for (item of items) {
				let review = {
						doctorName: item.doctorName,
						clientName: item.clientName,
						date: item.date,
						mark: item.mark,
						text: item.text,
					}
					reviews.push(review)
			}

				return res.send({success: true, reviews: reviews});

		} else {
			return res.send({success: false, message: "Вы не авторизованы"})
		}
	});

module.exports = router;