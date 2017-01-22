"use strict";
require("should");
let liveRoomAPIService = require('../service/liveRoomAPIService');

describe("liveRoomAPIService.get", () => {
    it("The name 'get' should be existed in liveRoomAPIService", () => {
	liveRoomAPIService.should.have.property("get");
    });
    it("liveRoomAPIService.get should response something.", (done) => {
	liveRoomAPIService.get("/points/pointsInfo", (data) => {
	    (!!data).should.equal(false);
	    done();
	});
    });
});
