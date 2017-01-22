/**
 * 直播间手机版入口
 * author Dick.guo
 */
var Index = {
    serverTimeTickId:0,  //服务器时间定时器编号

    init:function(){
        Data.init();
        this.serverTimeTick();
        this.setEvent();

        if(Data.userInfo.groupId){
            Room.load();
        }else{
            Rooms.load();
        }
    },

    /**
     * 服务器时间更新
     */
    serverTimeTick: function () {
        if(Index.serverTimeTickId){
            window.clearInterval(Index.serverTimeTickId);
        }
        Index.serverTimeTickId = window.setInterval(function(){
            Data.serverTime += 1000;
        },1000);//每秒一次
    },

    /**
     * 加载模板页面
     */
    setEvent:function(){
        //显示登录用户昵称
        if(Data.userInfo.isLogin){
            $('#header_ui').text(Data.userInfo.nickname);
        }

        //登录、显示用户信息
        $("#header_ui").bind("click", function(){
            if(Rooms.userInfo && Rooms.userInfo.isLogin){
                //已登录，显示用户信息
                //studioMbPop.popBox("person");
            }else{
                //未登录，弹出登录框
                /*studioMbPop.popBox("login", {
                 groupId : "",
                 clientGroup : Rooms.userInfo.clientGroup,
                 clientStoreId : Rooms.userInfo.clientStoreId,
                 platform : Rooms.options.platform
                 });*/
            }
        });
    }
};

/**
 * 文档信息(广告,公告)
 * @param params {{
 *      code : String,
 *      platform : String,
 *      [pageNo] : Number,
 *      [pageSize] : Number,
 *      [pageKey] : String,
 *      [pageLess] : Number,
 *      [isAll] : Number,
 *      [authorId] : String,
 *      [hasContent] : Number,
 *      [orderByStr] : String,
 *      [ids] : String,
 *      [callTradeIsNotAuth] : Number,
 *      [strategyIsNotAuth] : Number
 * }}
 * @param callback
 */
Index.getArticleList = function(params,callback){
    try{
        params = params || {};
        $.getJSON('/studio/getArticleList',{
            code:params.code || "",
            platform:params.platform || "",
            pageNo:params.pageNo || 1,
            isAll:params.isAll || 0,
            pageKey:params.pageKey || "",
            pageLess:params.pageLess || 0,
            authorId:params.authorId || "",
            pageSize:params.pageSize || 20,
            hasContent:params.hasContent || 0,
            orderByStr:params.orderByStr || "",
            ids: params.ids || "",
            callTradeIsNotAuth: params.callTradeIsNotAuth || '',
            strategyIsNotAuth: params.strategyIsNotAuth || ''
        },function(data){
            callback(data);
        });
    }catch (e){
        console.error("getArticleList->"+e);
        callback(null);
    }
};
