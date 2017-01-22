/**
 * 信息推送服务类 Created by Alan.wu on 2016/3/31.
 */
let logger = require('../resources/logConf').getLogger('pushInfoService'); // 引入log4js
let liveRoomAPIService = require('./liveRoomAPIService');
let Deferred = require("../util/common").Deferred;
/**
 * 定义信息推送服务类
 * 
 * @type {{}}
 */
var pushInfoService = {
    /**
     * 提取信息推送列表
     */
    getPushInfo: (groupType, roomId, clientGroup, position, callback) => {
        let deferred = new Deferred();
        let path = "/pushInfo/getPushInfo";
        path += "?groupType=" + groupType;
        path += "&roomId=" + roomId;
        path += "&clientGroup=" + clientGroup;
        path += "&position=" + position;
        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("getPushInfo! >>getPushInfo:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 检查推送是否符合条件
     * 
     * @param groupType
     * @param roomId
     * @param clientGroup
     * @param position
     * @param filterTime
     * @param callback
     */
    checkPushInfo: (groupType, roomId, clientGroup, position, filterTime, callback) => {
        let deferred = new Deferred();
        let path = "/pushInfo/checkPushInfo";
        path += "?groupType=" + groupType;
        path += "&roomId=" + roomId;
        path += "&clientGroup=" + (clientGroup || "");
        path += "&position=" + position;
        path += "&filterTime=" + filterTime;
        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("checkPushInfo! >>checkPushInfo:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    }
};

// 导出服务类
module.exports = pushInfoService;
