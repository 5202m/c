"use strict";
let should = require('should');
let syllabusService = require('../service/syllabusService');
let logger = require('../resources/logConf').getLogger("testSyllabusService");

describe("syllabusService.getSyllabus", () => {
  it("The name 'getSyllabus' should be existed in syllabusService", () => {
    syllabusService.should.have.property("getSyllabus");
  });
  let groupType = "hxstudio", groupId = "hxstudio_26";
  it("Should work as expect.", (done) => {
    syllabusService.getSyllabus(
        groupType, groupId,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("_id", "groupId", "groupType", "courses",
              "studioLink");
          (data["groupType"]).should.be.equal(groupType);
          (data["groupId"]).should.be.equal(groupId);
        }
    ).catch((e) => {
      logger.error(e);
    });
    syllabusService.getSyllabus(
        groupType, groupId
    ).then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("_id", "groupId", "groupType", "courses",
          "studioLink");
      (data["groupType"]).should.be.equal(groupType);
      (data["groupId"]).should.be.equal(groupId);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

//params.groupType,params.groupId,params.day,params.startTime,params.endTime,params.authorId
describe("syllabusService.getCourseInfo", () => {
  it("The name 'getCourseInfo' should be existed in syllabusService", () => {
    syllabusService.should.have.property("getCourseInfo");
  });
  let params = {
    groupType: "hxstudio",
    groupId: "hxstudio_26",
    day: 1,
    authorId: "alan1",
    startTime: "9:00",
    endTime: "10:00"
  };
  it("Should work as expect.", (done) => {
    syllabusService.getCourseInfo(
        params,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Object();
          data.should.have.keys("remark", "authors");
          (data["authors"]).should.be.an.Array();
          (data["authors"][0]["userId"]).should.be.equal(params.authorId);
        }
    ).catch((e) => {
      logger.error(e);
    });
    syllabusService.getCourseInfo(params)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Object();
      data.should.have.keys("remark", "authors");
      (data["authors"]).should.be.an.Array();
      (data["authors"][0]["userId"]).should.be.equal(params.authorId);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});

describe("syllabusService.getSyllabusHis", () => {
  it("The name 'getSyllabusHis' should be existed in syllabusService", () => {
    syllabusService.should.have.property("getSyllabusHis");
  });
  let groupType = "hxstudio", groupId = "hxstudio_26", date = null;
  it("Should work as expect.", (done) => {
    syllabusService.getSyllabusHis(
        groupType, groupId, date,
        (data) => {
          should(data).not.be.null();
          data.should.be.an.Array();
          data.length.should.be.aboveOrEqual(1);
          (data[0]).should.have.keys("_id", "groupType", "groupId");
          (data[0]["groupType"]).should.be.equal(groupType);
          (data[0]["groupId"]).should.be.equal(groupId);
        }
    ).catch((e) => {
      logger.error(e);
    });
    syllabusService.getSyllabusHis(groupType, groupId, date)
    .then((data) => {
      should(data).not.be.null();
      data.should.be.an.Array();
      data.length.should.be.aboveOrEqual(1);
      (data[0]).should.have.keys("_id", "groupType", "groupId");
      (data[0]["groupType"]).should.be.equal(groupType);
      (data[0]["groupId"]).should.be.equal(groupId);
      done();
    }).catch((e) => {
      logger.error(e);
      done();
    });
  });
});