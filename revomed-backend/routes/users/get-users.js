//request for get user status
const express = require('express');
const router = express.Router();
const jwt = require('../../modules/jwt.js');
const config = require('../../config/config.js');

const Client = require('../../models/Clients.js');
const Doctor = require('../../models/Doctors.js');
const Clinic = require('../../models/Clinics.js');
const Seller = require('../../models/Sellers.js');
const Farm = require('../../models/Farms.js');

router.get('/users', (req, res, next) => {
	let token = jwt.updateJWT(req.cookies.token, res, req.headers["user-agent"]);
	if (!token) {
		return res.send({success: true, type: 'vizitor'});
	}
	if (!token.confirm) {
		return res.send({success: false, message: 'Нет доступа в личный кабинет'});
	}
	if (token.role == 'admin') {
		return res.send({success: true, type: 'vizitor'});
	}
	if (token.role == 'client') {

		if (!token.confirm) {
			return res.send({success: true, type: "unconfirmed", info: {name: null}});
		} else {
			Client.model.findOne({idClient: token.id}, (err, user) => {
				if (!user) {
					return res.send({success: false, type: 'unconfirmed', info: {name: null}});
				}
				console.log('name', user.name)
				Client.model.updateOne({idClient: token.id}, {$set: {timezone: req.query.timezone}}, {upsert: false}, (err, update) => {
					return res.send({success: true, type: 'client', id: token.id, info: {name: user.name || null}});
				})
			})
		}
	}
	if (token.role == 'clinic') {
		Seller.model.findOne({ID: token.id, type: "clinic"}, (err, seller) => {
			if (seller.status == 1) {
				return res.send({success: true, type: "unconfirmed", info: {name: null}});
			} else if (seller.status == 3) {
				return res.send({success: true, type: "blocked", info: {name: null}});
			} else {
				Clinic.model.findOne({idClinic: token.id}, (err, user) => {
					Doctor.model.find({idClinic: token.id}, (err, doctors) => {
						Clinic.model.updateOne({idClinic: token.id}, {$set: {timezone: req.query.timezone}}, {upsert: false}, (err, update) => {
							return res.send({success: true, type: 'clinic', id: token.id, info: {name: user.name, managerName: user.managerName, totalDoctors: doctors.length, link: user.link, offline: user.offline, modules: user.modules}});
						})
					})
				})
			}
		})
	}
	if (token.role == 'clinicDoctor') {
		Seller.model.findOne({ID: token.id, type: "doctor"}, (err, seller) => {
			if (!seller) {
				return res.send({success: false, type: 'unconfirmed'});
			}
			if (seller.status == 1) {
				return res.send({success: true, type: "unconfirmed", info: {name: null}});
			} else if (seller.status == 3) {
				return res.send({success: true, type: "blocked", info: {name: null}});
			}else {
				Doctor.model.findOne({idDoctor: token.id}, (err, user) => {
					Doctor.model.updateOne({idDoctor: token.id}, {$set: {timezone: req.query.timezone}}, {upsert: false}, (err, update) => {
						return res.send({success: true, type: 'clinicDoctor', id: token.id, info: {name: user.name, avatar: config.config.backend + user.avatar}});
					})
				})
			}
		})
	}
	if (token.role == 'doctor') {
		Seller.model.findOne({ID: token.id, type: "doctor"}, (err, seller) => {
			if (!seller) {
				return res.send({success: false, type: 'unconfirmed'});
			}
			if (seller.status == 1) {
				return res.send({success: true, type: "unconfirmed", info: {name: null}});
			} else if (seller.status == 3) {
				return res.send({success: true, type: "blocked", info: {name: null}});
			}else {
				Doctor.model.findOne({idDoctor: token.id}, (err, user) => {
					Doctor.model.updateOne({idDoctor: token.id}, {$set: {timezone: req.query.timezone}}, {upsert: false}, (err, update) => {
						return res.send({success: true, type: 'doctor', id: token.id, info: {name: user.name, avatar: config.config.backend + user.avatar, modules: user.modules}});
					})
				})
			}
		})
	}
	if (token.role == 'farm') {
		Seller.model.findOne({ID: token.id, type: "farm"}, (err, seller) => {
			if (!seller) {
				return res.send({success: false, type: 'unconfirmed'});
			}
			if (seller.status == 3) {
				return res.send({success: true, type: "blocked", info: {name: null}});
			}
			Farm.model.findOne({idFarm: token.id}, (err, user) => {
				Farm.model.updateOne({idFarm: token.id}, {$set: {timezone: req.query.timezone}}, {upsert: false}, (err, update) => {
					return res.send({success: true, type: 'farm', id: token.id, info: {name: user.name, managerFio: user.managerFio}});
				})
			})
		})
	}
});

module.exports = router;