/**
 * 用户服务类 Created by Alan.wu on 2015/3/4.
 */
var constant = require('../constant/constant'); // 引入constant
var common = require('../util/common'); // 引入common类

let logger = require('../resources/logConf').getLogger('userService'); // 引入log4js
let liveRoomAPIService = require('./liveRoomAPIService');
let querystring = require("querystring");
let Deferred = require("../util/common").Deferred;
/**
 * 定义用户服务类
 *
 * @type {{getMemberList: , updateMemberInfo: }}
 */
var userService = {
  /**
   * 通过用户id提取信息
   *
   * @param id
   */
  getUserInfo: (id, callback) => {
    let deferred = new Deferred();
    let path = "/user/getUserInfo";
    path += "?id=" + id;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getUserInfo! >>getUserInfo:", e);
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
  getUserInfoByUserNo: (userNo, callback) => {
    let deferred = new Deferred();
    let path = "/user/getUserInfoByUserNo";
    path += "?userNo=" + userNo;

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
   * 通过用户id提取信息
   *
   * @param ids
   */
  getUserList: (userNOs, callback) => {
    let deferred = new Deferred();
    let path = "/user/getUserList";
    path += "?userNOs=" + userNOs.toString();

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getUserList! >>getUserList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 批量下线房间用户在线状态
   *
   * @param roomId
   */
  batchOfflineStatus: (roomId) => {
    let deferred = new Deferred();
    let path = "/user/batchOfflineStatus";
    path += "?roomId=" + roomId.toString();

    liveRoomAPIService.get(path).then((result) => {
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("batchOfflineStatus! >>batchOfflineStatus:", e);
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 验证规则
   *
   * @param clientGroup
   * @param nickname
   * @param isWh
   *            是否私聊
   * @param groupId
   * @param content
   * @param callback
   */
  verifyRule: (userInfo, options, content, callback) => {
    let deferred = new Deferred();
    let path = "/user/verifyRule";
    let params = {
      clientGroup: userInfo.clientGroup,
      nickname: userInfo.nickname,
      isWh: options.isWh,
      speakNum: Number(options.speakNum),
      userType: userInfo.userType,
      groupId: userInfo.groupId,
      content: JSON.stringify(content)
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("verifyRule! >>verifyRule:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 提取会员信息
   */
  getMemberList: (id, callback) => {
    let deferred = new Deferred();
    let path = "/user/getMemberList";
    path += "?id=" + id;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getMemberList! >>getMemberList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 检查角色是否有审批权限
   */
  getAuthUsersByGroupId: (groupId, callback) => {
    let deferred = new Deferred();
    let path = "/user/getAuthUsersByGroupId";
    path += "?groupId=" + groupId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getAuthUsersByGroupId! >>getAuthUsersByGroupId:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 新增用户信息
   *
   * @param userInfo
   * @param callback
   */
  createUser: (userInfo, callback) => {
    let deferred = new Deferred();
    let path = "/user/createUser";

    liveRoomAPIService.post(path, userInfo).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("createUser! >>createUser:", e);
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
   * @param userInfo
   * @param callback
   */
  joinNewRoom: (userInfo, callback) => {
    let deferred = new Deferred();
    let path = "/user/joinNewRoom";
    path += "?mobilePhone=" + userInfo.mobilePhone;
    path += "&userId=" + userInfo.userId;
    path += "&groupType=" + userInfo.groupType;
    path += "&groupId=" + userInfo.groupId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("joinNewRoom! >>joinNewRoom:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 检查后台进入聊天室的用户，是则直接登录聊天室
   */
  checkSystemUserInfo: function (userInfo, callback) {
    var result = {
      isOK: false
    };
    var newUserInfo = {
      groupType: userInfo.groupType,
      groupId: userInfo.groupId,
      accountNo: userInfo.accountNo,
      userId: userInfo.userId,
      mobilePhone: userInfo.mobilePhone
    };
    if (constant.fromPlatform.pm_mis == userInfo.fromPlatform) {
      newUserInfo.accountNo = userInfo.userId;
      newUserInfo.userId = ''; // 不需要填值
    }
    logger.info(
        "checkSystemUserInfo=>newUserInfo:" + JSON.stringify(newUserInfo));
    userService.createUser(newUserInfo).then(result => {
      callback({isOK: result});
    }).catch(err => {
      logger.error("checkSystemUserInfo=>createUser:" + err);
    });
  },
  /**
   * 更新会员信息 备注：判断是否存在登录信息，不存在则新增，存在则更新
   *
   * @param userInfo
   * @param callback
   */
  updateMemberInfo: (userInfo, callback) => {
    let deferred = new Deferred();
    let path = "/user/updateMemberInfo";

    liveRoomAPIService.post(path, userInfo).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("updateMemberInfo! >>updateMemberInfo:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 下线更新会员状态及发送记录条数
   */
  updateChatUserGroupStatus: (userInfo, chatStatus, sendMsgCount, callback) => {
    let deferred = new Deferred();
    let path = "/user/updateChatUserGroupStatus";
    let params = {
      userInfo: userInfo,
      chatStatus: chatStatus,
      sendMsgCount: sendMsgCount
    };

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("updateMemberInfo! >>updateMemberInfo:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 通过userId及组别检测用户是否已经登录过
   *
   * @param userInfo
   * @param isAllowPass
   *            是否允许通过
   */
  checkUserLogin: (userInfo, isAllowPass, callback) => {
    if (isAllowPass) {
      callback(true);
      return;
    }
    let deferred = new Deferred();
    let path = "/user/checkUserLogin";
    path += "?userId=" + userInfo.userId;
    path += "&groupType=" + userInfo.groupType;
    path += "&fromPlatform=" + userInfo.fromPlatform;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("checkUserLogin! >>checkUserLogin:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 检查用户禁言
   *
   * @param row
   *            member信息
   * @param groupId
   *            房间号
   * @returns {*}
   */
  checkUserGag: function (row, groupId) {
    var subRow = row.loginPlatform.chatUserGroup[0];
    if (common.isBlank(subRow.gagDate)) {
      var currRoom = !subRow.rooms ? null : subRow.rooms.find(ele => {
        return ele._id === groupId;
      });
      if (currRoom) {
        if (common.dateTimeWeekCheck(currRoom.gagDate, false)) {
          return {
            isOK: false,
            tip: currRoom.gagTips
          };
        } else {
          return {
            isOK: true
          };
        }
      } else {
        // 房间信息不存在？？
        return {
          isOK: true
        };
      }
    } else {
      if (common.dateTimeWeekCheck(subRow.gagDate, false)) {
        return {
          isOK: false,
          tip: subRow.gagTips
        };
      } else {
        return {
          isOK: true
        };
      }
    }
  },
  /**
   * 提取cs客服信息
   *
   * @param roomId
   */
  getRoomCsUser: (roomId, callback) => {
    let deferred = new Deferred();
    let path = "/user/getRoomCsUser";
    path += "?roomId=" + roomId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getRoomCsUser! >>getRoomCsUser:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 提取cs客服信息
   *
   * @param roomId
   */
  getRoomCsUserList: (roomId, callback) => {
    let deferred = new Deferred();
    let path = "/user/getRoomCsUserList";
    path += "?roomId=" + roomId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getRoomCsUserList! >>getRoomCsUserList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 检查房间是否在开放时间内，或可用
   *
   * @param userId
   * @param groupId
   * @returns {boolean}
   */
  checkRoomStatus: (userId, groupId, currCount, callback) => {
    let deferred = new Deferred();
    let path = "/user/checkRoomStatus";
    path += "?userId=" + (userId || "");
    path += "&groupId=" + groupId;
    path += "&currCount=" + currCount;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("checkRoomStatus! >>checkRoomStatus:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 修改昵称
   *
   * @param mobilePhone
   * @param groupType
   * @param callback
   */
  modifyNickname: (mobilePhone, groupType, nickname, callback) => {
    let deferred = new Deferred();
    let path = "/user/modifyNickname";
    let params = {
      mobilePhone: mobilePhone,
      groupType: groupType,
      nickname: nickname
    };
    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("modifyNickname! >>modifyNickname:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 修改头像
   *
   * @param mobilePhone
   * @param groupType
   * @param callback
   */
  modifyAvatar: (params, callback) => {
    let deferred = new Deferred();
    let path = "/user/modifyAvatar";

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("modifyAvatar! >>modifyAvatar:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 获取分析师
   *
   * @param params
   * @param callback
   */
  getTeacherList: (params, callback) => {
    let deferred = new Deferred();
    let path = "/user/getTeacherList";
    path += "?groupId=" + params.groupId;
    path += "&hasQRCode=" + params.hasQRCode;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getTeacherList! >>getTeacherList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 根据userid获取分析师二维码等信息
   *
   * @param params
   * @param callback
   */
  getTeacherByUserId: (params, callback) => {
    let deferred = new Deferred();
    let path = "/user/getTeacherByUserId";
    path += "?userId=" + params.userId;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getTeacherByUserId! >>getTeacherByUserId:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 修改用户名
   *
   * @param mobilePhone
   * @param groupType
   * @param callback
   */
  modifyUserName: (userInfo, params, callback) => {
    let deferred = new Deferred();
    let path = "/user/modifyUserName";
    let parameter = {
      userInfo: userInfo,
      params: params
    };

    liveRoomAPIService.post(path, parameter).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("modifyUserName! >>modifyUserName:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 修改邮箱
   *
   * @param mobilePhone
   * @param groupType
   * @param callback
   */
  modifyEmail: (params, callback) => {
    let deferred = new Deferred();
    let path = "/user/modifyEmail";

    liveRoomAPIService.post(path, params).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("modifyEmail! >>modifyEmail:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 修改密码
   *
   * @param mobilePhone
   * @param groupType
   * @param callback
   */
  modifyPwd: (userInfo, params, callback) => {
    let deferred = new Deferred();
    let path = "/user/modifyPwd";
    let parameter = {
      userInfo: userInfo,
      params: params
    };

    liveRoomAPIService.post(path, parameter).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("modifyPwd! >>modifyPwd:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * @param mobilePhone
   * @param groupType
   * @param callback
   */
  getClientGroupByMId: (mobileArr, groupType, callback) => {
    let deferred = new Deferred();
    let path = "/user/getClientGroupByMId";
    path += "?mobileArr=" + mobileArr;
    path += "&groupType=" + groupType;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getClientGroupByMId! >>getClientGroupByMId:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  },
  /**
   * 移除在线用户
   *
   * @param userInfo
   * @param isUpdate
   *            是否需要更新数据
   * @param callback
   */
  removeOnlineUser: function (userInfo, isUpdate, callback) {
    if (common.hasPrefix(constant.clientGroup.visitor, userInfo.userId)
        || !isUpdate) {
      callback(true);
      return;
    }
    // 更新用户记录表的在线状态(下线设置为0）
    if (common.isValid(userInfo.userId) && common.isValid(userInfo.groupId)
        && common.isValid(userInfo.groupType)) {
      userService.updateChatUserGroupStatus(userInfo, 0, userInfo.sendMsgCount,
          function (err) {
          });
      callback(true);
    } else {
      callback(false);
    }
  },
  /**
   * 获取分析师列表
   *
   * @param params
   * @param callback
   */
  getAnalystList: (params, callback) => {
    let deferred = new Deferred();
    let path = "/user/getAnalystList";
    path += "?systemCategory=" + params.systemCategory;

    liveRoomAPIService.get(path).then((result) => {
      if (callback) {
        callback(result);
      }
      deferred.resolve(result);
    }).catch((e) => {
      logger.error("getAnalystList! >>getAnalystList:", e);
      if (callback) {
        callback(null);
      }
      deferred.reject(e);
    });
    return deferred.promise;
  }
};
// 导出服务类
module.exports = userService;