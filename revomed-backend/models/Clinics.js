const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ClinicSchema = new Schema({
  name: { type: String, default: "" },
  confirmation: { type: Number, default: 0 }, // подтверждение 0 -нет, 1 - есть
  managerFio: { type: String, default: "" },
  managerName: { type: String, default: "" },
  managerEmail: { type: String, default: "" },
  managerPhone: { type: String, default: "" },
  managerPosition: { type: String, default: "" },
  typeOrg: {type: String, default: ""},
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  licenseNumber: { type: String, default: "" },
  licenseFile: { type: String, default: "" },
  description: { type: String, default: "" },
  logo: String,
  logoWebp: String,
  link: { type: String, default: ""},
  price: { type: Array, default: [] },
  balance: { type: Number, default: 0 },
  idClinic: { type: Number, default: 1 },
  doctors: { type: Array, default: []},
  reviewsTotal: { type: Number, default: 0 },
  doctorsTotal: { type: Number, default: 0 },
  timezone: String,
  socketID: String,
  shopID: String,
  priceOffline: Array,
  adresses: Array,
  offline: Boolean,
  //!!!
  modules: {
    checkups: {type: Boolean, default: false},
    promo: {type: Boolean, default: false},
  }
});

exports.model = mongoose.model("Clinic", ClinicSchema);