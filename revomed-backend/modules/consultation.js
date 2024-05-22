const {DateTime} = require('luxon');
const Agenda = require('agenda');
const cookie = require('cookie');

const mail = require("./mail.js");
const kassa_api = require("./kassa_api.js");
const kassa_api_info_payment = require("./kassa_api_info_payment.js");
const jwt = require('./jwt.js');
const config = require('../config/config.js');
const smsc = require('./smsc_api.js');

const Consultation = require('../models/Consultations.js');
const Doctor = require('../models/Doctors.js');
const Clinic = require('../models/Clinics.js');
const Category = require('../models/Categories.js');
const Client = require('../models/Clients.js');
const Notification = require('../models/Notifications.js');

smsc.configure({
	login : 'Revomed',
	password : 'Aviator212',
	ssl : true,
	charset : 'utf-8',
});

// db change
const agenda = new Agenda({ db: { address: "mongodb://admin:admin123@localhost:20000/revomedCopy?authSource=admin", collection: "agendaJobs"}});
agenda.start();

// get io instance
let getIORecur = (resolve) => {
	if(typeof io === "undefined") setTimeout(() => getIORecur(resolve), 50);
	else resolve(io);
}

let getIO = new Promise(function(resolve, reject) {
	getIORecur(resolve);
});
// / get io instance

/*let getInfoAboutPayment = async (id) => {
	let result;
	let timerId = setInterval(async () => {
		result = await kassa_api_info_payment(id);
		console.log("result", result)

		let newTimetable = [];
		let consultation = await Consultation.model.findOne({payment_id: result.id});
		console.log('consultation', consultation)
		if (!consultation) return clearInterval(timerId);
		if (result.status == 'canceled') {
			console.log('canceled');
			let doctor = await Doctor.model.findOne({idDoctor: consultation.idDoctor}, {timetable: 1});
			console.log('doctor', doctor)
			for (timetableItem of doctor.timetable) {
				if (timetableItem.time == consultation.date) newTimetable.push({ time: timetableItem.time, booked: false });
				else newTimetable.push(timetableItem);
			}
			let updated = await Doctor.model.updateOne({idDoctor: consultation.idDoctor},{$set: {timetable: newTimetable}}, {upsert: false})
			let removed = await Consultation.model.deleteOne({payment_id: result.id});
			console.log('updated', updated);
			clearInterval(timerId);
			return 200;
		} else if ((result.status == 'waiting_for_capture') || (result.status == 'succeeded')){
			let status;
			if (result.status == 'waiting_for_capture') status = 'paymentInProcess';
			if (result.status == 'succeeded') status = 'paymentSuccess';
			let updated = await Consultation.model.updateOne({payment_id: result.id}, {$set: {process_payment: status}}, {upsert: false});
			getActionsConsultation(result.id);
			clearInterval(timerId);
	      	if (result.status == 'succeeded') {
	      		status = 'paymentSuccess';
	      		let updated = await Consultation.model.updateOne({payment_id: result.id}, {$set: {process_payment: status}}, {upsert: false});	
	      	}
	      }
	  }, 60000)
}*/

endConsultation = async (idConsultation) => {
	await agenda.cancel({ data: {idConsultation: idConsultation}});
	let consultation = await  Consultation.model.findOne({idConsultation: idConsultation}, {idDoctor: 1});
	let doctor = await  Doctor.model.findOne({idDoctor: consultation.idDoctor}, {pacientsTotal: 1});
	let patients = doctor.pacientsTotal + 1
	await Consultation.model.updateOne({idConsultation: idConsultation}, {$set: {step: 5}}, {upsert: false});
	await Doctor.model.updateOne({idDoctor: consultation.idDoctor}, {$set: {pacientsTotal: patients}}, {upsert: false});
	return {success: true}
}

