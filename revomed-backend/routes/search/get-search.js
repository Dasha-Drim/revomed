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

router.get('/search', async (req, res, next) => {
	let reviews = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	let doctorsArr = [];
	let clinicsArr = [];
	let categoriesArr = [];

	let getDoctors = async (str) => {
		let arr = [];
		let doctors = await Doctor.model.find({fio: new RegExp(str, "i")});
		console.log("doctors", doctors);
		for (doctor of doctors) {
			let item = {
				idDoctor: doctor.idDoctor,
				fio: doctor.fio
			}
			arr.push(item);
		}
		return arr;
	}

	let getClinics = async (str) => {
		let arr = [];
		let clinics = await Clinic.model.find({name: new RegExp(str, "i")});
		console.log("clinics", clinics);
		for (clinic of clinics) {
			let item = {
				idClinic: clinic.idClinic,
				name: clinic.name
			}
			arr.push(item);
		}
		return arr;
	}

	let getCategories = async (str) => {
		let arr = [];
		let categories = await Categories.model.find({nameRu: new RegExp(str, "i")});
		console.log("categories", categories);
		for (category of categories) {
			let item = {
				title: category.nameRu,
				name: category.name
			}
			arr.push(item);
		}
		return arr;
	}

	if (req.query.page === "home") {
		let doctorsArr = await getDoctors(req.query.search);
		let clinicsArr = await getClinics(req.query.search);
		let categoriesArr = await getCategories(req.query.search);
		return res.send({success: true, doctors: doctorsArr, clinics: clinicsArr, categories: categoriesArr});
	}
	if (req.query.page === "clinics") {
		let clinicsArr = await getClinics(req.query.search);
		return res.send({success: true, doctors: doctorsArr, clinics: clinicsArr, categories: categoriesArr});
	}
	if (req.query.page === "doctors") {
		let doctorsArr = await getDoctors(req.query.search);
		let categoriesArr = await getCategories(req.query.search);
		return res.send({success: true, doctors: doctorsArr, clinics: clinicsArr, categories: categoriesArr});
	}

	
});

module.exports = router;