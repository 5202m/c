/**
 * 直播间手机版房间内页 -- 直播精华
 * author Dick.guo
 */
var ClassNote = new Container({
    panel: $("#page_classNote"),
    url: "/theme2/template/classNote.html",
    strategyIsNotAuth : -1,//查看交易策略是否授权
    callTradeIsNotAuth : -1,//查看喊单/挂单是否授权
    classNoteInfo: null, //直播精华非交易策略数据
    onLoad: function () {
        ClassNote.setEvent();
        ClassNote.loadData();
    }
});

/**
 * 绑定事件
 */
ClassNote.setEvent = function () {
    $('#classNote_close').bind('click',Container.back);

    /**
     * 查看数据
     */
    $("#classNodeContainer").on("click", ".btn-group", function () {
        //(判断用户是否登录)
        if($(this).children('a.btn').hasClass('btn-data-grey')){
            return;
        }
        if (Data.userInfo.isLogin) {
            ClassNote.viewData($(this));
        } else {
            Login.load();
        }
    });
    /**
     * 展开交易策略
     */
    $('#classNodeContainer').on('click', '.txt-block .toggle-op-btn', function(){
        $(this).find('i').toggleClass('i-arrow-up i-arrow-down');
        $(this).closest('.txt-block').children('.txt-details').toggleClass('sildeup');
        //$(this).closest('.txt-block').children('.txt-details').children('.details-item-list').toggleClass('sildeup');
        //$(this).closest('.txt-block').children('.txt-details').children('.call-infos').toggleClass('dn');
    });
    /**
     * 滚动到末尾加载数据
     */
/*    $('#page_classNote').scroll(function (e) {
        if ((e.timeStamp - ClassNote.lastTimeStamp) < 150) {
            return;
        } else {
            ClassNote.lastTimeStamp = e.timeStamp;
        }
        var viewH = $(this).height(),//可见高度
            contentH = $(this).get(0).scrollHeight,//内容高度
            scrollTop = $(this).scrollTop();//滚动高度
        if (scrollTop / (contentH - viewH) >= 0.95 && scrollTop > ClassNote.lastScrollTop) {
            ClassNote.lastScrollTop = scrollTop;
            ClassNote.loadData(true, false);
        } else {
            ClassNote.lastTimeStamp = 0;
        }
    });*/
};

/**
 * 加载直播精华
 * @param [isMore] 加载更多
 * @param [isRoom] 是否是房间
 * @param [noteId] 最后一条直播精华ID
 */
ClassNote.loadData = function (isMore, isRoom,classNoteId) {
    var noteId = classNoteId;
    var pagesize = isRoom ? 10 : 30;
    Index.getArticleList({
        code: "class_note",
        platform: Data.userInfo.groupId,
        hasContent: 1,
        pageSize: pagesize,
        pageKey: noteId || "",
        pageLess: isMore ? 1 : 0,
        isAll: 1,
        ids: "",
        callTradeIsNotAuth: 0,
        strategyIsNotAuth: 0
    }, function (dataList) {
        if (dataList && dataList.result == 0) {
            var dataArr = dataList.data || [];
            //根据当前所在页面将数据追加到相应div（房间内数据加载/加载直播精华页面数据）
            if(isRoom) {
                ClassNote.appendRoomClassNote(dataArr, isMore ? isMore : false);
            }else{
                ClassNote.appendClassNote(dataArr, isMore ? isMore : false);
            }
        }
    });
};

/**
 * 加载权限
 */
ClassNote.getAuthConfig = function (callback) {
    if (ClassNote.callTradeIsNotAuth != -1) {
        callback();
        return;
    }
    var data = {type: "prerogative", item: ["prerogative_strategy", 'prerogative_callTrade']};
    Util.postJson('/getChatPointsConfig', {data: JSON.stringify(data)}, function (result) {
        ClassNote.callTradeIsNotAuth = 0;
        ClassNote.strategyIsNotAuth = 0;
        if (result) {
            $.each(result, function (i, row) {
                var clientGroups = row.clientGroup;
                for (var i = 0, lenI = !clientGroups ? 0 : clientGroups.length; i < lenI; i++) {
                    var clientGroup = clientGroups[i];
                    if (clientGroup == Data.userInfo.clientGroup) {
                        if (row.item == 'prerogative_callTrade') {
                            ClassNote.callTradeIsNotAuth = 1;
                        } else if (row.item == 'prerogative_strategy') {
                            ClassNote.strategyIsNotAuth = 1;
                        }
                    }
                }
            });
        }
        callback();
    });
};

