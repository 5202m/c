"use strict";
let should = require('should');
let zxFinanceService = require('../service/zxFinanceService');
let logger = require('../resources/logConf').getLogger("testZxFinanceService");

describe("zxFinanceService.getFinanceDataLastReview", () => {
  it("The name 'getFinanceDataLastReview' should be existed in zxFinanceService",
      () => {
        zxFinanceService.should.have.property("getFinanceDataLastReview");
      });
  it("Should work as expect.", (done) => {
    zxFinanceService.getFinanceDataLastReview((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "name", "country",
          "basicIndexId", "period", "importance",
          "predictValue", "lastValue", "value",
          "year", "positiveItem", "negativeItem",
          "level", "url", "date", "time", "unit",
          "interpretation", "publishOrg", "publishFrequncy",
          "statisticMethod", "explanation", "influence",
          "nextPublishTime", "importanceLevel", "description",
          "valid", "dataType", "__v", "comments",
          "updateDate", "createDate");
    }).catch((e) => {
      logger.error(e);
    });
    zxFinanceService.getFinanceDataLastReview()
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "name", "country",
          "basicIndexId", "period", "importance",
          "predictValue", "lastValue", "value",
          "year", "positiveItem", "negativeItem",
          "level", "url", "date", "time", "unit",
          "interpretation", "publishOrg", "publishFrequncy",
          "statisticMethod", "explanation", "influence",
          "nextPublishTime", "importanceLevel", "description",
          "valid", "dataType", "__v", "comments",
          "updateDate", "createDate");
      done();
    })
    .catch((e) => {
      logger.error(e);
      done();
    });
  });
});