let ConsultationSocket = async () => {
	let ioServer = await getIO;
	ioServer.of("/consultation").on('connection', async (socket) => {
		const cookies = cookie.parse(socket.request.headers.cookie || '');
		let token = jwt.decodeToken(cookies.token);

		socket.on('readyToConsultation', async (data) => {
			let consultation = await Consultation.model.findOne({link: data.link});
			if (token.role == "client") {
				if (consultation.clientSocketID) ioServer.of("/consultation").to(consultation.clientSocketID).emit('deviceChanged', {message: "Данная страница не активна, так как вы сменили устройство или вкладку браузера."});
				await Consultation.model.updateOne({link: data.link}, {$set: {clientSocketID: socket.id}}, {upsert: false});
			}
			if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
				if (consultation.doctorSocketID) ioServer.of("/consultation").to(consultation.doctorSocketID).emit('deviceChanged', {message: "Данная страница не активна, так как вы сменили устройство или вкладку браузера."});
				await Consultation.model.updateOne({link: data.link}, {$set: {doctorSocketID: socket.id}}, {upsert: false});
			}
		})

		socket.on('consultationCurrentStatus', (data) => {
			Consultation.model.findOne({link: data.link}, (err, consultation) => {
				let status;
				if ((consultation.step == 2) || (consultation.step == 3)) status = "notStarted";
				if (consultation.step == 4) status = "inProgress";
				if (consultation.step == 5) status = "completed";
				socket.emit('consultationCurrentStatusAnswer', {status: status});

				if (token.role == "client") {
					socket.emit('doctorIsOnline', {online: !!consultation.doctorSocketID});
					ioServer.of("/consultation").to(consultation.doctorSocketID).emit('clientIsOnline', {online: true});
				}
				if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
					socket.emit('clientIsOnline', {online: !!consultation.clientSocketID});
					ioServer.of("/consultation").to(consultation.clientSocketID).emit('doctorIsOnline', {online: true});
				}
			})
		});

		socket.on('userWantsToStartConsultation', async (data) => {
			let consultation = await Consultation.model.findOne({link:data.link});
			let now = DateTime.now();
			let startConsultation = DateTime.fromISO(consultation.date);
			if (now >= startConsultation) {
				socket.emit('consultationStartsAnswer', {success: true});
				ioServer.of("/consultation").to(consultation.doctorSocketID).emit('consultationStartsAnswer', {success: true});
				ioServer.of("/consultation").to(consultation.doctorSocketID).emit('consultationCurrentStatusAnswer', {status: "inProgress"});
				await Consultation.model.updateOne({link: data.link}, {$set: {step: 4}}, {upsert: false})
			} else {
				socket.emit('consultationStartsAnswer', {success: false, message: "Время начала консультации ещё не наступило. Попробуйте позже"});
			}
		});

		socket.on('userWantsToEndConsultation', (data) => {
			Consultation.model.findOne({link:data.link}, (err, consultation) => {
				endConsultation(consultation.idConsultation).then(result => {
					socket.emit('consultationEndsAnswer', result);
					ioServer.of("/consultation").to(consultation.doctorSocketID).emit('consultationCurrentStatusAnswer', {status: "completed"});
				})
			})
		});

		socket.on('disconnect', async (data) => {
			if (token.role == "client") {
				let consultation = await Consultation.model.findOne({clientSocketID: socket.id})
				await Consultation.model.updateOne({clientSocketID: socket.id}, {$unset: {clientSocketID: 1}});
				if (consultation.doctorSocketID) ioServer.of("/consultation").to(consultation.doctorSocketID).emit('clientIsOnline', {online: false});
			}
			if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
				let consultation = await Consultation.model.findOne({doctorSocketID: socket.id})
				await Consultation.model.updateOne({doctorSocketID: socket.id}, {$unset: {doctorSocketID: 1}});
				if (consultation.clientSocketID) ioServer.of("/consultation").to(consultation.clientSocketID).emit('doctorIsOnline', {online: false});
			}
		})
	});
}
ConsultationSocket();


