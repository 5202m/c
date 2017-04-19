/**
 * 老师订阅操作类
 * Created by Jade.zhu on 2017/1/17.
 */
var Subscribe = new Container({
    panel : $("#page_subscribe"),
    url : "/theme2/template/subscribe.html",
    subscribeOpTeacher : '',
    onLoad : function(){
        Subscribe.setEvent();
    },
    onShow : function () {
        Data.getAnalyst('', function(){
            Subscribe.setAnalystList();
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
            $.each(result, function(key, r){
                Data.getAnalyst(r.userNo, function(row){
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
                            r.subscribe,
                            row.introduction,
                            row.praiseNum,
                            row.userNo
                        ).replace('/theme2/img/pro-bg1.jpg',Subscribe.getAnalystBg(row.userNo)));
                    }
                });
            });
            $('#subscribeAnalyst').empty().html(analystHtml.join(''));

            Subscribe.setSubscribeType(function (analyst) {//回调处理
                $('#subscribeAnalyst div[userno='+analyst.userId+']').find('a.btn').show();
                var type = $('#subscribeAnalyst div[userno='+analyst.userId+']').find('a.btn').attr('type');
                var types = type && type.length > 0 ?  type.split(',') : [] ;
                types.push(analyst.code);
                $('#subscribeAnalyst div[userno='+analyst.userId+']').find('a.btn').attr('type',types.join(','));
            });
            if(Data.userInfo.isLogin){
                Subscribe.setSubscribeData('#subscribeAnalyst .item-con .item-main .social-op');
            }
        }
    });
};
/**
 * 订阅类型
 */
Subscribe.setSubscribeType = function(callback) {
    Util.postJson('/getSubscribeType', { params: JSON.stringify({ groupType: Data.userInfo.groupType }) }, function(data) {
        if (data != null) {
            $.each(data, function(i, row) {
                if(row.code === 'live_reminder' || row.code === 'shout_single_strategy' || row.code === 'trading_strategy'){
                    var analysts = JSON.parse(row.analysts);
                    $.each(analysts,function (k,v) {
                        if(typeof callback === 'function'){
                            v.code = row.code;
                            callback(v);
                        };
                    });
                }
            });
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
            $.each(data,function(i, row) {
                if (Util.isNotBlank(row.analyst)) {
                    var analystsArr = row.analyst.split(',');
                    $.each(analystsArr, function (k, v) {
                        if ($(obj + ' a[analystId="' + v + '"]').size() > 0) {
                            $(obj + ' a[analystId="' + v + '"]').html('<i class="i-selected"></i>已订阅')
                            .removeClass('btn-grey').removeClass('btn-blue')
                            .addClass('btn-green').attr('subscribed', true);
                            if (row.type == 'live_reminder') {
                                $(obj + ' a[analystId="' + v + '"]').attr('lrid', row._id)
                            } else if (row.type == 'shout_single_strategy') {
                                $(obj + ' a[analystId="' + v + '"]').attr('ssid', row._id)
                            } else if (row.type == 'trading_strategy') {
                                $(obj + ' a[analystId="' + v + '"]').attr('tsid', row._id)
                            }
                        }
                    });
                }
            });
        }
    });
};
/**
 * 设置订阅属性
 * @param obj
 */
Subscribe.setSubscribeAttr = function(obj,analyst){
    Util.postJson('/getSubscribe',{params:JSON.stringify({groupType:Data.userInfo.groupType})},function(data){
        if(data!=null){
            $.each(data,function(i, row){
                if(analyst !== row.analyst) return;
                if(row.type == 'live_reminder'){
                    obj.attr('lrid', row._id);
                    obj.children('label').text('已订阅')
                }else if(row.type == 'shout_single_strategy'){
                    obj.attr('ssid', row._id);
                    obj.children('label').text('已订阅')
                }else if(row.type == 'trading_strategy'){
                    obj.attr('tsid', row._id);
                    obj.children('label').text('已订阅')
                }
                obj.attr('subscribed', true);
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
        Analyst.subscribeStr = $(this).children('div').children('div .btn-op').children('a').attr('subscribed') == 'true' ? '已订阅' : '订阅';
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
        if($this.attr('subscribed') =='true' ){
            Subscribe.subscribeOpTeacher = currAnalyst;
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
            Subscribe.setSubscribe($this, id, v, analystArr, k==(typeLen-1),Subscribe.followHander);
        });
        return false;
    });
};
/**
 * 订阅回调处理
 */
Subscribe.followHander = function(isOK,analyst){
    analyst = analyst.length > 0 ? analyst : [Subscribe.subscribeOpTeacher];
    $.each(analyst,function (i,row) {
        var obj = $('#subscribeAnalyst a[analystId='+row+']');
        if(obj.attr('subscribed') ==='true' && isOK){
            obj.attr('lrid','').attr('ssid','').attr('tsid','');
            obj.removeClass('btn-green').addClass('btn-blue').removeAttr('subscribed');
            obj.html('订阅');
        }else if(obj.attr('subscribed') !='true' && isOK){
            obj.removeClass('btn-blue').addClass('btn-green').attr('subscribed','true');
            obj.html('<i class="i-selected"></i>已订阅');
        }
        Syllabus.subscribeTeachers = row;
        Syllabus.followHander(isOK);
        if(obj.attr('subscribed') ==='true'){
            Subscribe.setAnalystSubscribeNum(row,function (data) {
                $('#subscribeAnalyst div[userno="'+row+'"] .item-infos ul li:eq(2) span').text(data.num || 0);
            });
        }
    });
    setTimeout(function () {
        Subscribe.setSubscribeData('#subscribeAnalyst .item-con .item-main .social-op');
    },5000);
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
            Pop.msg('亲，点赞成功！');
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
Subscribe.setSubscribe = function(obj, id, type, analysts, isLast,callback) {
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
                var types = obj.attr('type').split(','),tips = [];
                var remark = {'live_reminder':'直播提醒','shout_single_strategy':'喊单策略','trading_strategy':'交易策略'}
                $.each(types,function (i,row) {
                    tips.push(remark[row]);
                });
                Pop.msg(tips.join('、')+'订阅成功！');
            }
        }else{
            if(data.msg === '请先绑定邮箱') data.msg = '请到电脑端绑定邮箱';
            Pop.msg(data.msg);
        }
        obj.removeClass('clicked');
        if(isLast){//回调函数
            callback(data.isOK,analysts);
        }
    });
};

/**
 * 设置老师订阅数
 */
Subscribe.setAnalystSubscribeNum = function (analyst,callback) {
    if(Util.isNotBlank(analyst)){
        Util.postJson('/setAnalystSubscribeNum',{data:JSON.stringify({userNo:analyst})},function(data) {
            if(data){
                callback(data);
            }
        });
    }
};

/**
 * 根据用户名得到订阅页面老师的背景图
 * @param userNo
 */
Subscribe.getAnalystBg = function (userNo) {
    var picArray = ['alex_fang','buck_chen','dan_yeh','eric_liu','gelaoshi','gw_analyst_3','Ivan_lin',
                    'joe_chung','joe_zhuang','liumin','tonylee','tracey_jiang','zhouyou','public'];
    var picUrl = '/theme2/img/analyst/public.jpg';
    if($.inArray(userNo,picArray) > -1){
        picUrl = '/theme2/img/analyst/'.concat(userNo).concat('.jpg');
    }
    return picUrl;
};
