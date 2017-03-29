const logger = require('../resources/logConf').getLogger(
    'chatSubscribeService');// 引入log4js
const constant = require('../constant/constant');// 引入constant
const liveRoomAPIService = require('./liveRoomAPIService');
const Deferred = require("../util/common").Deferred;

/**
 * 订阅服务类
 *
 */
let chatSubscribeService = {
  /**
   * 获取订阅数据
   *
   * @param params
   * @param callback
   */
  getSubscribeList: function (params, callback) {
    let deferred = new Deferred();
    let path = "/subscribe/getSubscribeList";
    path += "?groupType=" + params.groupType;
    path += "&userId=" + params.userId;
    liveRoomAPIService.get(path).then(result => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch(function (e) {
      logger.error("查询数据失败! >>getSubscribeList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 保存订阅
   *
   * @param params
   * @param callback
   */
  saveSubscribe: function (params, callback) {
    let deferred = new Deferred();
    let path = "/subscribe/saveSubscribe";
    liveRoomAPIService.post(path, params).then((result, a, b) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch(e => {
      logger.error("saveSubscribe失败! >>saveSubscribe:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 更新订阅
   *
   * @param params
   * @param callback
   */
  modifySubscribe: function (params, callback) {
    let deferred = new Deferred();
    let path = "/subscribe/modifySubscribe";
    liveRoomAPIService.post(path, params).then(result => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch(e => {
      logger.error("modifySubscribe! >>modifySubscribe:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },

  /**
   * 保存客户分组到UTM
   *
   * @param groupType
   * @param userId
   * @param subscribeType
   * @param isAdd
   * @param callback
   *            ({{isOK : boolean, msg : String}})
   */
  saveSubscribe4UTM: function (groupType, userId, subscribeType, isAdd,
      callback) {
    let deferred = new Deferred();
    let path = "/subscribe/saveSubscribe4UTM";
    liveRoomAPIService.post(path, {
      userId: userId,
      groupType: groupType,
      subscribeType: subscribeType,
      isAdd: isAdd
    }).then(result => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch(e => {
      logger.error("saveSubscribe4UTM! >>saveSubscribe4UTM:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  }
};
// 导出服务类
module.exports = chatSubscribeService;