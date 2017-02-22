const logger = require('../resources/logConf').getLogger('clientTrainService'); // 引入log4js
const liveRoomAPIService = require('./liveRoomAPIService');
const Deferred = require("../util/common").Deferred;
/**
 * 客户学员服务类型服务类
 * 
 */
let clientTrainService = {
    /**
     * 保存培训班
     * 
     * @param groupId
     * @param userId
     * @param nickname
     */
    saveTrain: (groupId, userId, nickname, callback) => {
        let deferred = new Deferred();
        let path = "/clientTrain/saveTrain";
        let postData = {
            groupId: groupId,
            userId: userId,
            nickname: nickname
        };
        liveRoomAPIService.post(path, postData).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("saveTrain失败! >>saveTrain:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 客户学员报名
     * 
     * @param params
     * @param callback
     */
    addClientTrain: function (params, userInfo, callback) {
        let deferred = new Deferred();
        let path = "/clientTrain/addClientTrain";
        let postData = {
            groupId: params.groupId,
            nickname: params.nickname,
            userId: userInfo.userId,
            clientGroup: userInfo.clientGroup
        };
        liveRoomAPIService.post(path, postData).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("addClientTrain失败! >>addClientTrain:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 提取培训班数及人数
     * 
     * @param groupType
     * @param teachId
     * @param dataCallback
     */
    getTrainAndClientNum: function (groupType, teachId, callback) {
        let deferred = new Deferred();
        let path = "/clientTrain/getTrainAndClientNum";
        path += "?groupType=" + groupType;
        path += "&teachId=" + teachId;
        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("getTrainAndClientNum! >>getTrainAndClientNum:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 提取培训班列表
     * 
     * @param groupType
     * @param teachId
     * @param isAll
     * @param callback
     */
    getTrainList: function (groupType, teachId, isAll, callback) {
        let deferred = new Deferred();
        let path = "/clientTrain/getTrainList";
        path += "?groupType=" + groupType;
        if (teachId) {
            path += "&teachId=" + teachId;
        }
        path += "&isAll=" + isAll;
        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("getTrainList! >>getTrainList:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },

    /**
     * 添加签到
     * 
     * @param userInfo
     * @param clientip
     * @param callback
     */
    addSignin: function (userInfo, clientip, callback) {
        let deferred = new Deferred();
        let path = "/clientTrain/addSignin";
        let params = {
            mobilePhone: userInfo.mobilePhone,
            groupType: userInfo.groupType,
            avatar: userInfo.avatar,
            clientip: clientip
        };
        liveRoomAPIService.post(path, params).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("addSignin! >>addSignin:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },

    /**
     * 查询签到
     * 
     * @param params
     */
    getSignin: function (userInfo, callback) {
        let deferred = new Deferred();
        let path = "/clientTrain/getSignin";
        path += "?mobilePhone=" + userInfo.mobilePhone;
        path += "&groupType=" + userInfo.groupType;
        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("getSignin! >>getSignin:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
    },

    /**
     * 查询当天签到
     *
     * @param params
     */
    checkTodaySignin: function (userInfo, clientip, callback) {
        let deferred = new Deferred();
        let path = "/clientTrain/checkTodaySignin";
        let params = {
            mobilePhone: userInfo.mobilePhone,
            groupType: userInfo.groupType,
            clientip: clientip
        };
        liveRoomAPIService.post(path, params).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch ((e) => {
            logger.error("checkTodaySignin! >>checkTodaySignin:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    }

};
// 导出服务类
module.exports = clientTrainService;
