/**
 * 培训班列表操作类 JS
 * Created by Jade.zhu on 2017/1/22.
 */
var Trains = new Container({
    panel : $("#page_trains"),
    url : "/pm/theme2/template/trains.html",
    onLoad : function(){
        Trains.setTrainList();
        Trains.setEvent();
    }
});

/**
 * 设置培训班列表
 */
Trains.setTrainList = function(){
    var trainsHtml = [], trainsEndHtml = [];
    $.getJSON('/studio/getTrainRoomList', {groupType:Data.userInfo.groupType}, function(result){
        if(result!=null){
            var trainNum = result.length;
            $.each(result, function(key, row){
                var introduction = $.trim(row.defaultAnalyst.introduction);
                var txt = '报名/详情',
                    numTxt= "已报名" + (row.clientSize || 0) + "人",
                    //clk='onclick="chatTeacher.trainDetails(this);" ',
                    //href='href="javascript:void(0);"',
                    dateStr = Util.formatDate(row.openDate.beginDate, 'yyyy.MM.dd')+'~'+Util.formatDate(row.openDate.endDate, 'yyyy.MM.dd');
                if(row.allowInto){
                    txt = '进入';
                    //clk = 'onclick="chatTeacher.trainRegis(this);" ';
                }else if(row.isEnd){
                    trainNum = trainNum - 1;
                    txt = '精彩回顾';
                    //clk = '';
                    numTxt = "&nbsp;";
                    //href = Util.isBlank(Trains.trainLpUrl[row.defaultAnalyst.userNo]) ? 'href="javascript:void(0);"' : 'href="'+Trains.trainLpUrl[row.defaultAnalyst.userNo]+'" target="_blank"';
                    dateStr = '已结束';
                }
                if(row.status == 0){
                    trainsEndHtml.push(Trains.formatHtml('train',
                        row.name,
                        dateStr,//时间/状态
                        row.remark,
                        txt//状态，报名/进入/结束
                    ));
                }else {
                    trainsHtml.push(Trains.formatHtml('train',
                        row.name,
                        dateStr,//时间/状态
                        row.remark,
                        txt//状态，报名/进入/结束
                    ));
                }
            });
            $('#trainsList').empty().html($.merge(trainsHtml,trainsEndHtml).join(''));
        }
    });
};

/**培训班报名*/
Trains.trainRegis = function(obj){
    if(Data.userInfo.isLogin) {
        var userNo =$(obj).attr("userno");
        var group =$(obj).attr("cgs");
        var updateTrain =$(obj).attr("updateTrain");
        var isDetail = $(obj).attr('isDetail');
        var userGroup = Data.userInfo.clientGroup;
        var nickname = Data.userInfo.nickname;
        if(group && group.indexOf(userGroup) != -1){
            var params = {groupId:$(obj).attr("rid"),userNo:userNo,clientGroup:group,nickname:nickname};
            Util.postJson('/studio/addClientTrain',{data:JSON.stringify(params)},function(data){
                if(data.awInto){//进入培训班
                    //TODO 进入培训班
                    //indexJS.toRefreshView();
                }else if(data.errcode){
                    if(!$(".train_detail").is(":visible") && $(obj).attr('rml')=='true' && $.inArray(data.errcode,['3003','3009'])>-1){
                        //TODO 显示详情页
                        //chatTeacher.trainDetailsLoad(userNo, $(obj).text());
                    } else {
                        //TODO 显示错误提示
                        //box.showMsg(data.errmsg);
                    }
                }else{
                    if(data.isOK){
                        if(updateTrain){
                            //TODO 显示培训班详情
                            //chatTeacher.showTrani(data.chatGroup);
                        }else if(isDetail=='true'){
                            //TODO 显示列表
                            //box.showMsg(data.msg);
                            //videosTrain.getTrainList();
                        }else{
                            //TODO 显示消息
                            //box.showMsg(data.msg);
                        }
                    }else{
                        //TODO 显示提示消息
                        //box.showMsg(data.msg||data.errmsg);
                    }
                }
            });
        }else{
            //TODO 切换房间消息
            //videosLive.changeRoomMsg({title:"", type:"onlyTrain"});
        }
    }else{
        Login.load();
        //$('#loginBox').css('z-index','102');
        //common.openPopup('.blackbg,.login');
    }
};

/**
 * 设置事件
 */
Trains.setEvent = function(){
    /**
     * 返回首页
     */
    $('#train_back').bind('click', Container.back);
    /**
     * 报名/进入按钮事件
     */
    $('#trainsList').on('click', '.u-ch-class .u-ch-con a.btn', function(){
        //TODO 进入培训班
    });
};