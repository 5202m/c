"use strict";
let should = require('should');

let pushInfoService = require('../service/pushInfoService');
let logger = require('../resources/logConf').getLogger("testPushInfoService");

describe("pushInfoService.getPushInfo", () => {
    it("The name 'getPushInfo' should be existed in pushInfoService", () => {
        pushInfoService.should.have.property("getPushInfo");
    });
    let params = {
        groupType: "hxstudio",
        roomId: "studio_teach",
        clientGroup: "register",
        position: 1
    };

    it("Should work as expect.", (done) => {
        pushInfoService.getPushInfo(
            params["groupType"],
            params["roomId"],
            params["clientGroup"],
            params["position"],
            (data) => {
                should(data).not.be.null();
                data.should.be.an.Object();
                data.should.have.property("isOK");
            }
        ).catch((e) => {
            logger.error(e);
        });
        pushInfoService.getPushInfo(
            params["groupType"],
            params["roomId"],
            params["clientGroup"],
            params["position"]
        ).then((data) => {
            should(data).not.be.null();
            data.should.be.an.Object();
            data.should.have.property("isOK");
        }).then(done).catch((e) => {
            logger.error(e);
            done();
        });
    });
});
describe("pushInfoService.checkPushInfo", () => {
    it("The name 'checkPushInfo' should be existed in pushInfoService", () => {
        pushInfoService.should.have.property("checkPushInfo");
    });

    let params = {
        groupType: "hxstudio",
        roomId: "studio_teach",
        clientGroup: "register",
        position: 1,
        filterTime: true
    };

    it("Should work as expect.", (done) => {
        pushInfoService.checkPushInfo(
            params["groupType"],
            params["roomId"],
            params["clientGroup"],
            params["position"],
            params["filterTime"],
            (data) => {
                should(data).not.be.null();
                data.should.be.an.Array();
            }
        ).catch((e) => {
            logger.error(e);
        });
        pushInfoService.checkPushInfo(
            params["groupType"],
            params["roomId"],
            params["clientGroup"],
            params["position"],
            params["filterTime"]
        ).then((data) => {
            should(data).not.be.null();
            data.should.be.an.Array();
        }).then(done).catch((e) => {
            logger.error(e);
            done();
        });
    });
});