let notificationSocket = async () => {
	let ioServer = await getIO;
	ioServer.of("/notify").on('connection', async (socket) => {
		const cookies = cookie.parse(socket.request.headers.cookie || '');
		if (cookies.token) {
			let token = jwt.decodeToken(cookies.token);
			socket.on('readyToHearNotifications', async (data) => {
				if (token.role == "client") {
					await Client.model.updateOne({idClient: token.id}, {$set: {socketID: socket.id}}, {upsert: false});
				}
				if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
					await Doctor.model.updateOne({idDoctor: token.id}, {$set: {socketID: socket.id}}, {upsert: false});
				}
				if ((token.role == "doctor") || (token.role == "clinicDoctor")) {
					await Clinic.model.updateOne({idClinic: token.id}, {$set: {socketID: socket.id}}, {upsert: false});
				}
			})
			socket.on('notificationsHaveBeenRead', async (data) => {
				let updated = await Notification.model.updateMany({idUser: token.id}, {$set: {read: true}}, {upsert: false});
			})
		}
		
	});
}
notificationSocket();


let sendSocket = async (id, type, data = {}) => {
	let ioServer = await getIO;
	if (type == "endConsultation") ioServer.of("/consultation").to(id).emit('consultationCurrentStatusAnswer', {status: "completed"});
	if (type == "notify") {
		let notification = {
			text: data.text,
			idUser: data.id,
			typeUser: data.typeUser,
			link: data.link || null,
		}
		let newNotification = new Notification.model(notification);
		try {
			let saveNotification = await newNotification.save();
			ioServer.of("/notify").to(id).emit('newNotification', {text: data.text, date: DateTime.now().toISO(), read: false, link: data.link || null});
		} catch (err) {console.log('err' + err)}
	}
	
}
let sendSMS = (phone, text) => {
	smsc.send_sms({
		phones : [phone],
		mes : text
	}, function (data, raw, err, code) {
		if (err) return console.log(err, 'code: '+code);
    	console.log(data); // object
    	console.log(raw); // string in JSON format
    });
}


agenda.define(
	"informaition users", 
	{ priority: "high", concurrency: 10 },
	async (job) => {
		let data = job.attrs.data;
		let doctor = await Doctor.model.findOne({idDoctor: data.idDoctor}, {email: 1, fio: 1, timezone: 1, type: 1, idClinic: 1, socketID: 1});
		let client = await Client.model.findOne({idClient: data.idClient}, {socketID: 1, phone: 1, timezone: 1});
		let consultation = await Consultation.model.findOne({idConsultation: data.idConsultation}, {date: 1, offline: 1, adress: 1});

		console.log("client", client);
		console.log("consultation", consultation);

		let normalDate = DateTime.fromISO(consultation.date, {zone: doctor.timezone}).setLocale('ru').toFormat('dd.LL.yyyy HH:mm');
		let normalDateClient = DateTime.fromISO(consultation.date, {zone: client.timezone}).setLocale('ru').toFormat('dd.LL.yyyy HH:mm');
		//mail('booked', doctor.email, "Пациент забронировал онлайн-консультацию с вами", {date: normalDate}, doctor.fio);

		sendSocket(doctor.socketID, "notify", {text: "Пользователь забронировал консультацию", typeUser: 'doctor', id: +data.idDoctor});
		sendSocket(client.socketID, "notify", {text: "Вы забронировали консультацию", typeUser : 'client', id: data.idClient});
		if (doctor.type == 'clinic') {
			let clinic = await Clinic.model.findOne({idClinic: doctor.idClinic}, {socketID: 1});
			sendSocket(clinic.socketID, "notify", {text: "Пользователь забронировал консультацию с врачом клиники", typeUser: 'clinic', date: consultation.date, id: doctor.idClinic});
		}

		console.log("client.phone.slice(1)", client.phone.slice(1))
		if (!consultation.offline) {
			//sendSMS(client.phone.slice(1), "Вы забронировали консультацию: " + normalDateClient);
			console.log("send online sms")
		} else {
			//sendSMS(client.phone.slice(1), "Вы записались на очную консультацию по адресу: " + consultation.adress + ". Врач: " + doctor.fio + ". Дата консультации: " + normalDateClient + ". REVOMED");
			console.log("send offline sms");
		}
		console.log("all good")
		await Consultation.model.updateOne({idConsultation: data.idConsultation}, {$set: {step: 2}}, {upsert: false});
	}
	);
