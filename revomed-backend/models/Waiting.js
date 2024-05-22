const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let WaitingSchema = new Schema({
	idDoctor: Number,
	idClient: Number,
});

exports.model = mongoose.model("Waiting", WaitingSchema);