const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ConsultationSchema = new Schema({
  idConsultation: Number,
  idDoctor: Number,
  idClient: Number,
  idClinic: Number,
  payment_id: String,
  process_payment: String,
  link: String,
  date: String,
  duration: Number,
  timeEnd: String,
  files: Array,
  recomendation: String,
  category: String,
  price: Number,
  commission: Number,
  profit: Number,
  step: Number,
  clientSocketID: String,
  doctorSocketID: String,
  offline: Boolean,
  adress: String,
});

exports.model = mongoose.model("Consultation", ConsultationSchema);