const routerUsersClientsFavorites = app => {
    app.use(require('./post-favorites'));
    app.use(require('./get-favorites'));
}

module.exports = routerUsersClientsFavorites;