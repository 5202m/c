var logger = require('../resources/logConf').getLogger("cacheClient");
var config = require("../resources/config");
var Deferred = require("../util/common").Deferred;
/**
 * 定义缓存连接的客户端
 * @type {exports}
 */
var redis = require("redis"); //引入redis
var cacheClient = redis.createClient(config.redisUrlObj.port,
    config.redisUrlObj.host, {}); //连接redis

cacheClient.on("error", function(err) { //错误监听
    logger.info("connect to redis has error:" + err);
});
module.exports = cacheClient;