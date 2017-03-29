"use strict";
const Deferred = require("../util/common").Deferred;
const request = require('request');
const config = require('../resources/config'); // 引入config
const logger = require('../resources/logConf').getLogger("liveRoomAPIService");
const baseUrl = config.apiUrl;

/**
 * 在请求路径后面添加公司代码
 * @param {string} path 请求路径
 * @returns string
 */
let addCompanyIdToPath = path => {
    let companIdParam = "companyId=" + config.companyId;
    let params = path.split("?")[1];
    path += params ? "&" + companIdParam : "?" + companIdParam;
    return path;
};
/**
 * 在请求体里面添加公司代码
 * @param {Object} body 请求体
 * @returns Object
 */
let addCompanyIdToBody = body => {
    body.companyId = config.companyId;
    return body;
}

/**
 * 统一处理GET和POST返回结果的方法
 * @param deferred deferred对象
 * @param callback 回调方法, 允许为空
 * @returns handler 对象, 提供sucesss和failure方法.
 */
let responseHandler = (deferred, callback) => {
    /**
     * 处理正常数据的方法(result == 0)
     * @param {Object} result
     */
    let done = (result) => {
        if (callback) {
            callback(result);
        }
        deferred.resolve(result);
    };
    /**
     * 处理上游的异常数据(result != 0)
     * @param {Object} result
     */
    let failure = (result) => {
        if (callback) {
            callback(result);
        }
        deferred.reject(result);
    };
    let handler = {};
    /**
     * 处理成功请求的方法, 但也会处理上游的异常数据(result != 0).
     * @param data 需要处理的数据
     */
    handler.success = data => {
        let dataObj = {};
        try {
            dataObj = JSON.parse(data);
        } catch (e) {
            dataObj = data;
        }
        if (typeof dataObj == "object") {
            if (dataObj["errcode"] && dataObj["errcode"] != 0) {
                failure(dataObj);
            } else {
                done(dataObj.data);
            }
            return;
        }
        done(dataObj);
    };
    /**
     * 处理失败请求的方法, 通常由于系统报错产生的异常.
     * @param err 需要处理的异常错误
     */
    handler.failure = err => {
        if (callback) {
            callback(false);
        }
        deferred.reject(err);
    };
    return handler;
};

module.exports = {
    get: (path, callback) => {
        let deferred = new Deferred();
        let handler = responseHandler(deferred, callback);
        logger.debug("Getting data from liveRoom API with path: " + path);
        path = addCompanyIdToPath(path);
        request(baseUrl + path, (err, res, data) => {
            if (err) {
                logger.error("Get " + path.split("?")[0] + ">>>error:" + err);
                handler.failure(err);
            } else {
                handler.success(data);
            }
        });
        return deferred.promise;
    },
    post: (path, data, callback) => {
        let deferred = new Deferred();
        let handler = responseHandler(deferred, callback);
        logger.debug("Posting data to liveRoom API with path: " + path);
        data = addCompanyIdToBody(data);
        request.post({
            url: baseUrl + path,
            body: data,
            headers: { "Connection": "close" },
            json: true
        }, (err, res, data) => {
            if (err) {
                logger.error("Post " + path + ">>>error:" + err);
                handler.failure(err);
            } else {
                handler.success(data);
            }
        });
        return deferred.promise;
    }
};