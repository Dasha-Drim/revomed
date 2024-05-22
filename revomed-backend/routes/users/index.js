const routerUsers = app => {
    app.use(require('./get-users'));
}

module.exports = routerUsers;