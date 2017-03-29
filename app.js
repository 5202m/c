"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./resources/config');

global.rootdir = __dirname;
let app = express();
app.use(bodyParser.json({
    limit: '50mb'
})); // 最大传输量
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
}));

// 设置session
require('./routes/chatSession').startSession(app);
require('./routes/index').init(app, express); // 配置同源页面路由
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    res.status(err.status);
    var renderError = {
        errmsg: `请求错误: ${err.status}`,
        errcode: err.status,
        reqPath: req.path.replace(/\/(.*studio)(\/.*)?/g, "$1"),
        err: err
    };
    res.render('error', renderError);
});
app.use((err, req, res, next) => {
    console.error("500错误", err);
    var newErr = new Error('Not Found');
    newErr.status = err.status || err.code || 500;
    res.status(newErr.status);
    var renderError = {
        errmsg: `系统错误，请联系客服！`,
        errcode: newErr.status
    };
    if (config.isDevTest) {
        renderError.err = err;
    }
    res.render('error', renderError);
});

module.exports = app;