/**
 * 追加直播精华（房间页面）
 * @param dataArr
 * @param isPrepend
 */
ClassNote.appendRoomClassNote = function (dataArr, isMore) {
    var html = [],flag = true;
    for (var i = 0, lenI = !dataArr ? 0 : dataArr.length; i < lenI; i++) {

        if($('#classNote_panel div[dataid="'+dataArr[i]._id+'"]').size() > 0){
            return;
        }
        if(!isMore && flag && dataArr[i].detailList[0].tag === "trading_strategy"){
            html.unshift(ClassNote.getRoomClassNoteHtml(dataArr[i]));
            flag = false;
            continue;
        }
        html.push(ClassNote.getRoomClassNoteHtml(dataArr[i]));
    }
    if(dataArr.length == 0){
        html.push('<div class="myloading"><span>没有最新数据了</span></div>');
    }
    $('#classNote_panel .myloading').remove();//删除
    if (isMore) {
        $("#classNote_panel").append(html.join(""));
    } else {
        $("#classNote_panel").prepend(html.join(""));
    }
};

/**
 * 处理推送过来的直播精华（房间页面）
 * @param data
 */
ClassNote.appendPushRoomClassNote = function (data) {
    data._id = data.id;
    var html = ClassNote.getRoomClassNoteHtml(data),dataid = data.id;
    var firstId = $("#classNote_panel>[dataid]:first").attr('dataid');
    //存在则替换
    if($('#classNote_panel div[dataid="'+dataid+'"]').size() > 0){
        var tempId = $('#classNote_panel div[dataid="'+dataid+'"]').next().next().attr('dataid');
        if(!tempId){
            tempId = $('#classNote_panel div[dataid="'+dataid+'"]').prev().prev().attr('dataid');
            $('#classNote_panel div[dataid="'+dataid+'"]').next().remove();
            $('#classNote_panel div[dataid="'+dataid+'"]').remove();
            $('#classNote_panel div[dataid="'+tempId+'"]').each(function () {
                $(this).next().after(html);
                return false;
            });
        }else{
            $('#classNote_panel div[dataid="'+dataid+'"]').next().remove();
            $('#classNote_panel div[dataid="'+dataid+'"]').remove();
            $('#classNote_panel div[dataid="'+tempId+'"]').each(function () {
                $(this).before(html);
                return false;
            });
        }
    }else if(parseInt(dataid) > firstId){//不存在当前页面则判断是否最新加的数据
        var articleDetail=data.detailList && data.detailList[0];
        if(Util.isNotBlank(articleDetail.tag) && articleDetail.tag == 'trading_strategy'){
            $('#classNote_panel div[dataid="'+firstId+'"]').before(html);
        }else{
            $('#classNote_panel div[dataid="'+firstId+'"]').next().after(html);
        }

    }
};

/**
 * 追加直播精华，直播精华页面（当前页）
 * @param dataArr
 * @param isMore
 */
ClassNote.appendClassNote = function(dataArr, isMore){
    var html = [];
    for (var i = 0, lenI = !dataArr ? 0 : dataArr.length; i < lenI; i++) {
        html.push(ClassNote.getClassNoteHtml(dataArr[i]));
    }
    if(dataArr.length == 0 || html.join('').length === 0){
        html.push('<div class="myloading"><span>没有最新数据了</span></div>');
    }
    $('#classNodeContainer .myloading').remove();//删除
    if (isMore) {
        $("#classNodeContainer").append(html.join(""));
    } else {
        $("#classNodeContainer").prepend(html.join(""));
    }
    for (var i = 0, lenI = !ClassNote.classNoteInfo ? 0 : ClassNote.classNoteInfo.length; i < lenI; i++) {
        ClassNote.setOtherClassNoteHtml(ClassNote.classNoteInfo[i]);
    }
};
/**
 * 获取房间直播精华HTML
 * @param data
 */
