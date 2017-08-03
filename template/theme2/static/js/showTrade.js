/**
 * 晒单墙操作类JS
 * Created by Jade.zhu on 2017/1/19.
 */
var ShowTrade = new Container({
    panel : $("#page_showTrade"),
    url : "/theme2/template/showTrade.html",
    tradeList : [],
    tradeLoadAll : false,
    onLoad : function(){
        ShowTrade.getShowTrade();
        ShowTrade.setEvent();
    },
    onShow : function () {
        if(Util.isAppEnv())$('.addShowTrade .i-addbtn3').hide();
    }
});

/**
 * 获取晒单数据
 */
ShowTrade.getShowTrade = function(){
    var params = {groupType:Data.userInfo.groupType};
    Util.postJson('/getShowTrade',{data:JSON.stringify(params)},function(data){
        if(data.isOK && data.data){
            ShowTrade.tradeList = data.data.tradeList || [];
            ShowTrade.tradeLoadAll = false;
            ShowTrade.setShowTradeList();
        }
    });
};

/**
 * 设置晒单墙数据显示
 * @returns {boolean}
 */
ShowTrade.setShowTradeList = function(){
    if(ShowTrade.tradeLoadAll){
        return false;
    }
    var start = $("#showTradeList .item-cell").size();
    var listData = ShowTrade.tradeList;
    var row = null;
    var length = listData.length;
    var tradeHtml = [];
    for(var i = start; i < length && i < start + 10; i++){
        row = listData[i];
        if($('#showTradeList .item-cell[sid="'+row._id+'"]').length>0){
            continue;
        }
        var showTradeDate = Util.formatDate(row.showDate,'MM-dd HH:mm');
        if(row.user.avatar.indexOf('/pm/theme1/img/user.png') > -1){
            row.user.avatar = '/theme2/img/user.png';
        }
        tradeHtml.push(ShowTrade.formatHtml('showTrade',
            row.user.userName,
            showTradeDate,
            row.title,
            row.remark,
            row.praise||0,
            row._id,
            row.user.avatar,
            row.tradeImg,           (row.isAccord == 1) ? '<span class="starIcon"></span>' :　"&nbsp;"        ));

        if(i < length - 1) {
            tradeHtml.push('<div class="blk7 blke3e3ea"></div>');
        }
    }
    $('#showTradeList').append(tradeHtml.join(''));
    $('#showTradeList img.lazy').lazyload({effect : "fadeIn"});
    if(i >= length - 1){
        ShowTrade.tradeLoadAll = true;
    }
};
/**
 * 晒单墙点赞事件
 */
ShowTrade.setShowTradePraise = function(obj){
    var params = {clientId:Data.userInfo.userId, praiseId:obj.attr('id')};
    Util.postJson("/setTradePraise",{data:JSON.stringify(params)},function(result){
        if(result.isOK) {
            //$this.find('i').fadeIn().delay(400).fadeOut();
            var lb= obj.children("span").children('label');
            lb.text(Util.isNotBlank(lb.text())?(parseInt(lb.text())+1):0);
        }else{
            Pop.msg('亲，已点赞，当天只能点赞一次！');
        }
        obj.addClass('supported');
        obj.attr('title','已点赞');
    },true);
};
/**
 * 设置事件
 */
ShowTrade.setEvent = function(){
    /**
     * 返回直播大厅
     */
    $('#showTrade_back').bind('click', Container.back);
    /**
     * 进入我的晒单
     */
    $('#myShowTrade').bind('click', function(){
        PmGaTrace.myShowTradeListGaEvent();
        if(Data.userInfo.isLogin) {
            UserShowTrade.load();
        }else{
            Login.load();
        }
    });
    /**
     * 进入我要晒单页面
     */
    $('.addShowTrade').unbind('click');
    $('.addShowTrade').bind('click', function(){
        PmGaTrace.showTradeListPlusEntryGaEvent();
        if(Data.userInfo.isLogin) {
            ShowTradeAdd.load();
        }else{
            Login.load();
        }
    });
    /**
     * 点赞晒单
     */
    $('#showTradeList').on('click', '.item-cell .item-con .social-op .support', function(){
        ShowTrade.setShowTradePraise($(this));
    });
    /**
     * 加载更多
     */
    $('#showTradeLoadMore').bind('click', function(){
        ShowTrade.setShowTradeList();
    });
};

/**
 * 聊天室 推送用户晒单提示消息
 * @param data
 */
ShowTrade.pushShowTradeInfo = function(data) {
    var tradeHtml = [],
        row = null,
        txt = null;
    for(var i = 0, length=data.length; i < length; i++){
        row = data[i];
        if($('#showTradeList .item-cell[sid="'+row.id+'"]').length==0){
            var showTradeDate = Util.formatDate(row.showDate,'MM-dd HH:mm');
            tradeHtml.push(ShowTrade.formatHtml('showTrade',
                row.user.avatar,
                row.user.userName,
                showTradeDate,
                row.title,
                row.tradeImg,
                row.remark,
                row.praise||0,
                row._id
            ));
        }
        var time = Util.formatDate(Data.serverTime, 'HH:mm');
        txt = row.boUser.userName + '在晒单墙晒了一单，' + (Util.isBlank(row.title)?'...':row.title);
        $('#chat_msg').append(Room.formatHtml('chat_sys_msg', time, txt, 'showTrade', row._id));
        $('#scroll-tips .scroller .chat-tips-con .pr15').text(txt).show();
        //chat.showSystemTopInfo("showTrade", row.id, txt);
    }
    var timeOutId = setTimeOut(function(){
        $('#scroll-tips').hide();
        clearTimeout(timeOutId);
    },10000);
    $('#showTradeList').prepend(tradeHtml.join(''));
    ShowTrade.showShowTradeNumTip(false);
    Tool.gotoLook();
};

/**
 * 显示新消息数量角标
 */
ShowTrade.showShowTradeNumTip = function(isClear){
    var $tip = $("#showTradeNum");
    if(isClear){
        $tip.data("cnt", 0).html("").hide();
    }else{
        var cnt = ($tip.data("cnt") || 0) + 1;
        $tip.data("cnt", cnt).html(cnt).css("display", "inline-block");
    }
}