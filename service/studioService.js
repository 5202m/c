/**
 * 直播服务类 Created by Alan.wu on 2015/7/8.
 */
const constant = require('../constant/constant'); // 引入constant
const common = require('../util/common'); // 引入common类
var errorMessage = require('../util/errorMessage'); //引入errorMessage类
const userService = require('../service/userService'); // 引入userService
const clientTrainService = require('./clientTrainService'); // 引入clientTrainService
const chatService = require('./chatService'); // 引入chatService
const logger = require('../resources/logConf').getLogger('studioService'); // 引入log4js
const liveRoomAPIService = require('./liveRoomAPIService');
const querystring = require("querystring");
const Deferred = require("../util/common").Deferred;
const apiService = require('../service/pmApiService');
/**
 * 定义直播服务类
 *
 * @type {{}}
 */
var studioService = {
  /**
   * 提取主页需要加载的数据
   *
   * @param userInfo
   * @param groupId
   * @param isGetRoomList
   *            是否加载房间
   * @param isGetSyllabus
   *            是否加载课程表数据
   * @param isGetMember
   *            是否客户信息
   * @param dataCallback
   */
  getIndexLoadData: (userInfo, groupId, isGetRoomList, isGetSyllabus,
      isGetMember, callback) => {
    let deferred = new Deferred();
    let params = {
      userId: userInfo.userId,
      groupType: userInfo.groupType,
      groupId: groupId,
      isGetRoomList: isGetRoomList,
      isGetSyllabus: isGetSyllabus,
      isGetMember: isGetMember
    };
    let path = "/studio/getIndexLoadData";
    path += "?" + querystring.stringify(params);

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getIndexLoadData! >>getIndexLoadData:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 提取房间列表
   *
   * @param callback
   */
  getRoomList: (groupType, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getRoomList";
    path += "?groupType=" + groupType;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getRoomList! >>getRoomList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 提取客户组列表
   *
   * @param callback
   */
  getClientGroupList: (groupType, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getClientGroupList";
    path += "?groupType=" + groupType;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getClientGroupList! >>getClientGroupList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 重置密码
   */
  resetPwd: (groupType, mobilePhone, newPwd, oldPwd, callback) => {
    let deferred = new Deferred();
    let path = "/studio/resetPwd";
    let params = {
      groupType: groupType,
      mobilePhone: mobilePhone,
      newPwd: newPwd,
      oldPwd: oldPwd
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("resetPwd! >>resetPwd:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },

  /**
   * 提取直播间
   */
  getStudioByGroupId: (groupId, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getStudioByGroupId";
    path += "?groupId=" + groupId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getStudioByGroupId! >>getStudioByGroupId:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 检查用户组权限 roomType 和 groupId不能为空
   */
  checkGroupAuth: (roomType, groupId, clientGroup, userId, callback) => {
    let deferred = new Deferred();
    let path = "/studio/checkGroupAuth";
    path += "?groupId=" + groupId;
    path += "&clientGroup=" + (clientGroup || "");
    path += "&userId=" + (userId || "");
    path += "&roomType=" + (roomType || "");

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("checkGroupAuth! >>checkGroupAuth:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },

  /**
   * 通过客户组提取默认房间
   *
   * @param clientGroup
   */
  getDefaultRoom: (groupType, clientGroup, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getDefaultRoom";
    path += "?groupType=" + groupType;
    path += "&clientGroup=" + clientGroup;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getDefaultRoom! >>getDefaultRoom:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 直播间注册
   *
   * @param callback
   */
  studioRegister: (userInfo, clientGroup, callback) => {
    let deferred = new Deferred();
    let path = "/studio/studioRegister";
    let params = {
      userInfo: userInfo,
      clientGroup: clientGroup
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("studioRegister! >>studioRegister:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 检查客户信息是否存在， 1、存在则把需要与接口提取的用户数据（交易账号，账号级别）同步更新 2、不存在则视为新的记录插入
   *
   * @param userInfo
   * @param callback
   */
  checkMemberAndSave: (userInfo, callback) => {
    let deferred = new Deferred();
    let path = "/studio/checkMemberAndSave";
    let params = {
      userInfo: userInfo
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("checkMemberAndSave! >>checkMemberAndSave:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 判断昵称唯一
   *
   * @param userInfo
   *            {{mobilePhone:String, groupType:String, nickname:String}}
   * @param callback
   *            (err, boolean)，true-唯一，false-不唯一
   */
  checkNickName: (userInfo, callback) => {
    let deferred = new Deferred();
    let path = "/studio/checkNickName";
    path += "?" + querystring.stringify(userInfo);

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("checkNickName! >>checkNickName:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },

  /**
   * 加入新的房间组
   *
   * @param groupType
   * @param mobilePhone
   * @param userId
   * @param newGroupId
   * @param isLogin
   * @param callback
   */
  joinNewGroup: (groupType, mobilePhone, userId, newGroupId, isLogin,
      callback) => {
    let deferred = new Deferred();
    let result = {
      isOK: false,
      error: null
    };
    if (!isLogin) {
      result.isOK = true;
      if (callback) {
        callback(result);
      }
      deferred.reject(result);
      return deferred.promise;
    }
    return userService.joinNewRoom({
      groupType: groupType,
      userId: userId,
      groupId: newGroupId,
      mobilePhone: mobilePhone
    }, function (result) {
      result.isOK = true;
      callback(result);
    });
  },
  /**
   * 通过手机号码检测客户组
   *
   * @param mobilePhone
   */
  checkClientGroup: (mobilePhone, accountNo, platformKey, callback) => {
    var clientGroup = constant.clientGroup.register;
    // 引入ApiService
    apiService.checkAClient({
      mobilePhone: mobilePhone,
      accountNo: accountNo,
      ip: '',
      isCheckByMobile: mobilePhone ? true : false
    }, function (result) {
      logger.info("checkAClient->flagResult:" + JSON.stringify(result));
      if (result.flag == 2) {
        clientGroup = constant.clientGroup.notActive;
        callback(clientGroup, result.accountNo);
      } else if (result.flag == 3) {
        clientGroup = constant.clientGroup.active;
        callback(clientGroup, result.accountNo);
      } else {
        if (common.isValid(mobilePhone)) {
          // 检查用户是否模拟用户
          apiService.checkSmClient(mobilePhone, function (hasRow) {
            if (hasRow) {
              clientGroup = constant.clientGroup.simulate;
            }
            callback(clientGroup);
          });
        } else {
          callback(clientGroup, result.accountNo);
        }
      }
    });
  },
  /**
   * 客户登陆
   *
   * @param userInfo
   * @param type
   *            1-手机登录,匹配手机号 2-自动登录,匹配userId 3-第三方平台自动登录,匹配thirdId 4-手机号码+密码登录
   * @param callback
   */
  login: (userInfo, type, callback) => {
    let deferred = new Deferred();
    let path = "/studio/login";
    let params = {
      userInfo: userInfo,
      type: type
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("studio.login! >>studio.login:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 通过手机号码检测客户组
   *
   * @param mobilePhone
   * @param clientGroup
   * @param callback
   */
  upgradeClientGroup: (groupType, mobilePhone, clientGroup, callback) => {
    var apiService = require(
        '../service/' + common.getTempPlatformKey(groupType) + 'ApiService'); // 引入ApiService
    if (clientGroup === constant.clientGroup.active || clientGroup
        === constant.clientGroup.notActive) {
      // 升级到真实
      apiService.checkAClient({
        mobilePhone: mobilePhone,
        isCheckByMobile: true
      }, function (result) {
        logger.info("checkAClient->flagResult:" + JSON.stringify(result));
        if (result.flag == 2 || result.flag == 3) {
          var clientGroupTmp = result.flag == 2 ? constant.clientGroup.notActive
              : constant.clientGroup.active;
          studioService.updateClientGroup(groupType, mobilePhone,
              clientGroupTmp, result.accountNo, function (isOk) {
                if (isOk) {
                  callback(true, clientGroupTmp);
                } else {
                  callback(false, null);
                }
              });
        } else {
          callback(false, null);
        }
      });
    } else if (clientGroup === constant.clientGroup.simulate) {
      // 升级到模拟
      apiService.checkSmClient(mobilePhone, function (hasRow) {
        if (hasRow) {
          studioService.updateClientGroup(groupType, mobilePhone,
              constant.clientGroup.simulate, null, function (isOk) {
                if (isOk) {
                  callback(true, constant.clientGroup.simulate);
                } else {
                  callback(false, null);
                }
              });
        } else {
          callback(false, null);
        }
      });
    } else {
      callback(false, null);
    }
  },
  /**
   * 更新客户组别
   *
   * @param mobilePhone
   * @param newClientGroup
   * @param accountNo
   * @param callback
   */
  updateClientGroup: (groupType, mobilePhone, newClientGroup, accountNo,
      callback) => {
    let deferred = new Deferred();
    let path = "/studio/updateClientGroup";
    let params = {
      groupType: groupType,
      mobilePhone: mobilePhone,
      newClientGroup: newClientGroup,
      accountNo: accountNo
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("updateClientGroup! >>updateClientGroup:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 伦敦金/伦敦银看涨看跌投票
   *
   * @param symbol
   *            伦敦金或伦敦银标识 Gold/Silver
   * @param highsorlows
   *            涨或跌 highs/lows
   * @param callback
   */
  highsLowsVote: (symbol, highsorlows, callback) => {
    var cacheClient = require('../cache/cacheClient');
    var key = 'highsLowsVote_' + symbol;
    var map = {};
    cacheClient.hgetall(key, function (err, result) {
      if (err) {
        logger.error("get highs or lows vote fail:" + err);
        result.highs = 0;
        result.lows = 0;
        callback({
          isOK: false,
          data: result
        });
      } else if (!err && result) {
        if (highsorlows == 'highs') {
          result.highs = parseInt(result.highs) + 1;
          cacheClient.hmset(key, result);
        } else if (highsorlows == 'lows') {
          result.lows = parseInt(result.lows) + 1;
          cacheClient.hmset(key, result);
        }
        // cacheClient.expire(key, 24*7*3600);//再次投票时不再设置有效时间
        map.isOK = true;
        map.data = result;
        callback(map);
      } else {
        result = {
          "highs": 0,
          "lows": 0
        };
        if (highsorlows == 'highs') {
          result.highs = 1;
          cacheClient.hmset(key, result);
        } else if (highsorlows == 'lows') {
          result.lows = 1;
          cacheClient.hmset(key, result);
        }
        cacheClient.expire(key, 24 * 7 * 3600); // 首次投票时设置有效时间
        map.isOK = true;
        map.data = result;
        callback(map);
      }
    });
  },
  /**
   * 伦敦金/伦敦银看涨看跌投票
   *
   * @param symbol
   *            伦敦金或伦敦银标识 Gold/Silver
   * @param highsorlows
   *            涨或跌 highs/lows
   * @param callback
   */
  getHighsLowsVote: (symbol, highsorlows, callback) => {
    var cacheClient = require('../cache/cacheClient');
    var key = 'highsLowsVote_' + symbol;
    var map = {};
    cacheClient.hgetall(key, function (err, result) {
      if (err) {
        logger.error("get highs or lows vote fail:" + err);
        result.highs = 0;
        result.lows = 0;
        callback({
          isOK: false,
          data: result
        });
      } else if (!err && result) {
        map.isOK = true;
        map.data = result;
        callback(map);
      } else {
        result = {
          "highs": 0,
          "lows": 0
        };
        map.isOK = true;
        map.data = result;
        callback(map);
      }
    });
  },
  /**
   * 用户修改皮肤样式
   *
   * @param userInfo
   * @param params
   * @param callback
   */
  setUserGroupThemeStyle: (userInfo, params, callback) => {
    if (typeof params == 'string') {
      params = JSON.parse(params);
    }
    let deferred = new Deferred();
    let path = "/studio/setUserGroupThemeStyle";
    let paramBody = {
      userInfo: userInfo,
      defTemplate: params.defTemplate
    };

    liveRoomAPIService.post(path, paramBody).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("setUserGroupThemeStyle! >>setUserGroupThemeStyle:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 提取培训班列表
   *
   * @param callback
   */
  getTrainRoomList: (groupType, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getTrainRoomList";
    path += "?groupType=" + groupType;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getTrainRoomList! >>getTrainRoomList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 通过用户userNo提取信息
   *
   * @param userNo
   */
  getUserInfoByUserNo: (groupType, userNo, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getUserInfoByUserNo";
    path += "?groupType=" + groupType;
    path += "&userNo=" + userNo;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getUserInfoByUserNo! >>getUserInfoByUserNo:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 初始直播老师列表
   *
   * @param params
   * @param callback
   */
  getShowTeacher: (params, callback) => {
    let deferred = new Deferred();
    let path = "/studio/getShowTeacher";
    path += "?groupType=" + params.groupType;
    path += "&groupId=" + params.groupId;
    path += "&authorId=" + params.authorId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getShowTeacher! >>getShowTeacher:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  }
};

// 导出服务类
module.exports = studioService;