agenda.define(
	"informaition users 2 hour", 
	{ priority: "high", concurrency: 10 },
	async (job) => {
		let data = job.attrs.data;
		let doctor = await Doctor.model.findOne({idDoctor: data.idDoctor}, {email: 1, fio: 1, timezone: 1, socketID: 1});
		let client = await Client.model.findOne({idClient: data.idClient}, {socketID: 1, phone: 1, timezone: 1});
		let consultation = await Consultation.model.findOne({idConsultation: data.idConsultation}, {date: 1, offline: 1, adress: 1});

		let normalDate = DateTime.fromISO(consultation.date, {zone: doctor.timezone}).setLocale('ru').toFormat('dd.LL.yyyy HH:mm');
		let normalDateClient = DateTime.fromISO(consultation.date, {zone: client.timezone}).setLocale('ru').toFormat('dd.LL.yyyy HH:mm');
		//mail('twoHours', doctor.email, "Консультация начнется через 2 часа", {date: normalDate}, doctor.fio);

		if (consultation.offline) sendSMS(client.phone.slice(1), "Напоминаем, что ваша консультация в клинике по адресу: " + consultation.adress + " начнется через 2 часа. REVOMED");

		sendSocket(doctor.socketID, "notify", {text: "Консультация начнется через 2 часа", typeUser: 'doctor', id: data.idDoctor});
		sendSocket(client.socketID, "notify", {text: "Консультация начнется через 2 часа", typeUser : 'client', id: data.idClient});
	}
	);
agenda.define(
	"informaition users 15 min", 
	{ priority: "high", concurrency: 10 },
	async (job) => {
		let data = job.attrs.data;
		let doctor = await Doctor.model.findOne({idDoctor: data.idDoctor}, {email: 1, fio: 1, timezone: 1});
		let client = await Client.model.findOne({idClient: data.idClient}, {socketID: 1});
		let consultation = await Consultation.model.findOne({idConsultation: data.idConsultation}, {date: 1, link: 1, offline: 1});

		let normalDate = DateTime.fromISO(consultation.date, {zone: doctor.timezone}).setLocale('ru').toFormat('dd.LL.yyyy HH:mm');
		//mail('fifteenMinutes', doctor.email, "Консультация начнется через 15 минут", {date: normalDate}, doctor.fio);
		
		if (!consultation.offline) {
			sendSocket(doctor.socketID, "notify", {text: "Консультация начнется через 15 минут", typeUser: 'doctor', id: data.idDoctor, link: "/link/" + consultation.link});
			sendSocket(client.socketID, "notify", {text: "Консультация начнется через 15 минут", typeUser : 'client', id: data.idClient, link: "/link/" + consultation.link});
			//sendSMS(client.phone.slice(1), "Revomed.ru: Консультация начнется через 15 минут, перейдите в личный кабинет");
		}
	}
	);
agenda.define(
	"start consultation",
	{ priority: "high", concurrency: 10 },
	async (job) => {
		const data = job.attrs.data;
		let doctor = await Doctor.model.findOne({idDoctor: data.idDoctor}, {email: 1, fio: 1, timezone: 1});
		let client = await Client.model.findOne({idClient: data.idClient}, {socketID: 1, phone: 1});
		let consultation = await Consultation.model.findOne({idConsultation: data.idConsultation}, {date: 1, link: 1, offline: 1});

		if (!consultation.offline) {
			sendSocket(doctor.socketID, "notify", {text: "Консультация началась", typeUser: 'doctor', id: data.idDoctor, link: "/link/" + consultation.link});
			sendSocket(client.socketID, "notify", {text: "Консультация началась", typeUser : 'client', id: data.idClient, link: "/link/" + consultation.link});
		}
		
		await Consultation.model.updateOne({idConsultation: data.idConsultation}, {$set: {step: 3}}, {upsert: false});
	}
	);
