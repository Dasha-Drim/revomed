const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let CheckupSchema = new Schema({
  name: String,
  annotation: String,
  description: String,
  price: Number,
  surveys: Array,
  symptoms: Array,
  idCheckup: Number,
  consultation: Boolean,
  idClinic: Number,
});

exports.model = mongoose.model("Checkup", CheckupSchema);