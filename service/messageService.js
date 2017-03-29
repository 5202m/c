const logger = require('../resources/logConf').getLogger('messageService'); // 引入log4js
const querystring = require("querystring");
const liveRoomAPIService = require('./liveRoomAPIService');
const Deferred = require("../util/common").Deferred;

/**
 * 聊天室服务类 备注：处理聊天室接受发送的所有信息及其管理 author Alan.wu
 */
let messageService = {
  maxRows: 50,
  /**
   * 从数据库中加载已有的聊天记录
   */
  loadMsg: (userInfo, lastPublishTime, allowWhisper, callback) => {
    let deferred = new Deferred();
    let path = "/message/loadMsg";
    path += "?" + querystring.stringify(userInfo);
    path += "&lastPublishTime=" + (lastPublishTime || "");
    path += "&allowWhisper=" + allowWhisper;
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("loadMsg! >>loadMsg:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 保存内容到数据库中
   */
  saveMsg: (messageData, userNoArr, callback) => {
    let deferred = new Deferred();
    let path = "/message/saveMsg";
    let params = {};
    params["messageData"] = messageData;
    params["approvalUserArr"] = userNoArr;
    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("saveMsg! >>saveMsg:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 是否存在符合条件的记录 {"toUser.talkStyle":
     * 1,"toUser.userType":3,"toUser.questionId":pushInfo._id}
   *
   * @param searchObj
   */
  existRecord: (searchObj, callback) => {
    let deferred = new Deferred();
    let path = "/message/existRecord";
    path += "?" + querystring.stringify(searchObj);
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result.isExist);
      }
      deferred.resolve(result.isExist);
    }).catch((e) => {
      logger.error("existRecord! >>existRecord:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },

  /**
   * 从数据库中加载已有的聊天记录
   *
   * @param groupType
   * @param groupId
   * @param fromUserTypeArr
   * @param toUserId
   * @param lastOfflineDate
   * @param callback
   */
  getWhUseMsgCount: (groupType, groupId, userType, whUserTypeArr, toUserId,
      lastOfflineDate, callback) => {
    let deferred = new Deferred();
    let path = "/message/getWhUseMsgCount";
    path += "?groupType=" + groupType;
    path += "&groupId=" + groupId;
    path += "&userType=" + userType;
    path += "&whUserTypeArr=" + whUserTypeArr;
    path += "&toUserId=" + toUserId;
    path += "&lastOfflineDate=" + lastOfflineDate;
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("existRecord! >>existRecord:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },

  /**
   * 加载大图
   *
   * @param publishTime
   * @param callback
   */
  loadBigImg: (userId, publishTime, callback) => {
    let deferred = new Deferred();
    let path = "/message/loadBigImg";
    path += "?userId=" + userId;
    path += "&publishTime=" + publishTime;
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result.content.maxValue);
      }
      deferred.resolve(result.content.maxValue);
    }).catch((e) => {
      logger.error("loadBigImg! >>loadBigImg:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 删除聊天记录
   *
   * @param data
   * @param callback
   */
  deleteMsg: (data, callback) => {
    let deferred = new Deferred();
    let path = "/message/deleteMsg";
    liveRoomAPIService.post(path, data).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("deleteMsg! >>deleteMsg:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 查询两天内的聊天记录并分组
   *
   * @param params
   * @param callback
   *            params.groupType；params.groupId；params.userId
   */
  getLastTwoDaysMsg: (params, callback) => {
    let deferred = new Deferred();
    let path = "/message/getLastTwoDaysMsg";
    path += "?groupType=" + params.groupType;
    path += "&groupId=" + params.groupId;
    path += "&userId=" + params.userId;
    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getLastTwoDaysMsg! >>getLastTwoDaysMsg:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  }
};
// 导出服务类
module.exports = messageService;
