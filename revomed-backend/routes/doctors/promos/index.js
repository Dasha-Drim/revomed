const routerPromos = app => {
    app.use(require('./post-promos'));
    app.use(require('./get-promos'));
    app.use(require('./get-promos-id'));
    app.use(require('./update-promos'));
    app.use(require('./delete-promos'));
}

module.exports = routerPromos;