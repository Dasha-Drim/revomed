const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ReviewSchema = new Schema({
	idReview: Number,
	idDoctor: Number,
	idClinic: Number,
	doctorName: String,
	idClient: Number,
	clientName: String,
	mark: Number,
	text: String,
	date: { type: Date, default: Date.now },
	consultation: String,
});

exports.model = mongoose.model("Review", ReviewSchema);