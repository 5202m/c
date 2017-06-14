/**
 * 培训班列表操作类 JS
 * Created by Jade.zhu on 2017/1/22.
 */
var Trains = new Container({
    panel: $("#page_trains"),
    url: "/theme2/template/trains.html",
    trainConfig: null,
    /*{
            "joe_chung_1" : {"cls" : "popup_box tbox train_detail zwytrain dn", "lp" : "http://www.24k.hk/lp_v154_zwy.html"},
             "tonylee_1" : {"cls" : "popup_box tbox train_detail dn", "lp" : "http://www.24k.hk/lp_v142_lgg.html"},
             "tracey_jiang_1" : {"cls" : "popup_box tbox train_detail cctrain_detail dn", "lp" : "http://www.24k.hk/lp_v137_cls.html"}
        },*/
    onLoad: function() {
        Trains.initTrainData();
        Trains.setTrainList();
        Trains.setEvent();
    }
});

/**
 * 初始化数据
 */
Trains.initTrainData = function() {
    Trains.trainConfig = {
        "joe_chung_1": { "cls": "popup_box tbox train_detail zwytrain dn", "lp": "http://www.24k.hk/lp_v154_zwy.html" },
        "tonylee_1": { "cls": "popup_box tbox train_detail dn", "lp": "http://www.24k.hk/lp_v142_lgg.html" },
        "tracey_jiang_1": { "cls": "popup_box tbox train_detail cctrain_detail dn", "lp": "http://www.24k.hk/lp_v137_cls.html" }
    };
};

/**
 * 设置培训班列表
 */
Trains.setTrainList = function() {
    var trainsHtml = [],
        trainsEndHtml = [];
    $.getJSON('/getTrainRoomList', { groupType: Data.userInfo.groupType }, function(result) {
        if (result != null) {
            $.each(result, function(key, row) {
                var openDate = JSON.parse(row.openDate);
                var feature = Trains.getTrainFeature(row, false);
                var dateStr = Util.formatDate(openDate.beginDate, 'yyyy.MM.dd') + '~' + Util.formatDate(openDate.endDate, 'yyyy.MM.dd');
                var statusArray = ['', 'tracey_jiang', 'joe_chung', 'tonylee', 'joe_zhuang'],
                    bgcss = 1;
                if (openDate.weekTime && openDate.weekTime[0].beginTime && openDate.weekTime[0].endTime) {
                    var timeStr = openDate.weekTime[0];
                    dateStr = dateStr + '&nbsp;&nbsp;' + timeStr.beginTime.substr(0, 5) + '~' + timeStr.endTime.substr(0, 5)
                }
                if (feature.isEnd) {
                    dateStr = '已结束';
                }
                bgcss = $.inArray(row.defaultAnalyst.userNo || '', statusArray) == -1 ? bgcss : $.inArray(row.defaultAnalyst.userNo || '', statusArray);
                var html = Trains.formatHtml('train',
                    row.name,
                    dateStr, //时间
                    row.remark,
                    feature.handleTxt, //状态，报名/进入/结束
                    row._id,
                    feature.handler,
                    feature.clientSize,
                    bgcss
                );
                if (feature.isEnd) {
                    trainsEndHtml.push(html);
                } else {
                    trainsHtml.push(html);
                }
            });
            trainsHtml = $.merge(trainsHtml, trainsEndHtml);
            $('#trainsList').empty().html(trainsHtml.join(''));
        }
    });
};
/**
 * 切换房间，如果失败并且是不含
 * @param groupId
 */
Trains.changeRoomOrSignup = function(groupId) {
    Util.postJson("/checkGroupAuth", { groupId: groupId }, function(authResult) {
        if (!authResult || !authResult.checkState) {
            Room.toRefreshView(groupId);
        } else {
            var msg = (authResult.checkState.message || "") + "已为你自动跳转到默认房间。";
            var trainCfg = Trains.getTrainConfig(authResult && authResult.trainConfig);
            if (authResult.roomType == "train" && !trainCfg && authResult.checkState.code == "4007") {
                Util.postJson('/addClientTrain', {
                    groupId: groupId,
                    noApprove: 1
                }, function(result2) {
                    if (!result2 || result2.code == "4016") {
                        Util.postJson("/checkGroupAuth", { groupId: groupId }, function(result3) {
                            if (!result3 || !result3.checkState) {
                                Room.toRefreshView(groupId);
                            } else {
                                Pop.msg(msg);
                                Room.toRefreshView(groupId);
                            }
                        });
                    } else {
                        Pop.msg(result2.message + "已为你自动跳转到默认房间。");
                        Room.toRefreshView(groupId);
                    }
                });
            } else {
                Pop.msg(msg);
                Room.toRefreshView(groupId);
            }
        }
    });
};

