/**
 * 老师订阅操作类
 * Created by Jade.zhu on 2017/1/17.
 */
var Subscribe = new Container({
    panel : $("#page_subscribe"),
    url : "/pm/theme2/template/subscribe.html",
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
    $.getJSON('/studio/getAuthUsersByGroupId', {groupId : Data.userInfo.groupId}, function(result){
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
        }
    });
};

/**
 * 点击事件
 */
Subscribe.setEvent = function(){
    $('body').addClass('bgfff').removeClass('bgf2f2f2');
    /**返回节目列表*/
    $("#back_syllabus").bind("click", function(){
        Syllabus.load();
    });
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
        Subscribe.setSubscribe($(this));
        return false;
    });
};

/**
 * 设置点赞
 */
Subscribe.setPraise = function(obj, lb){
    Util.postJson("/studio/setUserPraise",{clientId:Data.userInfo.userId,praiseId:obj.attr('userNo')},function(result){
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
 */
Subscribe.setSubscribe = function(){
};
