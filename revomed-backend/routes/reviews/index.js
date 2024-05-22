const routerReviews = app => {
    app.use(require('./post-reviews'));
    app.use(require('./post-reviews-admin'));
    app.use(require('./update-reviews'));
    app.use(require('./get-reviews'));
    app.use(require('./delete-reviews'));
}

module.exports = routerReviews;