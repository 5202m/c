"use strict";
let should = require('should');
let userService = require('../service/userService');
let common = require('../util/common');//引入common类
let logger = require('../resources/logConf').getLogger("testStudioService");

describe("userService.getUserInfo", () => {
  it("The name 'getUserInfo' should be existed in userService", () => {
    userService.should.have.property("getUserInfo");
  });
  let id = "U161019B000074";
  it("Should work as expect.", (done) => {
    userService.getUserInfo(
        id,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "userNo", "userName", "position",
              "introduction", "introductionImg", "avatar");
          (data["_id"]).should.be.equal(id);
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getUserInfo(id).then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "userNo", "userName", "position",
          "introduction", "introductionImg", "avatar");
      (data["_id"]).should.be.equal(id);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });

});

describe("userService.getUserInfoByUserNo", () => {
  it("The name 'getUserInfoByUserNo' should be existed in userService", () => {
    userService.should.have.property("getUserInfoByUserNo");
  });

  let userNo = "andrew";
  it("Should work as expect.", (done) => {
    userService.getUserInfoByUserNo(
        userNo,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "userNo", "userName", "position",
              "introduction", "introductionImg", "avatar");
          (data["userNo"]).should.be.equal(userNo);
        }
    ).catch((e) => {
      logger.error(e);
      done();
    });
    userService.getUserInfoByUserNo(userNo).then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "userNo", "userName", "position",
          "introduction", "introductionImg", "avatar");
      (data["userNo"]).should.be.equal(userNo);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getUserList", () => {
  it("The name 'getUserList' should be existed in userService", () => {
    userService.should.have.property("getUserList");
  });
  let userNOs = ["andrew", "sunman_chu", "monica_chen"];
  it("Should work as expect.", (done) => {
    userService.getUserList(
        userNOs,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Array();
          data.length.should.be.equal(3);
        }
    ).catch((e) => {
      logger.error(e);
      done();
    });
    userService.getUserList(userNOs).then((data) => {
      should(data).not.be.null();
      data.should.be.an.Array();
      data.length.should.be.equal(3);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.batchOfflineStatus", () => {
  it("The name 'batchOfflineStatus' should be existed in userService", () => {
    userService.should.have.property("batchOfflineStatus");
  });
  let roomId = "studio_teach";
  it("Should work as expect.", (done) => {
    userService.batchOfflineStatus(roomId).then((data) => {
      should(data).not.be.null();
      data.should.be.a.Number();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.verifyRule", () => {
  it("The name 'verifyRule' should be existed in userService", () => {
    userService.should.have.property("verifyRule");
  });
  let clientGroup = "register",
      nickname = "GMS",
      isWh = false,
      userType = 0,
      groupId = "hxstudio_26",
      content = "Testing for userService.verifyRule";
  it("Should work as expect.", (done) => {
    userService.verifyRule(
        clientGroup, nickname, isWh, userType, groupId, content,
        (data) => {
          should(data).not.be.null();
        }
    ).catch((e) => {
      logger.error(e);
      done();
    });
    userService.verifyRule(clientGroup, nickname, isWh, userType, groupId,
        content)
    .then((data) => {
      should(data).not.be.null();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getMemberList", () => {
  it("The name 'getMemberList' should be existed in userService", () => {
    userService.should.have.property("getMemberList");
  });
  let id = "55bad80b64ac85e4ea250207";
  it("Should work as expect.", (done) => {
    userService.getMemberList(
        id,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "mobilePhone", "createIp", "updateUser",
              "updateIp", "loginPlatform");
          (data["_id"]).should.be.equal(id);
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getMemberList(id).then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "mobilePhone", "createIp", "updateUser",
          "updateIp", "loginPlatform");
      (data["_id"]).should.be.equal(id);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getAuthUsersByGroupId", () => {
  it("The name 'getAuthUsersByGroupId' should be existed in userService",
      () => {
        userService.should.have.property("getAuthUsersByGroupId");
      });
  let groupId = "hxstudio_26";
  it("Should work as expect.", (done) => {
    userService.getAuthUsersByGroupId(
        groupId,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Array();
          data.length.should.be.aboveOrEqual(1);
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getAuthUsersByGroupId(groupId).then((data) => {
      should(data).not.be.null();
      data.should.be.an.Array();
      data.length.should.be.aboveOrEqual(1);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.createUser", () => {
  it("The name 'createUser' should be existed in userService", () => {
    userService.should.have.property("createUser");
  });
  let userInfo = {
    mobilePhone: "18038050936",
    userId: "fxnpunpcpfuvx",
    accountNo: "87000027",
    ip: "127.0.0.1",
    thirdId: "",
    avatar: "",
    nickname: "Testing Name",
    userType: "0",
    roleNo: "0",
    pwd: "11111111",
    clientGroup: "vip",
    groupType: "studio",
    groupId: "studio_teach"
  };
  it("Should work as expect.", (done) => {
    userService.createUser(
        userInfo,
        (data) => {
          should(data).not.be.null();
          data.should.be.a.Boolean();
          data.should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.createUser(userInfo).then((data) => {
      should(data).not.be.null();
      data.should.be.a.Boolean();
      data.should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.joinNewRoom", () => {
  it("The name 'joinNewRoom' should be existed in userService", () => {
    userService.should.have.property("joinNewRoom");
  });
  let userInfo = {
    mobilePhone: "18038050936",
    userId: "fxnpunpcpfuvx",
    groupType: "studio",
    groupId: "studio_teach"
  };
  it("Should work as expect.", (done) => {
    userService.joinNewRoom(
        userInfo,
        (data) => {
          should(data).not.be.null();
          data.should.be.a.Boolean();
          data.should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.joinNewRoom(userInfo).then((data) => {
      should(data).not.be.null();
      data.should.be.a.Boolean();
      data.should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.updateMemberInfo", () => {
  it("The name 'updateMemberInfo' should be existed in userService", () => {
    userService.should.have.property("updateMemberInfo");
  });
  it("The name 'createUser' should be existed in userService", () => {
    userService.should.have.property("createUser");
  });
  let userInfo = {
    mobilePhone: "18038050936",
    userId: "fxnpunpcpfuvx",
    accountNo: "87000027",
    ip: "127.0.0.1",
    thirdId: "",
    avatar: "",
    nickname: "Testing Name",
    userType: "0",
    roleNo: "0",
    pwd: "11111111",
    clientGroup: "vip",
    groupType: "studio",
    groupId: "studio_teach"
  };
  it("Should work as expect.", (done) => {
    userService.updateMemberInfo(
        userInfo,
        (data) => {
          should(data).not.be.null();
          data.should.be.a.Number(0);
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.updateMemberInfo(userInfo).then((data) => {
      should(data).not.be.null();
      data.should.be.a.Number(0);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.updateChatUserGroupStatus", () => {
  it("The name 'updateChatUserGroupStatus' should be existed in userService",
      () => {
        userService.should.have.property("updateChatUserGroupStatus");
      });
  let userInfo = {
    fromPlatform: "pm_mis",
    userId: "fxnpunpcpfuvx",
    groupType: "studio",
    groupId: "studio_teach"
  };
  let chatStatus = 1, sendMsgCount = 10;
  it("Should work as expect.", (done) => {
    userService.updateChatUserGroupStatus(
        userInfo, chatStatus, sendMsgCount,
        (data) => {
          should(data).be.null();
        }
    ).catch((e) => {
      logger.error(e);
    });
    chatStatus = 0,
        userService.updateChatUserGroupStatus(userInfo, chatStatus,
            sendMsgCount)
        .then((data) => {
          should(data).be.null();
          done();
        }).catch((e) => {
          logger.error(e);
          done();
        });
  });

});

describe("userService.checkUserLogin", () => {
  it("The name 'checkUserLogin' should be existed in userService", () => {
    userService.should.have.property("checkUserLogin");
  });
  let userInfo = {
    userId: "fxnpunpcpfuvx",
    groupType: "studio",
    fromPlatform: "studio"
  };
  let isAllowPass = false;
  it("Should work as expect.", (done) => {
    userService.checkUserLogin(
        userInfo, isAllowPass,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "mobilePhone", "loginPlatform");
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.checkUserLogin(userInfo, isAllowPass)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "mobilePhone", "loginPlatform");
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getRoomCsUser", () => {
  it("The name 'getRoomCsUser' should be existed in userService", () => {
    userService.should.have.property("getRoomCsUser");
  });
  let roomId = "studio_market";
  it("Should work as expect.", (done) => {
    userService.getRoomCsUser(
        roomId,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "userNo", "userName", "position",
              "avatar");
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getRoomCsUser(roomId)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "userNo", "userName", "position", "avatar");
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getRoomCsUserList", () => {
  it("The name 'getRoomCsUserList' should be existed in userService", () => {
    userService.should.have.property("getRoomCsUserList");
  });
  let roomId = "studio_market";
  it("Should work as expect.", (done) => {
    userService.getRoomCsUserList(
        roomId,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Array();
          data.length.should.be.aboveOrEqual(1);
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getRoomCsUserList(roomId)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Array();
      data.length.should.be.aboveOrEqual(1);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.checkRoomStatus", () => {
  it("The name 'checkRoomStatus' should be existed in userService", () => {
    userService.should.have.property("checkRoomStatus");
  });
  let userId = "fxnpunpcpfuvx",
      groupId = "studio_teach",
      currCount = 1;
  it("Should work as expect.", (done) => {
    userService.checkRoomStatus(
        userId, groupId, currCount,
        (data) => {
          should(data).not.be.null();
          data.should.be.a.Boolean();
          data.should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.checkRoomStatus(userId, groupId, currCount)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.a.Boolean();
      data.should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.modifyNickname", () => {
  it("The name 'modifyNickname' should be existed in userService", () => {
    userService.should.have.property("modifyNickname");
  });
  let mobilePhone = "18038050936",
      groupType = "studio",
      nickname = "nickName Testing";
  it("Should work as expect.", (done) => {
    userService.modifyNickname(
        mobilePhone, groupType, nickname,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("isOK");
          (data["isOK"]).should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    nickname = "Testing Name"
    userService.modifyNickname(mobilePhone, groupType, nickname)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("isOK");
      (data["isOK"]).should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.modifyAvatar", () => {
  it("The name 'modifyAvatar' should be existed in userService", () => {
    userService.should.have.property("modifyAvatar");
  });
  let params = {
    mobilePhone: 18038050936,
    groupType: "studio",
    avatar: "",
    item: "hand_openDemo",
    clientGroup: "vip",
    userId: "fxnpunpcpfuvx",
    ip: "127.0.0.1",
  };
  it("Should work as expect.", (done) => {
    userService.modifyAvatar(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("isOK");
          (data["isOK"]).should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.modifyAvatar(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("isOK");
      (data["isOK"]).should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getTeacherList", () => {
  it("The name 'getTeacherList' should be existed in userService", () => {
    userService.should.have.property("getTeacherList");
  });
  let params = {
    groupId: "hxstudio_26",
    hasQRCode: false
  };
  it("Should work as expect.", (done) => {
    userService.getTeacherList(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Array();
          (data.length).should.be.aboveOrEqual(1);
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getTeacherList(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Array();
      (data.length).should.be.aboveOrEqual(1);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getTeacherByUserId", () => {
  it("The name 'getTeacherByUserId' should be existed in userService", () => {
    userService.should.have.property("getTeacherByUserId");
  });
  let userId = "monica_chen";
  it("Should work as expect.", (done) => {
    userService.getTeacherByUserId(
        {userId: userId},
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "userNo", "userName", "introductionImg",
              "wechatCodeImg", "introductionImgLink");
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getTeacherByUserId({userId: userId})
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "userNo", "userName", "introductionImg",
          "wechatCodeImg", "introductionImgLink");
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.modifyUserName", () => {
  it("The name 'modifyUserName' should be existed in userService", () => {
    userService.should.have.property("modifyUserName");
  });
  let userInfo = {
    mobilePhone: 18038050936,
    groupType: "studio",
    clientGroup: "vip",
    userId: "fxnpunpcpfuvx"
  };
  let params = {
    userName: "Testing UserName",
    item: "register_reg",
    ip: "127.0.0.1"
  };
  it("Should work as expect.", (done) => {
    userService.modifyUserName(
        userInfo, params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("isOK");
          (data["isOK"]).should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.modifyUserName(userInfo, params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("isOK");
      (data["isOK"]).should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.modifyEmail", () => {
  it("The name 'modifyEmail' should be existed in userService", () => {
    userService.should.have.property("modifyEmail");
  });
  let params = {
    groupType: "studio",
    email: "ccc" + common.randomNumber(6) + "@abc.com",
    userId: "uxnxiipcvfnvi",
    item: "register_reg"
  };
  it("Should work as expect.", (done) => {
    userService.modifyEmail(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("isOK");
          (data["isOK"]).should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    params.email = "ccc" + common.randomNumber(6) + "@abc.com";
    userService.modifyEmail(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("isOK");
      (data["isOK"]).should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.modifyPwd", () => {
  it("The name 'modifyPwd' should be existed in userService", () => {
    userService.should.have.property("modifyPwd");
  });
  it("The name 'modifyUserName' should be existed in userService", () => {
    userService.should.have.property("modifyUserName");
  });
  let userInfo = {
    mobilePhone: 18122056986,
    groupType: "studio",
    clientGroup: "register",
    userId: "uxnxiipcvfnvi"
  };
  let params = {
    password: "11111111",
    newPwd: "11111111",
    item: "register_reg",
    ip: "127.0.0.1"
  };
  it("Should work as expect.", (done) => {
    userService.modifyPwd(
        userInfo, params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("isOK");
          (data["isOK"]).should.be.true();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.modifyPwd(userInfo, params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("isOK");
      (data["isOK"]).should.be.true();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("userService.getClientGroupByMId", () => {
  it("The name 'getClientGroupByMId' should be existed in userService", () => {
    userService.should.have.property("getClientGroupByMId");
  });
  let mobileArr = "15083782809,15297762185,15297764162",
      groupType = "studio";
  it("Should work as expect.", (done) => {
    userService.getClientGroupByMId(
        mobileArr, groupType,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
        }
    ).catch((e) => {
      logger.error(e);
    });
    userService.getClientGroupByMId(mobileArr, groupType)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});
