// update timetable seller
const express = require('express');
const router = express.Router();
const jwt = require('../../../modules/jwt.js');
const smsc = require('../../../modules/smsc_api.js');
const {DateTime} = require('luxon');

const Doctor = require('../../../models/Doctors.js');
const Waiting = require('../../../models/Waiting.js');
const Clients = require('../../../models/Clients.js');

smsc.configure({
	login : 'Revomed',
	password : 'Aviator212',
	ssl : true,
	charset : 'utf-8',
});

//function sort date in timetable
let sortDate = (a, b) => {
	a = DateTime.fromISO(a.time);
	b = DateTime.fromISO(b.time);
	if (a > b) return 1;
	if (a < b) return -1;
}

let sendSMS = (phone, text) => {
	smsc.send_sms({
		phones : [phone],
		mes : text,
		sender : "Revomed.ru"
	}, function (data, raw, err, code) {
		if (err) return console.log(err, 'code: '+code);
    	console.log(data); // object
    	console.log(raw); // string in JSON format
    });
}

router.put('/doctors/timetables/:id', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: false, message: 'Вы не авторизованы'});
	}
	let arr = [];
	let sendTimetable = req.body;

	if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
		Doctor.model.findOne({idDoctor: token.id}, {timetable : 1, fio: 1}, (err, doctor) => {
			let currentTimetable = doctor.timetable;
			currentTimetable.forEach(timetableItem => {
				if (timetableItem.booked) {
					sendTimetable = sendTimetable.filter(el => el !== timetableItem.time);
					arr.push(timetableItem);
				}
			})
			sendTimetable.forEach(element => {
				let item = {
					time: element,
					booked: false,
				}
				arr.push(item);
			})
			// filters date in new timetable
			let newTimetable = [...new Set(arr.map(item => item.time))];
			newTimetable = newTimetable.map((item, key) => newTimetable[key] = {time: item, booked: arr.findIndex(obj => obj.time === item && obj.booked === true) !== -1})
			newTimetable.sort(sortDate);
			Doctor.model.updateOne({idDoctor: token.id}, {$set: {timetable : newTimetable}}, {upsert: false}, async (err, doc) => {
				if (err) return  res.send({success: false, message: "Ошибка сервера. Попробуйте позже"});
				let waitingList = await Waiting.model.find({idDoctor: token.id});
				for (item of waitingList) {
					console.log("item.idClient", item);
					let client = await Clients.model.findOne({idClient: item.idClient});
					console.log("client", client);
					// отправляем смс пользователям
					sendSMS(client.phone.slice(1), "У врача " + doctor.fio + " появились свободные записи. Посмотреть: https://revomed.ru/doctor/" + token.id);
					await Waiting.model.deleteOne({idDoctor: token.id, idClient: item.idClient});
				}
				return res.send({success: true});
			})
		})
	} else if (token.role == "clinic") {
		console.log("req.body", req.body)
		console.log("sendTimetable", sendTimetable)
		Doctor.model.findOne({idDoctor: req.params.id}, {timetable : 1, fio: 1}, (err, doctor) => {
			let currentTimetable = doctor.timetable;
			console.log("doctor.timetable", doctor.timetable);
			currentTimetable.forEach(timetableItem => {
				if (timetableItem.booked) {
					sendTimetable = sendTimetable.filter(el => el !== timetableItem.time);
					arr.push(timetableItem);
				}
			})
			sendTimetable.forEach(element => {
					let item = {
						time: element,
						booked: false,
					}
					arr.push(item);
				})
			let newTimetable = [...new Set(arr.map(item => item.time))];
			console.log("newTimetable", newTimetable);
			newTimetable = newTimetable.map((item, key) => newTimetable[key] = {time: item, booked: arr.findIndex(obj => obj.time === item && obj.booked === true) !== -1})
			newTimetable.sort(sortDate);
			Doctor.model.updateOne({idDoctor: req.params.id}, {$set: {timetable : newTimetable}}, {upsert: false}, async (err, doc) => {
				if (err) return  res.send({success: false, message: "Ошибка сервера. Попробуйте позже"});
				let waitingList = await Waiting.model.find({idDoctor: req.params.id});
				for (item of waitingList) {
					let client = await Clients.model.findOne({idClient: item.idClient});
					console.log("client", client);
					// отправляем смс пользователям
					sendSMS(client.phone.slice(1), "У врача " + doctor.fio + " появились свободные записи. Посмотреть: https://revomed.ru/doctor/" + req.params.id);
					await Waiting.model.deleteOne({idDoctor: req.params.id, idClient: item.idClient});
				}
				return res.send({success: true});
			})
		})
	}
	else {
		return res.send({success: false});
	}
});

module.exports = router;