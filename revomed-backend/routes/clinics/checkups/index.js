const routerCheckups = app => {
    app.use(require('./post-checkups'));
    app.use(require('./get-checkups'));
    app.use(require('./get-checkups-id'));
    app.use(require('./update-checkups'));
    app.use(require('./delete-checkups'));
}

module.exports = routerCheckups;