ClassNote.getRoomClassNoteHtml = function (data) {
    if (!data) {
        return;
    }
    var storeClassNote = Store.get('point_' + Data.userInfo.userId);
    var dataDetail = data.detailList && data.detailList[0] || {};
    var timeStr = Util.formatDate(data.createDate, "HH:mm:ss");
    var result;
    //交易策略 喊单 挂单
    if (dataDetail.tag == "trading_strategy" || dataDetail.tag == "shout_single" || dataDetail.tag == "resting_order") {
        var isHideData = ClassNote.isHideData(data._id, dataDetail.tag, storeClassNote);
        var dimHtml = isHideData ? Room.formatHtml("classNote_dim1") : "";
        var dataHtml = [];
        var txtHtml = dataDetail.tag == 'trading_strategy' ? dataDetail.content : dataDetail.content && Room.formatHtml("classNote_txt", dataDetail.content) || "";
        var item = dataDetail.tag == 'resting_order' ? 'prerogative_callTrade' : 'prerogative_callTrade';
        var lookHtml = isHideData ? (dataDetail.tag == "trading_strategy" ? Room.formatHtml("classNote_trading_strategy_look", data._id) : Room.formatHtml("classNote_look", data._id, item)) : "";
        var dataDataArr = Util.parseJSON(dataDetail.remark || ""), dataDataTemp;
        for (var i = 0, lenI = dataDataArr ? dataDataArr.length : 0; i < lenI; i++) {
            dataDataTemp = dataDataArr[i];
            dataHtml.push(Room.formatHtml("classNote_data1",
                dataDataTemp.name || "",
                isHideData ? dimHtml : dataDataTemp.upordown == "up" ? "多" : "空",
                isHideData ? dimHtml : dataDataTemp.open || "",
                isHideData ? dimHtml : dataDataTemp.profit || "",
                isHideData ? dimHtml : dataDataTemp.loss || ""
            ));
            if (dataDataTemp.description) {
                dataHtml.push(Room.formatHtml("classNote_data2", isHideData ? Room.formatHtml("classNote_dim2") : dataDataTemp.description));
            } else {
                dataHtml.push('<br/>')
            }
        }
        if (dataHtml.length > 0) {
            dataHtml = dataDetail.tag == "trading_strategy" ? Room.formatHtml("classNote_data", dataHtml.join("")) : dataHtml.join('');
        } else {
            dataHtml = "";
        }
        if (dataDetail.tag == "trading_strategy") {
            result = Room.formatHtml("classNote_strategy", data._id, txtHtml + dataHtml + lookHtml);
        } else {
            result = Room.formatHtml("classNote_shoutTrade",
                data._id,
                timeStr,
                dataDetail.tag == "shout_single" ? "喊单" : "挂单",
                dataDetail.authorInfo && dataDetail.authorInfo.name || "",
                dataHtml + lookHtml,
                txtHtml
            );
        }
    } else { //普通直播精华
        result = Room.formatHtml("classNote_article", data._id, timeStr, dataDetail.content);
    }
    return result + Room.formatHtml("classNote_split");
};

/**
 * 获取直播精华(交易策略)HTML（当前页）
 * @param data
 */
