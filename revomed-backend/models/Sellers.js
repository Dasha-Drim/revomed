const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let SellersSchema = new Schema({
	login: String,
	password: String,
	salt: String,
  	type: String, // доктор клиника
  	link: String,
  	status: {type: Number, default: 0}, // 1 - не подтвержден, 2 - подтвержден, 3 - заблокирован 
  	idSeller: Number,
  	ID: Number,
});

exports.model = mongoose.model("Seller", SellersSchema);

// passport.js
// update doc adn clinic