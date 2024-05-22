const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const Doctor = require('../models/Doctors.js');
const Farm = require('../models/Farms.js');
const Clinic = require('../models/Clinics.js');
const Seller = require('../models/Sellers.js');
const Admin = require('../models/Admins.js');
const Client = require('../models/Clients.js');
const crypto = require('crypto');
const mail = require("./mail.js");
const smsc = require('./smsc_api.js');

smsc.configure({
    login : 'Revomed',
    password : 'Aviator212',
    ssl : true,
    charset : 'utf-8',
});

let randomString = (i) => {
	let rnd = '';
	while (rnd.length < i) 
		rnd += Math.random().toString(9).substring(2);
	return rnd.substring(0, i);
};


passport.use('registration-doctor', new LocalStrategy({
	usernameField : 'email',
	passwordField : 'email'
},
function(login, password, done) {
	Seller.model.findOne({ 'login' :  login.toLowerCase() }, function(err, seller) {
		if (err)
			return done(err);
		if (seller) {
			return done(null, false, { message: 'Пользователь с таким email адресом уже существует.' });
		}
		password = Math.random().toString(36).slice(-8);
		let salt = crypto.randomBytes(32).toString('hex');
		let hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
		let idDoctor = 1;
		let idSeller = 1;
		Doctor.model.find({}, (err, doctors) => {
			Seller.model.find({}, (err, users) => {
				if (err)
					return done(err);
				if (doctors.length !== 0) idDoctor = doctors[doctors.length-1].idDoctor + 1;
				if (users.length !== 0) idSeller = users[users.length-1].idSeller + 1;
				let newDoctor = new Doctor.model({email: login.toLowerCase(), idDoctor: idDoctor});
				newDoctor.save(function (err) {
					if (err) return handleError(err);
					let newSeller = new Seller.model({login: login.toLowerCase(), password: hash, salt: salt, type: "doctor", status: 1, idSeller: idSeller, ID: idDoctor});
					newSeller.save(function (err) {
						if (err) return handleError(err);
					})
					mail('regDoc', login.toLowerCase(), "Вы зарегистрировались", {login: login.toLowerCase(), password: password});
					return done(null, newDoctor);
				})
			})
		});
	})
}));

passport.use('registration-farm', new LocalStrategy({
	usernameField : 'email',
	passwordField : 'email'
},
function(login, password, done) {
	Seller.model.findOne({ 'login' :  login.toLowerCase() }, function(err, seller) {
		if (err)
			return done(err);
		if (seller) {
			return done(null, false, { message: 'Пользователь с таким email адресом уже существует.' });
		}
		password = Math.random().toString(36).slice(-8);
		let salt = crypto.randomBytes(32).toString('hex');
		let hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
		let idFarm = 1;
		let idSeller = 1;
		Farm.model.find({}, (err, farms) => {
			Seller.model.find({}, (err, users) => {
				if (err)
					return done(err);
				if (farms.length !== 0) idFarm = farms[farms.length-1].idFarm + 1;
				if (users.length !== 0) idSeller = users[users.length-1].idSeller + 1;
				let newFarm = new Farm.model({email: login.toLowerCase(), idFarm: idFarm});
				newFarm.save(function (err) {
					if (err) return handleError(err);
					let newSeller = new Seller.model({login: login.toLowerCase(), password: hash, salt: salt, type: "farm", status: 1, idSeller: idSeller, ID: idFarm});
					newSeller.save(function (err) {
						if (err) return handleError(err);
					})
					mail('regDoc', login.toLowerCase(), "Вы зарегистрировались", {login: login.toLowerCase(), password: password});
					return done(null, newFarm);
				})
			})
		});
	})
}));


