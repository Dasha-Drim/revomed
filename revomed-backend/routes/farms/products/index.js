const routerFarmsProducts = app => {
    app.use(require('./get-products'));
    app.use(require('./post-products'));
    app.use(require('./get-products-id'));
    app.use(require('./put-products'));
    app.use(require('./delete-products'));
}

module.exports = routerFarmsProducts;