/**
 * 老师订阅操作类
 * Created by Jade.zhu on 2017/1/17.
 */
var Subscribe = new Container({
    panel : $("#page_subscribe"),
    url : "/theme2/template/subscribe.html",
    onLoad : function(){
        Data.getAnalyst('', function(){
            Subscribe.setAnalystList();
            Subscribe.setEvent();
        });
    }
});

/**
 * 设置老师列表 <label class="u-badge">趋势专家<i class="i-badge-arrowr"></i></label>
 */
Subscribe.setAnalystList = function(){
    $.getJSON('/getAuthUsersByGroupId', {groupId : Data.userInfo.groupId}, function(result){
        if(result) {
            var analystHtml = [];
            $.each(result, function(key, val){
                Data.getAnalyst(val, function(row){
                    if(row) {
                        var tagHtml = [];
                        if (Util.isNotBlank(row.tag)) {
                            var tags = row.tag.replace(/\s*，\s*/g, ',').split(',');
                            $.each(tags, function (k, v) {
                                tagHtml.push('<label class="u-badge">' + v + '<i class="i-badge-arrowr"></i></label>');
                            });
                        }
                        analystHtml.push(Subscribe.formatHtml('subscribeAnalyst',
                            row.userName,
                            tagHtml.join(''),
                            row.winRate ? row.winRate.replace(/%/, '') : 0,
                            row.earningsM ? row.earningsM.replace(/%/, '') : 0,
                            0,
                            row.introduction,
                            row.praiseNum,
                            row.userNo
                        ));
                    }
                });
            });
            $('#subscribeAnalyst').empty().html(analystHtml.join(''));
            Subscribe.setSubscribeData('#subscribeAnalyst .item-con .item-main .social-op');
        }
    });
};

/**
 * 获取订阅数据
 * @param obj
 */
Subscribe.setSubscribeData = function(obj){
    Util.postJson('/getSubscribe',{params:JSON.stringify({groupType:Data.userInfo.groupType})},function(data){
        if(data!=null){
            $.each(data,function(i, row){
                var analystsArr = row.analyst.split(',');
                $.each(analystsArr, function(k, v){
                    if($(obj+' a[analystId="'+v+'"]').size()>0) {
                        $(obj+' a[analystId="' + v + '"]').html('<i class="i-selected"></i>已订阅').removeClass('btn-blue').addClass('btn-green').attr('subscribed', true);
                    }
                });
                if(row.type == 'live_reminder'){
                    $(obj+' a.btnSubscribe').attr('lrid', row._id);
                }else if(row.type == 'shout_single_strategy'){
                    $(obj+' a.btnSubscribe').attr('ssid', row._id);
                }else if(row.type == 'trading_strategy'){
                    $(obj+' a.btnSubscribe').attr('tsid', row._id);
                }
            });
        }
    });
};

/**
 * 点击事件
 */
Subscribe.setEvent = function(){
    /**返回节目列表*/
    $("#back_syllabus").bind("click", Container.back);
    /**
     * 老师简介
     */
    $('#subscribeAnalyst').on('click', '.item-con', function(){
        Analyst.userNo = $(this).attr('userNo');
        Analyst.load();
        return false;
    });
    /**
     * 点赞
     */
    $('#subscribeAnalyst').on('click', '.item-con .item-main .social-op span a.support', function(){
        Subscribe.setPraise($(this), $(this).next('label'));
        return false;
    });
    /**
     * 订阅
     */
    $('#subscribeAnalyst').on('click', '.item-con .item-main .social-op a.btnSubscribe', function(){
        if(!Data.userInfo.isLogin){
            Login.load();
            return false;
        }
        var $this = $(this), id = '', types = $this.attr('type').split(',');
        $this.addClass('clicked');
        var typeLen = types.length;
        var analystArr = [];
        var currAnalyst = $this.attr('analystId');
        $('#subscribeAnalyst .item-con .item-main .social-op a.btnSubscribe').each(function(){
            if($(this).attr('subscribed')=='true'){
                analystArr.push($(this).attr('analystId'));
            }
        });
        var idx =  $.inArray(currAnalyst, analystArr);
        if($this.attr('subscribed')=='true' && idx>-1){
            analystArr.splice(idx, 1);//如果点击已订阅，则删除当前订阅的老师
        }else{
            analystArr.push(currAnalyst);//未订阅的，则加入到订阅列表
        }
        $.each(types, function(k, v){
            if(v=='live_reminder'){
                id = $this.attr('lrid');
            }else if(v=='shout_single_strategy'){
                id = $this.attr('ssid');
            }else if(v=='trading_strategy'){
                id = $this.attr('tsid');
            }
            Subscribe.setSubscribe($this, id, v, analystArr, k==(typeLen-1));
        });
        return false;
    });
};

/**
 * 设置点赞
 */
Subscribe.setPraise = function(obj, lb){
    Util.postJson("/setUserPraise",{clientId:Data.userInfo.userId,praiseId:obj.attr('userNo')},function(result){
        if(result.isOK) {
            //$this.find('i').fadeIn().delay(400).fadeOut();
            //var lb= obj.next("label") || obj.find('label');
            lb.text(Util.isNotBlank(lb.text())?(parseInt(lb.text())+1):0);
        }else{
            Pop.msg('亲，已点赞，当天只能点赞一次！');
        }
        obj.addClass('supported');
        obj.attr('title','已点赞');
    },true);
};

/**
 * 订阅
 * @param obj
 * @param id
 * @param type
 * @param analysts
 * @param isLast
 */
Subscribe.setSubscribe = function(obj, id, type, analysts, isLast) {
    /*if(Util.isBlank($('#myEmail').val()) && $.inArray('email', params.noticeType.split(','))>-1){
     Pop.msg('请先绑定邮箱！');
     $('#infotab a[t="accountInfo"]').click();
     }else{*/
    var remark = {'live_reminder':'订阅直播提醒','shout_single_strategy':'订阅喊单策略','trading_strategy':'订阅交易策略'};
    var params = {id:id, groupType:Data.userInfo.groupType, noticeType:'email', noticeCycle:'year', type:type, pointsRemark : remark[type], point:0};
    params.analyst = analysts.join(',');
    Util.postJson('/subscribe', {params: JSON.stringify(params)}, function (data) {
        if (data.isOK) {
            if(Util.isBlank(params.analyst) || Util.isBlank(params.noticeType)){
                Pop.msg('取消订阅成功！');
            } else if(Util.isNotBlank(params.id)) {
                Pop.msg('修改订阅成功！');
                $('#subscribeAnalyst .item-con .item-main .social-op a[analystId="' + obj.attr('analystId') + '"]').html('订阅').addClass('btn-blue').removeClass('btn-green').attr('subscribed', false);
            }else{
                Pop.msg('订阅成功！');
            }
        }else{
            Pop.msg(data.msg);
        }
        obj.removeClass('clicked');
        if(isLast){
            Subscribe.setSubscribeData('#subscribeAnalyst .item-con .item-main .social-op');
        }
    });
    /*}*/
};