ClassNote.getClassNoteHtml = function(data,isPush){
    if (!data) {
        return;
    }
    var storeClassNote = Store.get('point_' + Data.userInfo.userId);
    var dataDetail = data.detailList && data.detailList[0] || {};
    var timeStr = Util.formatDate(data.createDate, "HH:mm:ss");
    var upOrDown = { 'up': '看涨', 'down': '看跌' };
    var publishTime = new Date(data.publishStartDate).getTime();
    var html = [], classNoteHtml = [];
    if($("#classNodeContainer  div[pt="+publishTime+"]").size()==0) {
        //交易策略
        if (Util.isNotBlank(dataDetail.tag) && dataDetail.tag == "trading_strategy") {
            var publishTimeStr = Util.formatDate(publishTime,
                    'yyyy.MM.dd HH:mm') +
                "~" + Util.formatDate(data.publishEndDate, 'HH:mm');
            var author = '',
                avatar = '',
                style = '',
                tag = [],
                tagHtml = [],
                tUserId = '';
            if (dataDetail.authorInfo) {
                author = dataDetail.authorInfo.name || "";
                avatar = dataDetail.authorInfo.avatar || "";
                tUserId = dataDetail.authorInfo.userId || "";
                tag = Util.isNotBlank(dataDetail.authorInfo.tag)
                    ? dataDetail.authorInfo.tag.replace(/\s*，\s*/g, ',').split(
                    ',') : [];
                $.each(tag, function (key, val) {
                    if (Util.isNotBlank(val)) {
                        tagHtml.push(ClassNote.formatHtml("teacherTag", val));
                    }
                });
            }
            var isHideData = ClassNote.isHideData(data._id, dataDetail.tag, storeClassNote);
            var dataDataArr = Util.parseJSON(dataDetail.remark || ""), dataDataTemp, dataHtml = [];
            for (var i = 0, lenI = dataDataArr ? dataDataArr.length : 0; i < lenI; i++) {
                dataDataTemp = dataDataArr[i];
                dataHtml.push(ClassNote.formatHtml("dataTable",
                    dataDataTemp.name || "",
                    upOrDown[dataDataTemp.upordown],
                    isHideData ? '****<i class="txt-mban repeatx"></i>'
                        : dataDataTemp.open || "",
                    isHideData ? '****<i class="txt-mban"></i>'
                        : dataDataTemp.profit || "",
                    isHideData ? '****<i class="txt-mban"></i>'
                        : dataDataTemp.loss || ""
                ));
                if (dataDataTemp.description) {
                    dataHtml.push(ClassNote.formatHtml("dataTableRemark",
                        isHideData ? '****<i class="txt-mban repeat3x"></i>'
                            : dataDataTemp.description));
                }else if(lenI > (i + 1)){//非最后一个table且没有说明换行
                    dataHtml.push('<br/>')
                }
            }
            var teacherAvatarName = '<img src="' + avatar
                + '" class="img-avatar"/><div class="a-top" userNo="' + tUserId
                + '"><b>' + author + '</b><i class="i-dot3"></i></div>';
            var viewDataCls = '', viewDataTxt = '查看数据';
            if (!isHideData) {
                viewDataCls = ' btn-data-grey';
                viewDataTxt = '数据已显示';
            }
            var viewDataHtml = ClassNote.formatHtml('viewData', data._id, '',
                viewDataCls, viewDataTxt);
            html.push(ClassNote.formatHtml('classNodePanel',
                publishTime,
                teacherAvatarName,
                tagHtml.join(''),
                dataDetail.title,
                publishTimeStr,
                dataDetail.content || '',
                dataHtml.join(''),
                viewDataHtml,
                data._id
            ));
        } else {
            if (!ClassNote.classNoteInfo) {
                ClassNote.classNoteInfo = [];
            }
            ClassNote.classNoteInfo.push(data);
        }
    }else if($("#classNodeContainer  div[pt="+publishTime+"]").size()>0 && isPush){
        var isHideData = ClassNote.isHideData(data.id, dataDetail.tag, storeClassNote);
        var dataHtml = [];
        var remarkArr = Util.isNotBlank(dataDetail.remark) ? JSON.parse(dataDetail.remark) : [];
        if (Util.isNotBlank(dataDetail.tag) && dataDetail.tag == 'trading_strategy') {
            $.each(remarkArr, function(i, row) {
                dataHtml.push(ClassNote.formatHtml("dataTable",
                    row.name || "",
                    upOrDown[row.upordown],
                    isHideData ? '****<i class="txt-mban repeatx"></i>'
                        : row.open || "",
                    isHideData ? '****<i class="txt-mban"></i>'
                        : row.profit || "",
                    isHideData ? '****<i class="txt-mban"></i>'
                        : row.loss || ""
                ));
                if (row.description) {
                    dataHtml.push(ClassNote.formatHtml("dataTableRemark",
                        isHideData ? '****<i class="txt-mban repeat3x"></i>'
                            : row.description));
                }else if(lenI > (i + 1)){//非最后一个table且没有说明换行
                    dataHtml.push('<br/>')
                }
            });
            var viewDataCls = '', viewDataTxt = '查看数据';
            if (!isHideData) {
                viewDataCls = ' btn-data-grey';
                viewDataTxt = '数据已显示';
            }
            var viewDataHtml = ClassNote.formatHtml('viewData', data.id, '', viewDataCls, viewDataTxt);
            html.push(ClassNote.formatHtml('strategyPush',
                dataDetail.content || '',
                dataHtml.join(''),
                viewDataHtml
            ));
        }
        $("#classNodeContainer  div[pt="+publishTime+"]").find('.txt-block').remove();
        $("#classNodeContainer  div[pt="+publishTime+"] .infos-block").after(html.join(''));
        return;
    }
    return html.join('');
};

