const routerNotifications = app => {
    app.use(require('./get-notifications'));
}

module.exports = routerNotifications;