const routerUsersSellersPassword = app => {
    app.use(require('./post-password'));
    app.use(require('./update-password'));
}
module.exports = routerUsersSellersPassword;