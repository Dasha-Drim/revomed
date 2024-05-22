const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let NotificationSchema = new Schema({
  text: String,
  link: String,
  read: {type: Boolean, default: false},
  idUser: Number,
  typeUser: String,
  date: { type: Date, default: Date.now },
});

exports.model = mongoose.model("Notification", NotificationSchema);