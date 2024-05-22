const routerUsersAdmins = app => {
    app.use(require('./post-admins'));
    app.use(require('./get-admins'));
}

module.exports = routerUsersAdmins;