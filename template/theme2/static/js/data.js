/**
 * 直播间手机版公共数据对象
 * author Dick.guo
 */
var Data = {
    windowHeight: 0, //窗口高度
    options: null, //附加参数
    userInfo: null, //登录用户信息
    mobile24kPath: '', //手机版官网地址
    apiUrl: '', //API地址
    filePath: '', //文件路径

    serverTime: 0, //服务器时间

    roomList: null, //房间列表

    syllabusMap: null, //课程表
    onlineNumMap: null, //在线人数

    analysts: null, //所有分析列表

    pointLevel: [{ points: 0, name: 'L1' },
        { points: 10000, name: 'L2' },
        { points: 30000, name: 'L3' },
        { points: 50000, name: 'L4' },
        { points: 100000, name: 'L5' },
        { points: 300000, name: 'L6' },
        { points: 500000, name: 'L7' },
        { points: 1000000, name: 'L8' },
        { points: 2000000, name: 'L9' },
        { points: 400000000000, name: 'L10' }
    ],


    pushTalk: [], //公聊推送消息
    pushWHTalk: [], //私聊推送消息

    msgType: {
        text: 'text',
        img: 'img',
        file: 'file'
    },

    /**
     * 初始化
     */
    init: function() {
        this.options = this.options || {};
        this.options.timezoneLs = this.options.timezoneLs || 0;
        this.windowHeight = $(window).height();
        Store.init();
        this.initUserInfo();
    },

    /**
     * 设置访客存储信息
     * @param userInfo
     */
    initUserInfo: function() {
        Data.userInfo = Data.userInfo || { groupType: "studio" };
        var key = 'storeInfos_' + Data.userInfo.groupType,
            keyVal = Store.store(key);
        var obj = {};
        if (Util.isEmpty(keyVal)) {
            var randId = Util.randomNumber(8);
            obj.clientStoreId = new Date().getTime() + "_" + randId;
            obj.userId = "visitor_" + randId;
            obj.nickname = '游客_' + randId;
            obj.userType = -1;
            Store.store(key, obj);
        } else {
            obj = keyVal;
        }
        Data.userInfo.clientStoreId = obj.clientStoreId;
        Data.userInfo.visitorId = obj.userId;
        Data.userInfo.loginId = obj.loginId;
        if (Data.userInfo.clientGroup && Data.userInfo.clientGroup == 'visitor') {
            Data.userInfo.nickname = obj.nickname;
            Data.userInfo.userId = obj.userId;
        } else {
            obj.loginId = Data.userInfo.userId;
            Store.store(key, obj);
        }
    },

    /**
     * 获取API连接
     * @param [path]
     */
    getApiUrl: function(path) {
        return this.apiUrl + (path || "");
    },

    /**
     * 获取房间列表
     * @param callback (RoomList)
     */
    getRoomList: function(callback) {
        if (Data.roomList) {
            callback(Data.roomList);
            return;
        }
        Util.postJson('/getRoomList', null, function(data) {
            if (data && data.studioList) {
                Data.roomList = data.studioList;
                callback(Data.roomList);
            } else {
                callback([]);
            }
        });
    },

    /**
     * 获取房间信息
     * @param [roomId] 默认获取当前房间信息
     * @param callback (RoomInfo)
     */
    getRoom: function(roomId, callback) {
        if (typeof roomId == "function") {
            callback = roomId;
            roomId = Data.userInfo.groupId;
        }
        Data.getRoomList(function(rooms) {
            var result = Util.search(rooms, roomId, function(roomTmp, roomIdTmp) {
                return roomTmp.id == roomIdTmp;
            });
            /*if (!result) { //如果找不到房间，就从rooms里找个有效的默认房间。
                $.each(rooms, function(i, room) {
                    if (room.allowVisitor && !room.disable && room.status == 1) {
                        result = room;
                        LoginAuto.sessionUser.groupId = room.id;
                    }
                });
            }*/
            callback(result);
        });
    },

    /**
     * 获取所有房间课程表信息
     * @param callback
     */
    getSyllabuses: function(callback) {
        if (Data.syllabusMap) {
            callback(Data.syllabusMap);
            return;
        }
        Data.getRoomList(function(rooms) {
            var roomIds = [];
            for (var i = 0, lenI = rooms ? rooms.length : 0; i < lenI; i++) {
                roomIds.push(rooms[i].id);
            }
            $.getJSON('/getSyllabusList', { roomIds: roomIds }, function(result) {
                if (result) {
                    Data.syllabusMap = result.syllabuses || {};
                    Data.onlineNumMap = result.onlineNums || {};
                    var syllabusObj;
                    for (var roomId in Data.syllabusMap) {
                        syllabusObj = Data.syllabusMap[roomId];
                        if (syllabusObj) {
                            syllabusObj.courses = Util.parseJSON(syllabusObj.courses);
                            syllabusObj.studioLink = Util.parseJSON(syllabusObj.studioLink);
                        }
                    }
                    callback(Data.syllabusMap);
                } else {
                    callback({});
                }
            });
        });
    },

    /**
     * 获取指定房间课程表信息
     * @param [roomId] 默认获取当前房间信息
     * @param callback (RoomInfo)
     */
    getSyllabus: function(roomId, callback) {
        if (typeof roomId == "function") {
            callback = roomId;
            roomId = Data.userInfo.groupId;
        }
        Data.getSyllabuses(function(syllabuses) {
            callback(syllabuses[roomId]);
        });
    },

    /**
     * 获取指定房间课程安排
     * @param [roomId] 默认获取当前房间信息
     * @param callback (RoomInfo)
     */
    getSyllabusPlan: function(roomId, callback) {
        if (typeof roomId == "function") {
            callback = roomId;
            roomId = Data.userInfo.groupId;
        }
        Data.getSyllabus(roomId, function(syllabus) {
            var result = Util.getSyllabusPlan(syllabus, Data.serverTime);
            callback(result);
        });
    },

    /**
     * 获取视频链接
     * @param syllabusPlan
     * @returns {{pc: string, mobile: string, audio: string, oneTV: string, https: string}}
     */
    getVideoUrl: function(syllabusPlan) {
        var result = { pc: "", mobile: "", audio: "", oneTV: "", https: "" },
            linkTmp = null;
        for (var i = 0, lenI = syllabusPlan.studioLink ? syllabusPlan.studioLink.length : syllabusPlan.studioLink; i < lenI; i++) {
            linkTmp = syllabusPlan.studioLink[i];
            switch (linkTmp.code) {
                case "1":
                    result.pc = linkTmp.url || "";
                    break;

                case "2":
                    result.oneTV = linkTmp.url || "";
                    break;

                case "3":
                    result.mobile = linkTmp.url || "";
                    result.https = result.mobile.replace(/^http:/, "rtmps:").replace(/\/index\.m3u8$/, "");
                    break;

                case "4":
                    result.audio = linkTmp.url || "";
                    break;
            }
        }
        return result;
    },
    /**
     * 根据systemCategory获取分析师列表
     */
    getAnalyst: function(userId, callback) {
        if (Data.analysts) {
            callback(Data.analysts[userId]);
        } else {
            Data.analysts = {};
            $.getJSON('/getAnalystList', { systemCategory: 'pm', platform: Data.userInfo.groupType }, function(result) {
                if (result) {
                    if (result.analysts) {
                        $.each(result.analysts, function(i, row) {
                            row.praiseNum = 0;
                            Data.analysts[row.userNo] = row;
                        });
                    }
                    if (result.praise) {
                        $.each(result.praise, function(i, row) {
                            if (Data.analysts.hasOwnProperty(row.praiseId)) {
                                Data.analysts[row.praiseId].praiseNum = row.praiseNum;
                            }
                        });
                    }
                }
                callback(Data.analysts[userId]);
            });
        }
    },

    /**
     * 根据客户积分获取用户级别
     * @param point
     */
    getUserLevel: function(point) {
        var result = Data.pointLevel[0].name,
            pointLevelTmp;
        for (var i = Data.pointLevel.length - 1; i >= 0; i--) {
            pointLevelTmp = Data.pointLevel[i];
            if (point >= pointLevelTmp.points) {
                result = pointLevelTmp.name;
                break;
            }
        }
        return result;
    },

    /**
     * 获取积分
     */
    getPointsInfo: function(callback) {
        Util.postJson('/getPointsInfo', { params: JSON.stringify({ groupType: Data.userInfo.groupType }) }, function(data) {
            if (data) {
                var levelPointObj = {},
                    nextPointObj = {};
                for (var i = Data.pointLevel.length - 1; i >= 0; i--) {
                    var obj = Data.pointLevel[i];
                    if (data.pointsGlobal >= obj.points) {
                        levelPointObj = obj;
                        nextPointObj = Data.pointLevel[i + 1];
                        break;
                    }
                }
                callback({ data: data, levelPoint: levelPointObj, nextPoint: nextPointObj });
            } else {
                callback(null);
            }
        });
    }

};