"use strict";
let should = require('should');

let chatSubscribeService = require('../service/chatSubscribeService');
let logger = require('../resources/logConf').getLogger("testChatSubscribeService");

describe("chatSubscribeService.getSubscribeList", () => {
    it("The name 'getSubscribeList' should be existed in chatSubscribeService", () => {
	chatSubscribeService.should.have.property("getSubscribeList");
    });
    
    it("chatSubscribeService.getSubscribeList should work as expect.", (done) => {
	chatSubscribeService.getSubscribeList({groupType: "studio", userId: "13800138096"}, (data) => {
	    should(data).not.be.null();
	    data.length.should.equal(0);
	});
	chatSubscribeService.getSubscribeList({groupType: "studio", userId: "13800138096"}).then((data) => {
	    should(data).not.be.null();
	    data.length.should.equal(0);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("chatSubscribeService.saveSubscribe", () => {
    it("The name 'saveSubscribe' should be existed in chatSubscribeService", () => {
	chatSubscribeService.should.have.property("saveSubscribe");
    });
    
    it("chatSubscribeService.saveSubscribe should work as expect.", (done) => {
	let testingData = {
	            groupType   : "studio",
	            type        : "shout_single_strategy",
	            userId      : "13510569443",
	            analyst     : "Eugene_ana",
	            noticeType  : "email",
	            startDate   : "2016-08-30T03:19:14.000Z",
	            endDate     : "2017-09-30T03:19:14.000Z",
	            point       : 3,
	            userName  	: "admin",
	            Ip    	: "0:0:0:0:0:0:0:1"
	        };
	chatSubscribeService.saveSubscribe(testingData).then((data) => {
	    should(data).not.be.null();
	    data.length.should.equal(0);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});

describe("chatSubscribeService.modifySubscribe", () => {
    it("The name 'modifySubscribe' should be existed in chatSubscribeService", () => {
	chatSubscribeService.should.have.property("modifySubscribe");
	chatSubscribeService.modifySubscribe.should.be.a.Function()
    });
    
    it("chatSubscribeService.modifySubscribe should work as expect.", (done) => {
	let testingData = {
	        userName        : "admin",
	        Ip              : "0:0:0:0:0:0:0:1",
	        userId          : "13510569443",
	        groupType       : "studio",
	        noticeType      : "email",
	        clientGroup     : 3,
	        analyst         : false,
	        point           : 100,
	        noticeCycle     : "week",
	        id              : "580ec16f417f77edde9c67e1"
	    };
	chatSubscribeService.modifySubscribe(testingData).then((data) => {
	    should(data).not.be.null();
	    data.length.should.equal(0);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});
describe("chatSubscribeService.saveSubscribe4UTM", () => {
    it("The name 'saveSubscribe4UTM' should be existed in chatSubscribeService", () => {
	chatSubscribeService.should.have.property("saveSubscribe4UTM");
	chatSubscribeService.saveSubscribe4UTM.should.be.a.Function()
    });
    
    it("chatSubscribeService.saveSubscribe4UTM should work as expect.", (done) => {
	chatSubscribeService.saveSubscribe4UTM("studio", "18813982018", "daily_quotation", true).then((data) => {
	    should(data).not.be.null();
	    data.length.should.equal(8);
	    done();
	}).catch((e) => {
	    logger.error(e);
	    done();
	});
    });
});