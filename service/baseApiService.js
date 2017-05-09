var request = require('request');
var util = require('util');
var common = require('../util/common'); //引入公共的js
var config = require('../resources/config'); //引入config
var logger = require('../resources/logConf').getLogger('baseApiService');
const liveRoomAPIService = require('./liveRoomAPIService');
const Deferred = common.Deferred;
/**
 * baseApi服务类
 * @type {{}}
 * create by alan.wu
 */
var baseApiService = {
    /**
     * 格式url
     */
    formatApiUrl: function(url) {
        return config.apiUrl + url;
    },
    /**
     * 销毁访问主页的token
     * @param val
     * @param isAllowPass
     */
    destroyHomeToken: function(val, isAllowPass, callback) {
        if (isAllowPass) {
            callback(true);
            return;
        }
        request.post({ url: this.formatApiUrl('/token/destroyToken'), form: { token: val } },
            function(err, response, data) {
                if (err) {
                    logger.error("destroyHomeToken>>>error:" + err);
                    callback(false);
                } else {
                    var dataObj = {};
                    try {
                        dataObj = JSON.parse(data);
                        callback(dataObj.isOK);
                    } catch (e) {
                        logger.error("destroyHomeToken>>>data:" + data);
                        callback(true);
                    }
                }
            });
    },

    /**
     * 提取文档接口
     * @param params
     * @param callback
     */
    getArticleList: function(params, callback) {
        let deferred = new Deferred();
        let path = util.format(
            '/article/getArticleList?authorId=%s&platform=%s&code=%s&lang=%s&hasContent=%s&isAll=%s&pageNo=%d&pageSize=%d&pageLess=%s&pageKey=%s&orderByJsonStr=%s',
            params.authorId,
            params.platform,
            params.code,
            'zh',
            params.hasContent,
            params.isAll,
            params.pageNo,
            params.pageSize,
            params.pageLess,
            params.pageKey,
            params.orderByStr);
        liveRoomAPIService.get(path, callback)
            .then((result) => {
                deferred.resolve(result);
            }).catch((e) => {
                logger.error("getArticleList>>>error:" + e);
                if (callback) {
                    callback(null);
                }
                deferred.reject(e);
            });
        return deferred.promise;
    },
    /**
     * 提取文档详情接口
     * @param params
     * @param callback
     */
    getArticleInfo: function(params, callback) {
        let deferred = new Deferred();
        let path = `/article/getArticleInfo?id=${params.id}`;
        liveRoomAPIService.get(path)
            .then((result) => {
                if (callback) {
                    callback(result);
                }
                deferred.resolve(result);
            }).catch((e) => {
                logger.error("getArticleInfo>>>error:" + e);
                if (callback) {
                    callback(null);
                }
                deferred.reject(e);
            });
        return deferred.promise;
    },

    /**
     * 提取手机验证码
     * @param mobilePhone
     * @param useType
     * @param ip
     * @param callback
     */
    getMobileVerifyCode: function(mobilePhone, useType, ip, callback) {
        let deferred = new Deferred();
        let path = "/sms/send";
        let data = {
            mobilePhone: mobilePhone,
            useType: useType,
            deviceKey: ip
        };
        liveRoomAPIService.post(path, data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("getMobileVerifyCode fail:" + e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },

    /**
     * 验证手机验证码
     * @param mobilePhone
     * @param useType
     * @param verifyCode
     * @param callback
     */
    checkMobileVerifyCode: function(mobilePhone, useType, verifyCode, callback) {
        let deferred = new Deferred();
        let path = "/sms/checkAuth";
        let data = {
            mobilePhone: mobilePhone,
            useType: useType,
            authCode: verifyCode
        };
        liveRoomAPIService.post(path, data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("checkMobileVerifyCode fail:" + e);
            if (callback) {
                callback({ result: 1, errcode: -1, errmsg: "短信验证失败！" });
            }
            deferred.reject({ result: 1, errcode: -1, errmsg: "短信验证失败！" });
        });
        return deferred.promise;
    },

    /**
     * 检查点赞记录是否已经点赞
     * @param clientId
     * @param praiseId
     * @param fromPlatform
     * @param callback
     */
    checkChatPraise: function(clientId, praiseId, fromPlatform, callback) {
        let deferred = new Deferred();
        let path = "/chat/checkChatPraise";
        let data = {
            clientId: clientId,
            praiseId: praiseId,
            fromPlatform: fromPlatform
        };
        liveRoomAPIService.post(path, data).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("checkChatPraise fail:" + e);
            if (callback) {
                callback(false);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },

    /**
     * 获取CFTC持仓比例数据
     */
    get24kCftc: function(callback) {
        let deferred = new Deferred();
        let path = `/common/get24kCftc`;
        liveRoomAPIService.get(path)
            .then((result) => {
                if (callback) {
                    callback(result);
                }
                deferred.resolve(result);
            }).catch((e) => {
                logger.error("get24kCftc fail:" + e);
                if (callback) {
                    callback(false);
                }
                deferred.reject(e);
            });
        return deferred.promise;
    },
    /**
     * 获取财经日历列表数据
     * @param callback
     */
    getZxFinanceDataList: function(releaseTime, dataTypeCon, callback) {
        let deferred = new Deferred();
        let path = `/zxFinanceData/list?releaseTime=${releaseTime}&dataTypeCon=${dataTypeCon}`;
        liveRoomAPIService.get(path)
            .then((result) => {
                if (callback) {
                    callback(result);
                }
                deferred.resolve(result);
            }).catch((e) => {
                logger.error("getZxFinanceDataList fail:" + e);
                if (callback) {
                    callback(false);
                }
                deferred.reject(e);
            });
        return deferred.promise;
    },
    /**
     * 发送邮件
     * @param key
     * @param data
     * @param callback
     */
    sendEmail: function(key, data, callback) {
        let deferred = new Deferred();
        let path = "/common/email";
        let form = {
            key: key,
            data: JSON.stringify(data)
        };
        liveRoomAPIService.post(path, form).then((result) => {
            if (typeof result === 'string') {
                result = JSON.parse(result);
            }
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("sendEmail fail:" + e);
            if (callback) {
                callback(false);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 添加文档
     * @param data
     * @param callback
     */
    addArticle: function(data, callback) {
        if (typeof data != 'string') {
            data = JSON.stringify(data);
        }
        let deferred = new Deferred();
        let path = "/article/add";
        let form = {
            data: data
        };
        liveRoomAPIService.post(path, form).then((result) => {
            if (typeof result === 'string') {
                result = JSON.parse(result);
            }
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("addArticle fail:" + e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 更新文章
     * @param query
     * @param field
     * @param updater
     * @param callback
     */
    modifyArticle: function(query, field, updater, callback) {
        if (typeof query != 'string') {
            try {
                query = JSON.stringify(query);
            } catch (e) {
                callback(null);
                return;
            }
        }
        if (typeof update != 'string') {
            try {
                updater = JSON.stringify(updater);
            } catch (e) {
                callback(null);
                return;
            }
        }
        let deferred = new Deferred();
        let path = "/article/add";
        let data = {
            query: query,
            field: field,
            data: updater
        };
        liveRoomAPIService.post(path, data).then((result) => {
            if (typeof result === 'string') {
                result = JSON.parse(result);
            }
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("modifyArticle fail:" + e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 获取未平仓品种比率
     * @param callback
     */
    getSymbolOpenPositionRatios: function(callback) {
        var date = common.getHHMM(new Date()) > '11:15' ? common.formatterDate(
            new Date(), '-') : common.formatterDate(
            common.DateAdd('d', -1, new Date()), '-');
        request(config.goldApiUrl +
            "/goldadmin/findSymbolOpenPositionRatios?symbol=null&date=" + date,
            function(err, response, data) {
                if (!err && response.statusCode == 200) {
                    callback(data);
                } else {
                    logger.error("getSymbolOpenPositionRatios>>>error:" + err);
                    callback(null);
                }
            });
    },
    /**
     * FX获取多头与空头比例
     */
    getSymbolLongShortRatios: function(callback) {
        request(this.formatApiUrl('/common/getSymbolLongShortRatios'),
            function(err, response, data) {
                if (err) {
                    callback({ code: 'FAIL', result: [] });
                } else {
                    try {
                        if (typeof data == 'string') {
                            data = JSON.parse(data);
                        }
                        callback(data);
                    } catch (e) {
                        logger.error("getSymbolLongShortRatios fail:" + e);
                        callback({ code: 'FAIL', result: [] });
                    }
                }
            });
    },
    /**
     *  FX未平仓品种比率
     */
    findSymbolOpenPositionRatios: function(callback) {
        request(this.formatApiUrl('/common/getSymbolOpenPositionRatios'),
            function(err, response, data) {
                if (err) {
                    callback({ code: 'FAIL', result: [] });
                } else {
                    try {
                        callback(data);
                    } catch (e) {
                        logger.error("getSymbolOpenPositionRatios fail:" + e);
                        callback({ code: 'FAIL', result: [] });
                    }
                }
            });
    }
};

//导出服务类
module.exports = baseApiService;