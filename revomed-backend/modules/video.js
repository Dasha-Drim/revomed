//module video call
const cookie = require('cookie');
const jwt = require('./jwt.js');

const Doctor = require('../models/Doctors.js');
const Client = require('../models/Clients.js');
const Consultation = require('../models/Consultations.js');

let video = io => {
	// Array to map all clients connected in socket
	let otherUsers = [];
	let consultations = [];

	// Called whend a client start a socket connection
	io.of("/video").on('connection', (socket) => {
		console.log('connection')
		const cookies = cookie.parse(socket.request.headers.cookie || '');
		let token = jwt.decodeToken(cookies.token);
		socket.on('readyToVideoCall', async (data) => {
			let consultationsItemIndex = consultations.findIndex((item) => item.link === data.link);
			if(consultationsItemIndex !== -1) {
				// consultation item already exist
				if (token.role === 'client') {
					if (consultations[consultationsItemIndex].client) {
						io.of("/video").to(consultations[consultationsItemIndex].client).emit('you-disconnected');
						io.of("/video").in(consultations[consultationsItemIndex].client).disconnectSockets();
					}
					consultations[consultationsItemIndex].client = socket.id;
				}
				if (token.role === 'doctor' || token.role === 'clinicDoctor') {
					if (consultations[consultationsItemIndex].doctor) {
						io.of("/video").to(consultations[consultationsItemIndex].doctor).emit('you-disconnected');
						io.of("/video").in(consultations[consultationsItemIndex].doctor).disconnectSockets();
					}
					consultations[consultationsItemIndex].doctor = socket.id;
				}
			} else {
				// no consultation item
				let newConsultationsItem = {};
				newConsultationsItem.link = data.link;
				newConsultationsItem.client = null;
				newConsultationsItem.doctor = null;
				if (token.role === 'client') newConsultationsItem.client = socket.id;
				if (token.role === 'doctor' || token.role === 'clinicDoctor') newConsultationsItem.doctor = socket.id;
				consultations.push(newConsultationsItem);
			}

			let currentConsultation = consultations.find((item) => item.link === data.link);
			let otherUser = token.role === 'client' ? currentConsultation.doctor : currentConsultation.client;
			if(!otherUser) otherUser = [];
			else otherUser = [otherUser];
			socket.emit('other-users', otherUser);
		})


	  	// Send Offer To Start Connection
	  	socket.on('offer', (socketId, description) => {
	  		socket.to(socketId).emit('offer', socket.id, description);
	  	});

	  	// Send Answer From Offer Request
	  	socket.on('answer', (socketId, description) => {
	  		socket.to(socketId).emit('answer', description);
	  	});

	   	// Send Signals to Establish the Communication Channel
	   	socket.on('candidate', (socketId, candidate) => {
	   		socket.to(socketId).emit('candidate', candidate);
	   	});

	  	// Remove client when socket is disconnected
	  	socket.on('disconnect', () => {
	  		console.log('disconnect', consultations);
	  		// get other user
	  		let currentConsultationIndex = consultations.findIndex((item) => item.client === socket.id || item.doctor === socket.id);
	  		if(currentConsultationIndex === -1) return false;

	  		console.log("consultations[currentConsultationIndex]", consultations[currentConsultationIndex]);
	  		let otherUser = token.role === 'client' ? consultations[currentConsultationIndex].doctor : consultations[currentConsultationIndex].client;
	  		
	  		// send socket and disconnect
	  		io.of("/video").to(otherUser).emit('other-disconnected');
	  		socket.disconnect();

	  		// clear consultations
	  		if(token.role === 'client') {
	  			consultations[currentConsultationIndex].client = null;
	  		} else {
	  			consultations[currentConsultationIndex].doctor = null;
	  		}
	  		if(!consultations[currentConsultationIndex].client && !consultations[currentConsultationIndex].doctor) consultations.splice(currentConsultationIndex, 1);
	  	});
	  });
}

module.exports = video;