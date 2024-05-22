const routerCategories = app => {
    app.use(require('./get-categories'));
    app.use(require('./get-categories-id'));
    app.use(require('./post-categories'));
    app.use(require('./delete-categories'));
}
module.exports = routerCategories;