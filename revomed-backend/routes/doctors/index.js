const routerDoctors = app => {
    app.use(require('./post-doctors'));
    app.use(require('./get-doctors'));
    app.use(require('./update-doctors'));
    app.use(require('./get-doctors-id'));
}

module.exports = routerDoctors;