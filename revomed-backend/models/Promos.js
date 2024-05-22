const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PromoSchema = new Schema({
	idPromo: Number,
	name: String,
  	type: String, // fixed / cumulative
  	category: String, // all / name category
  	idDoctor: Number,
  	idClinic: Number,
  	data: {
  		sale: Number, // only for fixed
  		minSale: Number, // only for cumulative
  		maxSale: Number, // only for cumulative
  		step: Number, // only for cumulative
  		numConsultation: Number, // only for cumulative
  		dateStart: String, // only for fixed
  		dateEnd: String, // only for fixed
  	}
});

exports.model = mongoose.model("Promo", PromoSchema);