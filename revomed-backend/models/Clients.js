const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ClientSchema = new Schema({
	name: String,
	phone: String,
	salt: String,
	hash: String,
	idClient: Number,
	code: Number,
	date: Date,
	dateBirth: String,
 	sex: Number, // 1 - female, 0 - male
 	favoriteDoctors: Array,
  	favoritePosts: Array,
  	blocked: Boolean,
  	timezone: String,
  	socketID: String,
});

exports.model = mongoose.model("Client", ClientSchema);