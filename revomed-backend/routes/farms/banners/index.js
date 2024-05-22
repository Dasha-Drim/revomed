const routerFarmsBanners = app => {
    app.use(require('./get-banners'));
    app.use(require('./post-banners'));
    app.use(require('./get-banners-id'));
    app.use(require('./put-banners'));
    app.use(require('./delete-banners'));
}

module.exports = routerFarmsBanners;