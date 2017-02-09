/**
 * 直播间手机版工具类
 * author Dick.guo
 *
 * OnlineCS : 在线客服
 */
var Tool = {

    /**
     * 在线客服
     */
    OnlineCS : {
        /**
         * 联系在线客服
         * @param platform pm、fx、hx
         * @param type     qq、live800
         * @param device   pc、mb
         */
        connect : function(platform, type, device){
            device = device && "pc";
            switch(platform){
                case "pm":
                    this.connect2PM(type, device);
                    break;

                case "fx":
                    this.connect2FX(type, device);
                    break;

                case "hx":
                    this.connect2HX(type, device);
                    break;
            }
        },

        /**
         * 获取窗口特征
         * @param device
         */
        getWindowFeatures : function(device){
            return device == "pc" ? "height=520,width=740,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no" : "";
        },

        /**
         * PM联系在线客服
         * @param type
         * @param device
         */
        connect2PM : function(type, device){
            switch(type){
                case "qq":
                    window.open("http://wpa.b.qq.com/cgi/wpa.php?ln=2&uin=800018282", "WindowPMChatQQ", this.getWindowFeatures(device));
                    break;

                case "live800":
                    window.open("https://www.onlineservice-hk.com/k800/chatClient/chatbox.jsp?companyID=209&s=1",'WindowPMChatLive800', this.getWindowFeatures(device));
                    break;
            }
        },

        /**
         * FX联系在线客服
         * @param type
         * @param device
         */
        connect2FX : function(type, device){
            switch(type){
                case "qq":
                    window.open("http://wpa.b.qq.com/cgi/wpa.php?ln=2&uin=800018886", "WindowFXChatQQ", this.getWindowFeatures(device));
                    break;

                case "live800":
                    window.open("http://onlinecustomer-service.gwghk.com/live800/chatClient/chatbox.jsp?companyID=283&enterurl=http%3A%2F%2Fwww%2Egwfx%2Ecom%2F&tm=1355377642406",'WindowFXChatLive800', this.getWindowFeatures(device));
                    break;
            }

        },

        /**
         * HX联系在线客服
         * @param type
         * @param device
         */
        connect2HX : function(type, device){
            switch(type){
                case "qq":
                    window.open("http://crm2.qq.com/page/portalpage/wpa.php?uin=800025930&cref=&ref=&f=1&ty=1&ap=&as=&utm_source=hxstudio&utm_medium=yy&utm_content=TOP&utm_campaign=qqzx_hx", "WindowHXChatQQ", this.getWindowFeatures(device));
                    break;
            }
        }
    },
    /**
     * 课程表定时器
     */
    courseTick : {
        //当前课程或下次课程
        course : {courseId:'',courseType:0,courseTypeName:'',day:0,endTime:'',isNext:false,lecturer:'',lecturerId:'',startTime:'',status:0,studioLink:null,title:'',courseName:''},
        //下次校验时间
        nextTickTime : 0,
        roomId : null,
        //初始化或者重新校验
        tick : function(){
            if(Data.serverTime.time <= this.nextTickTime && this.roomId == Data.userInfo.groupId){
                return;
            }
            Data.getSyllabus(function(syllabusData){
                var currCourse = Util.getSyllabusPlan(syllabusData, Data.serverTime.time);
                if(!currCourse){
                    return;
                }
                var nextTime = 0;
                var timezoneOffset = new Date().getTimezoneOffset() * 60000;
                if(currCourse.isNext){ //下次课程开始作为下一次tick时间
                    //"17:51" eval("17*60+51")*60*1000
                    nextTime = eval(currCourse.startTime.replace(":", "*60+"))*60000 + Data.serverTime.time - Data.serverTime.time % 86400000 + timezoneOffset;
                }else{//本次课程结束后作为下一次tick时间
                    nextTime = eval(currCourse.endTime.replace(":", "*60+"))*60000 + Data.serverTime.time - Data.serverTime.time % 86400000 + timezoneOffset + 60000;
                }
                if(this.nextTickTime != nextTime) {
                    var courseType = {'0': '文字直播', '1': '视频直播', '2': 'oneTV直播'};
                    var courseId = Util.formatDate(Data.serverTime.time, 'yyyy-MM-dd') + '_' + currCourse.startTime + '_' + Data.userInfo.groupId;
                    this.course = currCourse;
                    this.course.courseId = courseId;
                    if(Util.isNotBlank(currCourse.title) && Util.isNotBlank(currCourse.lecturer) && Util.isNotBlank(currCourse.courseType)) {
                        this.course.courseTypeName = courseType[currCourse.courseType];
                        this.course.courseName = currCourse.title + '_' + currCourse.lecturer + '_' + courseType[currCourse.courseType];
                    }
                    this.nextTickTime = nextTime;
                    this.roomId = Data.userInfo.groupId;
                }
            });
        }
    }
};


/**
 * 可编辑div焦点定位通用方法
 * @returns {$.fn}
 */
$.fn.focusEnd = function() {
    $(this).focus();
    var tmp = $('<span/>').appendTo($(this)),
        node = tmp.get(0),
        range = null,
        sel = null;
    if (document.selection) {
        range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        range = document.createRange();
        range.selectNode(node);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    tmp.remove();
    return this;
};