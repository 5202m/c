const config = require('./../resources/config'); //资源文件
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const connectRedis = require('connect-redis')

class ChatSession {
    constructor() {
        this.session = null;
        this.cookieParser = null;
    }

    _initSession(store) {
        let sessionSettings = {
            key: config.sessionConfig.key,
            secret: config.sessionConfig.secret,
            resave: true,
            saveUninitialized: true
                /*,cookie: {maxAge: 30000} 已在startRedisSession中设置，无需再次设置*/
        };
        if (store) {
            sessionSettings.store = store;
        }
        this.cookieParser = cookieParser(config.sessionConfig.secret);
        this.session = expressSession(sessionSettings);
    }

    _startRedisSession() {
        let RedisStore = connectRedis(expressSession),
            store = new RedisStore({
                host: config.redisUrlObj.host,
                port: config.redisUrlObj.port,
                db: 2, //使用2号库
                ttl: 60 * 60 * 24 //redis数据库中无效的Session，设置有效期为一天。
            });
        this._initSession(store);
    }

    startSession(app) {
        this._startRedisSession();
        if (app) {
            app.use(this.cookieParser);
            app.use(this.session);
            app.session = this.session;
        }
    }
};

//导出服务
module.exports = new ChatSession();