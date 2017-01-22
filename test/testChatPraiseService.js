"use strict";
require("should");

let chatPraiseService = require('../service/chatPraiseService');
let logger = require('../resources/logConf').getLogger("testCchatPraiseService");

describe("chatPraiseService.getPraiseNum", () => {
    it("The name 'getPraiseNum' should be existed in chatPraiseService", () => {
	chatPraiseService.should.have.property("getPraiseNum");
    });
    it("chatPraiseService.getPraiseNum should work good.", (done) => {
	chatPraiseService.getPraiseNum("U150511B000005", "user", "fxchat", (data) => {
	    data.should.not.be.null();
	});
	chatPraiseService.getPraiseNum("U150511B000005", "user", "fxchat").then((data) => {
	    data.should.not.be.null();
	    done();
	});
    });
});

describe("chatPraiseService.setPraise", () => {
    it("The name 'setPraise' should be existed in chatPraiseService", () => {
	chatPraiseService.should.have.property("setPraise");
    });
    it("chatPraiseService.setPraise should work good.", (done) => {
	chatPraiseService.setPraise("U150511B000005", "user", "fxchat", (data) => {
	    data.should.not.be.null();
	});
	chatPraiseService.setPraise("U150511B000005", "user", "fxchat").then((data) => {
	    data.should.not.be.null();
	    done();
	});
    });
});