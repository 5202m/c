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

var commands = ["get", "set", "del"];
commands.forEach((command, index) => {
    if (!cacheClient[command]) {
        logger.error(`redis.RedisClient doesn't have the command: ${command}`);
        return;
    }
    let newCommand = `${command}Async`;
    let commandFunc = cacheClient[command];
    cacheClient[newCommand] = () => {
        let deferred = new Deferred();
        let callback = (err, res) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(res);
            }
        };
        Array.prototype.push.call(arguments, callback);
        commandFunc.apply(cacheClient, arguments);
        return deferred.promise;
    };
});
cacheClient.on("error", function(err) { //错误监听
    logger.info("connect to redis has error:" + err);
});
module.exports = cacheClient;