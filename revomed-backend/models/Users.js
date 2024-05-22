const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let SellersSchema = new Schema({
  login: String,
  password: String,
  salt: String,
  type: String, // доктор клиника или клиент
});

exports.model = mongoose.model("Seller", SellersSchema);