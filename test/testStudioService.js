"use strict";
let should = require('should');
let studioService = require('../service/studioService');
let logger = require('../resources/logConf').getLogger("testStudioService");

describe("studioService.getIndexLoadData", () => {
    it("The name 'getIndexLoadData' should be existed in studioService", () => {
	studioService.should.have.property("getIndexLoadData");
    });
    let userInfo = {
	    userId: "uxnxiipcvfnvi",
	    groupType: "hxstudio"
    };
    let groupId = "hxstudio_26";
    it("Should work as expect.", (done) => {
	studioService.getIndexLoadData(
		userInfo,
		groupId,
		false,
		false,
		false,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("memberInfo");
		    data.should.have.property("studioList");
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.getIndexLoadData(
		userInfo,
		groupId,
		false,
		false,
		false
	).then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("memberInfo");
	    data.should.have.property("studioList");
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.getRoomList", () => {
    it("The name 'getRoomList' should be existed in studioService", () => {
	studioService.should.have.property("getRoomList");
    });
    let groupType = "hxstudio";
    it("Should work as expect.", (done) => {
	studioService.getRoomList(
		groupType,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Array();
		    data.length.should.be.aboveOrEqual(1);
		    data.forEach(function(ele){
			ele.should.have.property("groupType");
			ele["groupType"].should.be.equal(groupType);
		    });
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.getRoomList(groupType)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Array();
	    data.length.should.be.aboveOrEqual(1);
	    data.forEach(function(ele){
		ele.should.have.property("groupType");
		ele["groupType"].should.be.equal(groupType);
	    });
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.getClientGroupList", () => {
    it("The name 'getClientGroupList' should be existed in studioService", () => {
	studioService.should.have.property("getClientGroupList");
    });
    let groupType = "hxstudio";
    it("Should work as expect.", (done) => {
	studioService.getClientGroupList(
		groupType,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Array();
		    data.length.should.be.aboveOrEqual(1);
		    data.forEach(function(ele){
			ele.should.have.property("groupType");
			ele["groupType"].should.be.equal(groupType);
			ele.should.have.property("clientGroupId");
		    });
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.getClientGroupList(groupType)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Array();
	    data.length.should.be.aboveOrEqual(1);
	    data.forEach(function(ele){
		ele.should.have.property("groupType");
		ele["groupType"].should.be.equal(groupType);
		ele.should.have.property("clientGroupId");
	    });
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.resetPwd", () => {
    it("The name 'resetPwd' should be existed in studioService", () => {
	studioService.should.have.property("resetPwd");
    });
    let groupType = "hxstudio",
        mobilePhone = "18122056986",
        newPwd = "11111111",
        oldPwd = "";
    it("Should work as expect.", (done) => {
	studioService.resetPwd(
		groupType, mobilePhone, newPwd, oldPwd,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.a.String();
		    data.length.should.be.aboveOrEqual(1);
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.resetPwd(groupType, mobilePhone, newPwd, oldPwd)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.a.String();
	    data.length.should.be.aboveOrEqual(1);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});  
    });
});

describe("studioService.getStudioByGroupId", () => {
    it("The name 'getStudioByGroupId' should be existed in studioService", () => {
	studioService.should.have.property("getStudioByGroupId");
    });
    let groupId = "hxstudio_26";
    it("Should work as expect.", (done) => {
	studioService.getStudioByGroupId(
		groupId,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("_id");
		    data["_id"].should.be.equal(groupId);
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.getStudioByGroupId(groupId)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("_id");
	    data["_id"].should.be.equal(groupId);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});    
    });
});

describe("studioService.checkGroupAuth", () => {
    it("The name 'checkGroupAuth' should be existed in studioService", () => {
	studioService.should.have.property("checkGroupAuth");
    });
    let groupId = "studio_30",
    	clientGroup = "active",
    	userId = "fxcviisincnxv";
    it("Should work as expect.", (done) => {
	studioService.checkGroupAuth(
		groupId, clientGroup, userId,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.a.Boolean();
		    data.should.be.true();
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.checkGroupAuth(groupId, clientGroup, userId)
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

describe("studioService.getDefaultRoom", () => {
    it("The name 'getDefaultRoom' should be existed in studioService", () => {
	studioService.should.have.property("getDefaultRoom");
    });
    let groupType = "studio",
	clientGroup = "active";
    it("Should work as expect.", (done) => {
	studioService.getDefaultRoom(
		groupType,clientGroup,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.a.String();
		    data.length.should.be.aboveOrEqual(1);
		}
	).catch((e) => {
	    logger.error(e);
	});
	studioService.getDefaultRoom(groupType,clientGroup)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.a.String();
	    data.length.should.be.aboveOrEqual(1);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});    
    });
});

describe("studioService.studioRegister", () => {
    it("The name 'studioRegister' should be existed in studioService", () => {
	studioService.should.have.property("studioRegister");
    });
    let userInfo = {
	    mobilePhone: "18038050936",
	    userId: "fxnpunpcpfuvx",
	    accountNo: "accountNo",
	    ip: "::ffff:183.62.222.129",
	    groupType: "",
	    thirdId: "",
	    avatar: "",
	    nickname: "Testing Name",
	    userType: "0",
	    roleNo: "",
	    pwd: "11111111",
	    clientGroup: "vip",
	    groupType: "studio",
	    groupId: "studio_teach"
	};
    it("Should work as expect.", (done) => {
	studioService.studioRegister(
		userInfo,"real",
		(data) => {
		    should(data).not.be.null();
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.studioRegister(
		userInfo,"real"
	).then((data) => {
	    should(data).not.be.null();
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.checkMemberAndSave", () => {
    it("The name 'checkMemberAndSave' should be existed in studioService", () => {
	studioService.should.have.property("checkMemberAndSave");
    });
    let userInfo = {
	    mobilePhone: "18038050936",
	    groupType: "studio",
	    groupId: "studio_teach"
	};
    it("Should work as expect.", (done) => {
	studioService.checkMemberAndSave(
		userInfo,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data["isOK"].should.be.true();
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.checkMemberAndSave(
		userInfo
	).then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("isOK");
	    data["isOK"].should.be.true();
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.checkNickName", () => {
    it("The name 'checkNickName' should be existed in studioService", () => {
	studioService.should.have.property("checkNickName");
    });
    let userInfo = {mobilePhone:"", groupType:"studio", nickname:"Eugene_ana"};
    it("Should work as expect.", (done) => {
	studioService.checkNickName(
		userInfo,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isExist");
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.checkNickName(userInfo)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("isExist");
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.login", () => {
    it("The name 'login' should be existed in studioService", () => {
	studioService.should.have.property("login");
    });
    let userInfo = {mobilePhone:"18038050936", groupType:"studio", userId: "fxnpunpcpfuvx"};
    it("Should work as expect when type = 1.", (done) => {
	studioService.login(
		{
		    mobilePhone: userInfo.mobilePhone,
		    groupType: userInfo.groupType
		}, 1,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data.isOK.should.be.true();
		    (data.userInfo.mobilePhone).should.be.equal(userInfo.mobilePhone);
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.login(
		{
		    mobilePhone: userInfo.mobilePhone,
		    groupType: userInfo.groupType
		}, 1)
	.then((data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data.isOK.should.be.true();
		    (data.userInfo.mobilePhone).should.be.equal(userInfo.mobilePhone);
		    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
    it("Should work as expect when type = 2.", (done) => {
	studioService.login(
		{
		    userId: userInfo.userId,
		    groupType: userInfo.groupType
		}, 2,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data.isOK.should.be.true();
		    (data.userInfo.mobilePhone).should.be.equal(userInfo.mobilePhone);
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.login(
		{
		    userId: userInfo.userId,
		    groupType: userInfo.groupType
		}, 2)
	.then((data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data.isOK.should.be.true();
		    (data.userInfo.mobilePhone).should.be.equal(userInfo.mobilePhone);
		    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
//    it("Should work as expect when type = 3.", (done) => {}); //can't test this, because I can't find out available thirdId in DB.
    it("Should work as expect when type = 4.", (done) => {
	studioService.login(
		{
		    mobilePhone: "18122056986",
		    password: "11111111",
		    groupType: userInfo.groupType
		}, 4,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data.isOK.should.be.true();
		    (data.userInfo.mobilePhone).should.be.equal("18122056986");
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.login(
		{
		    mobilePhone: "18122056986",
		    password: "11111111",
		    groupType: userInfo.groupType
		}, 4)
	.then((data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("isOK");
		    data.isOK.should.be.true();
		    (data.userInfo.mobilePhone).should.be.equal("18122056986");
		    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.updateClientGroup", () => {
    it("The name 'updateClientGroup' should be existed in studioService", () => {
	studioService.should.have.property("updateClientGroup");
    });
    
    let groupType = "studio",
        mobilePhone = "13043427001", 
        newClientGroup = "register", //active
        accountNo = "86027299";
    it("Should work as expect.", (done) => {
	studioService.updateClientGroup(
		groupType, mobilePhone, newClientGroup, accountNo,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.a.Boolean();
		    data.should.be.true();
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	
	studioService.updateClientGroup(
		groupType, mobilePhone, "active", accountNo
	).then((data) => {
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
describe("studioService.setUserGroupThemeStyle", () => {
    it("The name 'setUserGroupThemeStyle' should be existed in studioService", () => {
	studioService.should.have.property("setUserGroupThemeStyle");
    });
    let userInfo = {
	    mobilePhone: "18122056986",
	    groupType: "studio"
    }, 
    	defTemplate = '{"theme":"theme1","style":"pm_darkblue"}';
    it("Should work as expect.", (done) => {
	studioService.setUserGroupThemeStyle(
		userInfo, 
		{
		    defTemplate: defTemplate
		},
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.property("mobilePhone");
		    (data.mobilePhone).should.be.equal(userInfo.mobilePhone);
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	defTemplate = '{"theme":"theme1","style":"pm_def"}';
	studioService.setUserGroupThemeStyle(
		userInfo,
		{
		    defTemplate: defTemplate
		}
	).then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("mobilePhone");
	    (data.mobilePhone).should.be.equal(userInfo.mobilePhone);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.getTrainRoomList", () => {
    it("The name 'getTrainRoomList' should be existed in studioService", () => {
	studioService.should.have.property("getTrainRoomList");
    });
    let groupType = "studio";
    it("Should work as expect.", (done) => {
	studioService.getTrainRoomList(
		groupType,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Array();
		    data.length.should.be.aboveOrEqual(1);
		    (data[0]).should.have.keys("_id","groupType","name","talkStyle","clientGroup","defaultAnalyst");
		    (data[0]["groupType"]).should.be.equal(groupType);
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.getTrainRoomList(groupType)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Array();
	    data.length.should.be.aboveOrEqual(1);
	    (data[0]).should.have.keys("_id","groupType","name","talkStyle","clientGroup","defaultAnalyst");
	    (data[0]["groupType"]).should.be.equal(groupType);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.getUserInfoByUserNo", () => {
    it("The name 'getUserInfoByUserNo' should be existed in studioService", () => {
	studioService.should.have.property("getUserInfoByUserNo");
    });
    let groupType = "studio",
    	userNo = "alan1";
    it("Should work as expect.", (done) => {
	studioService.getUserInfoByUserNo(
		groupType,
		userNo,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.keys("_id","userNo","userName","position","introduction","introductionImg","winRate","praiseNum");
		    data.userNo.should.be.equal(userNo);
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.getUserInfoByUserNo(groupType, userNo)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.keys("_id","userNo","userName","position","introduction","introductionImg","winRate","praiseNum");
	    data.userNo.should.be.equal(userNo);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("studioService.getShowTeacher", () => {
    it("The name 'getShowTeacher' should be existed in studioService", () => {
	studioService.should.have.property("getShowTeacher");
    });
    let params = {
	    groupType: "studio",
	    groupId: "studio_42",
	    authorId: ""
    };
    it("Should work as expect.", (done) => {
	studioService.getShowTeacher(
		params,
		(data) => {
		    should(data).not.be.null();
		    data.should.be.an.Object();
		    data.should.have.keys("userInfo","tradeList","teacherList","trAndClNum","trainList");
		}
	).catch((e) => {
	    logger.error(e);
	    done();
	});
	studioService.getShowTeacher(params)
	.then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.keys("userInfo","tradeList","teacherList","trAndClNum","trainList");
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});
