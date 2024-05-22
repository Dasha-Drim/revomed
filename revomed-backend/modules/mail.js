const nodemailer = require("nodemailer");
// templates
const emailBookedDoctor  = require('./emailTemplate/emailBookedDoctor.js');
const emailEndConsultation  = require('./emailTemplate/emailEndConsultation.js');
const emailNotifyFifteenMinutes  = require('./emailTemplate/emailNotifyFifteenMinutes.js');
const emailNotifyTwoHours  = require('./emailTemplate/emailNotifyTwoHours.js');
const emailRegDoc  = require('./emailTemplate/emailRegDoc.js');
const applicationApproved  = require('./emailTemplate/applicationApproved.js');
const applicationRejected  = require('./emailTemplate/applicationRejected.js');
const emailForgetPassword  = require('./emailTemplate/emailForgetPassword.js');
const emailRegistrationUser  = require('./emailTemplate/emailRegistrationUser.js');
const mailingTemplate  = require('./emailTemplate/mailingTemplate.js');
const emailWaitingClinic  = require('./emailTemplate/emailWaitingClinic.js');
const emailWaitingDoc  = require('./emailTemplate/emailWaitingDoc.js');

const emailCheckupBooked  = require('./emailTemplate/emailCheckupBooked.js');

module.exports = async function sendEmail(type, mailTo, subject, data, name = "Дорогой клиент") {
	let transporter;
	try {
		transporter = nodemailer.createTransport({
			host: 'smtp.yandex.ru',
			port: 465,
	  		secure: true, // true for 465, false for other ports 587
	  		auth: {
	  		user: "hello@revomed.ru",
	  		pass: "kiunkodzperwinin"
	  	}
	});
	} catch (e) {
		return console.log('Error: ' + e.name + ":" + e.message);
	}

	let mail;
	if (type == 'booked') mail = emailBookedDoctor.template(name, data.date, data.timezone);
	if (type == 'twoHours') mail = emailNotifyTwoHours.template(name, data.date, data.timezone);
	if (type == 'fifteenMinutes') mail = emailNotifyFifteenMinutes.template(name, data.date, data.timezone);
	if (type == 'endConsultation') mail = emailEndConsultation.template(name);
	if (type == 'regDoc') mail = emailRegDoc.template(name, data.login, data.password);
	if (type == 'approved') mail = applicationApproved.template(name);
	if (type == 'reject') mail = applicationRejected.template(name);
	if (type == 'forgetPassword') mail = emailForgetPassword.template(name, data.link);
	if (type == 'admin') mail = emailRegistrationUser.template('', data.text);

	if (type == 'waitingClinic') mail = emailWaitingClinic.template(data.nameDoctor);
	if (type == 'waitingDoc') mail = emailWaitingDoc.template();

	if (type == 'checkupBooked') mail = emailCheckupBooked.template();

 	let info = await transporter.sendMail({
		from: '"REVOMED" <hello@revomed.ru>', 
		//to: mailTo, // list of receivers
		to: "daria@unicreate.ru",
		subject: subject, 
		html: mail,
	});
  	console.log("Message sent: %s", info.messageId);
}

