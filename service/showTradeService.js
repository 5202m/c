let logger = require('../resources/logConf').getLogger('showTradeService'); // 引入log4js
let liveRoomAPIService = require('./liveRoomAPIService');
let querystring = require("querystring");
let Deferred = require("../util/common").Deferred;
/**
 * 晒单服务类 备注：查询各分析师的晒单数据 author Dick.guo
 */
var showTradeService = {

  /**
   * 查询分析师晒单数据
   *
   * @param groupType
   * @param userNo
   *            如果有多个分析师，只取第一个
   * @param callback
   */
  getShowTrade: function (groupType, userNo, callback) {
    let deferred = new Deferred();
    let path = "/showTrade/getShowTrade";
    path += "?groupType=" + groupType;
    path += "&userNo=" + userNo;
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getShowTrade! >>getShowTrade:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 查询指定条数数据
   *
   * @param params
   * @param callback
   */
  getShowTradeList: function (params, callback) {
    let deferred = new Deferred();
    let path = "/showTrade/getShowTradeList";
    path += "?" + querystring.stringify(params);
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getShowTradeList! >>getShowTradeList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 新增晒单
   *
   * @param params
   * @param callback
   */
  addShowTrade: function (params, callback) {
    let deferred = new Deferred();
    let path = "/showTrade/addShowTrade";

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("addShowTrade! >>addShowTrade:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 更新点赞数
   *
   * @param params
   * @param callback
   */
  setShowTradePraise: function (params, callback) {
    let deferred = new Deferred();
    let path = "/showTrade/setShowTradePraise";
    path += "?" + querystring.stringify(params);
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("setShowTradePraise! >>setShowTradePraise:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 根据晒单id查询晒单数据
   *
   * @param tradeIds
   * @param callback
   */
  getShowTradeByIds: function (tradeIds, callback) {
    let deferred = new Deferred();
    let path = "/showTrade/getShowTradeByIds";
    path += "?tradeIds=" + tradeIds;
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getShowTradeByIds! >>getShowTradeByIds:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
    /**
     * 添加评论
     * @param id
     * @param userInfo
     * @param content
     * @param refId
     * @param callback
     */
    addComments : function(params){
        let deferred = new Deferred();
        let path = "/showTrade/addComments";
        liveRoomAPIService.post(path, params).then((result) => {
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("addComments! >>addComments:", e);
            deferred.reject(e);
        });
        return deferred.promise;
    }

};
// 导出服务类
module.exports = showTradeService;
