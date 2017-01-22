let logger = require('../resources/logConf').getLogger('chatSubscribeTypeService'); // 引入log4js
let liveRoomAPIService = require('./liveRoomAPIService');
let Deferred = require("../util/common").Deferred;

/**
 * 可订阅服务类型服务类
 * 
 */
let chatSubscribeTypeService = {
    /**
     * 获取有效订阅服务类型数据
     * 
     * @param params
     * @param callback
     */
    getSubscribeTypeList: (params, callback) => {
        let deferred = new Deferred();
        let path = "/subscribe/getSubscribeTypeList";
        path += "?groupType=" + params.groupType;
        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("查询数据失败! >>getSubscribeTypeList:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    }
};
// 导出服务类
module.exports = chatSubscribeTypeService;