/**
 * 获取直播精华（喊单/挂单）HTML(当前页面)
 * @param data
 */
ClassNote.setOtherClassNoteHtml = function(data,isPush){
    if(!data){
        return;
    }
    var storeClassNote = Store.get('point_' + Data.userInfo.userId);
    var dataDetail = data.detailList && data.detailList[0] || {};
    var timeStr = Util.formatDate(data.createDate, "HH:mm:ss");
    var upOrDown = { 'up': '看涨', 'down': '看跌' };
    var html = [], classNoteHtml = [];
    //喊单 挂单
    var dataDetail = data.detailList && data.detailList[0] || {},
        publishTime = new Date(data.publishStartDate).getTime();
    //课程信息
    var aid = data._id || data.id;
    if($('#classNodeContainer div[pt='+publishTime+'] .classNote div[aid="'+aid+'"]').size()>0 && !isPush){
        return;
    }
    var author = '';
    if (dataDetail.authorInfo) {
        author = dataDetail.authorInfo.name.substring(0, 1) || "";
    }
    var isHideData = ClassNote.isHideData(aid, dataDetail.tag, storeClassNote);
    var dataDataArr = Util.parseJSON(dataDetail.remark || ""), dataDataTemp, dataHtml = [];
    for (var i = 0, lenI = dataDataArr ? dataDataArr.length : 0; i < lenI; i++) {
        dataDataTemp = dataDataArr[i];
        dataHtml.push(ClassNote.formatHtml("dataTable",
            dataDataTemp.name || "",
            upOrDown[dataDataTemp.upordown],
            isHideData ? '****<i class="txt-mban repeatx"></i>' : dataDataTemp.open || "",
            isHideData ? '****<i class="txt-mban"></i>' : dataDataTemp.profit || "",
            isHideData ? '****<i class="txt-mban"></i>' : dataDataTemp.loss || ""
        ));
        if (dataDataTemp.description) {
            dataHtml.push(ClassNote.formatHtml("dataTableRemark",
                isHideData ? '****<i class="txt-mban repeat3x"></i>' : dataDataTemp.description));
        }
    }
    var viewDataCls = '', viewDataTxt = '查看数据';
    if (!isHideData) {
        viewDataCls = ' btn-data-grey';
        viewDataTxt = '数据已显示';
    }
    var viewDataHtml = ClassNote.formatHtml('viewData', aid, 'prerogative_callTrade', viewDataCls, viewDataTxt);
    if(Util.isNotBlank(dataDetail.tag) && Util.isNotBlank(dataDetail.remark) && (dataDetail.tag == 'shout_single' || dataDetail.tag == 'resting_order')){
        var label = "喊单";
        if (dataDetail.tag == 'resting_order') {
            label = "挂单";
        }
        html.push(ClassNote.formatHtml('shoutSingle',
            !isHideData ? ' data-visible' : '',
            timeStr,
            label,
            author,
            dataDetail.content || '',
            dataHtml.join(''),
            viewDataHtml,
            aid
        ));
    }else{
        html.push(ClassNote.formatHtml('descTxt',
            aid,
            timeStr,
            dataDetail.content || ''
        ));
    }
    html.push(ClassNote.formatHtml('blk7'));
    if (isPush) {
        $('#classNodeContainer div[pt='+publishTime+'] .classNote').find("div[aid='" + aid + "']").next().remove();
        $('#classNodeContainer div[pt='+publishTime+'] .classNote').find("div[aid='" + aid + "']").remove();
        $('#classNodeContainer div[pt='+publishTime+'] .classNote').prepend(html.join(''));
    }else{
        $('#classNodeContainer div[pt='+publishTime+'] .classNote').append(html.join(''));
    }
};

/**
 * 是否隐藏数据
 * @param id
 * @param tag
 * @param storeClassNote
 */
ClassNote.isHideData = function (id, tag, storeClassNote) {
    if (!Data.userInfo.isLogin) {
        return true;
    }
    if(Data.userInfo.isLogin && tag == "trading_strategy"){//策略只对游客隐藏
        return false;
    }
    if ((tag == "trading_strategy" && ClassNote.strategyIsNotAuth == 1)
        || ((tag == "shout_single" || tag == "resting_order") && ClassNote.callTradeIsNotAuth == 1)) {
        return $.inArray(id, storeClassNote) == -1;
    }
    return false;
};
/**
 * 老师喊单后推送消息提醒
 */