agenda.define(
	"end consultation",
	{ priority: "high", concurrency: 10 },
	async (job) => {
		const data = job.attrs.data;
		let doctor = await Doctor.model.findOne({idDoctor: data.idDoctor}, {email: 1, fio: 1, timezone: 1, socketID: 1, pacientsTotal: 1});
		let client = await Client.model.findOne({idClient: data.idClient}, {socketID: 1, phone: 1});
		let consultation = await Consultation.model.findOne({idConsultation: data.idConsultation});
		console.log("consultation", consultation)
		console.log("client", client)
		console.log("doctor", doctor)
		//mail('endConsultation', doctor.email, "Консультация завершилась", {}, doctor.fio);

		if (!consultation.offline) {
			console.log("end1")
			sendSocket(consultation.doctorSocketID, "endConsultation");
			sendSocket(consultation.clientSocketID, "endConsultation");

		} else {
			console.log("end3")
			sendSocket(doctor.socketID, "notify", {text: "Консультация завершилась", typeUser: 'doctor', id: data.idDoctor});
			sendSocket(doctor.socketID, "notify", {text: "Консультация завершилась, вы можете оставить отзыв врачу", typeUser: 'client', id: data.idClient, link: "/write/review/" + consultation.link});
			//sendSMS(client.phone.slice(1), "Revomed.ru: Консультация завершилась, вы можете оставить отзыв врачу по ссылке: " + "https://revomed.ru/write/review/" + consultation.link);
		}
		

		let patients = doctor.pacientsTotal + 1;
		if (!consultation.offline) {
			console.log("end2")
			let kassaRequestResult = await kassa_api({}, '/' + consultation.payment_id + '/capture');

			let event = kassaRequestResult.status;
			let status;
			if (event == 'succeeded') {
				status = 'paymentSuccess';
				console.log('HOLDING COMPLETED');
			} else {
				console.log('HOLDING ERROR');
			}
			await Consultation.model.updateOne({idConsultation: data.idConsultation}, {$set: {process_payment: status}}, {upsert: false});
		}
		await Consultation.model.updateOne({idConsultation: data.idConsultation}, {$set: {step: 5}}, {upsert: false});
		await Doctor.model.updateOne({idDoctor: data.idDoctor}, {$set: {pacientsTotal: patients}}, {upsert: false});
		console.log("end!!!")
	}
	);

