// request for get doctors in catalog and othe public pages
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');
const { DateTime, Interval } = require('luxon');
const Agenda = require('agenda');

const getSale = require('../../modules/sale.js');

const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');
const Categories = require('../../models/Categories.js');
const Seller = require('../../models/Sellers.js');
const Consultation = require('../../models/Consultations.js');
const Client = require('../../models/Clients.js');

/*
	query.sort - type sort
	query.categories - categories doctors
	query.limit - count doctors in page
	query.offset - offset in doc array
	query.object - boolean (true - group doctors by categories)
	query.timezone - timezone user
	*/

// db change
const agenda = new Agenda({ db: { address: "mongodb://admin:admin123@localhost:20000/revomedCopy?authSource=admin", collection: "agendaRandomOrderJob"}});

agenda.define("generate a random order", async (job) => {
	let firstGroupDoctors = [];
	let secondGroupDoctors = [];

  	// shuffle algorithm
  	let shuffle = (array) => {
  		let currentIndex = array.length;
  		let randomIndex;
  		while (0 !== currentIndex) {
  			randomIndex = Math.floor(Math.random() * currentIndex);
  			currentIndex--;
  			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  		}
  		return array;
  	}

  	let dayInterval = Interval.fromDateTimes(DateTime.now(), DateTime.now().plus({days: 1}));

  	// !!! not blocked
  	let allDoctors = await Doctor.model.find({});

  	for(item of allDoctors) {
		// are there any unarmored sessions for tomorrow
		let isFreeConsultationNextDay = item.timetable.findIndex((timetableItem) => !timetableItem.booked ? dayInterval.contains(DateTime.fromISO(timetableItem.time, {zone: 'utc'})) : false)
		if(isFreeConsultationNextDay !== -1) firstGroupDoctors.push(item.idDoctor);
		else secondGroupDoctors.push(item.idDoctor);
	}

	firstGroupDoctors = shuffle(firstGroupDoctors);
	for([position, id] of firstGroupDoctors.entries()) {
		await Doctor.model.updateOne({idDoctor: id}, {$set: {priority: position}}, {upsert: false});
	}

	secondGroupDoctors = shuffle(secondGroupDoctors);
	for([position, id] of secondGroupDoctors.entries()) {
		await Doctor.model.updateOne({idDoctor: id}, {$set: {priority: position+firstGroupDoctors.length}}, {upsert: false});
	}
	console.log("I print a report!!!");
});

(async function() {
	await agenda.start();
	const job = agenda.create("generate a random order");
	await job.repeatAt("23:59pm").save();
})(); 



