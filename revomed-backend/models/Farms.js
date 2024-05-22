const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let FarmSchema = new Schema({
	idFarm: Number,
	email: String,
	name: String,
	license: String,
	managerFio: String,
	managerPhone: String,
	logo: String,
	INN: String
});

exports.model = mongoose.model("Farm", FarmSchema);