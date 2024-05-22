const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const bodyParser  = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('node-error-handler');
const config = require('./config/config.js');

let indexDoctors = require('./routes/doctors/index');
let indexCategories = require('./routes/categories/index');
let indexClinics = require('./routes/clinics/index');
let indexUsers = require('./routes/users/index');
let indexAdmins = require('./routes/users/admins/index');
let indexReviews = require('./routes/reviews/index');
let indexSearch = require('./routes/search/index');
let indexFilters = require('./routes/doctors/filters/index');
let indexTimetable = require('./routes/doctors/timetables/index');
let indexPrices = require('./routes/doctors/prices/index');
let indexDoctorsShopID = require('./routes/doctors/shopID/index');
let indexClinicsShopID = require('./routes/clinics/shopID/index');
let indexPosts = require('./routes/posts/index');
let indexFavorites = require('./routes/users/clients/favorites/index');
let indexUsersClients = require('./routes/users/clients/index');
let indexUsersSellers = require('./routes/users/sellers/index');
let indexConsultation = require('./routes/consultations/index');
let indexNotifications = require('./routes/notifications/index');
let indexConsultationFiles = require('./routes/consultations/files/index');
let indexUserSellersPassword = require('./routes/users/sellers/password/index');
let indexConsultationsRocommendations = require('./routes/consultations/recommendations/index');
let indexDoctorsWaiting = require('./routes/doctors/waiting/index');
let indexClinicsCheckups = require('./routes/clinics/checkups/index');
let indexClinicsCheckupsApplications = require('./routes/clinics/checkups/applications/index');
let indexClinicsPromos = require('./routes/clinics/promos/index');
let indexDoctorsPromos = require('./routes/doctors/promos/index');


let indexFarmsArticlesImage = require('./routes/farms/articles/image/index');
let indexFarmsArticlesLink = require('./routes/farms/articles/link/index');
let indexFarms = require('./routes/farms/index');
let indexFarmsBanners = require('./routes/farms/banners/index');
let indexFarmsProducts = require('./routes/farms/products/index');
let indexFarmsArticles = require('./routes/farms/articles/index');
let indexSubcategories = require('./routes/subcategories/index');
let indexChecking = require('./routes/farms/cheсking/index');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('etag', false)

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(function(req, res, next) {
  var allowedOrigins = [config.config.frontend, config.config.adminFrontend];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
   res.setHeader('Access-Control-Allow-Origin', origin);
 }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "origin, Content-Type, X-Requested-With, accept");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Content-Type",'application/json');
  res.set('Cache-Control', 'no-store')
  return next();
});



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
  global.originRequest = req.get('origin');
  next();
});

app.use(errorHandler({ debug: true, trace: true, camel_case: false }));


indexPrices(app);
indexDoctors(app);
indexCategories(app);
indexPosts(app);
indexClinics(app);
indexFilters(app);
indexTimetable(app);
indexReviews(app);
indexSearch(app);
indexFavorites(app);
indexUsersClients(app);
indexUsersSellers(app);
indexConsultation(app);
indexUsers(app);
indexAdmins(app);
indexConsultationFiles(app);
indexUserSellersPassword(app);
indexConsultationsRocommendations(app);
indexNotifications(app);
indexDoctorsShopID(app);
indexClinicsShopID(app);
indexDoctorsWaiting(app);
indexClinicsCheckups(app);
indexClinicsCheckupsApplications(app);
indexClinicsPromos(app);
indexDoctorsPromos(app);

indexFarmsArticlesImage(app);
indexFarmsArticlesLink(app);
indexFarms(app);
indexSubcategories(app);
indexFarmsBanners(app);
indexFarmsProducts(app);
indexFarmsArticles(app);
indexChecking(app);

// connecting mongoDB
const uri = 'mongodb://admin:admin123@localhost:20000/revomedCopy?authSource=admin';
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.set('useFindAndModify', false);







//var path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const Doctors = require('./models/Doctors.js');
const Posts = require('./models/Posts.js');
const Clinics = require('./models/Clinics.js');

let getFiles = async (dirPath) => {
  let files = fs.readdirSync(dirPath);
    return files
}
let deleteFiles = async (file) => {
 fs.unlink(file, err => {
      if(err) throw err; // не удалось удалить файл
      console.log('Файл успешно удалён');
  });
}

// doctors avatar / licenseFile / passportFiles  =>  /uploads/16257052814261.jpeg
// posts photo  =>   /uploads/16257129816931.jpeg
// clinics logo  =>   /uploads/16257129816931.jpeg


let compressAllFiles = async () => {
  let files = await getFiles('./uploads');
  console.log("files", files)

  for (file of files) {
    console.log("file", file)
    let currentFile = "./uploads/"+file;
    let arr = file.split(".");
    //if (arr[1] === "webp") continue;
    //.jpeg({ quality: 50, mozjpeg: true })
    let dataWebp = await sharp(currentFile).webp().toFormat("webp").toFile('./uploads/'+arr[0]+'.webp', (err, info) => { 
      console.log("err", err);
      console.log("info", info);
    });
    let dataJpeg = await sharp(currentFile).jpeg({ quality: 50, mozjpeg: true }).toFile('./uploads/'+arr[0]+"new"+'.jpeg', (err, info) => { 
      console.log("err", err);
      console.log("info", info);
    });
    //await deleteFiles("./uploads/"+file);
  }
}
//compressAllFiles();

let replacementPhotoDoctor = async () => {
  let files = await getFiles('./uploads');
  for (file of files) {
    let arr = file.split(".");
    let result = arr[0].match(/new/);
    
    if (result && result.length) continue;
    if (arr[1] === "webp") continue;
    let doctor = await Doctors.model.findOne({"avatar": "/uploads/"+file});
    console.log("doctor", doctor);
    if (!doctor) continue;
    console.log("doctor", doctor);
    //console.log(" arr[0]",  file);
    await Doctors.model.updateOne({idDoctor: doctor.idDoctor}, {$set: {avatar: "/uploads/" + arr[0]+"new"+".jpeg", avatarWebp: "/uploads/" + arr[0]+".webp"}}, {upsert: false});
  }
}

let replacementPhotoPost = async () => {
  let files = await getFiles('./uploads');
  for (file of files) {
    let arr = file.split(".");
    let result = arr[0].match(/new/);
    if (result && result.length) continue;
    if (arr[1] === "webp") continue;
    let post = await Posts.model.findOne({"photo": "/uploads/"+file});
    //console.log("post", post);
    if (!post) continue;
    console.log("post", post);
    await Posts.model.updateOne({idPost: post.idPost}, {$set: {photo: "/uploads/" + arr[0]+"new"+".jpeg", photoWebp: "/uploads/" + arr[0]+".webp"}}, {upsert: false});
  }
}

let replacementPhotoClinic = async () => {
  let files = await getFiles('./uploads');
  for (file of files) {
    let arr = file.split(".");
    let result = arr[0].match(/new/);
    if (result && result.length) continue;
    if (arr[1] === "webp") continue;
    let clinic = await Clinics.model.findOne({"logo": "/uploads/"+file});
    //console.log("clinic", clinic);
    if (!clinic) continue;
    console.log("clinic", clinic);
    await Clinics.model.updateOne({idClinic: clinic.idClinic}, {$set: {logo: "/uploads/" + arr[0]+"new"+".jpeg", logoWebp: "/uploads/" + arr[0]+".webp"}}, {upsert: false});
  }
}


/*replacementPhotoDoctor();
replacementPhotoPost();
replacementPhotoClinic();*/







//require('./routes')(app);
module.exports = app;
