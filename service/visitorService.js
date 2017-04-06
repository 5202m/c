"use Strict";
const logger = require('../resources/logConf').getLogger("visitorService");
const liveRoomAPIService = require('./liveRoomAPIService');
const common = require("../util/common");
const Deferred = common.Deferred;
const config = require('../resources/config'); // 引入config
const request = require('request');

let visitorService = {
    saveVisitorRecord: (type, dasData) => {
        let defer = new Deferred();
        let path = "/visitor/saveVisitorRecord";
        liveRoomAPIService.post(path, {
            type: type,
            dasData: JSON.stringify(dasData)
        }).then(data => {
            defer.resolve(data);
            visitorService.requestDas(type, dasData);
        }).catch(err => {
            logger.error("saveVisitorRecord! >>saveVisitorRecord:", path, err);
            logger.debug("saveVisitorRecord!", type, dasData);
            defer.resolve(err);
        });
        return defer.promise;
    },
    getVistiorByName: (groupType, roomId, nickname) => {
        let defer = new Deferred();
        let path = "/visitor/getVistiorByName";
        path += "?groupType=" + groupType;
        path += "&roomId=" + roomId
        path += "&nickname=" + nickname
        liveRoomAPIService.get(path).then(data => {
            defer.resolve(data);
        }).catch(err => {
            logger.error("getVistiorByName! >>getVistiorByName:", err);
            defer.resolve(err);
        });
        return defer.promise;
    },
    /**
     * 请求DAS数据统计系统
     * @param type
     * @param data
     */
    requestDas: function(type, data) {
        var dasData = {
            userId: data.cookieId,
            userTel: common.isBlank(data.mobile) ? '' : data.mobile,
            userType: visitorService.getClientGroup(data.clientGroup),
            userIp: data.ip,
            userName: common.isBlank(data.userName) ? '' : data.userName,
            roomName: data.roomName, //房间名称
            userSource: common.isBlank(data.platform) ? 'web' : data.platform,
            useEquipment: data.userAgent,
            tradingAccount: data.accountNo,
            tradingPlatform: '',
            platformType: common.isMobile(data.userAgent) ? 1 : 0,
            businessPlatform: 2, //for pm, it's 2.
            operateEntrance: common.isBlank(data.platform) ? 'web' : data.platform,
            touristId: data.visitorId,
            roomId: data.roomId, //房间名称
            sessionId: data.sessionId,
            nickName: common.isBlank(data.nickname) ? '' : data.nickname,
            email: common.isBlank(data.email) ? '' : data.email,
            courseId: data.courseId,
            courseName: common.isValid(data.courseName) && data.courseName.indexOf(
                'undefined') > -1 ? '' : data.courseName,
            teacherId: data.teacherId,
            teacherName: data.teacherName
        };
        if (type == 'online') { //上线
            dasData.operationType = 1;
        } else if (type == 'login') { //登录
            dasData.operationType = 4;
        } else if (type == 'offline') { //下线
            dasData.operationType = 6;
        } else if (type == 'logout') { //退出
            dasData.operationType = 5;
        } else if (type == 'register') { //注册
            dasData.operationType = 3;
        }
        if (common.isValid(dasData.sessionId) &&
            common.isValid(dasData.userId) &&
            common.isValid(dasData.operationType) &&
            (common.isValid(dasData.touristId) || common.isValid(
                dasData.userTel))) {
            request.post({
                    url: config.dasUrl,
                    form: { data: JSON.stringify(dasData), 'callback': '?' },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                },
                (err, response, result) => {
                    if (err) {
                        logger.error("DAS online post fail:" + err);
                    } else {
                        logger.info(type + '::' + result);
                    }
                });
        }
    },
    /**
     * 根据客户在类别返回对应数字
     * @param clientGroup
     * @returns {number}
     */
    getClientGroup: function(clientGroup) {
        var userType = 1;
        switch (clientGroup) {
            case 'visitor':
                userType = 1;
                break;
            case 'register':
                userType = 2;
                break;
            case 'simulate':
                userType = 3;
                break;
            case 'active':
                userType = 4;
                break;
            case 'notActive':
                userType = 5;
                break;
            case 'vip':
                userType = 6;
                break;
        }
        return userType;
    }
};

module.exports = visitorService;