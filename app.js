"use strict";
const express = require('express');
const bodyParser = require('body-parser');

global.rootdir = __dirname;
let app = express();
app.use(bodyParser.json({
    limit : '50mb'
})); // 最大传输量
app.use(bodyParser.urlencoded({
    limit : "50mb",
    extended : true,
    parameterLimit : 50000
}));

// 设置session
require('./routes/chatSession').startSession(app);
require('./routes/index').init(app, express); // 配置同源页面路由
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
        error : '请求错误:' + err.status,
        reqPath : req.path.replace(/\/(.*studio)(\/.*)?/g, "$1")
    });
});
app.use((err, req, res, next) => {
    console.error("500错误", err);
    res.status(err.status || 500);
    res.render('error', {
        message : err.message,
        error : '500错误，请联系客服！'
    });
});

module.exports = app;
