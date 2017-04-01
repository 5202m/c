/**
 * 直播间手机版房间内页 -- 直播精华
 * author Dick.guo
 */
var ClassNote = {

    classNoteInfo:{},//直播精华

    strategyIsNotAuth: -1,//查看交易策略是否授权
    callTradeIsNotAuth: -1,//查看喊单/挂单是否授权
    lastScrollTop : 0,
    lastTimeStamp : 0,
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
            //查看数据(判断用户是否登录)
            if(Data.userInfo.isLogin) {
                ClassNote.viewData($(this));
            }else{
                Login.load();
            }
        });

        /**
         * 滚动到末尾加载数据
         */
        $('#page_room').scroll(function (e) {
            if((e.timeStamp - ClassNote.lastTimeStamp)<150){
                return;
            }else {
                ClassNote.lastTimeStamp = e.timeStamp;
            }
            var viewH =$(this).height(),//可见高度
                contentH =$(this).get(0).scrollHeight,//内容高度
                scrollTop =$(this).scrollTop();//滚动高度
            if(scrollTop/(contentH -viewH)>=0.95 && scrollTop > ClassNote.lastScrollTop){
                ClassNote.lastScrollTop = scrollTop;
                ClassNote.load(true);
            }else{
                ClassNote.lastTimeStamp = 0;
            }
        })

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
                ClassNote.appendClassNote(dataArr, isMore ? isMore : false);
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
        Util.postJson('/getChatPointsConfig',{data:JSON.stringify(data)}, function(result) {
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
    appendClassNote : function(dataArr, isMore){
        var html = [];
        for(var i = 0, lenI = !dataArr ? 0 : dataArr.length; i < lenI; i++){
            html.push(ClassNote.getClassNoteHtml(dataArr[i]));
        }
        if(isMore){
            $("#classNote_panel").append(html.join(""));
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
            var txtHtml = dataDetail.tag == 'trading_strategy' ? dataDetail.content : dataDetail.content && Room.formatHtml("classNote_txt", dataDetail.content) || "";
            var item = dataDetail.tag == 'resting_order'? 'prerogative_callTrade' : 'prerogative_callTrade';
            var lookHtml = isHideData ? (dataDetail.tag == "trading_strategy" ? Room.formatHtml("classNote_trading_strategy_look", data._id) : Room.formatHtml("classNote_look", data._id, item)) : "";
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
                }else{
                    dataHtml.push('<br/>')
                }
            }
            if(dataHtml.length > 0){
                dataHtml = dataDetail.tag == "trading_strategy" ? Room.formatHtml("classNote_data", dataHtml.join("")) : dataHtml.join('');
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
                    dataHtml + lookHtml,
                    txtHtml
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
    },
    /**
     * 扣积分查看数据
     * @param dom
     */
    viewData:function(dom){
        var storeData = ClassNote.getStoreViewData()||[];
        var params = {groupType: Data.userInfo.groupType,item: dom.attr('item'),tag: 'viewdata_' + dom.attr('dataid')};
        Util.postJson('/addPointsInfo', {params: JSON.stringify(params)}, function (result) {
            if (result.isOK) {
                Index.getArticleInfo(dom.attr('dataid'), function (data) {
                    if (data) {
                        if(Util.isNotBlank(result.msg) && typeof result.msg.change == 'number') {
                            Pop.msg('消费' + Math.abs(result.msg.change) + '积分');
                        }
                        ClassNote.setViewDataHtml(dom, data.data);
                        if($.inArray(dom.attr('dataid'), storeData)<0) {
                            storeData.push(dom.attr('dataid'));
                        }
                        Store.set('point_'+Data.userInfo.userId, storeData);
                    }
                });
            }else{
                Pop.msg("不好意思，你的积分余额不足！");
            }
        });
    },

    getStoreViewData:function(){
        if (!store.enabled){
            console.log('Local storage is not supported by your browser.');
            return;
        }
        return Store.get('point_'+Data.userInfo.userId);
    }

};

/**
 * 设置查看数据的html
 * @param dom
 * @param data
 */
ClassNote.setViewDataHtml = function(dom, data){
    var upOrDown = {'up':'看涨', 'down':'看跌'};
    var articleInfo = data.detailList && data.detailList[0];
    var remarkArr = JSON.parse(articleInfo.remark),tradeStrategyHdDetailHtml = [],tradeStrategySupportHtml = [], tradeStrategyHdDetail = ClassNote.formatViewDataHtml('tradeStrategyHdDetail');
    if(articleInfo.tag == 'shout_single' || articleInfo.tag == 'resting_order'){
        $.each(remarkArr, function (i, row) {
            var hideDesc = '';
            if(Util.isBlank(row.description)){
                hideDesc = ' style="display:none;"';
            }
            tradeStrategyHdDetailHtml.push(Util.format(tradeStrategyHdDetail,row.name, upOrDown[row.upordown], row.open, row.profit, row.loss, row.description, '', hideDesc));
        });
        dom.parent().children('table').remove();
        dom.parent().children('.instr-txt').remove();
        dom.parent().children('.call-hd').after(tradeStrategyHdDetailHtml.join(''));
        dom.hide();
    }else if(articleInfo.tag == 'trading_strategy'){
        var tradeStrategySupport = ClassNote.formatViewDataHtml('tradeStrategySupport'); //交易支撑位信息
        var tradeStrategySupportDiv = ClassNote.formatViewDataHtml('tradeStrategySupportDiv');//交易支撑位支撑值
        $.each(remarkArr, function (i, row) {
            var hideDesc = '';
            if(Util.isBlank(row.description)){
                hideDesc = ' style="display:none;"';
            }
            tradeStrategySupportHtml.push(Util.format(tradeStrategySupport,row.name, upOrDown[row.upordown], row.open, row.profit, row.loss, row.description, '', hideDesc));
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
ClassNote.formatViewDataHtml = function(region){
    var formatHtmlArr = [];
    switch(region) {
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
}