let getRandomString = (count) => {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < count; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

// 1 - забронированно
// 2 - проинформированно
// 3 - начало
// 4 - в процессе
// 5 - завершилась


let getActionsConsultation = async (id, offline = false) => {
	console.log("fffff");

	let consultation;
	if (offline) consultation = await Consultation.model.findOne({idConsultation: id}, {date: 1, idDoctor: 1, idClient: 1, idConsultation: 1, timeEnd: 1});
	else consultation = await Consultation.model.findOne({payment_id: id}, {date: 1, idDoctor: 1, idClient: 1, idConsultation: 1, timeEnd: 1});

	let now = DateTime.now();
	let beforeTwoHours = DateTime.fromISO(consultation.date).minus({ hours: 2 });
	let beforeFifteenMinutes = DateTime.fromISO(consultation.date).minus({ minutes: 15 });
	let start = DateTime.fromISO(consultation.date);
	let avterConsultation = DateTime.fromISO(consultation.timeEnd);

	let infoForAgenda = {
		idConsultation: consultation.idConsultation,
		idClient: consultation.idClient,
		idDoctor: consultation.idDoctor,
	}

	await agenda.schedule(now, "informaition users", infoForAgenda);
	if (now < beforeTwoHours) await agenda.schedule(beforeTwoHours, "informaition users 2 hour", infoForAgenda);
	if (now < beforeFifteenMinutes) await agenda.schedule(beforeFifteenMinutes, "informaition users 15 min", infoForAgenda);
	await agenda.schedule(start, "start consultation", infoForAgenda);
	await agenda.schedule(avterConsultation, "end consultation", infoForAgenda);
	return 200;
}

let bookedConsultation = async (time, offline, idDoctor, idClient, sale) => {
	offline = (offline == "true") ? true : false;
	let id = 1;
	let timetable = [];
	let result;
	let consultations = await Consultation.model.find({});
	for (oneConsiltation of consultations) {
		if ((oneConsiltation.date == time) && (oneConsiltation.idDoctor == idDoctor)) return {success: false, message: "Данное время уже забронировано."}
	}
	if (consultations.length !== 0) id = consultations[consultations.length-1].idConsultation + 1;
	let link = getRandomString(16);
	let consultation = {
		idConsultation: id,
		idDoctor: idDoctor,
		idClient: idClient,
		link: link,
		date: time,
		offline: offline,
		//step: 1,
		step: 2,
	}
	let doctor = await Doctor.model.findOne({idDoctor: idDoctor}, {category: 1, doctorType: 1, idClinic: 1, timetable: 1, price: 1, fio: 1, shopID: 1, adress: 1, priceOffline: 1});
	consultation.category = doctor.category;

	if (!offline) {
		consultation.price = (doctor.price + (0.2*doctor.price)).toFixed(0);
		consultation.commission = (0.2*doctor.price).toFixed(0);
		consultation.profit = doctor.price;
		if (sale > 0) {
			consultation.price = Math.round((doctor.price + 0.2*doctor.price)*(1-sale/100)).toFixed(0);
			consultation.commission = (0.2*Math.round((doctor.price + 0.2*doctor.price)*(1-sale/100))).toFixed(0);
		}
	} else {
		console.log("doctor.adress", doctor.adress);
		consultation.adress = doctor.adress.adress;
		consultation.price = doctor.priceOffline;
		consultation.profit = doctor.priceOffline;
	}

	if (doctor.doctorType == 'clinic') {
		consultation.idClinic = doctor.idClinic;
	}
	doctor.timetable.forEach((timetableItem) => {
		let item = {};
		if (timetableItem.time == time) {
			if (timetableItem.booked == true) {
				result = {success: false, message: 'Это время уже забронировано'}
				return result;
			}
			item = {
				time: time,
				booked: true,
			}
			timetable.push(item)
		} else {
			timetable.push(timetableItem)
		}
	})
	let info = await Category.model.findOne({name: doctor.category})
	consultation.duration = info.duration;
	let timeEnd = DateTime.fromISO(time).plus({minutes: info.duration });
	timeEnd.toISO();
	consultation.timeEnd = timeEnd;

	console.log("consultation.price", consultation.price)
	console.log("consultation.commission", consultation.commission)
	console.log("doctor.shopID", doctor.shopID)

	if (!offline) {
		let object = {
			amount: {
				value: consultation.price +'.00',
				currency: "RUB"
			},
			capture: false,
			confirmation: {
				type: "redirect",
				return_url: config.config.frontend + "/lk"
			},
			description: "Сеанс с доктором " + doctor.fio,
			"transfers": [{
				"account_id": doctor.shopID,
				"amount": {
					"value": consultation.price + '.00',
					"currency": "RUB"
				},
				"platform_fee_amount": {
					"value": consultation.commission + '.00',
					"currency": "RUB"
				}}]
			};
			try {
			// request to kassa
			//let kassaRequestResult = await kassa_api(object, '');
			// errors
			//if (kassaRequestResult.type == "error") return {success: false, message: 'Ошибка оплаты'};
			// redirect URL
			//let redirect_url = kassaRequestResult.confirmation.confirmation_url;
			//consultation.payment_id = kassaRequestResult.id;

			let redirect_url = "https://dev.unicreate.ru:4545/lk";
			getActionsConsultation(consultation.idConsultation);

			let updated = await Doctor.model.updateOne({idDoctor: idDoctor}, {$set: {timetable: timetable}});

			let newConsultation = new Consultation.model(consultation);
			let saveConsultation = await newConsultation.save();

			//getInfoAboutPayment(consultation.payment_id);

			result = {success: true, link: redirect_url}
			return result;

		} catch (err) {
			console.log('err' + err);
			result = {success: false, message: 'Не удалось забронировать консультацию'}
			return result;
		}
	} else {
		let updated = await Doctor.model.updateOne({idDoctor: idDoctor}, {$set: {timetable: timetable}});
		let newConsultation = new Consultation.model(consultation);
		let saveConsultation = await newConsultation.save();
		result = {success: true};
		getActionsConsultation(id, true);
		return result;
	}
}


module.exports.bookedConsultation = bookedConsultation;
module.exports.getActionsConsultation = getActionsConsultation;