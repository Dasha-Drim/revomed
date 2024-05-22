// get clinics in catalog
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');

const Clinic = require('../../models/Clinics.js');
const Doctor = require('../../models/Doctors.js');

router.get('/clinics', (req, res, next) => {
	let clinics = [];

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (token.role == "admin") {
		Clinic.model.find({}).exec( (err, items) => {
			items.forEach((clinic) => {
				let direction = [];
				let item = {
					id: clinic.idClinic,
					name: clinic.name,
					city: clinic.city,
					country: clinic.country,
					description: clinic.description,
					reviewsTotal: clinic.reviewsTotal,
					doctorsTotal: clinic.doctorsTotal,
					logo: config.config.backend + clinic.logo,
					logoWebp: config.config.backend + clinic.logoWebp,
				}
				Doctor.model.find({idClinic: clinic.idClinic}).exec ( (err, doctors) => {
					if (doctors.length !== 0) {
						doctors.forEach((doc) => {
							direction = direction.concat(doc.directions)
						})
						item.directions = direction;
					}
				})
				clinics.push(item)
			});
			return res.send({success: true, clinics: clinics})
		});
	} else {
		let getClinics = async () => {
			let items = await Clinic.model.find({logo: {$exists:true}}).limit(+req.query.limit).skip(+req.query.offset);
			for (clinic of items) {
				let directionsArr = [];
				let item = {
					id: clinic.idClinic,
					name: clinic.name,
					city: clinic.city,
					country: clinic.country,
					description: clinic.description,
					reviewsTotal: clinic.reviewsTotal,
					doctorsTotal: clinic.doctorsTotal,
					logo: config.config.backend + clinic.logo,
					logoWebp: config.config.backend + clinic.logoWebp,
				}
				let doctors = await Doctor.model.find({idClinic: clinic.idClinic});
				if (doctors.length !== 0) {
					for (doc of doctors) {
						directionsArr = directionsArr.concat(doc.directions)
					}
				}
				item.directions = directionsArr;
				clinics.push(item)
			}
			Clinic.model.countDocuments({logo: {$exists:true}}, function (err, count) {
				let pagesAvailable = (req.query.limit) ? Math.ceil(count/req.query.limit) : 1;
				return res.send({success: true, clinics: clinics, pagesAvailable: pagesAvailable});
			});
		}
		getClinics();
	}
});

module.exports = router;