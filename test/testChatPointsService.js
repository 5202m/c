"use strict";
let should = require('should');

let chatPointsService = require('../service/chatPointsService');
let logger = require('../resources/logConf').getLogger("testChatPointsService");

describe("chatPointsService.getPointsInfo", () => {
    it("The name 'getPointsInfo' should be existed in chatPointsService", () => {
        chatPointsService.should.have.property("getPointsInfo");
    });
    it("chatPointsService.getPointsInfo with hasJournal == false.", (done) => {
        chatPointsService.getPointsInfo("studio", "13800138075", false, (data) => {
            data.groupType.should.equal("studio");
            data.userId.should.equal("13800138075");
            data.should.not.have.property("journal");
        });
        chatPointsService.getPointsInfo("studio", "13800138075", false).then(
            (data) => {
                data.groupType.should.equal("studio");
                data.userId.should.equal("13800138075");
                data.should.not.have.property("journal");
                done();
            }).catch((e) => {
            logger.error(e);
            done();
        });
    });
    it("chatPointsService.getPointsInfo with hasJournal == true.", (done) => {
        chatPointsService.getPointsInfo("studio", "13800138075", true, (data) => { //journal
            data.groupType.should.equal("studio");
            data.userId.should.equal("13800138075");
            data.should.have.property("journal");
        });
        chatPointsService.getPointsInfo("studio", "13800138075", true).then(
            (data) => { //journal
                data.groupType.should.equal("studio");
                data.userId.should.equal("13800138075");
                data.should.have.property("journal");
                done();
            }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});
describe("chatPointsService.getChatPoints", () => {
    it("The name 'getChatPoints' should be existed in chatPointsService", () => {
        chatPointsService.should.have.property("getChatPoints");
    });
    it("chatPointsService.getChatPoints should not response journal", (done) => {
        chatPointsService.getChatPoints("studio", "13800138075", (data) => {
            data.groupType.should.equal("studio");
            data.userId.should.equal("13800138075");
            data.should.not.have.property("journal");
            done();
        });
    });
});

describe("chatPointsService.add", () => {
    it("The name 'add' should be existed in chatPointsService", () => {
        chatPointsService.should.have.property("add");
    });
    it("chatPointsService.add should works", (done) => {
        var testdata = {
            groupType: "studio",
            userId: "13824390058",
            item: "register_reg",
            clientGroup: "3"
        };
        chatPointsService.add(testdata, (data) => {
            if (data) {
                should(data.result).be.a.Number();
            } else {
                (!!data).should.equal(false);
            }
        });
        chatPointsService.add(testdata).then((data) => {
            if (data) {
                should(data.result).be.a.Number();
            } else {
                (!!data).should.equal(false);
            }

            done();
        }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});

describe("chatPointsService.getChatPointsConfig", () => {
    it("The name 'getChatPointsConfig' should be existed in chatPointsService",
        () => {
            chatPointsService.should.have.property("getChatPointsConfig");
        });
    let params = {
        groupType: "studio",
        type: "prerogative",
        item: ["prerogative_strategy", "prerogative_callTrade"]
    };
    it("should work as expect", (done) => {
        chatPointsService.getChatPointsConfig(params, (data) => {
            should(data).not.be.null();
            data.should.be.an.Array();
            data.length.should.be.aboveOrEqual(1);
            should(data[0]).have.keys("groupType", "clientGroup", "type");
        }).catch((e) => {
            logger.error(e);
        });
        chatPointsService.getChatPointsConfig(params)
            .then((data) => {
                should(data).not.be.null();
                data.should.be.an.Array();
                data.length.should.be.aboveOrEqual(1);
                should(data[0]).have.keys("groupType", "clientGroup", "type");
                done();
            })
            .catch((e) => {
                logger.error(e);
            });
    });
});