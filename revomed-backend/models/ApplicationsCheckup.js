const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let CheckupSchema = new Schema({
  date: String,
  time: String,
  adress: String,
  idClient: Number,
  idClinic: Number,
  nameCheckup: String,
  idApplication: String,
  invite: { type: Boolean, default: false},
});

exports.model = mongoose.model("ApplicationsCheckup", CheckupSchema);