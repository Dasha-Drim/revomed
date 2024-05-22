const routerFarmsArticles = app => {
    app.use(require('./get-articles'));
    app.use(require('./post-articles'));
    app.use(require('./get-articles-id'));
    app.use(require('./put-articles'));
    app.use(require('./delete-articles'));
}

module.exports = routerFarmsArticles;