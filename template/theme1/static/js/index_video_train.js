/**
 * 直播间视频区培训班选项卡操作类
 * author Jade.zhu
 */
var videosTrain = {
    trainConfig : {
        "joe_chung_1" : {"cls" : "popup_box tbox train_detail zwytrain dn", "lp" : "http://www.24k.hk/lp_v154_zwy.html"},
        "tonylee_1" : {"cls" : "popup_box tbox train_detail dn", "lp" : "http://www.24k.hk/lp_v142_lgg.html"},
        "tracey_jiang_1" : {"cls" : "popup_box tbox train_detail cctrain_detail dn", "lp" : "http://www.24k.hk/lp_v137_cls.html"}
    },

    init: function(){
        this.setEvent();
        this.getTrainList();
    },

    setEvent: function(){
        $('#trains').click(function(){
            common.openPopup('.blackbg,.pop_train');
        });
    },

    /**
     * 切换房间，如果失败并且是不含
     * @param groupId
     */
    changeRoomOrSignup : function(groupId){
        common.getJson("/checkGroupAuth",{groupId:groupId},function(result1){
            if(!result1 || !result1.errcode){
                indexJS.toRefreshView();
            }else{
                var msg = result1.errmsg + "已为你自动跳转到默认房间。";
                var trainCfg = videosTrain.getTrainConfig(result1.data && result1.data.trainConfig);
                if(result1.data && result1.data.roomType == "train" && !trainCfg && result1.errcode == "4007"){
                    common.getJson('/addClientTrain',{
                        groupId : groupId,
                        noApprove : 1
                    },function(result2){
                        if(!result2 || result2.errcode == "4016"){
                            common.getJson("/checkGroupAuth",{groupId:groupId},function(result3){
                                if(!result3 || !result3.errcode){
                                    indexJS.toRefreshView();
                                }else{
                                    alert(msg);
                                    indexJS.toRefreshView();
                                }
                            });
                        }else{
                            alert(result2.errmsg + "已为你自动跳转到默认房间。");
                            indexJS.toRefreshView();
                        }
                    });
                }else{
                    alert(msg);
                    indexJS.toRefreshView();
                }
            }
        });
    },

    /**
     * 切换房间
     * @param groupId
     * @param groupName
     */
    changeRoom : function(groupId, groupName){
        common.getJson("/checkGroupAuth",{groupId:groupId},function(result){
            if(!result || !result.errcode){
                indexJS.toRefreshView();
                return;
            }else if(result.data && result.data.roomType == "train"){
                var roomInfo = result.data;
                roomInfo.defaultAnalyst = roomInfo.defaultAnalyst || {};
                var trainCfg = videosTrain.getTrainConfig(roomInfo.trainConfig);
                if(trainCfg && trainCfg.cls && result.errcode == "4007"){
                    videosTrain.trainDetail(roomInfo.trainConfig, roomInfo.defaultAnalyst.userNo, roomInfo._id, roomInfo.name);
                    return;
                }else if(!trainCfg && result.errcode == "4007"){
                    videosTrain.trainSignUp(roomInfo._id, roomInfo.name, true);
                    return;
                }else if(result.errcode == "4007" && $(".pop_train").is(":hidden")){
                    $("#trains").trigger("click"); //显示培训班列表页
                    return;
                }else if((result.errcode == "4009" || result.errcode == "4007") && $(".pop_train").is(":visible")){
                    if(videosTrain.trainEntryByPoints(roomInfo)){//使用积分进入房间
                        return;
                    }
                }
            }
            box.showMsg({
                title : groupName || "",
                msg : result.errmsg + '<a class="contactContact" style="color:#2980d1; font-size:14px;text-decoration:none;cursor:pointer" onclick="videosLive.contactTeacher();_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_zb_callzhuli\', \'content_left\', 1, true]);">如有疑问请联系老师助理</a>。',
            });
        });
    },
    /**
     * 培训班详情内页报名
     */
    trainSignUpDetail : function(){
        var $item = $('.train_detail .pop_tit label');
        videosTrain.trainSignUp($item.attr("roomid"), $item.text());
    },
    /**
     * 培训班报名
     * @param groupId String
     * @param groupName String
     * @param [noApprove] boolean
     */
    trainSignUp : function(groupId, groupName, noApprove){
        if(indexJS.checkClientGroup('visitor')){
            $("#login_a").trigger("click", {groupId : groupId});
        }else{
            common.getJson('/addClientTrain',{
                groupId : groupId,
                noApprove : noApprove ? 1 : 0
            },function(data){
                if(!data || data.errcode == "4016"){
                    videosTrain.changeRoom(groupId, groupName);
                }else{
                    if(data.errcode == "4019"){//报名成功
                        $(".traindetails.trainbtn[rid='" + groupId + "']")
                            .attr("href", "javascript:videosTrain.changeRoom('" + groupId + "', '" + groupName + "')")
                            .text("已报名");
                    }
                    box.showMsg({
                        title : groupName || "",
                        msg : data.errmsg + '<a class="contactContact" style="color:#2980d1; font-size:14px;text-decoration:none;cursor:pointer" onclick="videosLive.contactTeacher();_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_zb_callzhuli\', \'content_left\', 1, true]);">如有疑问请联系老师助理</a>。',
                    });
                }
            });
        }
    },
    /**
     * 培训班报名
     */
    trainDetail : function(trainCfg, analystId, groupId, groupName){
        var cfg = videosTrain.getTrainConfig(trainCfg);
        if(cfg && cfg.cls){
            $('.train_detail .pop_tit label').attr("roomid", groupId).text(groupName);
            $("#panel_popupBox_train").attr("class", cfg.cls);
            LazyLoad.css(["/theme1/css/train.css"]);
            $("#train_info_id").empty().load("/getTrDetail?uid="+analystId,function(){
                $("#train_info_id > .scrollbox").mCustomScrollbar({theme:"light-thick",scrollbarPosition:"outside",scrollButtons:false});
                common.openPopup('.blackbg,.train_detail');
            });
        }else{
            videosTrain.trainSignUp(groupId, groupName, true);
        }
    },
    /**
     * 使用积分进入培训班房间
     */
    trainEntryByPoints : function(roomInfo){
        if(roomInfo && roomInfo.point){
            var tip='您未报名培训班或者未通过审核，是否消耗'+roomInfo.point+'积分直接进入房间？';
            box.showMsg({
                title : roomName || "",
                msg : tip,
                btns : [{
                    txt : "确定",
                    fn : function(){
                        var point = roomInfo.point;
                        var params = {groupType:indexJS.userInfo.groupType,item:"prerogative_room",tag:'user_'+indexJS.userInfo.userId,val:-roomInfo.point,groupId:roomInfo._id};
                        if(point != 0){
                            common.getJson('/addPointsInfo',{params:JSON.stringify(params)}, function(result) {
                                if (!result.isOK) {
                                    box.showTipBox(result.msg);
                                }else{
                                    common.getJson('/updateSession',{params:JSON.stringify(params)}, function(result) {
                                        if(result.isOK){
                                            indexJS.toRefreshView();
                                        }
                                    });
                                }
                            })
                        }else{
                            common.getJson('/updateSession',{params:JSON.stringify(params)}, function(result) {
                                if(result.isOK){
                                    indexJS.toRefreshView();
                                }
                            });
                        }
                    }
                }]
            });
            return true;
        }
        return false;
    },

    /**
     * 获取培训班配置，用于有详情内页
     */
    getTrainConfig : function(cfgKey){
        if(cfgKey && videosTrain.trainConfig.hasOwnProperty(cfgKey)){
            return videosTrain.trainConfig[cfgKey];
        }
        return null;
    },

    /**
     * 获取培训班列表
     */
    getTrainList: function(){
        $.getJSON('/getTrainRoomList', {groupType:indexJS.userInfo.groupType}, function(result){
            if(result!=null){
                var trainNum = result.length;
                var trainHtml = [], trainEndHtml = [], trainFormatHtml = videosTrain.formatHtml('train');
                $.each(result, function(key, row){
                    row.defaultAnalyst = row.defaultAnalyst || {};
                    var feature = videosTrain.getTrainFeature(row, false);
                    if(feature.isEnd){
                        trainNum--;
                    }

                    var html = trainFormatHtml.formatStr(
                        row.defaultAnalyst.avatar || "",
                        row.name,
                        row.label || "&nbsp;",
                        row.remark,
                        feature.handleCls,
                        row.defaultAnalyst.userNo || "",
                        row.clientGroup,
                        feature.handler,
                        feature.handleTarget,
                        row._id,
                        feature.handleTxt,
                        feature.clientSize);

                    if(feature.isEnd){
                        trainEndHtml.push(html);
                    }else {
                        trainHtml.push(html);
                    }
                });
                trainHtml = $.merge(trainHtml,trainEndHtml);
                $('.pop_train .scrollbox .trainlist').html(trainHtml.join(''));
                if(trainNum>0) {
                    $('#trainsnum').text(trainNum).css("display", "inline-block");
                }else{
                    $('#trainsnum').hide();
                }
            }
        });
    },
    /**
     * 获取培训班特征
     * @param roomInfo
     * @param noLP
     * @returns {{handleTxt: string, handleCls: String, handler: string, handleTarget: string, clientSize: string, isEnd: boolean}}
     */
    getTrainFeature : function(roomInfo, noLP){
        var result = {
            handleTxt : "", //按钮文字
            handleCls : "", //按钮样式， b2是灰色按钮
            handler : "",   //按钮方法
            handleTarget : "",//按钮方法
            clientSize : "已报名" + Math.abs(roomInfo.clientSize || 0) + "人",  //已报名人数
            isEnd : false    //是否已结束
        };
        var openDate = common.formatToJson(roomInfo.openDate);
        var currDate = common.formatterDate(indexJS.serverTime, "-");
        var analystNo = roomInfo.defaultAnalyst && roomInfo.defaultAnalyst.userNo;
        var trainCfgKey = roomInfo.trainConfig || "";
        var trainCfg = videosTrain.getTrainConfig(trainCfgKey);
        if(roomInfo.status == 0 || (openDate && openDate.endDate < currDate)){
            if(trainCfg && trainCfg.lp && !noLP){
                result.handleTxt = "已结束，精彩回顾";
                result.handler = trainCfg.lp;
                result.handleTarget = " target='_blank'";
            }else{
                result.handleTxt = "已结束";
                result.handler = "javascript:void(0)";
                result.handleCls = " b2";
            }
            result.clientSize = "&nbsp;";
            result.isEnd = true;
        }else if(openDate && openDate.beginDate > currDate){
            if(trainCfg && trainCfg.cls){
                result.handleTxt = "详情";
                result.handler = "javascript:videosTrain.trainDetail('" + trainCfgKey + "', '" + analystNo + "', '" + roomInfo._id + "', '" + roomInfo.name+ "')";
            }else if(roomInfo.trainAuth == -1){
                result.handleTxt = "报名";
                result.handler = "javascript:videosTrain.trainSignUp('" + roomInfo._id + "', '" + roomInfo.name + "', true)";
            }else if(roomInfo.trainAuth == 0){
                result.handleTxt = "待审核";
                result.handler = "javascript:void(0)";
            }else{
                result.handleTxt = "已报名";
                result.handler = "javascript:videosTrain.changeRoom('" + roomInfo._id + "', '" + roomInfo.name + "')";
            }
        }else{
            if((!trainCfg || !trainCfg.cls) && roomInfo.trainAuth == -1){
                result.handleTxt = "报名";
                result.handler = "javascript:videosTrain.trainSignUp('" + roomInfo._id + "', '" + roomInfo.name + "', true)";
            }else{
                result.handleTxt = "进入";
                result.handler = "javascript:videosTrain.changeRoom('" + roomInfo._id + "', '" + roomInfo.name + "')";
            }
        }
        return result;
    },
    /**
     * 根据内容域模块名返回内容模板
     * @param region 内容域模块名
     * @returns {string}
     */
    formatHtml:function(region){
        var formatHtmlArr = [];
        switch(region) {
            case 'train':
                formatHtmlArr.push('<li>');
                formatHtmlArr.push('     <div class="headimg"><img src="{0}" alt=""></div>');
                formatHtmlArr.push('     <div class="train_name">{1}</div>');
                formatHtmlArr.push('     <span class="slogan">{2}</span>');
                formatHtmlArr.push('     <div class="ms"><p>{3}</p></div>');
                formatHtmlArr.push('     <a class="traindetails trainbtn{4}" userno="{5}" cgs= "{6}" isDetail="true" href="{7}" {8} rid="{9}">{10}</a>');
                // formatHtmlArr.push('     <a href="javascript:void(0)" class="trainbtn traindetails">详情</a>');
                formatHtmlArr.push('     <span class="bm">{11}</span>');
                formatHtmlArr.push('</li>');
                break;
        }
        return formatHtmlArr.join("");
    }
};