router.get('/doctors', async (req, res, next) => {

	let newUser = false;
	let idUser = null;
	let favorites = [];
	let sortType = {priority: 1};
	let parametrsSearch = {};

	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) newUser = true;
	if (token.role == "client") {
		idUser = token.id;
		let consultations = await Consultation.model.find({idClient: token.id});
		if (consultations.length == 0) newUser = true;
		let client = await Client.model.findOne({idClient: token.id}, {favoriteDoctors: 1});
		favorites = !client ? [] : client.favoriteDoctors;
	} else newUser = true;

	if (req.query.sort == "priceUp") sortType = {price: 1};
	if (req.query.sort == "priceDown") sortType = {price: -1};
	if (req.query.sort == "experience") sortType = {experience: -1};
	if (req.query.sort == "bestRating") sortType = {rating: -1};
	if (req.query.sort == "popular") sortType = {priority: 1};

	if (req.query.filter == "male") parametrsSearch.sex = 0;
	if (req.query.filter == "female") parametrsSearch.sex = 1;

	if (req.query.category) parametrsSearch.category = req.query.category;

	let categories = ((req.query.categories == 'false') || (!req.query.categories)) ? [""] : req.query.categories.split(',');

	let getCatalog = async (categories) => {
		if (categories[0] !== "") parametrsSearch.category = categories[0];
		if (req.query.category) parametrsSearch.category = req.query.category;
		let doctors = [];
		if ((token.role !== "admin") || (!token)) {
			let docs = await Doctor.model.find(parametrsSearch).sort(sortType);
			if (!docs) return {success: true, doctors: doctors};
			for (let doctor of docs) {
				let timetable = [];
				let timetableFilter = [];
				let seller = await Seller.model.findOne({ID: doctor.idDoctor});
				if (seller.status == 2) {
					let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic});
					let specialization = await Categories.model.findOne({name: doctor.category});
					//let image = config.config.backend + doctor.avatar;
					let saleInfo = await getSale(idUser, newUser, doctor.idDoctor);
					let item = {
						id: doctor.idDoctor,
						name: doctor.name,
						academicDegree: doctor.academicDegree,
						directions: doctor.directions,
						experience: doctor.experience,
						avatar: config.config.backend + doctor.avatar,
						avatarWebp: config.config.backend + doctor.avatarWebp,
						price: saleInfo.sale.sum > 0 ? Math.round((doctor.price + 0.2*doctor.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (doctor.price + 0.2*doctor.price).toFixed(0),
						oldPrice: saleInfo.sale.sum > 0 ? (doctor.price + 0.2*doctor.price).toFixed(0) : null,
						sale: saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null,
						cumulativeSale: saleInfo.cumulative,
						reviewsTotal: doctor.reviewsTotal,
						patientsTotal: doctor.pacientsTotal,
						category: specialization.nameRu,
						duration: specialization.duration,
						rating: doctor.rating.toFixed(1),
						isInFavoritesNow: token.role == "client" ? favorites.indexOf(doctor.idDoctor) !== -1 : null,
					}
					item.cumulativeSale.clinic = (doctor.doctorType == 'clinic') ? clinic.name : null;
					if (doctor.adress) {
						item.offline = true;
						item.priceOffline = doctor.priceOffline;

						if (!doctor.priceOffline) {
							let prices = clinic.priceOffline || clinic.price;
							let doctorUpdateInfo = {};
							for (onePrice of prices) {
								if (onePrice.category == doctor.category) doctorUpdateInfo.priceOffline = onePrice.price;
							}
							await Doctor.model.updateOne({idDoctor: doctor.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
							item.priceOffline = doctorUpdateInfo.priceOffline;
						} else {
							item.priceOffline = doctor.priceOffline;
						}
					}
					for (let time of doctor.timetable) {
						if ((DateTime.fromISO(time.time, {zone: req.query.timezone}).day - DateTime.now({zone: req.query.timezone}).day) >= 7 ) {
							continue
						}
						if ((!time.booked) && (DateTime.fromISO(time.time) > DateTime.now())) timetable.push(time.time);
					};
					item.timetable = timetable;
					if ((req.query.time) && (+req.query.time !== 0)) {
						let timeArr = req.query.time.split('-');
						for (date of timetable) {
							if ((DateTime.fromISO(date, {zone: req.query.timezone}).day - DateTime.now({zone: req.query.timezone}).day) >= 7 ) {
								continue
							}
							if (((DateTime.fromISO(date, {zone: req.query.timezone}).hour) >= +timeArr[0]) && ((DateTime.fromISO(date, {zone: req.query.timezone}).hour) < +timeArr[1])) timetableFilter.push(date);
						}
						item.timetable = timetableFilter;
					}


					if ((req.query.date) && (+req.query.date !== 0)) {
						let cons = false;
						for (date of timetable) {
							if (DateTime.fromISO(date, {zone: req.query.timezone}).toFormat("dd.LL.yyyy") === DateTime.fromISO(req.query.date, {zone: req.query.timezone}).toFormat("dd.LL.yyyy")) cons = true;
						}
						if (!cons) continue;
					}


					item.clinic = (doctor.doctorType == 'clinic') ? {name: clinic.name, id: doctor.idClinic} : null;

					if ((doctor.doctorType == 'clinic') && (clinic.offline)) {
						if (!doctor.priceOffline) {
							let prices = clinic.priceOffline || clinic.price;
							let doctorUpdateInfo = {};
							for (onePrice of prices) {
								if (onePrice.category == doctor.category) doctorUpdateInfo.priceOffline = onePrice.price;
							}
							await Doctor.model.updateOne({idDoctor: doctor.idDoctor}, {$set: doctorUpdateInfo}, {upsert: false});
							item.priceOffline = doctorUpdateInfo.priceOffline;
						} else {
							item.priceOffline = doctor.priceOffline;
						}
					} else item.priceOffline = null;

					item.adress = ((doctor.doctorType == 'clinic') && (clinic.offline)) ? doctor.adress : null;
					item.offline = ((doctor.doctorType == 'clinic') && (clinic.offline)) ? true : false;
					//console.log("req.query.online", req.query.online)
					//console.log("item.offline", item.offline)
					if (req.query.online === "false" && !item.offline) continue;
					if (doctor.shopID) doctors.push(item);
				}
			}
		} else {
			let docs = await Doctor.model.find();
			if (!docs) return {success: true, doctors: doctors};
			for (let doctor of docs) {
				let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic});
				let specialization = await Categories.model.findOne({name: doctor.category});
				//let image = config.config.backend + doctor.avatar;
				let saleInfo = await getSale(idUser, newUser, doctor.idDoctor);
				let item = {
					id: doctor.idDoctor,
					name: doctor.name,
					fio: doctor.fio,
					academicDegree: doctor.academicDegree,
					directions: doctor.directions,
					experience: doctor.experience,
					avatar: config.config.backend + doctor.avatar,
					avatarWebp: config.config.backend + doctor.avatarWebp,
					price: saleInfo.sale.sum > 0 ? Math.round((doctor.price + 0.2*doctor.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (doctor.price + 0.2*doctor.price).toFixed(0),
					oldPrice: saleInfo.sale.sum > 0 ? (doctor.price + 0.2*doctor.price).toFixed(0) : null,
					sale: saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null,
					cumulativeSale: saleInfo.cumulative,
					reviewsTotal: doctor.reviewsTotal,
					patientsTotal: doctor.pacientsTotal,
					timetable: doctor.timetable,
					category: specialization.nameRu,
					duration: specialization.duration,
					rating: doctor.rating.toFixed(1),
					isInFavoritesNow: token.role == "client" ? favorites.indexOf(doctor.idDoctor) !== -1 : null,
				}
				item.cumulativeSale.clinic = (doctor.doctorType == 'clinic') ? clinic.name : null;
				item.clinic = (doctor.doctorType == 'clinic') ? {name: clinic.name, id: doctor.idClinic} : null;
				doctors.push(item);
			}
		}
		let pageDoctors = doctors;
		if ((req.query.offset) || (req.query.limit)) pageDoctors = doctors.slice(+req.query.offset, (+req.query.offset) + (+req.query.limit));
		let count = doctors.length;
		let pagesAvailable = (req.query.limit) ? Math.ceil(count/req.query.limit) : 1;
		return {success: true, pagesAvailable: pagesAvailable, doctors: pageDoctors};
	}

	let getDoctorsInObject = async (categories) => {
		let doctors = [];
		let doctorsObj = {};
		let limit = req.query.limit ? req.query.limit : null;
		for (let item of categories) {
			let doctorsCategory = [];
			doctorsObj[item] = [];
			parametrsSearch.category = item;
			let doctorsArray = await Doctor.model.find(parametrsSearch).sort(sortType);
			if (!doctorsArray) return {success: true, doctors: doctors};
			for (doctor of doctorsArray) {
				let seller = await Seller.model.findOne({ID: doctor.idDoctor});
				if (seller.status == 2) {
					if (limit && doctorsCategory.length === +limit) continue;
					let timetable = [];
					//let image = config.config.backend + doctor.avatar;
					let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic});
					let saleInfo = await getSale(idUser, newUser, doctor.idDoctor);
					let oneDoctor = {
						id: doctor.idDoctor,
						name: doctor.name,
						academicDegree: doctor.academicDegree,
						directions: doctor.directions,
						experience: doctor.experience,
						avatar: config.config.backend + doctor.avatar,
						avatarWebp: config.config.backend + doctor.avatarWebp,
						price: saleInfo.sale.sum > 0 ? Math.round((doctor.price + 0.2*doctor.price)*(1 - saleInfo.sale.sum/100)).toFixed(0) : (doctor.price + 0.2*doctor.price).toFixed(0),
						oldPrice: saleInfo.sale.sum > 0 ? (doctor.price + 0.2*doctor.price).toFixed(0) : null,
						sale: saleInfo.sale.sum > 0 ? {name: saleInfo.sale.name, sum: saleInfo.sale.sum} : null,
						cumulativeSale: saleInfo.cumulative,
						reviewsTotal: doctor.reviewsTotal,
						patientsTotal: doctor.pacienstTotal,
						rating: doctor.rating.toFixed(1),
					}
					oneDoctor.cumulativeSale.clinic = (doctor.doctorType == 'clinic') ? clinic.name : null;

					for (let time of doctor.timetable) {
						let timeElement = time.time;
						if ((!time.booked) && (DateTime.fromISO(timeElement) > DateTime.now())) timetable.push(timeElement);
					};
					oneDoctor.timetable = timetable;
					oneDoctor.clinic = (doctor.doctorType == 'clinic') ? {name: clinic.name, id: doctor.idClinic} : null;


					if ((req.query.object == "true") && (doctor.shopID)) doctorsCategory.push(oneDoctor);
					if ((!req.query.object) && (doctor.shopID)) doctors.push(oneDoctor);


				}
			};
			doctorsObj[item] = await doctorsCategory;
		}
		if (req.query.object == "true") {
			return {success: true, doctors: doctorsObj};
		} else {
			let pageDoctors = doctors;
			if ((req.query.offset) || (req.query.limit)) pageDoctors = doctors.slice(+req.query.offset, (+req.query.offset) + (+req.query.limit));

			let count = doctors.length;
			let pagesAvailable = (req.query.limit) ? Math.ceil(count/req.query.limit) : 1;
			return {success: true, pagesAvailable: pagesAvailable, doctors: pageDoctors};
		}
	}
	(categories.length == 1) ? getCatalog(categories).then(result => res.send(result)) : getDoctorsInObject(categories).then(result => res.send(result));
});

module.exports = router;