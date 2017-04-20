var request = require('request');
var util = require('util');
var common = require('../util/common'); //引入公共的js
var config = require('../resources/config'); //引入config
var logger = require('../resources/logConf').getLogger('activityService');

var activityService = {
    /****
     * 获取奖池总金额
     */
    getTotalMoneyInfo: function(periods, fn) {
        periods = periods || "";
        var url = config.pmOAPath + "/activity20170201/getTotalMoneyInfo?periods=" +
            periods;
        logger.info("getTotalMoneyInfo:" + url);
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                fn(body);
            } else {
                fn(null);
                logger.error("getTotalMoneyInfo error:" + response.statusCode);
            }
        });
    },
    /****
     * 获取打赏排行
     */
    getRewardMoneyInfo: function(phoneNo, page, fn) {
        phoneNo = phoneNo || "";
        page = page || "";
        var url = config.pmOAPath + "/activity20170201/getRewardMoneyInfo?phoneNo=" +
            phoneNo + "&page=" + page;
        logger.info("getRewardMoneyInfo:" + url);
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                fn(body);
            } else {
                fn(null);
                logger.error("getRewardMoneyInfo error:" + response.statusCode);
            }
        });
    },
    /****
     * 获取抢红包金额
     */
    getLotteryInfo: function(phoneNo, periods, fn) {
        phoneNo = phoneNo || "";
        periods = periods || "";
        var url = config.pmOAPath + "/activity20170201/getLotteryInfo?phoneNo=" +
            phoneNo + "&periods=" + periods;
        logger.info("getLotteryInfo:" + url);
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                fn(body);
            } else {
                fn(null);
                logger.error("getLotteryInfo error:" + response.statusCode);
            }
        });
    }
};

module.exports = activityService;