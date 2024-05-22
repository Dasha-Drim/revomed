const routerUsersClients = app => {
    app.use(require('./post-clients'));
    app.use(require('./update-clients'));
    app.use(require('./get-clients-id'));
    app.use(require('./get-clients'));
}

module.exports = routerUsersClients;