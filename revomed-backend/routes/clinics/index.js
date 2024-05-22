const routerClinics = app => {
    app.use(require('./post-clinics'));
    app.use(require('./get-clinics'));
    app.use(require('./update-clinics'));
    app.use(require('./get-clinics-id'));
}

module.exports = routerClinics;