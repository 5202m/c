const liveRoomAPIService = require('./liveRoomAPIService');
const logger = require('../resources/logConf').getLogger("chatPointsService");
const Deferred = require("../util/common").Deferred;
const async = require('async');//引入async

class ChatService {
    constructor() {}
    getRoomOnlineTotalNum(groupId, callback) {
        let defer = new Deferred();
        let path = "/chat/getRoomOnlineTotalNum";
        path += "?groupId=" + groupId;
        liveRoomAPIService.get(path).then(function (data) {
            defer.resolve(data);
            if (callback) {
                callback(data);
            }
        }, function (err) {
            logger.error("getRoomOnlineTotalNum! >>getRoomOnlineTotalNum:", e);
            if (callback) {
                callback(err);
            }
            defer.reject(err);
        });
        return defer.promise;
    }
    acceptMsg(data) {
        let defer = new Deferred();
        let path = "/chat/acceptMsg";
        liveRoomAPIService.post(path, data).then(function (data) {
            defer.resolve(data);
        }, function (err) {
            logger.error("acceptMsg! >>acceptMsg:", err);
            defer.reject(err);
        });
        return defer.promise;
    }
    removeMsg(groupId, msgIds) {
        let defer = new Deferred();
        let path = "/chat/removeMsg";
        liveRoomAPIService.post(path, {
            groupId: groupId,
            msgIds: msgIds
        }).then(function (data) {
            defer.resolve(data);
        }, function (err) {
            logger.error("removeMsg! >>removeMsg:", err);
            defer.reject(err);
        });
        return defer.promise;
    }
    /**
     * 设置房间在线用户存储
     * @param groupId
     * @param roomUserArr
     */
    setRoomOnlineUserStore(key,roomUserArr){
        let storeKey = key.indexOf("onlineUser_") != -1 ? key : ("onlineUser_"+key);
        global.memored.store(storeKey, roomUserArr, err => {
            if(err){
                logger.error("setRoomOnlineUser[memored.store]->err:"+err);
            }
        });
    }
    /**
     * 提取房间在线用户
     * @param key 房间Id
     * @param callback
     */
    getRoomOnlineUser(key,callback){
        let storeKey = key.indexOf("onlineUser_")!=-1?key:("onlineUser_"+key);
        global.memored.read(storeKey, (err, roomUserArr) => {
            if(err){
                logger.error("getRoomOnlineUser[memored.read]->err:"+err);
                callback(null);
            }else{
                callback(roomUserArr);
            }
        });
    }

    /**
     * 清除缓存数据及强制离线，清除缓存的在线线用户
     * @param callback
     */
    clearAllData(callback){
        //更新缓存在线用户状态改成下线
        global.memored.keys((err, keys) => {
            if(err){
                logger.error("clearAllData has error!",err);
                callback(true);
                return;
            }
            async.each(keys, (key, callbackTmp) => {
                if(key.indexOf("onlineUser_")!=-1){
                    let roomId=key.replace("onlineUser_","");
                    userService.batchOfflineStatus(roomId);
                }else{
                    callbackTmp(null);
                }
            }, err => {
                if(err){
                    logger.error("clearAllData has error!",err);
                }
                global.memored.clean(() => {//移除所有缓存记录
                    logger.info('All cache entries have been deleted.');
                });
                callback(true);
            });
        });
    }
}
module.exports = new ChatService();
