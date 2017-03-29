/**
 * 积分信息管理<BR>
 * ------------------------------------------<BR>
 * <BR>
 * Copyright© : 2016 by Dick<BR>
 * Author : Dick <BR>
 * Date : 2016年9月14日 <BR>
 * Description :<BR>
 * <p>
 *
 * </p>
 */
const logger = require('../resources/logConf').getLogger("chatPointsService");
const liveRoomAPIService = require('./liveRoomAPIService');
const querystring = require("querystring");
const Deferred = require("../util/common").Deferred;

let chatPointsService = {

  /**
   * 查询一个用户积分信息
   *
   * @param groupType
   * @param userId
   * @param hasJournal
   * @param callback
   */
  getPointsInfo: function (groupType, userId, hasJournal, callback) {
    let defer = new Deferred();
    let path = "/points/pointsInfo";
    path += "?groupType=" + groupType;
    path += "&userId=" + userId
    path += "&noJournal=" + (hasJournal ? 0 : 1)
    liveRoomAPIService.get(path).then(data => {
      defer.resolve(data);
      if (callback) {
        callback(data);
      }
    }, err => {
      if (callback) {
        callback(err);
      }
      defer.resolve(err);
    });
    return defer.promise;
  },

  /**
   * 查询一个用户积分信息
   *
   * @param groupType,
   *            "studio"
   * @param userId,
   *            "13444477777"
   * @param callback
   *            (err, config)
   */
  getChatPoints: function (groupType, userId, callback) {
    let defer = new Deferred();
    let path = "/points/pointsInfo";
    path += "?groupType=" + groupType;
    path += "&userId=" + userId
    path += "&noJournal=" + 1
    liveRoomAPIService.get(path).then(data => {
      defer.resolve(data);
      if (callback) {
        callback(data);
      }
    }, err => {
      if (callback) {
        callback(err);
      }
      defer.resolve(err);
    });
    return defer.promise;
  },

  /**
   * 添加积分
   *
   * @param params
   *            {{groupType:String, clientGroup:String, userId:String,
     *            item:String, val:Number, isGlobal:Boolean, remark:String,
     *            opUser:String, opIp:String}}
   * @param callback
   */
  add: function (params, callback) {
    let defer = new Deferred();
    let path = "/points/add";
    liveRoomAPIService.post(path, params).then(data => {
      defer.resolve(data);
      if (callback) {
        callback(null, data);
      }
    }, err => {
      if (callback) {
        callback(err, null);
      }
      defer.resolve(err);
    });
    return defer.promise;
  },

  /**
   * 查询积分配置表
   *
   * @param usrInfo
   * @param callback
   */
  getChatPointsConfig: function (params, callback) {
    let defer = new Deferred();
    let path = "/points/getChatPointsConfig";
    path += "?" + querystring.stringify(params);

    liveRoomAPIService.get(path).then(data => {
      defer.resolve(data);
      if (callback) {
        callback(data);
      }
    }, err => {
      if (callback) {
        callback(err);
      }
      defer.resolve(err);
    });
    return defer.promise;
  }
};

// 导出服务类
module.exports = chatPointsService;