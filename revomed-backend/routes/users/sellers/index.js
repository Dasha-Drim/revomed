const routerUsersSellers = app => {
    app.use(require('./post-sellers'));
    app.use(require('./get-sellers'));
}

module.exports = routerUsersSellers;