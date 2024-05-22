const {DateTime} = require('luxon');

const Consultations = require('../models/Consultations.js');
const Doctors = require('../models/Doctors.js');
const Clinics = require('../models/Clinics.js');
const Categories = require('../models/Categories.js');
const Promos = require('../models/Promos.js');

module.exports = async (idUser, newUser, idDoctor) => {
	let sale = !newUser ? {sum: 0} : {sum: 10, name: "revomed"};
	let cumulativeData = {on: false}
	let doctor = await Doctors.model.findOne({idDoctor: idDoctor});
	if (doctor.doctorType === "clinic") {
		let clinic = await Clinics.model.findOne({idClinic: doctor.idClinic});
		if (!clinic.modules.promo) return {sale: sale, cumulative: cumulativeData};
		let promos = await Promos.model.find({idClinic: clinic.idClinic, category: {$in : [doctor.category, "all"]}});
		for (promo of promos) {
			if (promo.type === "fixed") {
				if (!promo.data.dateEnd && !promo.data.dateStart) {
					sale.sum = promo.data.sale > sale.sum ? promo.data.sale : sale.sum;
					sale.name = "fixed";
				} else {
					let now = DateTime.now();
				let dateEndArr = promo.data.dateEnd.split(".");
				let dateEnd = DateTime.fromObject({day: dateEndArr[0], month: dateEndArr[1], year: dateEndArr[2]});
				let dateStartArr = promo.data.dateStart.split(".");
				let dateStart = DateTime.fromObject({day: dateStartArr[0], month: dateStartArr[1], year: dateStartArr[2]});

				if (( now <= dateEnd) && (now >= dateStart)) {
					sale.sum = promo.data.sale > sale.sum ? promo.data.sale : sale.sum;
					sale.name = "fixed";
				}
				}
			} else {
				cumulativeData.on = true;
				cumulativeData.maxSale = promo.data.maxSale
				cumulativeData.minSale = promo.data.minSale
				cumulativeData.step = promo.data.step
				cumulativeData.numConsultation = promo.data.numConsultation
				if (promo.data.numConsultation === 0) {
					if (promo.data.minSale > sale.sum) {
						sale.sum = promo.data.minSale;
						sale.name = "cumulative" ;
					}
				} else {
					if (!idUser) continue;
					let doctors = promo.category === "all" ? await Doctors.model.find({idClinic: doctor.idClinic}) : await Doctors.model.find({idClinic: doctor.idClinic, category: promo.category});
					let consultationsSum = 0;

					for (oneDoctor of doctors) {
						let consultations = await Consultations.model.find({idDoctor: oneDoctor.idDoctor, idClient: idUser, offline: false});
						consultationsSum += consultations.length;
					}
					if (promo.data.numConsultation > consultationsSum) continue;
					let cumulativeSale = promo.data.minSale + (consultationsSum - promo.data.numConsultation)*promo.data.step;
					sale.sum = (cumulativeSale > promo.data.maxSale && promo.data.maxSale > sale.sum) ? promo.data.maxSale : (cumulativeSale > sale.sum) ? cumulativeSale : sale.sum;
					sale.name = "cumulative";
				}
			}
		}
	} else {
		if (!doctor.modules.promo) return {sale: sale, cumulative: cumulativeData};
		let promos = await Promos.model.find({idDoctor: doctor.idDoctor, category: {$in : [doctor.category, "all"]}});
		for (promo of promos) {
			if (promo.type === "fixed") {
				if (!promo.data.dateEnd && !promo.data.dateStart) {
					sale.sum = promo.data.sale > sale.sum ? promo.data.sale : sale.sum;
					sale.name = "fixed";
				} else {
					let now = DateTime.now();
				let dateEndArr = promo.data.dateEnd.split(".");
				let dateEnd = DateTime.fromObject({day: dateEndArr[0], month: dateEndArr[1], year: dateEndArr[2]});
				let dateStartArr = promo.data.dateStart.split(".");
				let dateStart = DateTime.fromObject({day: dateStartArr[0], month: dateStartArr[1], year: dateStartArr[2]});

				if (( now <= dateEnd) && (now >= dateStart)) {
					sale.sum = promo.data.sale > sale.sum ? promo.data.sale : sale.sum;
					sale.name = "fixed";
				}
				}

				
			} else {
				cumulativeData.on = true;
				cumulativeData.maxSale = promo.data.maxSale
				cumulativeData.minSale = promo.data.minSale
				cumulativeData.step = promo.data.step
				cumulativeData.numConsultation = promo.data.numConsultation
				if (promo.data.numConsultation === 0) {
					if (promo.data.minSale > sale.sum) {
						sale.sum = promo.data.minSale;
						sale.name = "cumulative" ;
					}
				} else {
					if (!idUser) continue;
					let consultations = await Consultations.model.find({idDoctor: doctor.idDoctor, idClient: idUser});
					if (promo.data.numConsultation < consultations.length) continue;
					let cumulativeSale = promo.data.minSale + (consultations.length - promo.data.numConsultation)*promo.data.step;
					sale.sum = (cumulativeSale > promo.data.maxSale && promo.data.maxSale > sale.sum) ? promo.data.maxSale : (cumulativeSale > sale.sum) ? cumulativeSale : sale.sum;
					sale.name = "cumulative";
				}
			}
		}
	}
	return {sale: sale, cumulative: cumulativeData}
}