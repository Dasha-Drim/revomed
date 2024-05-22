// request for get sellers (doctors, clinics, doctorClinics) in admin panel
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const config = require('../../../config/config.js');

const Doctor = require('../../../models/Doctors.js');
const Farm = require('../../../models/Farms.js');
const Clinic = require('../../../models/Clinics.js');
const Sellers = require('../../../models/Sellers.js');
const Categories = require('../../../models/Categories.js');

router.get('/sellers', (req, res, next) => {
	let applications = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);

	let getApplications = async () => {
		let item = {};
		const sellers = await Sellers.model.find({}).sort({ $natural: -1 });
		if (!sellers) return false;
		for (const oneSeller of sellers) { 
			item = {};
			if (oneSeller.type == "farm") {
				let farm = await Farm.model.findOne({idFarm: oneSeller.ID});
				//console.log("farm", farm)
				item = {
					type: "farm",
					name: farm.name,
					managerName: farm.managerFio,
					id: oneSeller.idSeller,
					avatar: farm.logo ? config.config.backend + farm.logo : ""
				}
				if (oneSeller.status == 1) item.status = "new";
				if (oneSeller.status == 2) item.status = "accepted";
				if (oneSeller.status == 3) item.status = "blocked";
				applications.push(item);
			}
			if (oneSeller.type == "clinic") {
				const clinic = await Clinic.model.findOne({idClinic: oneSeller.ID});
				item = {
					type: "clinic",
					name: clinic.name,
					managerPosition: clinic.managerPosition,
					managerName: clinic.managerName,
					id: oneSeller.idSeller,
				}
				if (clinic.logo) item.avatar = config.config.backend + clinic.logo;
				else item.avatar = '';
				if (oneSeller.status == 1) item.status = "new";
				if (oneSeller.status == 2) item.status = "accepted";
				if (oneSeller.status == 3) item.status = "blocked";
				applications.push(item);
			}
			if (oneSeller.type == "doctor") {
				const doctor = await Doctor.model.findOne({idDoctor: oneSeller.ID});
				if (doctor.doctorType == "clinic") {
					item = {
						type: "clinicDoctor",
						name: doctor.fio,
						avatar: config.config.backend + doctor.avatar,
						id: oneSeller.idSeller,
					}
					if (oneSeller.status == 1) item.status = "new";
					if (oneSeller.status == 2) item.status = "accepted";
					if (oneSeller.status == 3) item.status = "blocked";
					const category = await Categories.model.findOne({name: doctor.category});
					item.category = category.nameRu;
					const clinic = await Clinic.model.findOne({idClinic: doctor.idClinic});
					item.nameClinic = clinic.name;
					applications.push(item);
				} else {
					item = {
						type: "doctor",
						name: doctor.fio,
						avatar: config.config.backend + doctor.avatar,
						id: oneSeller.idSeller,
					}
					if (oneSeller.status == 1) item.status = "new";
					if (oneSeller.status == 2) item.status = "accepted";
					if (oneSeller.status == 3) item.status = "blocked";
					const category = await Categories.model.findOne({name: doctor.category}, {nameRu: 1});
					if (!category) continue;
					item.category = category.nameRu;
					applications.push(item);
				}
			}
		}
		res.send({success: true, applications: applications});
	}
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} else if (token.role == "admin") {
		getApplications();
	}
});
module.exports = router;