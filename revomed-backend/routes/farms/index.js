const routerFarms = app => {
    app.use(require('./post-farms'));
    app.use(require('./get-farms'));
    app.use(require('./get-farms-id'));
    app.use(require('./put-farms'));
}

module.exports = routerFarms;