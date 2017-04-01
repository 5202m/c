/**
 * 直播间手机版课程安排JS
 * author Jade.zhu
 */
var Syllabus = new Container({
    panel : $("#page_syllabus"),
    url : "/theme2/template/syllabus.html",
    onLoad : function(){
        Syllabus.setEvent();
    },
    onShow : function () {
        Data.getAnalyst('', function() {
            Syllabus.setSyllabusTitle();
        });
    }
});

/**
 * 加载课程表表头
 */
Syllabus.setSyllabusTitle = function () {
    Data.getSyllabus(Data.userInfo.groupId, function(result){
        if(result && result.courses) {
            var days = result.courses.days;
            var courseTitleHtml = [], curDay = new Date(Data.serverTime).getDay();
            $.each(days, function (i, row) {
                courseTitleHtml.push(Syllabus.formatHtml("syllabusDayTitle"
                    , Util.daysCN[row.day]
                    , row.day));
            });
            $('#syllabusDayTitle').empty().html(courseTitleHtml.join(''));
            Syllabus.setSyllabusList(curDay);
        }
    });
};

/**
 * 加载课程表
 * @param day
 */
Syllabus.setSyllabusList = function(day){
    $('#syllabusDayTitle li.active').removeClass('active');
    $('#syllabusDayTitle li[day='+day+']').addClass('active');
    var clsObj = {grey:'grey', red:'red', blue:'blue', orange:'orange', green:'green'}
    var courseDataHtml = [] ,curDay=new Date(Data.serverTime).getDay(), curTime = Util.formatDate(new Date(Data.serverTime),'HH:mm'), hideBtn = '';
    Data.getSyllabus(Data.userInfo.groupId, function(result){
        var courseType = {'0':'文字直播','1':'视频直播','2':'oneTV直播'};
        var days=result.courses.days,tmk=result.courses.timeBuckets;
        var startDateTime = Data.serverTime - 86400000 * ((curDay + 6) % 7),dateStr='今天',courseObj=null,status = '',statusCls='', btn='', btnCls='';
        $.each(days, function(i, row){
            if(row.day != day){
                return true;
            }
            if(row.status != 1){
                $('#syllabusList').empty().append('<li><a href="javascript:"><span><lable>休市</lable></span></a></li>');
            } else {
                if(day!=curDay){
                    dateStr = Util.formatDate(new Date(startDateTime + ((row.day + 6) % 7) * 86400000), 'yyyy.MM.dd');
                }
                for (var k = 0, tklen = tmk.length; k < tklen; k++) {
                    courseObj=tmk[k].course[day-1];
                    if(!courseObj){
                        continue;
                    }
                    if(courseObj.status != 0 && courseObj.lecturer){
                        var userId = courseObj.lecturerId;
                        if(courseObj.lecturerId.indexOf(',')>-1){
                            userId = courseObj.lecturerId.substring(0,courseObj.lecturerId.indexOf(','));
                        }
                        Data.getAnalyst(userId, function(analyst){
                            if(curDay == day && tmk[k].startTime<=curTime&&tmk[k].endTime>curTime){
                                status = '直播中<i class="i-volume2"></i>';
                                statusCls = clsObj.red;
                                btn = '不可回看';
                                btnCls = clsObj.grey;
                                hideBtn = ' style="display:none;"';
                            }else if(curDay > day || (curDay == day && tmk[k].startTime<=curTime && tmk[k].endTime<curTime)){
                                status = '已结束';
                                statusCls = clsObj.grey;
                                btn = '不可回看';
                                btnCls = clsObj.grey;
                                hideBtn = ' style="display:none;"';
                            }else{
                                status = '即将开始';
                                statusCls = clsObj.orange;
                                btn = '订阅';
                                btnCls = clsObj.blue;
                                hideBtn = 'style="display:none;"';
                            }
                            courseDataHtml.push(Syllabus.formatHtml('syllabusData',
                                courseObj.title,
                                dateStr,
                                tmk[k].startTime,
                                tmk[k].endTime,
                                courseType[courseObj.courseType],
                                status,
                                analyst && analyst.avatar,
                                courseObj.lecturer,
                                statusCls,
                                btn,
                                btnCls,
                                courseObj.lecturerId,
                                hideBtn,
                                (courseObj.context||'&nbsp')
                            ).replace('/theme2/img/any.png',(analyst && analyst.avatar)));
                            courseDataHtml.push('<div class="blk7 blke3e3ea"></div>');
                        });
                    }
                }
            }
            return false;
        });
        $('#syllabusList').empty().html(courseDataHtml.join(''));
        Subscribe.setSubscribeData('#syllabusList .item-cell .btn-op');
        Subscribe.setSubscribeTypeAttr('#syllabusList .item-cell .btn-op');
    });
};

/**
 * 设置事件
 */
Syllabus.setEvent = function(){
    /**返回房间*/
    $("#back_chat").bind("click", Container.back);
    /**
     * 课程表切换
     */
    $('#syllabusDayTitle').on('click', 'li', function(){
        $('#syllabusDayTitle li').removeClass('active');
        $(this).addClass('active');
        Syllabus.setSyllabusList($(this).attr('day'));
    });
    /**
     * 老师订阅
     */
    $('#chat_subscribe').bind('click', function(){
        Subscribe.load();
    });
    /**
     * 老师简介
     */
    $('#syllabusList').on('click', '.item-cell .item-bd .avatar-info', function(){
        Analyst.userNo = $(this).attr('userNo');
        Analyst.subscribeStr = $(this).parent().next().find('a').attr('subscribed') == 'true' ? '已订阅' : '订阅';
        Analyst.load();
        return false;
    });
    /**
     * 订阅
     */
    $('#syllabusList').on('click', '.item-cell .btn-op a.btnSubscribe', function(){
        var $this = $(this), id = '', types = $this.attr('type').split(',');
        if(!$this.hasClass('btn-grey')) {//已结束的则不能订阅，只能到老师列表中订阅
            $this.addClass('clicked');
            var typeLen = types.length;
            var analystArr = [];
            var currAnalyst = $this.attr('analystId');
            $('#syllabusList .item-cell .btn-op a.btnSubscribe').each(function () {
                if ($(this).attr('subscribed') == 'true') {
                    analystArr.push($(this).attr('analystId'));
                }
            });
            var idx = $.inArray(currAnalyst, analystArr);
            if ($this.attr('subscribed') == 'true' && idx > -1) {
                analystArr.splice(idx, 1);//如果点击已订阅，则删除当前订阅的老师
                $this.removeClass('btn-green');
                $this.addClass('btn-blue');
                $this.removeAttr('subscribed');
                $this.html('订阅')
            } else {
                analystArr.push(currAnalyst);//未订阅的，则加入到订阅列表
                $this.removeClass('btn-blue');
                $this.addClass('btn-green');
                $this.attr('subscribed','true');
                $this.html('<i class="i-selected"></i>已订阅');
            }
            $.each(types, function (k, v) {
                if (v == 'live_reminder') {
                    id = $this.attr('lrid');
                } else if (v == 'shout_single_strategy') {
                    id = $this.attr('ssid');
                } else if (v == 'trading_strategy') {
                    id = $this.attr('tsid');
                }
                Subscribe.setSubscribe($this, id, v, analystArr, k == (typeLen - 1));
            });
        }
        return false;
    });
};