ClassNote.pushShoutSingleInfo = function (articleInfo) {
    var articleDetail = articleInfo.detailList && articleInfo.detailList[0];
    var aid = articleInfo._id || articleInfo.id;
    var txt = null;
    if (Util.isNotBlank(articleDetail.tag) && Util.isNotBlank(articleDetail.remark) && (articleDetail.tag == 'shout_single' || articleDetail.tag == 'resting_order')) {
        var label = "老师喊单啦";
        if (articleDetail.tag == 'resting_order') {
            label = "老师挂单啦";
        }
        txt = (Util.isBlank(articleDetail.content) ? (articleDetail.authorInfo.userName || '') + label : articleDetail.content.replace('<p>', '').replace('</p>', ''));
        var time = Util.formatDate(Data.serverTime, 'HH:mm');
        $('#chat_msg').append(Room.formatHtml('chat_sys_msg', time, txt, 'classNote', aid));
        Tool.gotoLook();
    }
};
/**
 * 扣积分查看数据
 * @param dom
 */
ClassNote.viewData = function (dom) {
    var storeData = ClassNote.getStoreViewData() || [];
    var params = {groupType: Data.userInfo.groupType, item: dom.attr('item'), tag: 'viewdata_' + dom.attr('dataid')};
    Util.postJson('/addPointsInfo', {params: JSON.stringify(params)}, function (result) {
        if (result.isOK) {
            Index.getArticleInfo(dom.attr('dataid'), function (data) {
                if (data) {
                    if (Util.isNotBlank(result.msg) && typeof result.msg.change == 'number') {
                        Pop.msg('消费' + Math.abs(result.msg.change) + '积分');
                    }
                    ClassNote.setViewDataHtml(dom, data.data);
                    if ($.inArray(dom.attr('dataid'), storeData) < 0) {
                        storeData.push(dom.attr('dataid'));
                    }
                    Store.set('point_' + Data.userInfo.userId, storeData);
                }
            });
        } else {
            Pop.msg("不好意思，你的积分余额不足！");
        }
    });
};
/**
 * 本地存储数据
 * @returns {*}
 */
ClassNote.getStoreViewData = function () {
    if (!store.enabled) {
        console.log('Local storage is not supported by your browser.');
        return;
    }
    return Store.get('point_' + Data.userInfo.userId);
};

/**
 * 设置查看数据的html
 * @param dom
 * @param data
 */
ClassNote.setViewDataHtml = function (dom, data) {
    var upOrDown = {'up': '看涨', 'down': '看跌'};
    var articleInfo = data.detailList && data.detailList[0];
    var remarkArr = JSON.parse(articleInfo.remark), tradeStrategyHdDetailHtml = [], tradeStrategySupportHtml = [], tradeStrategyHdDetail = ClassNote.formatViewDataHtml('tradeStrategyHdDetail');
    if (articleInfo.tag == 'shout_single' || articleInfo.tag == 'resting_order') {
        $.each(remarkArr, function (i, row) {
            var hideDesc = '';
            if (Util.isBlank(row.description)) {
                hideDesc = ' style="display:none;"';
            }
            tradeStrategyHdDetailHtml.push(Util.format(tradeStrategyHdDetail, row.name, upOrDown[row.upordown], row.open, row.profit, row.loss, row.description, '', hideDesc));
        });
        dom.parent().children('table').remove();
        dom.parent().children('.instr-txt').remove();
        dom.parent().children('.call-hd').after(tradeStrategyHdDetailHtml.join(''));
        if(dom.parents('article').attr('id') === 'page_classNote'){
            dom.children().text('数据已显示');
        }else {
            dom.hide();
        }
    } else if (articleInfo.tag == 'trading_strategy') {
        var tradeStrategySupport = ClassNote.formatViewDataHtml('tradeStrategySupport'); //交易支撑位信息
        var tradeStrategySupportDiv = ClassNote.formatViewDataHtml('tradeStrategySupportDiv');//交易支撑位支撑值
        $.each(remarkArr, function (i, row) {
            var hideDesc = '';
            if (Util.isBlank(row.description)) {
                hideDesc = ' style="display:none;"';
            }
            tradeStrategySupportHtml.push(Util.format(tradeStrategySupport, row.name, upOrDown[row.upordown], row.open, row.profit, row.loss, row.description, '', hideDesc));
        });
        var hdBoxDom = dom.parent('div.hdbox').children('div.showpart').children('div.hdbox2');
        hdBoxDom.children('table').remove();
        hdBoxDom.html(tradeStrategySupportHtml.join(''));
    }
};

