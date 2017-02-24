/**
 * 直播间手机版房间内页 -- 直播精华
 * author Dick.guo
 */
var ClassNote = {

    classNoteInfo:{},//直播精华

    strategyIsNotAuth: -1,//查看交易策略是否授权
    callTradeIsNotAuth: -1,//查看喊单/挂单是否授权

    /**
     * 初始化
     */
    init : function(){
        //初始化数据
        $("#classNote_panel").empty();
        ClassNote.getAuthConfig(function(){
            ClassNote.load();
        })
    },

    /**
     * 绑定事件
     */
    setEvent : function(){
        $("#classNote_panel").on("click", ".btn-group", function(){
            //TODO 查看数据
            console.log("查看数据", $(this).attr("dataid"));
        });
    },

    /**
     * 加载直播精华
     * @param [isMore] 加载更多
     */
    load : function(isMore){
        var noteId = isMore ? $("#classNote_panel>[dataid]:last") : $("#classNote_panel>[dataid]:first");
        if(noteId.size() > 0){
            noteId = noteId.attr("dataid") || "";
        }else{
            noteId = "";
        }
        Index.getArticleList({
            code : "class_note",
            platform : Data.userInfo.groupId,
            hasContent : 1,
            pageSize : 5,
            pageKey: noteId || "",
            pageLess: isMore ? 1 : 0,
            isAll : 1,
            ids: "",
            callTradeIsNotAuth:0,
            strategyIsNotAuth:0
        }, function (dataList) {
            if (dataList && dataList.result == 0) {
                var dataArr = dataList.data || [];
                ClassNote.appendClassNote(dataArr, false);
                // if(dataArr.length < dataList.pageSize){} TODO 已加载全部
            }
        });
    },

    /**
     * 加载权限
     */
    getAuthConfig : function(callback){
        if(ClassNote.callTradeIsNotAuth != -1){
            callback();
            return;
        }
        var data = {type:"prerogative",item:["prerogative_strategy",'prerogative_callTrade']};
        Util.postJson('/studio/getChatPointsConfig',{data:JSON.stringify(data)}, function(result) {
            ClassNote.callTradeIsNotAuth = 0;
            ClassNote.strategyIsNotAuth = 0;
            if (result) {
                $.each(result, function(i,row){
                    var clientGroups = row.clientGroup;
                    for (var i = 0, lenI = !clientGroups ? 0 : clientGroups.length; i < lenI; i++){
                        var clientGroup = clientGroups[i];
                        if (clientGroup == Data.userInfo.clientGroup) {
                            if(row.item == 'prerogative_callTrade'){
                                ClassNote.callTradeIsNotAuth = 1;
                            }else if(row.item == 'prerogative_strategy'){
                                ClassNote.strategyIsNotAuth = 1;
                            }
                        }
                    }
                });
            }
            callback();
        });
    },

    /**
     * 追加直播精华
     * @param dataArr
     * @param isPrepend
     */
    appendClassNote : function(dataArr, isPrepend){
        var html = [];
        for(var i = 0, lenI = !dataArr ? 0 : dataArr.length; i < lenI; i++){
            html.push(ClassNote.getClassNoteHtml(dataArr[i]));
        }
        if(isPrepend){
            $("#classNote_panel").prepend(html.join(""));
        }else{
            $("#classNote_panel").prepend(html.join(""));
        }
    },

    /**
     * 获取直播精华HTML
     * @param data
     */
    getClassNoteHtml : function(data){
        if(!data){
            return;
        }
        var storeClassNote = Store.get('point_' + Data.userInfo.userId);
        var dataDetail = data.detailList && data.detailList[0] || {};
        var timeStr = Util.formatDate(data.createDate, "HH:mm:ss");
        var result;
        //交易策略 喊单 挂单
        if(dataDetail.tag == "trading_strategy" || dataDetail.tag == "shout_single" || dataDetail.tag == "resting_order"){
            var isHideData = ClassNote.isHideData(data._id, dataDetail.tag, storeClassNote);
            var dimHtml = isHideData ? Room.formatHtml("classNote_dim1") : "";
            var dataHtml = [];
            var txtHtml = dataDetail.content && Room.formatHtml("classNote_txt", dataDetail.content) || "";
            var lookHtml = isHideData ? Room.formatHtml("classNote_look", data._id) : "";
            var dataDataArr = Util.parseJSON(dataDetail.remark || ""), dataDataTemp;
            for(var i = 0,lenI = dataDataArr ? dataDataArr.length : 0; i < lenI; i++){
                dataDataTemp = dataDataArr[i];
                dataHtml.push(Room.formatHtml("classNote_data1",
                    dataDataTemp.name || "",
                    isHideData ? dimHtml : dataDataTemp.upordown == "up" ? "多" : "空",
                    isHideData ? dimHtml : dataDataTemp.open || "",
                    isHideData ? dimHtml : dataDataTemp.profit || "",
                    isHideData ? dimHtml : dataDataTemp.loss || ""
                ));
                if(dataDataTemp.description){
                    dataHtml.push(Room.formatHtml("classNote_data2", isHideData ? Room.formatHtml("classNote_dim2") : dataDataTemp.description));
                }
            }
            if(dataHtml.length > 0){
                dataHtml = Room.formatHtml("classNote_data", dataHtml.join(""));
            }else{
                dataHtml = "";
            }
            if(dataDetail.tag == "trading_strategy"){
                result = Room.formatHtml("classNote_strategy", data._id, txtHtml + dataHtml + lookHtml);
            }else{
                result = Room.formatHtml("classNote_shoutTrade",
                    data._id,
                    timeStr,
                    dataDetail.tag == "shout_single" ? "喊单" : "挂单",
                    dataDetail.authorInfo && dataDetail.authorInfo.name || "",
                    txtHtml + dataHtml + lookHtml
                );
            }
        }else{ //普通直播精华
            result = Room.formatHtml("classNote_article", data._id, timeStr, dataDetail.content);
        }
        return result + Room.formatHtml("classNote_split");
    },

    /**
     * 是否隐藏数据
     * @param id
     * @param tag
     * @param storeClassNote
     */
    isHideData : function(id, tag, storeClassNote){
        if(!Data.userInfo.isLogin){
            return true;
        }
        if((tag == "trading_strategy" && ClassNote.strategyIsNotAuth == 1)
            || ((tag == "shout_single" || tag == "resting_order") && ClassNote.callTradeIsNotAuth == 1)){
            return $.inArray(id, storeClassNote) == -1;
        }
        return false;
    },
    /**
     * 老师喊单后推送消息提醒
     */
    pushShoutSingleInfo:function(articleInfo){
        var articleDetail=articleInfo.detailList && articleInfo.detailList[0];
        var aid = articleInfo._id || articleInfo.id;
        var txt = null;
        if (Util.isNotBlank(articleDetail.tag) && Util.isNotBlank(articleDetail.remark) && (articleDetail.tag == 'shout_single' || articleDetail.tag == 'resting_order')) {
            var label = "老师喊单啦";
            if(articleDetail.tag == 'resting_order'){
                label = "老师挂单啦";
            }
            txt = (Util.isBlank(articleDetail.content) ? (articleDetail.authorInfo.userName||'')+label : articleDetail.content.replace('<p>','').replace('</p>',''));
            var time = Util.formatDate(Data.serverTime, 'HH:mm');
            $('#chat_msg').append(Room.formatHtml('chat_sys_msg', time, txt, 'classNote', aid));
            Tool.gotoLook();
        }
    }
};