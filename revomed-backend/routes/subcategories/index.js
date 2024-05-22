const routerSubcategories = app => {
    app.use(require('./post-subcategories'));
    app.use(require('./get-subcategories'));
    app.use(require('./delete-subcategories'));
    app.use(require('./get-subcategories-id'));
}

module.exports = routerSubcategories;