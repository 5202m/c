const common = require('../util/common');//引入common类
const logger=require('../resources/logConf').getLogger('adminService');//引入log4js
const liveRoomAPIService = require('./liveRoomAPIService');
const querystring = require("querystring");
const Deferred = common.Deferred;

let adminService ={
    /**
     * 后台聊天室用户登录
     * @param userNo 用户名
     * @param password 密码
     * @param callback
     */
    checkSystemUserInfo: function(userNo, password, callback){
        let deferred = new Deferred();
        let path = "/admin/checkSystemUserInfo";
        let userInfo = {
            userNo: userNo,
            password: password
        };

        liveRoomAPIService.post(path, userInfo).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("checkSystemUserInfo! >>checkSystemUserInfo:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 后台使用最新数据更新member
     * */
    updateMember : function(userInfo, callback){
        let deferred = new Deferred();
        let path = "/admin/updateMember";

        liveRoomAPIService.post(path, userInfo).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("updateMember! >>updateMember:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 根据登录用户的ID获取房间列表
     * @param userId
     * @param callback
     */
    getChatGroupListByAuthUser:function(userId,callback){
        let deferred = new Deferred();
        let path = `/admin/getChatGroupListByAuthUser?userId=${userId}`;

        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("getChatGroupListByAuthUser! >>getChatGroupListByAuthUser:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 获取房间类型列表
     * @param callback
     */
    getChatGroupRoomsList:function(callback){
        let deferred = new Deferred();
        let path = `/admin/getChatGroupRoomsList`;

        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("getChatGroupRoomsList! >>getChatGroupRoomsList:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 设置登录用户禁言
     * @param data
     * @param callback
     */
    setUserGag:function(data, callback){
        let deferred = new Deferred();
        let path = `/admin/setUserGag`;

        liveRoomAPIService.post(path, data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("setUserGag! >>setUserGag:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 更新房间游客禁言值
     * @param data
     * @param callback
     */
    setVisitorGag:function(data, callback){
        let deferred = new Deferred();
        let path = `/admin/setVisitorGag`;

        liveRoomAPIService.post(path, data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("setVisitorGag! >>setVisitorGag:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 获取禁言设置数据
     * @param data
     * @param callback
     */
    getUserGag:function(data, callback){
        let deferred = new Deferred();
        let pathes = [`/admin/setVisitorGag`];
        pathes.push(`?groupType=${data.groupType}`);
        pathes.push(`&groupId=${data.groupId}`);
        pathes.push(`&userId=${data.userId}`);

        liveRoomAPIService.post(pathes.join(""), data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("setVisitorGag! >>setVisitorGag:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    }
};

//导出服务类
module.exports =adminService;

