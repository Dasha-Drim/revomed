const routerPosts = app => {
    app.use(require('./post-posts'));
    app.use(require('./update-posts'));
    app.use(require('./get-posts'));
    app.use(require('./delete-posts'));
    app.use(require('./get-posts-id'));
}

module.exports = routerPosts;