/**
 * 根据内容域模块名返回内容模板
 * @param region 内容域模块名
 * @returns {string}
 */
ClassNote.formatViewDataHtml = function (region) {
    var formatHtmlArr = [];
    switch (region) {
        case 'tradeStrategyLiveBrief'://课程信息，直播老师
            formatHtmlArr.push('<div class="livebrief" pt="{6}" _aid="{9}">');
            formatHtmlArr.push('    <div class="te_info" tid="{10}">');
            formatHtmlArr.push('        <div class="himg"><img src="{0}" alt="" width="120" height="120"></div>');
            formatHtmlArr.push('        <div class="teinfo1">');
            formatHtmlArr.push('            <span class="te_name">{1}</span>');
            formatHtmlArr.push('            <span class="livetime">{2}</span>');
            formatHtmlArr.push('        </div>');
            formatHtmlArr.push('        <span class="brieftit">{3}</span>');
            formatHtmlArr.push('        <div class="taglist">');
            formatHtmlArr.push('            {8}');
            formatHtmlArr.push('        </div>');
            formatHtmlArr.push('    </div>');
            formatHtmlArr.push('    <div class="hdbox">');
            formatHtmlArr.push('        <div class="showpart cut">');
            formatHtmlArr.push('            <div class="skill">');
            formatHtmlArr.push('                <span><i class="dot"></i>当前交易策略：</span>');
            formatHtmlArr.push('                <p>{4}</p>');
            formatHtmlArr.push('            </div>');
            formatHtmlArr.push('                    {5}');
            formatHtmlArr.push('            <div class="scbox-shadow"></div>');
            formatHtmlArr.push('        </div>');
            formatHtmlArr.push('        <a href="javascript:void(0);" class="show-ctrl"{11}>点击展开</a>');
            formatHtmlArr.push('        <a href="javascript:void(0);" class="viewdata"{7} _id="{9}" item="prerogative_strategy" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'right_zb_cl_ChaKanShuJu\', \'content_right\', 1, true]);">查看数据</a>');
            formatHtmlArr.push('        <i class="hdbox-i"></i>');
            formatHtmlArr.push('    </div>');
            formatHtmlArr.push('    <div class="live_banner">');
            formatHtmlArr.push('        <ul class="ban_ul"></ul>');
            formatHtmlArr.push('        <div class="num">');
            formatHtmlArr.push('            <ul></ul>');
            formatHtmlArr.push('        </div>');
            formatHtmlArr.push('    </div>');
            formatHtmlArr.push('    <div class="brieflist">');
            formatHtmlArr.push('        <ul></ul>');
            formatHtmlArr.push('    </div>');
            formatHtmlArr.push('</div>');
            break;
        case 'tradeStrategySupport':
            formatHtmlArr.push('<div class="hdbox2 clearfix">');
            formatHtmlArr.push('    <table width="100%" border="0" cellspacing="0" cellpadding="0">');
            formatHtmlArr.push('        <tr>');
            formatHtmlArr.push('            <th>品种</th>');
            formatHtmlArr.push('            <th width="21%">方向</th>');
            formatHtmlArr.push('            <th width="21%">进场点位</th>');
            formatHtmlArr.push('            <th width="21%">止盈</th>');
            formatHtmlArr.push('            <th width="21%">止损</th>');
            formatHtmlArr.push('        </tr>');
            formatHtmlArr.push('        <tr>');
            formatHtmlArr.push('            <td>{0}</td>');//品种
            formatHtmlArr.push('            <td>{1}</td>');//涨跌
            formatHtmlArr.push('            <td><span class="{6}">{2}</span></td>');
            formatHtmlArr.push('            <td><span class="{6}">{3}</span></td>');
            formatHtmlArr.push('            <td><span class="{6}">{4}</span></td>');
            formatHtmlArr.push('        </tr>');
            formatHtmlArr.push('        <tr{7}>');
            formatHtmlArr.push('            <td colspan="5" class="explain">说明：<span class="{6}">{5}</span></td>');
            formatHtmlArr.push('        </tr>');
            formatHtmlArr.push('    </table>');
            formatHtmlArr.push('</div>');
            break;
        case 'tradeStrategySupportDiv':
            //formatHtmlArr.push('<div class="support"><i class="dot"></i><b>第{0}支撑位/阻力位：</b><span class="{3}">{1}/{2}</span></div>');
            break;
        case 'tradeStrategyNote':
            formatHtmlArr.push('<li aid="{2}">');
            formatHtmlArr.push('    <i class="dot"></i>');
            formatHtmlArr.push('    <span class="ltime">{0}</span>');
            formatHtmlArr.push('    <div class="textcont">');
            formatHtmlArr.push('    {1}');
            formatHtmlArr.push('    </div>');
            formatHtmlArr.push('</li>');
            break;
        case 'tradeStrategyHd':
            formatHtmlArr.push('{0}');
            formatHtmlArr.push('<div class="hdbox2 clearfix">');
            formatHtmlArr.push('    <span class="hdtit">【{5}】{4}老师{5}了，快来围观！</span>');
            formatHtmlArr.push('    <a href="javascript:void(0);" class="viewdata2"{2} _id="{3}" item="{6}" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'right_zb_hd_ChaKanShuJu\', \'content_right\', 1, true]);">查看数据</a>');
            formatHtmlArr.push('            {1}');
            formatHtmlArr.push('</div>');
            break;
        case 'tradeStrategyHdDetail':
            formatHtmlArr.push('<table class="tb-default">');
            formatHtmlArr.push('    <tbody>');
            formatHtmlArr.push('        <tr>');
            formatHtmlArr.push('            <th>品种</th>');
            formatHtmlArr.push('            <th width="21%">方向</th>');
            formatHtmlArr.push('            <th width="21%">进场点位</th>');
            formatHtmlArr.push('            <th width="21%">止盈</th>');
            formatHtmlArr.push('            <th width="21%">止损</th>');
            formatHtmlArr.push('        </tr>');
            formatHtmlArr.push('        <tr>');
            formatHtmlArr.push('            <td>{0}</td>');
            formatHtmlArr.push('            <td>{1}</td>');
            formatHtmlArr.push('            <td><span class="{6}">{2}</span></td>');
            formatHtmlArr.push('            <td><span class="{6}">{3}</span></td>');
            formatHtmlArr.push('            <td><span class="{6}">{4}</span></td>');
            formatHtmlArr.push('        </tr>');
            formatHtmlArr.push('    </tbody>');
            formatHtmlArr.push('</table>');
            //formatHtmlArr.push('<div class="details-item-list sildeup">');
            formatHtmlArr.push('<div class="instr-txt">');
            formatHtmlArr.push('<label>说明</label>');
            formatHtmlArr.push('<span class="{6}">{5}</span>');
            formatHtmlArr.push('</div>');
            //formatHtmlArr.push('</div>');
            break;
        case 'tradeStrategyNoteDetail':
            formatHtmlArr.push('<div class="textcont">{0}</div>');
            break;
        case 'tradeStrategyNoteImg':
            formatHtmlArr.push('<div class="picpart">');
            formatHtmlArr.push('    <div class="imgbox" url="{0}">');
            formatHtmlArr.push('        <a href="{0}" data-lightbox="liveinfo-img" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'right_zb_ChaKanTu\', \'content_right\', 1, true]);"><i></i><img alt="" /></a>');
            formatHtmlArr.push('    </div>');
            formatHtmlArr.push('</div>');
            break;
        case 'tag':
            formatHtmlArr.push('<a href="javascript:void(0);" class="tag"><span>{0}</span><i></i></a>');
            break;
        case 'pushShortSingle':
            formatHtmlArr.push('<div class="info_push">');
            formatHtmlArr.push('    <div class="pushcont">系统：{0}</div>');
            formatHtmlArr.push('    <a href="javascript:void(0);" class="detailbtn shoutsingle" _id="{1}" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'right_lts_QuKankan\', \'content_right\', 1, true]);">去看看</a>');
            formatHtmlArr.push('    <a href="javascript:void(0);" class="pushclose"><i></i></a>');
            formatHtmlArr.push('</div>');
            break;
    }
    return formatHtmlArr.join("");
};

