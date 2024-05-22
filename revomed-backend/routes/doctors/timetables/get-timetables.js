// get timetable by seller
const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');
const jwt = require('../../../modules/jwt.js');

const Doctor = require('../../../models/Doctors.js');
const Category = require('../../../models/Categories.js');

let sortDate = (a, b) => {
	a = DateTime.fromISO(a.time)
	b = DateTime.fromISO(b.time)
	if (a > b) return 1;
	if (a < b) return -1;
}

router.get('/doctors/timetables/:id', (req, res, next) => {
	let timetable = [];
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	} 
	if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
		Doctor.model.findOne({idDoctor: token.id}, (err, doc) => {
			doc.timetable.forEach(el => {
				let date;
				if (DateTime.fromISO(el.time) < DateTime.now()) {
					date = DateTime.fromISO(el.time).plus({days: 7}).toUTC().toISO();
					timetable.push({time: date, booked: false});
				} else {
					timetable.push(el);
				}
			})
			let newTimetable = [...new Set(timetable.map(item => item.time))];
			newTimetable = newTimetable.map((item, key) => newTimetable[key] = {time: item, booked: timetable.findIndex(obj => obj.time === item && obj.booked === true) !== -1})
			newTimetable.sort(sortDate);
			Category.model.findOne({name: doc.category}, (err, category) => {
				Doctor.model.updateOne({idDoctor: token.id}, {$set: {timetable: newTimetable}}, {upsert: false},(err, updated) => {
					return res.send({success: true, timetable: newTimetable, interval: category.interval + category.duration}); // interfal + duration
				})
			})
		})
	} else if (token.role == "clinic"){
		Doctor.model.findOne({idDoctor: req.params.id}, (err, doc) => {
			doc.timetable.forEach(el => {
				let date;
				if (DateTime.fromISO(el.time) < DateTime.now()) {
					date = DateTime.fromISO(el.time).plus({days: 7}).toUTC().toISO();
					timetable.push({time: date, booked: false});
				} else {
					timetable.push(el);
				}
			})
			let newTimetable = [...new Set(timetable.map(item => item.time))];
			newTimetable = newTimetable.map((item, key) => newTimetable[key] = {time: item, booked: timetable.findIndex(obj => obj.time === item && obj.booked === true) !== -1});
			newTimetable.sort(sortDate);
			Category.model.findOne({name: doc.category}, (err, category) => {
				Doctor.model.updateOne({idDoctor:req.params.id}, {$set: {timetable: newTimetable}}, {upsert: false},(err, updated) => {
					return res.send({success: true, timetable: newTimetable, interval: category.interval + category.duration, adress: doc.adress || null});
				})
			})
		})
	}
	else {
		return res.send({success: false});
	}
});

module.exports = router;