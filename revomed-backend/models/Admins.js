const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let AdminSchema = new Schema({
	login: String,
	password: String,
	salt: String,
});

exports.model = mongoose.model("Admin", AdminSchema);