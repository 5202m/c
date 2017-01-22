"use strict";
const Deferred = require("../util/common").Deferred;
const request = require('request');
const config = require('../resources/config'); // 引入config
const logger = require('../resources/logConf').getLogger("liveRoomAPIService");

const baseUrl = config.pmApiUrl;

let pmAPI = {
    get: (path, callback) => {
        logger.info("Getting data from liveRoom API with path: " + path);
        let defer = new Deferred();
        request(baseUrl + path, (err, res, data) => {
            if (err) {
                logger.error("Get " + path.split("?")[0] + ">>>error:" + err);
                if (callback) {
                    callback(false);
                }
                defer.reject(err);
            } else {
                let dataObj = {};
                try {
                    dataObj = JSON.parse(data);
                    if ("errcode" in dataObj && dataObj["errcode"] != 0) {
                        defer.reject(dataObj);
                        if (callback) {
                            callback(dataObj);
                            return defer.promise;
                        }
                    }
                    if (callback) {
                        callback(dataObj.data);
                    }
                    defer.resolve(dataObj.data);
                } catch (e) {
                    logger.error("Get " + path.split("?")[0] + ">>>data:" + data, e);
                    if (callback) {
                        callback(true);
                    }
                    defer.reject(e);
                }
            }
        });
        return defer.promise;
    },
    post: (path, data, callback) => {
        logger.info("Posting data to liveRoom API with path: " + path);
        let defer = new Deferred();
        request.post({
            url: baseUrl + path,
            body: data,
            headers: {
                "Connection": "close"
            },
            json: true
        }, (err, res, data) => {
            if (err) {
                logger.error("Post " + path + ">>>error:" + err);
                if (callback) {
                    callback(false);
                }
                defer.reject(err);
            } else {
                let dataObj = {};
                try {
                    dataObj = typeof data === "object" ? data : JSON.parse(data);
                    if ("errcode" in dataObj && dataObj["errcode"] != 0) {
                        defer.reject(dataObj);
                        if (callback) {
                            callback(dataObj);
                            return defer.promise;
                        }
                    }
                    if (callback) {
                        callback(dataObj.data);
                    }
                    defer.resolve(dataObj.data);
                } catch (e) {
                    logger.error("Post " + path + ">>>data:" + JSON.stringify(data), e);
                    if (callback) {
                        callback(true);
                    }
                    defer.reject(e);
                }
            }
        });
        return defer.promise;
    }
};

module.exports = pmAPI;