passport.use('registration-clinic', new LocalStrategy({
	usernameField : 'managerEmail',
	passwordField : 'managerEmail'
},
function(login, password, done) {
	Seller.model.findOne({ 'login' :  login.toLowerCase() }, function(err, seller) {
		if (err)
			return done(err);
		if (seller) {
			return done(null, false, { message: 'Пользователь с таким email адресом уже существует.' });
		}

		password = Math.random().toString(36).slice(-8);
		let salt = crypto.randomBytes(32).toString('hex');
		let hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
		let idClinic = 1;
		let idSeller = 1;
		Clinic.model.find({}, (err, clinics) => {
			Seller.model.find({}, (err, users) => {
				if (err)
					return done(err);
				if (clinics.length !== 0) idClinic = clinics[clinics.length-1].idClinic + 1;
				if (users.length !== 0) idSeller = users[users.length-1].idSeller + 1;
				let newClinic = new Clinic.model({managerEmail: login.toLowerCase(), idClinic: idClinic});
				newClinic.save(function (err) {
					if (err) return handleError(err);
					let newSeller = new Seller.model({login: login.toLowerCase(), password: hash, salt: salt, type: "clinic", status: 1, idSeller: idSeller, ID: idClinic});
					newSeller.save(function (err) {
						if (err) return handleError(err);
					})
					mail('regDoc', login.toLowerCase(), "Вы зарегистрировались", {login: login.toLowerCase(), password: password});
					return done(null, newClinic);
				})
			})
		});
	})
}));


passport.use('login-users', new LocalStrategy({
	usernameField: 'phone',
	passwordField: 'phone'
},
function(login, password, done) {
	Client.model.findOne({ 'phone' :  login }, function(err, user) {
		if (err) return done(err);
		console.log(user)
		let now = new Date();
		if (user) {
			if (user.blocked == true) return done(null, false, { message: 'Вы истратили попытки входа, попробуйте позже' });
			
			let interval = ((now - user.date)/1000).toFixed(0);
			if (interval < 30) {
				return done(null, user);
			} else {
				let code = randomString(4);
				if (code.length !== 4) {
					while (code.length !== 4) {
						code = randomString(4);
					}
				}
				Client.model.updateOne({phone: user.phone}, {$set: {code: code, date: now}}, {upsert: false}, (err, client) => {
					if (err) return done(err);
					let phone = user.phone.slice(1)
					smsc.send_sms({
   						phones : [phone],
   						mes : 'Ваш код для входа в личный кабинет: ' + code,
						sender : "Revomed.ru"
					}, function (data, raw, err, code) {
    					if (err) return console.log(err, 'code: '+code);
    					console.log(data); // object
    					console.log(raw); // string in JSON format
					});
					return done(null, user);
				})
			}
		} else {
			let id = 1;
			let code = randomString(4);
			if (code.length !== 4) {
				while (code.length !== 4) {
					code = randomString(4);
				}
			}
			let date = new Date();
			Client.model.find({}, (err, clients) => {
				if (err) return done(err);
				if (clients.length !== 0) id = clients[clients.length-1].idClient + 1;
				let newClient = new Client.model({phone: login, idClient: id, code: code, date: date});
				newClient.save(function (err) {
					if (err) return handleError(err);
					let phone = login.slice(1)
					smsc.send_sms({
   						phones : [phone],
   						mes : 'Ваш код для входа в личный кабинет: ' + code,
						sender : "Revomed.ru"
					}, function (data, raw, err, code) {
    					if (err) return console.log(err, 'code: '+code);
    					console.log(data); // object
    					console.log(raw); // string in JSON format
					});
					return done(null, newClient);
				})
			})
		} 
	})
}));

passport.use('login-sellers', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
},
function(login, password, done) {
	console.log('dd')
	Seller.model.findOne({login: login.toLowerCase()}, function(err, user) {
		if (!user) {
			return done(null, false, { message: 'Неправильный email-адрес' });
		} else {
			let hashVerify = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');
			if (hashVerify == user.password) {
				return done(null, user, { message: 'okkkk' });
			} else {
				return done(null, false, { message: 'Неправильный пароль' });
			}
		}
	})
}));

passport.use('login-admins', new LocalStrategy({
	usernameField: 'login',
	passwordField: 'password'
},
function(login, password, done) {
	Admin.model.findOne({login: login}, function(err, user) {
		if (!user) {
			return done(null, false, { message: 'Неправильный логин' });
		} else {
			let hashVerify = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');
			if (hashVerify === user.password) {
				return done(null, user, { message: 'okkkk' });
			} else {
				return done(null, false, { message: 'Неправильный пароль' });
			}
		}
	})
}));


module.exports = passport;