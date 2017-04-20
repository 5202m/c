"use strict";
let should = require('should');

let clientTrainService = require('../service/clientTrainService');
let logger = require('../resources/logConf').getLogger(
    "testClientTrainService");

describe("clientTrainService.saveTrain", () => {
    it("The name 'saveTrain' should be existed in clientTrainService", () => {
        clientTrainService.should.have.property("saveTrain");
    });

    it("Should work as expect.", (done) => {
        clientTrainService.saveTrain("studio_teach", "pxunfnnupxxns", "还是我啊",
            (data) => {
                should(data).not.be.null();
                data.should.be.String();
            }).catch((e) => {
            logger.error(e);
        });
        clientTrainService.saveTrain("studio_teach", "pxunfnnupxxns", "还是我啊").then(
            (data) => {
                should(data).not.be.null();
                data.should.be.String();
                done();
            }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});

describe("clientTrainService.addClientTrain", () => {
    it("The name 'addClientTrain' should be existed in clientTrainService",
        () => {
            clientTrainService.should.have.property("addClientTrain");
        });
    let testingParam = {
            groupId: "studio_teach",
            nickname: "豆豆"
        },
        testingUserInfo = {
            userId: "xxnpunpcpunvn",
            clientGroup: "register"
        };
    it("Should work as expect.", (done) => {
        clientTrainService.addClientTrain(testingParam, testingUserInfo, (data) => {
            should(data).not.be.null();
            data.should.have.property("errcode");
        }).catch((e) => {
            logger.error(e);
        });
        clientTrainService.addClientTrain(testingParam, testingUserInfo).then(
            (data) => {
                should(data).not.be.null();
                data.should.have.property("errcode");
                done();
            }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});

describe("clientTrainService.getTrainAndClientNum", () => {
    it("The name 'getTrainAndClientNum' should be existed in clientTrainService",
        () => {
            clientTrainService.should.have.property("getTrainAndClientNum");
        });

    it("Should work as expect.", (done) => {
        clientTrainService.getTrainAndClientNum("hxstudio", "hxteacher", (data) => {
            should(data).not.be.null();
            data.should.be.an.Object();
            data.should.have.property("trainNum");
            data.should.have.property("clientNum");
        }).catch((e) => {
            logger.error(e);
        });
        clientTrainService.getTrainAndClientNum("hxstudio", "hxteacher").then(
            (data) => {
                should(data).not.be.null();
                data.should.be.an.Object();
                data.should.have.property("trainNum");
                data.should.have.property("clientNum");
                done();
            }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});

describe("clientTrainService.getTrainList", () => {
    it("The name 'getTrainList' should be existed in clientTrainService", () => {
        clientTrainService.should.have.property("getTrainList");
    });

    it("Should work as expect.", (done) => {
        clientTrainService.getTrainList("hxstudio", "hxteacher", true, (data) => {
            should(data).not.be.null();
            data.should.be.an.Array();
            data.length.should.aboveOrEqual(1);
        }).catch((e) => {
            logger.error(e);
        });
        clientTrainService.getTrainList("hxstudio", "hxteacher", true).then(
            (data) => {
                should(data).not.be.null();
                data.should.be.an.Array();
                data.length.should.aboveOrEqual(1);
                done();
            }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});

describe("clientTrainService.addSignin", () => {
    it("The name 'addSignin' should be existed in clientTrainService", () => {
        clientTrainService.should.have.property("addSignin");
    });
    let userInfo = {
        mobilePhone: "18813982018",
        groupType: "studio",
        avatar: "http://192.168.35.91:8090/upload/pic/header/chat/front/201610/20161010104342_82090160.jpg"
    };
    it("Should work as expect.", (done) => {
        clientTrainService.addSignin(userInfo, "127.0.0.1", (data) => {
            should(data).not.be.null();
            data.should.be.an.Array();
            data.length.should.aboveOrEqual(1);
        }).catch((e) => {
            logger.error(e);
        });
        clientTrainService.addSignin(userInfo, "127.0.0.1").then((data) => {
            should(data).not.be.null();
            data.should.be.an.Array();
            data.length.should.aboveOrEqual(1);
            done();
        }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});

describe("clientTrainService.getSignin", () => {
    it("The name 'getSignin' should be existed in clientTrainService", () => {
        clientTrainService.should.have.property("getSignin");
    });
    let userInfo = {
        mobilePhone: "18813982018",
        groupType: "studio"
    };
    it("Should work as expect.", (done) => {
        clientTrainService.getSignin(userInfo, (data) => {
            should(data).not.be.null();
            data.should.have.property("signinUser");
            data.should.have.property("signinInfo");
        }).catch((e) => {
            logger.error(e);
        });
        clientTrainService.getSignin(userInfo).then((data) => {
            should(data).not.be.null();
            data.should.have.property("signinUser");
            data.should.have.property("signinInfo");
            done();
        }).catch((e) => {
            logger.error(e);
            done();
        });
    });
});