"use strict";
let should = require('should');

let chatSubscribeTypeService = require('../service/chatSubscribeTypeService');
let logger = require('../resources/logConf').getLogger(
    "testchatSubscribeTypeService");

describe("chatSubscribeTypeService.getSubscribeTypeList", () => {
  it("The name 'getSubscribeTypeList' should be existed in chatSubscribeTypeService",
      () => {
        chatSubscribeTypeService.should.have.property("getSubscribeTypeList");
      });

  it("chatSubscribeTypeService.getSubscribeList should work as expect.",
      (done) => {
        chatSubscribeTypeService.getSubscribeTypeList({groupType: "studio"},
            (data) => {
              should(data).not.be.null();
              data.should.be.Array();
              data.forEach((e) => {
                e.should.have.property("_id");
              });
            });
        chatSubscribeTypeService.getSubscribeTypeList(
            {groupType: "studio"}).then((data) => {
          should(data).not.be.null();
          data.should.be.Array();
          data.forEach((e) => {
            e.should.have.property("_id");
          });
          done();
        }).catch((e) => {
          logger.error(e);
          done();
        });
      });
});