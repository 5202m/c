/**
 * 我的晒单操作类 JS
 * Created by Jade.zhu on 2017/1/19.
 */
var UserShowTrade = new Container({
    panel : $("#page_userShowTrade"),
    url : "/pm/theme2/template/userShowTrade.html",
    tradeForUser : null,//指定用户的晒单(userNo)
    tradeList : [],
    tradeLoadAll : false,
    onLoad : function(){
        if(Data.userInfo.isLogin) {
            UserShowTrade.setUserShowTradeUserInfo();
            UserShowTrade.getUserShowTrade();
        }
        UserShowTrade.setEvent();
    }
});

/**
 * 加载我的积分等数据
 */
UserShowTrade.setUserShowTradeUserInfo = function(){
    Data.getPointsInfo(function (data) {
        if (data) {
            var row = data.data, levelPointObj = data.levelPoint, nextPointObj = data.nextPoint, widthPer = 0;
            if (row && nextPointObj) {
                widthPer = row.pointsGlobal / nextPointObj.points * 100;
            }
            $('#userShowTradeUserInfo').html(UserShowTrade.formatHtml('userInfo',
                Data.userInfo.avatar,
                Data.userInfo.nickname,
                Util.clientGroupStr[Data.userInfo.clientGroup],
                levelPointObj ? levelPointObj.name : '',
                row ? row.points : 0,
                row ? row.pointsGlobal : 0,
                nextPointObj ? nextPointObj.points : 0,
                widthPer
            ));
        }
    });
};

/**
 * 获取我的晒单数据
 */
UserShowTrade.getUserShowTrade = function(){
    var params = {groupType:Data.userInfo.groupType, userNo:Data.userInfo.userId};
    Util.postJson('/studio/getShowTrade',{data:JSON.stringify(params)},function(data){
        if(data.isOK && data.data){
            UserShowTrade.tradeList = data.data.tradeList || [];
            UserShowTrade.tradeLoadAll = false;
            UserShowTrade.setUserShowTradeList();
        }
    });
};

/**
 * 设置我的晒单数据列表
 */
UserShowTrade.setUserShowTradeList = function(){
    if(UserShowTrade.tradeLoadAll){
        return false;
    }
    var start = $("#userShowTradeList .item-cell").size();
    var listData = UserShowTrade.tradeList;
    var row = null;
    var length = listData.length;
    var tradeHtml = [];
    for(var i = start; i < length && i < start + 10; i++){
        row = listData[i];
        if($('#userShowTradeList .item-cell[sid="'+row._id+'"]').length>0){
            continue;
        }
        var showTradeDate = Util.formatDate(row.showDate,'MM.dd'),showTradeTime = Util.formatDate(row.showDate,'HH:mm');
        tradeHtml.push(UserShowTrade.formatHtml('userShowTrade',
            showTradeDate,
            showTradeTime,
            row.title,
            row.tradeImg,
            row.remark,
            row.praise||0,
            row._id
        ));
        if(i < length - 1) {
            tradeHtml.push('<div class="blk7 blke3e3ea"></div>');
        }
    }
    $('#userShowTradeList').append(tradeHtml.join(''));
    if(i >= length - 1){
        UserShowTrade.tradeLoadAll = true;
    }
};

/**
 * 我的晒单点赞事件
 * @param obj
 */
UserShowTrade.setUserShowTradePraise = function(obj){
    var params = {clientId:Data.userInfo.userId, praiseId:obj.attr('id')};
    Util.postJson("/studio/setTradePraise",{data:JSON.stringify(params)},function(result){
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
UserShowTrade.setEvent = function(){
    /**
     * 返回晒单墙
     */
    $('#myShowTrade_back').bind('click', Container.back);
    /**
     * 进入我要晒单页面
     */
    $('.addShowTrade').unbind('click');
    $('.addShowTrade').bind('click', function(){
        if(Data.userInfo.isLogin) {
            ShowTradeAdd.load();
        }else{
            Login.load();
        }
    });
    /**
     * 点赞晒单
     */
    $('#userShowTradeList').on('click', '.item-cell .item-con .social-op .support', function(){
        ShowTrade.setShowTradePraise($(this));
    });
};