const logger = require('../resources/logConf').getLogger('studioService'); // 引入log4js
const liveRoomAPIService = require('./liveRoomAPIService');
const querystring = require("querystring");
const Deferred = require("../util/common").Deferred;
/**
 * 课程安排服务类 备注：查询各聊天室的课程安排 author Dick.guo
 */
var syllabusService = {

    /**
     * 查询聊天室课程安排 备注：如果groupId是逗号分隔的多个id,则返回多条记录，否则返回一条记录
     *
     * @param groupType
     * @param groupId
     * @param callback
     */
    getSyllabus: function(groupType, groupId, callback) {
        let loc_dateNow = new Date();
        let deferred = new Deferred();
        let path = "/syllabus/getSyllabus";
        path += "?groupType=" + groupType;
        path += "&groupId=" + groupId;
        path += "&today=" + loc_dateNow.getTime();

        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("getSyllabus! >>getSyllabus:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },
    /**
     * 移除课程内容
     *
     * @param coursesObj
     */
    removeContext: function(coursesObj) {
        var tmArr = coursesObj.timeBuckets,
            courseTmp = null;
        for (var i in tmArr) {
            courseTmp = tmArr[i].course;
            for (var k in courseTmp) {
                delete courseTmp[k].context;
            }
        }
        return coursesObj;
    },
    /**
     * 通过参数提取课程信息,包括课程分析师的个人信息
     *
     * @param params
     */
    getCourseInfo: function(params, callback) {
        let loc_dateNow = new Date();
        let deferred = new Deferred();
        let path = "/syllabus/getCourseInfo";
        path += "?" + querystring.stringify(params);

        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("getCourseInfo! >>getCourseInfo:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    },

    /**
     * 查询聊天室课程安排历史记录
     *
     * @param groupType
     * @param groupId
     * @param date
     * @param callback
     */
    getSyllabusHis: function(groupType, groupId, date, callback) {
        let deferred = new Deferred();
        let path = "/syllabus/getSyllabusHis";
        path += "?groupType=" + groupType;
        path += "&groupId=" + groupId;
        path += "&date=" + date;

        liveRoomAPIService.get(path).then((result) => {
            if (callback) {
                callback(result);
            }
            deferred.resolve(result);
        }).catch((e) => {
            logger.error("getSyllabusHis! >>getSyllabusHis:", e);
            if (callback) {
                callback(null);
            }
            deferred.reject(e);
        });
        return deferred.promise;
    }
};
// 导出服务类
module.exports = syllabusService;