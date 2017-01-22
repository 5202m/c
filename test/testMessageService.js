"use strict";
let should = require('should');

let messageService = require('../service/messageService');
let chatMessage = require('../models/chatMessage');//引入chatMessage数据模型
let logger = require('../resources/logConf').getLogger("testMessageService");

describe("messageService.loadMsg", () => {
    it("The name 'loadMsg' should be existed in messageService", () => {
	messageService.should.have.property("loadMsg");
    });
    var userInfo = {
	    userType: 1,
	    isOK: true,
	    nickname: 'admin',
	    position: '超级管理员',
	    avatar: '',
	    roleNo: 'admin_super',
	    roleName: '超级管理员',
	    accountNo: 'admin',
	    userId: 'admin',
	    mobilePhone: '13569897412',
	    fromPlatform: 'pm_mis',
	    groupId: 'hxstudio_26',
	    groupType: 'hxstudio',
	    isMobile: false,
	    sequence: 1,
	    toUser: {
		userId: "userId",
		userType: "userType"
	    }
    };
    it("Should work as expect.", (done) => {
	messageService.loadMsg(userInfo, null, false, (data) => {
	    should(data).not.be.null();
	    data.should.be.an.Array();
	}).catch((e) => {
	    logger.error(e);
	});
	messageService.loadMsg(userInfo, null, true).then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Array();
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("messageService.saveMsg", () => {
    it("The name 'saveMsg' should be existed in messageService", () => {
	messageService.should.have.property("saveMsg");
    });
    let msgData = {
	    "fromUser": {
	        "userType": 1,
	        "isOK": true,
	        "nickname": "admin",
	        "position": "超级管理员",
	        "avatar": "",
	        "roleNo": "admin_super",
	        "roleName": "超级管理员",
	        "accountNo": "admin",
	        "userId": "admin",
	        "mobilePhone": "13569897412",
	        "fromPlatform": "pm_mis",
	        "groupId": "hxstudio_26",
	        "groupType": "hxstudio",
	        "toUser": null
	    },
	    "content": {
	        "msgType": "text",
	        "value": "Hello"
	    }
	};
    it("Should work as expect.", (done) => {
	messageService.saveMsg(msgData, [], (data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("isOK");
	    data.should.have.property("msg");
	}).catch((e) => {
	    logger.error(e);
	});
	messageService.saveMsg(msgData, []).then((data) => {
	    should(data).not.be.null();
	    data.should.be.an.Object();
	    data.should.have.property("isOK");
	    data.should.have.property("msg");
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("messageService.existRecord", () => {
    it("The name 'existRecord' should be existed in messageService", () => {
	messageService.should.have.property("existRecord");
    });
    let msgData = {"toUser.talkStyle": 1,"toUser.userType":3,"toUser.questionId":"56a981b1e0502e07a1f54dd1"};
    
    it("Should work as expect.", (done) => {
	messageService.existRecord(msgData, (data) => {
	    should(data).be.Number();
	}).catch((e) => {
	    logger.error(e);
	});
	messageService.existRecord(msgData).then((data) => {
	    should(data).be.Number();
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});
//@TODO add available testing cases.
describe("messageService.getWhUseMsgCount", () => {
    it("The name 'getWhUseMsgCount' should be existed in messageService", () => {
	messageService.should.have.property("getWhUseMsgCount");
    });
    it("Should work as expect.", (done) => {
	messageService.getWhUseMsgCount(
		"hxstudio", 
		"hxstudio_26", 
		0, 
		[3],
		"admin",
		"2016-12-13T02:34:32.647Z",
	(data) => {
	    should(data).not.be.null();
	}).catch((e) => {
	    logger.error(e);
	});
	messageService.getWhUseMsgCount(
		"hxstudio", 
		"hxstudio_26", 
		0, 
		[3],
		"admin",
		"2016-12-13T02:34:32.647Z"	
	).then((data) => {
	    should(data).not.be.null();
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("messageService.loadBigImg", () => {
    it("The name 'loadBigImg' should be existed in messageService", () => {
	messageService.should.have.property("loadBigImg");
    });
    let userId = "Eugene_ana",
    	publishTime = "1480671328886_189339966";
    it("Should work as expect.", (done) => {
	messageService.loadBigImg(userId, publishTime, (data) => {
	    should(data).not.be.null();
	    should(data).be.String();
	    data.should.startWith("data:image");
	}).catch((e) => {
	    logger.error(e);
	});
	messageService.loadBigImg(userId, publishTime).then((data) => {
	    should(data).not.be.null();
	    should(data).be.String();
	    data.should.startWith("data:image");
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("messageService.deleteMsg", () => {
    it("The name 'deleteMsg' should be existed in messageService", () => {
	messageService.should.have.property("deleteMsg");
    });
    let data = {};
    data.publishTimeArr = ["58414012897f05f151773b04"];
    let reverDelete = () => {
	chatMessage.db().update(
		{'publishTime':{ '$in':data.publishTimeArr}},
		{$set:{ status: 1,valid:1}},
		{ multi: true },
	(err,row) => {
            if(!err && row){
                logger.info("reverDelete->reverDelete success!");
            }
        });
    };
    it("Should work as expect.", (done) => {
	messageService.deleteMsg(data, (data) => {
	    should(data).not.be.null();
	    should(data).be.String();
	}).then(reverDelete).catch((e) => {
	    logger.error(e);
	});
	messageService.deleteMsg(data).then((data) => {
	    should(data).not.be.null();
	    should(data).be.String();
	}).then(reverDelete).then(done).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("messageService.getLastTwoDaysMsg", () => {
    it("The name 'getLastTwoDaysMsg' should be existed in messageService", () => {
	messageService.should.have.property("getLastTwoDaysMsg");
    });
    let params = {
	    groupType: "hxstudio",
	    groupId: "hxstudio_26",
	    userId: "Eugene_ana"
    };
    
    it("Should work as expect.", (done) => {
	messageService.getLastTwoDaysMsg(params, (data) => {
	    should(data).not.be.null();
	    should(data).be.Array();
	}).catch((e) => {
	    logger.error(e);
	});
	messageService.getLastTwoDaysMsg(params).then((data) => {
	    should(data).not.be.null();
	    should(data).be.Array();
	}).then(done).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});