/**
 * 切换房间
 * @param groupId
 * @param groupName
 */
Trains.changeRoom = function(groupId) {
    Util.postJson("/checkGroupAuth", { groupId: groupId }, function(result) {
        if (!result || !result.checkState) {
            Room.toRefreshView(groupId);
            return;
        } else if (result.data && result.data.roomType == "train") {
            var roomInfo = result;
            roomInfo.defaultAnalyst = roomInfo.defaultAnalyst || {};
            var trainCfg = Trains.getTrainConfig(roomInfo.trainConfig);
            if (trainCfg && trainCfg.cls && result.checkState.code == "4007") {
                Trains.trainDetail(roomInfo.trainConfig, roomInfo.defaultAnalyst.userNo, roomInfo._id, roomInfo.name);
                return;
            } else if (!trainCfg && result.checkState.code == "4007") {
                Trains.trainSignUp(roomInfo._id, roomInfo.name, true);
                return;
            } else if (result.checkState.code == "4007" && $(".pop_train").is(":hidden")) {
                //$("#trains").trigger("click"); //显示培训班列表页
                return;
            } else if ((result.checkState.code == "4009" || result.checkState.code == "4007") && $(".pop_train").is(":visible")) {
                if (Trains.trainEntryByPoints(roomInfo)) { //使用积分进入房间
                    return;
                }
            }
        }
        var msg = result.checkState.message;
        if ((result.name.indexOf('RSI指标专场') > -1 || groupId == "studio_21" ) && result.checkState.code) {
            msg = "该房间暂未开放，请关注开课时间: 每周三 15:30-17:30！";
        }
        Pop.msg(msg);
    });
};

/**
 * 培训班详情内页报名
 */
Trains.trainSignUpDetail = function() {
    var $item = $('.train_detail .pop_tit label');
    Trains.trainSignUp($item.attr("roomid"), $item.text());
};
/**
 * 培训班报名
 * @param groupId String
 * @param groupName String
 * @param [noApprove] boolean
 */
Trains.trainSignUp = function(groupId, groupName, noApprove) {
    if (!Data.userInfo.isLogin) {
        Login.load();
    } else {
        Util.postJson('/addClientTrain', { groupId: groupId, noApprove: noApprove ? 1 : 0 }, function(data) {
            if (!data || data.code == "4016") {
                Trains.changeRoom(groupId, groupName);
                $("#trainsList .u-ch-class .u-ch-con .btn[rid='" + groupId + "']")
                    .attr("href", "javascript:Trains.changeRoom('" + groupId + "', '" + groupName + "')")
                    .attr('class', 'btn join-btn')
                    .html("<b>已报名</b>");
            } else {
                if (data.code == "4019") { //报名成功
                    $("#trainsList .u-ch-class .u-ch-con .btn[rid='" + groupId + "']")
                        .attr("href", "javascript:Trains.changeRoom('" + groupId + "', '" + groupName + "')")
                        .attr('class', 'btn join-btn')
                        .html("<b>已报名</b>");
                }
                Pop.msg(data.message);
            }
        });
    }
};

/**
 * 获取培训班特征
 * @param roomInfo
 * @param noLP
 * @returns {{handleTxt: string, handleCls: String, handler: string, handleTarget: string, clientSize: string, isEnd: boolean}}
 */
