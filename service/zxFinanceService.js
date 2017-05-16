/**
 * 财经数据API服务类<BR>
 * ------------------------------------------<BR>
 * <BR>
 * Copyright© : 2016 by Jade<BR>
 * Author : Jade.zhu <BR>
 * Date : 2016年11月25日 <BR>
 * Description :<BR>
 * <p>
 * 财经日历 + 假期预告 + 财经大事
 * </p>
 */
const logger = require('../resources/logConf').getLogger('zxFinanceService'); // 引入log4js
const liveRoomAPIService = require('./liveRoomAPIService');
const Deferred = require("../util/common").Deferred;

let zxFinanceService = {
    /**
     * 获取最后点评的数据
     *
     * @param callback
     */
    getFinanceDataLastReview: function(callback) {
        let deferred = new Deferred();
        let path = "/zxFinanceData/getFinanceDataLastReview";

        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("getFinanceDataLastReview! >>getFinanceDataLastReview:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 保存点评内容
     * @param params
     * @param callback
     * @returns {*}
     */
    saveFinanceDataReview: function(params, callback){
        let deferred = new Deferred();
        let path = "/zxFinanceData/saveFinanceDataReview";
        let data = {
            name : params.name,
            bid : params.bid,
            date : params.date,
            userId : params.userId,
            userName : params.userName,
            avatar : params.avatar,
            comment : params.comment,
            ip : params.ip
        };

        liveRoomAPIService.post(path, data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("saveFinanceDataReview! >>saveFinanceDataReview:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    }
};

// 导出服务类
module.exports = zxFinanceService;