const routerApplications = app => {
    app.use(require('./post-applications'));
    app.use(require('./get-applications'));
    app.use(require('./invite-applications'));
}

module.exports = routerApplications;