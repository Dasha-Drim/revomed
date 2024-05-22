const routerDoctorsTimitables = app => {
    app.use(require('./get-timetables'));
    app.use(require('./update-timetables'));
}

module.exports = routerDoctorsTimitables;