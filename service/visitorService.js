"use Strict";
const logger = require('../resources/logConf').getLogger("visitorService");
const liveRoomAPIService = require('./liveRoomAPIService');
const Deferred = require("../util/common").Deferred;

let visitorService = {
        saveVisitorRecord: (type, dasData) => {
            let defer = new Deferred();
            let path = "/visitor/saveVisitorRecord";
            liveRoomAPIService.post(path, {
                recordType: type,
                dasData: JSON.stringify(dasData)
            }).then(data => {
                defer.resolve(data);
            }).catch(err  => {
                logger.error("saveVisitorRecord! >>saveVisitorRecord:", err);
                defer.resolve(err);
            });
            return defer.promise;
        },
        getVistiorByName: (groupType,roomId, nickname) => {
            let defer = new Deferred();
            let path = "/visitor/getVistiorByName";
            path += "?groupType=" + groupType;
            path += "&roomId=" + roomId
            path += "&nickname=" + nickname
            liveRoomAPIService.get(path).then(data => {
                defer.resolve(data);
            }).catch(err  => {
                logger.error("getVistiorByName! >>getVistiorByName:", err);
                defer.resolve(err);
            });
            return defer.promise;
        }
};

module.exports = visitorService;