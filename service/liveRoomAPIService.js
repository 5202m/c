"use strict";
let Deferred = require("../util/common").Deferred;
let request = require('request');
let config = require('../resources/config'); // 引入config
let logger = require('../resources/logConf').getLogger("liveRoomAPIService");

const baseUrl = config.pmApiUrl;

let addCompanyIdToPath = path => {
    let companIdParam = "companyId=" + config.companyId;
    let params = path.split("?")[1];
    path += params ? "&" + companIdParam : "?" + companIdParam;
    return path;
};

let addCompanyIdToBody = body => {
    body.companyId = config.companyId;
    return body;
}

let doRequestSuccess = (data, defer) => {
    let dataObj = {};
    try {
        dataObj = JSON.parse(data);
    } catch (e) {
        dataObj = data;
    }
    let done = (result, callback) => {
        if (callback) {
            callback(result);
        }
        defer.resolve(result);
    };
    let failure = (result, callback) => {
        if (callback) {
            callback(result);
        }
        defer.reject(result);
    };
    return (callback) => {
        if (typeof dataObj == "object") {
            if (dataObj["errcode"] && dataObj["errcode"] != 0) {
                failure(dataObj, callback);
            } else {
                done(dataObj.data, callback);
            }
            return;
        }
        done(dataObj, callback);
    }
};

let pmAPI = {
    get: (path, callback) => {
        path = addCompanyIdToPath(path);
        logger.debug("Getting data from liveRoom API with path: " + path);
        let defer = new Deferred();
        request(encodeURI(baseUrl + path), (err, res, data) => {
            if (err) {
                logger.error("Get " + path.split("?")[0] + ">>>error:" + err);
                if (callback) {
                    callback(false);
                }
                defer.reject(err);
            } else {
                doRequestSuccess(data, defer)(callback);
            }
        });
        return defer.promise;
    },
    post: (path, data, callback) => {
        data = addCompanyIdToBody(data);
        logger.debug("Posting data to liveRoom API with path: " + path);
        let defer = new Deferred();
        request.post({
            url: baseUrl + path,
            body: data,
            headers: { "Connection": "close" },
            json: true
        }, (err, res, data) => {
            if (err) {
                logger.error("Post " + path + ">>>error:" + err);
                if (callback) {
                    callback(false);
                }
                defer.reject(err);
            } else {
                doRequestSuccess(data, defer)(callback);
            }
        });
        return defer.promise;
    }
};

module.exports = pmAPI;