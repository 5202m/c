/**
 * 直播间手机版课程安排JS
 * author Jade.zhu
 */
var Syllabus = new Container({
    panel : $("#page_syllabus"),
    url : "/pm/theme2/template/syllabus.html",
    onLoad : function(){
        Data.getAnalyst('', function() {
            Syllabus.setSyllabusTitle();
            Syllabus.setEvent();
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
    var courseDataHtml = [] ,curDay=new Date(Data.serverTime).getDay(), curTime = Util.formatDate(new Date(Data.serverTime),'HH:mm');
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
                            }else if(curDay > day || tmk[k].startTime<=curTime && tmk[k].endTime<curTime){
                                status = '已结束';
                                statusCls = clsObj.grey;
                                btn = '不可回看';
                                btnCls = clsObj.grey;
                            }else{
                                status = '即将开始';
                                statusCls = clsObj.orange;
                                btn = '订阅';
                                btnCls = clsObj.blue;
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
                                btnCls
                            ));
                            courseDataHtml.push('<div class="blk7 blke3e3ea"></div>');
                        });
                    }
                }
            }
            return false;
        });
        $('#syllabusList').empty().html(courseDataHtml.join(''));
    });
};

/**
 * 设置事件
 */
Syllabus.setEvent = function(){
    $('body').addClass('bgfff').removeClass('bgf2f2f2');
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
};