Trains.getTrainFeature = function(roomInfo, noLP) {
    var result = {
        handleTxt: "", //按钮文字
        handleCls: "", //按钮样式， b2是灰色按钮
        handler: "", //按钮方法
        handleTarget: "", //按钮方法
        clientSize: "已报名" + Math.abs(roomInfo.clientSize || 0) + "人", //已报名人数
        isEnd: false //是否已结束
    };
    var openDate = JSON.parse(roomInfo.openDate);
    var currDate = Util.formatDate(Data.serverTime, "yyyy-MM-dd");
    var analystNo = roomInfo.defaultAnalyst && roomInfo.defaultAnalyst.userNo;
    var trainCfgKey = roomInfo.trainConfig || "";
    var trainCfg = Trains.getTrainConfig(trainCfgKey);
    if (roomInfo.status == 0 || (openDate && openDate.endDate < currDate)) {
        if (trainCfg && trainCfg.lp && !noLP) {
            /*            result.handleTxt = "已结束，精彩回顾";
                        result.handler = trainCfg.lp;
                        result.handleTarget = " target='_blank'";*/
            result.handleTxt = "已结束";
            result.handler = "javascript:void(0)";
            result.handleCls = " b2";
        } else {
            result.handleTxt = "已结束";
            result.handler = "javascript:void(0)";
            result.handleCls = " b2";
        }
        result.clientSize = "&nbsp;";
        result.isEnd = true;
    } else if (openDate && openDate.beginDate > currDate) {
        if (trainCfg && trainCfg.cls) {
            result.handleTxt = "详情";
            result.handler = "javascript:Trains.trainDetail('" + trainCfgKey + "', '" + analystNo + "', '" + roomInfo._id + "', '" + roomInfo.name + "')";
        } else if (roomInfo.trainAuth == -1) {
            result.handleTxt = "报名";
            result.handler = "javascript:Trains.trainSignUp('" + roomInfo._id + "', '" + roomInfo.name + "', true)";
        } else if (roomInfo.trainAuth == 0) {
            result.handleTxt = "待审核";
            result.handler = "javascript:void(0)";
        } else {
            result.handleTxt = "已报名";
            result.handler = "javascript:Trains.changeRoom('" + roomInfo._id + "', '" + roomInfo.name + "')";
        }
    } else {
        if ((!trainCfg || !trainCfg.cls) && roomInfo.trainAuth == -1) {
            result.handleTxt = "报名";
            result.handler = "javascript:Trains.trainSignUp('" + roomInfo._id + "', '" + roomInfo.name + "', true)";
        } else {
            result.handleTxt = "进入";
            result.handler = "javascript:Trains.changeRoom('" + roomInfo._id + "', '" + roomInfo.name + "')";
        }
    }
    return result;
};

/**
 * 培训班报名
 */
Trains.trainDetail = function(trainCfg, analystId, groupId, groupName) {
    var cfg = Trains.getTrainConfig(trainCfg);
    if (cfg && cfg.cls) {
        /*$('.train_detail .pop_tit label').attr("roomid", groupId).text(groupName);
        $("#panel_popupBox_train").attr("class", cfg.cls);
        LazyLoad.css(["/fx/theme1/css/train.css"]);
        $("#train_info_id").empty().load("/getTrDetail?uid="+analystId,function(){
            $("#train_info_id > .scrollbox").mCustomScrollbar({theme:"light-thick",scrollbarPosition:"outside",scrollButtons:false});
            common.openPopup('.blackbg,.train_detail');
        });*/
    } else {
        Trains.trainSignUp(groupId, groupName, true);
    }
};

/**
 * 使用积分进入培训班房间
 */
Trains.trainEntryByPoints = function(roomInfo) {
    if (roomInfo && roomInfo.point) {
        var tip = '您未报名培训班或者未通过审核，是否消耗' + roomInfo.point + '积分直接进入房间？';
        Pop.msg({
            msg: tip,
            onOK: function() {
                var point = roomInfo.point;
                var params = { groupType: Data.userInfo.groupType, item: "prerogative_room", tag: 'user_' + Data.userInfo.userId, val: -roomInfo.point, groupId: roomInfo._id };
                if (point != 0) {
                    Util.postJson('/addPointsInfo', { params: JSON.stringify(params) }, function(result) {
                        if (!result.isOK) {
                            Pop.msg(result.msg);
                        } else {
                            Util.postJson('/updateSession', { params: JSON.stringify(params) }, function(result) {
                                if (result.isOK) {
                                    Room.toRefreshView(roomInfo._id);
                                }
                            });
                        }
                    });
                } else {
                    Util.postJson('/updateSession', { params: JSON.stringify(params) }, function(result) {
                        if (result.isOK) {
                            Room.toRefreshView(roomInfo._id);
                        }
                    });
                }
            }
        });
        return true;
    }
    return false;
};

/**
 * 获取培训班配置，用于有详情内页
 */
Trains.getTrainConfig = function(cfgKey) {
    if (Trains.trainConfig && cfgKey && Trains.trainConfig.hasOwnProperty(cfgKey)) {
        return Trains.trainConfig[cfgKey];
    }
    return null;
};

/**
 * 设置事件
 */
Trains.setEvent = function() {
    /**
     * 返回首页
     */
    $('#train_back').bind('click', Container.back);
};