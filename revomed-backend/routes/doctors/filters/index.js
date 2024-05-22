const routerFilters = app => {
    app.use(require('./get-filters'));
}

module.exports = routerFilters;