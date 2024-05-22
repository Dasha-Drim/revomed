const routerConsultation = app => {
    app.use(require('./get-consultations'));
    app.use(require('./post-consultations'));
    app.use(require('./get-consultations-id'));
    app.use(require('./cancel-consultation'));
    app.use(require('./post-kassa-webhooks'));
}

module.exports = routerConsultation;