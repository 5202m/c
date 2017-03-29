"use strict";
let should = require('should');
let showTradeService = require('../service/showTradeService');
let logger = require('../resources/logConf').getLogger("testShowTradeService");

describe("showTradeService.getShowTrade", () => {
  it("The name 'getShowTrade' should be existed in showTradeService", () => {
    showTradeService.should.have.property("getShowTrade");
  });

  it("Should work as expect.", (done) => {
    showTradeService.getShowTrade(
        "studio",
        "alan1",
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.property("analyst");
          data.analyst.should.be.an.Object();
          data.should.have.property("tradeList");
          data.tradeList.should.be.an.Array();
        }
    ).catch((e) => {
      logger.error(e);
    });
    showTradeService.getShowTrade("studio", "alan1")
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.property("analyst");
      data.analyst.should.be.an.Object();
      data.should.have.property("tradeList");
      data.tradeList.should.be.an.Array();
    }).then(done).catch((e) => {
      logger.error(e);
      done();
    });
  });
});
describe("showTradeService.getShowTradeList", () => {
  it("The name 'getShowTradeList' should be existed in showTradeService",
      () => {
        showTradeService.should.have.property("getShowTradeList");
      });

  let params = {
    groupType: "studio",
    userNo: "alan1",
    pageSize: 10,
    tradeType: 1,
    status: 1
  };

  it("Should work as expect.", (done) => {
    showTradeService.getShowTradeList(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.property("tradeList");
          data.tradeList.should.be.an.Array();
        }
    ).catch((e) => {
      logger.error(e);
    });
    showTradeService.getShowTradeList(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.property("tradeList");
      data.tradeList.should.be.an.Array();
    }).then(done).catch((e) => {
      logger.error(e);
      done();
    });
  });
});
describe("showTradeService.addShowTrade", () => {
  it("The name 'addShowTrade' should be existed in showTradeService", () => {
    showTradeService.should.have.property("addShowTrade");
  });

  let params = {
    groupType: "studio",
    userNo: "Eugene_ana",
    avatar: "http://192.168.35.91:8090/upload/pic/header/chat/201612/20161201091332_70993207_cut.png",
    userName: "Eugene Zeng",
    telePhone: "13800138135",
    tradeImg: "http://192.168.35.91:8090/upload/pic/201606/20160624103732_14150188.jpg",
    remark: "测试交易晒单数据",
    Ip: "172.30.5.76",
    title: "测试交易晒单数据",
    tradeType: 1,
  };

  it("Should work as expect.", (done) => {
    showTradeService.addShowTrade(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.String();
          data.length.should.be.aboveOrEqual(1);
        }
    ).catch((e) => {
      logger.error(e);
    });
    showTradeService.addShowTrade(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.String();
      data.length.should.be.aboveOrEqual(1);
    }).then(done).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("showTradeService.setShowTradePraise", () => {
  it("The name 'setShowTradePraise' should be existed in showTradeService",
      () => {
        showTradeService.should.have.property("setShowTradePraise");
      });

  let params = {
    praiseId: "5850bde34b75030fe8752118"
  };

  it("Should work as expect.", (done) => {
    showTradeService.setShowTradePraise(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.String();
          data.length.should.be.aboveOrEqual(1);
        }
    ).catch((e) => {
      logger.error(e);
    });
    showTradeService.setShowTradePraise(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.String();
      data.length.should.be.aboveOrEqual(1);
    }).then(done).catch((e) => {
      logger.error(e);
      done();
    });
  });
});
describe("showTradeService.getShowTradeByIds", () => {
  it("The name 'getShowTradeByIds' should be existed in showTradeService",
      () => {
        showTradeService.should.have.property("getShowTradeByIds");
      });

  let tradeIds = [
    "57b181e3e4b09c8e303b6aa4",
    "576c9c61e4b041bdc411f0e0",
    "576c9c79e4b041bdc411f0e1"
  ];

  it("Should work as expect.", (done) => {
    showTradeService.getShowTradeByIds(
        tradeIds.toString(),
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Array();
          data.length.should.be.equal(3);
        }
    ).catch((e) => {
      logger.error(e);
    });
    showTradeService.getShowTradeByIds(tradeIds.toString())
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Array();
      data.length.should.be.equal(3);
    }).then(done).catch((e) => {
      logger.error(e);
      done();
    });
  });
});