/**
 * 直播间前台工具类
 * author Dick.guo
 *
 * Theme      : 主题
 * SimpleRoom : 新手房间
 * RedPacket  : 红包活动
 */
var indexTool ={
    /**
     * 从本地存储设置、获取布尔标识
     * @param attr
     * @param [val]
     * @returns {*}
     */
    store : function(attr, val){
        var storeObj = LoginAuto.get();
        var result = null;
        if(arguments.length == 1){
            result = storeObj && storeObj[attr];
        }else{
            if(storeObj){
                storeObj[attr] = val;
                LoginAuto.set(storeObj);
                result = val;
            }
        }
        return result;
    },

    /**
     * 主题
     */
    Theme : {

        /**
         * 切换主题
         * @param theme
         * @param isSave
         */
        setTheme : function(theme, isSave){
            theme = theme || "";
            var themes = null;
            if($("#panel_theme").attr("ismin") == "true"){
                themes = {"pm_darkblue" : "/pm/theme1/css/darkblue.min.css"}; //pm_def
            }else{
                themes = {"pm_darkblue" : "/pm/theme1/css/darkblue.css"}; //pm_def
            }
            if(themes.hasOwnProperty(theme)){
                LazyLoad.css(themes[theme], function(theme){
                    $("#panel_theme .sebox.on").removeClass("on");
                    $("#panel_theme .sk_item[theme='" + theme + "'] .sebox").addClass("on");
                    $("head link[href='" + themes[theme] + "']").attr("theme", theme);
                }, theme);
            }else{
                $("#panel_theme .sebox.on").removeClass("on");
                $("#panel_theme .sk_item[theme='pm_def'] .sebox").addClass("on");
                $("head link[theme]").remove();
            }
            if(isSave && common.isValid(indexJS.userInfo.userId) && indexJS.userInfo.isLogin) {
                var themeObj = {'theme': 'theme1', 'style': theme || "pm_def"};
                var params = {defTemplate: JSON.stringify(themeObj)};
                common.getJson('/studio/setThemeStyle', {data: JSON.stringify(params)}, function (result) {});
            }
        }
    },

    /**
     * 新手房间
     */
    SimpleRoom : {
        countdown : {time : 10, id : 0},

        /**
         * 初始化
         */
        init : function(){
            var rootType = $("#roomInfoId").attr("rt");
            if(!indexJS.userInfo.isLogin && rootType != "simple"){
                //未登录用户进入非新手房间：曾经已看3分钟，直接弹出。否则3分钟之后弹出提示框。
                var lgt = $('#roomInfoId').attr("lgt");//后台控制登录弹框时间
                if(/\d+(\.\d+)?/.test(lgt)) {
                    lgt = parseFloat(lgt);
                    if(indexTool.store("simpleTip")){
                        this.showSimpleTip(true, lgt);
                    }else{
                        window.setTimeout(function(){
                            indexTool.store("simpleTip", true);
                            indexTool.SimpleRoom.showSimpleTip(true, lgt);
                        }, lgt * 60000);
                    }
                }
            }else if(rootType == "simple"){ //新手房间引导
                //隐藏直播精华
                $(".mod_main .main_tabnav a[t='chat']").trigger("click");
                $(".mod_main .main_tabnav a[t='livepride'], .mod_main .tabcont .main_tab[t='livepride']").hide();
                if(!indexJS.userInfo.isLogin){
                    var today0 = new Date(indexJS.serverTime);
                    today0 = new Date(today0.getFullYear(), today0.getMonth(), today0.getDate()).getTime();
                    var lastGuideTipTime = indexTool.store("guideTipTime");
                    if(!lastGuideTipTime || today0 > lastGuideTipTime){
                        this.showSimpleGuideTip("start");
                    }else{
                        this.showSimpleGuide(true);
                    }
                }
            }
        },

        /**
         * 显示新手房间提示
         * @param [isSetEvent]
         * @param [time]
         */
        showSimpleTip : function(isSetEvent, time){
            if(isSetEvent){
                $("#pop_stTime").html(time || 3);

                $("#pop_simpleTip .enteritem:first a").bind("click", function(){
                    $("#login_a").trigger("click", {closeable : false});
                });

                $("#pop_simpleTip .enteritem.newbie a").bind("click", function(){
                    $("#roomList_panel>a[rt='simple']:first").trigger("click");
                });
            }
            //倒计时提示，切换宣传片，倒计时
            $("#pop_stCountdown").hide();
            videos.player.play("type=blws&vid=28c30edf38841e1603a2f98ae61545fb_2", "在线金道贵金属实盘直播室");
            this.simpleTipCountdown();
            $(".popup_box").hide();
            common.openPopup('.blackbg,#pop_simpleTip');
        },

        /**
         * 新手跳转提示倒计时
         */
        simpleTipCountdown : function(){
            window.setTimeout(function(){
                indexTool.SimpleRoom.countdown = {time : 10, id:null};
                $("#pop_stCountdown span").html(indexTool.SimpleRoom.countdown.time);
                $("#pop_stCountdown").show();
                indexTool.SimpleRoom.countdown.id = window.setInterval(function(){
                    var tickObj = indexTool.SimpleRoom.countdown;
                    tickObj.time--;
                    if(tickObj.time > 0){
                        $("#pop_stCountdown span").html(indexTool.SimpleRoom.countdown.time);
                    }else{
                        window.clearInterval(indexTool.SimpleRoom.countdown.id);
                        indexTool.SimpleRoom.countdown.id = 0;
                        $("#roomList_panel>a[rt='simple']:first").trigger("click");
                    }
                }, 1000);
            }, 107000);
        },

        /**
         * 显示新手场引导
         * @param [isSetEvent]
         */
        showSimpleGuide : function(isSetEvent){
            if(isSetEvent){
                //提示跳转
                $("#pop_simpleGuide .newbie_course li").bind("click", function(){
                    $("#pop_simpleGuide").hide();
                    var videoType = $(this).attr("vt");
                    if(videoType){
                        $("#teachVideoId a[t='" + videoType + "']").trigger("click", [videosTeach.playTeachByUrlFunc, {url : $(this).attr("url"), title : $(this).text()}]);
                    }
                    if($(this).attr("t") == "connCs"){
                        $(".mod_infotab .tabnav .myaid").trigger("click");
                    }
                });
            }
            common.openPopup('#pop_simpleGuide');
        },

        /**
         * 显示新手步骤提示
         * @param step
         */
        showSimpleGuideTip : function(step){
            if(step == "start"){
                $("#pop_guideBg,#pop_guide").show();
                $("#pop_guide .jumpbtn").bind("click", function(){
                    indexTool.SimpleRoom.showSimpleGuideTip($(this).attr("step"));
                });
                $("#pop_guideLogin").bind("click", function(){
                    $("#pop_guideBg,#pop_guide").hide();
                    $("#login_a").trigger("click");
                });
                $("#pop_guideReg").bind("click", function(){
                    $("#pop_guideBg,#pop_guide").hide();
                    $("#register_a").trigger("click");
                });
                indexTool.SimpleRoom.showSimpleGuideTip(-1);
                indexTool.store("guideTipTime", indexJS.serverTime);
            }else if(step == "end"){
                $("#pop_guideBg,#pop_guide").hide();
                indexTool.SimpleRoom.showSimpleGuide(true);
            }else{
                $("#pop_guide .n_guide").each(function(index){
                    if(index - 1 != step){
                        $(this).hide();
                    }else{
                        $(this).show();
                    }
                });
            }
        }
    },

    /**
     * 红包活动
     */
    RedPacket : {
        /**配置信息*/
        config : {
            init : false,   //初始化
            cycleTime : 300000,  //红包周期
            stayTime  : 5000,   //红包停留时间
            startTime : 30600000, //8:30
            endTime : 84600000,   //23:30
            courseTime : -1,      //课程时间 -2没有课程、-1未初始化、其他当前课程或者最近课程安排所在日期的最后1毫秒
            analysts : [
                /*08:30*/ {start:30600000, userId:"tonylee", userName:"李呱呱", wechat:"lee_24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/1_liguagua.png"},
                /*09:31*/ {start:34200001, userId:"tracey_jiang", userName:"陈丞",  wechat:"chan24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/2_chencheng.png"},
                /*11:31*/ {start:41400001, userId:"joe_chung", userName:"钟文耀", wechat:"chung24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/3_zhongwenyao.png"},
                /*13:31*/ {start:48600001, userId:"joe_zhuang", userName:"庄蓝玉", wechat:"zhuang24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/4_zhuanglanyu.png"},
                /*15:31*/ {start:55800001, userId:"dan_yeh", userName:"叶航",  wechat:"yehang24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/5_yehang.png"},
                /*17:31*/ {start:63000001, userId:"dusan_kao", userName:"高登",  wechat:"kao_24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/6_gaodeng.png"},
                /*19:31*/ {start:70200001, userId:"eric_liu", userName:"刘策",  wechat:"liu_gw24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/7_liuce.png"},
                /*21:31*/ {start:77400001, userId:"buck_chen", userName:"陈铎",  wechat:"chen_gw24k", wechatImg:"https://chatfiles.kgold852.com/upload/pic/wechat/8_chendou.png"}
            ], //23:30*/

            redPacketPopFlag : true, //红包弹出标记
            miniClose : false, //mini窗关闭标识，手动关闭后，当次不再弹出
            opened : false, //是否已经点击抢红包标记

            times : 0,          //次数
            minutes : 0,        //分钟数
            seconds : 0,        //秒数
            timesLabel : "--",          //次数
            minutesLabel : "--",        //分钟数
            secondsLabel : "--",        //秒数
            redPacketPeriods : 0 //红包期数，为0时表示非抢红包时间，其他为红包的期数
        },

        /**
         * 初始化
         */
        init : function(){
            this.config.redPacketPopFlag = indexTool.store("redPacketPopFlag") !== false;
            this.setEvent();
            this.config.init = true;
        },

        /**
         * 绑定事件
         */
        setEvent : function(){
            //红包视图-顶部
            $("#redPacket_header").bind("view", function(){
                var config = indexTool.RedPacket.config;
                $(this).find("[rp]").each(function(){
                    $(this).text(config[$(this).attr("rp")]);
                });
            });

            //红包视图-右侧小窗
            $("#redPacket_mini").bind("view", function(){
                var config = indexTool.RedPacket.config;
                if(config.minutes == 0 && config.times > 0){
                    $("#redPacket_mini [rp='timesLabel']").text(config.timesLabel);
                    if(indexTool.RedPacket.isStayTime()){
                        $("#redPacket_miniWait").hide();
                        $("#redPacket_miniRob").show();
                    }else if(indexTool.RedPacket.isCountDownTime()){
                        $("#redPacket_mini [rp='seconds']").attr("class", "t" + config.seconds).text(config.seconds);
                        $("#redPacket_miniWait").show();
                        $("#redPacket_miniRob").hide();
                    }else{
                        //关闭
                        $("#redPacket_mini").hide();
                    }
                }else{
                    //关闭
                    $("#redPacket_mini").hide();
                }
            });

            //红包视图-中奖页（{money:Number, wechatImg:String}）
            $("#redPacket_resYes").bind("view", function(e, data){
                $("#redPacket_resYes [rp='money']").html(data.money);
                $("#redPacket_resYes [rp='wechatImg']").attr("src", data.wechatImg);
            });

            //红包视图-未中奖页（{wechatImg:String}）
            $("#redPacket_resNo").bind("view", function(e, data){
                $("#redPacket_resNo [rp='wechatImg']").attr("src", data.wechatImg);
            });

            //红包视图-主界面
            $("#redPacket_normal").bind("view", function(){
                var config = indexTool.RedPacket.config;
                $(this).find("[rp]").each(function(){
                    $(this).text(config[$(this).attr("rp")]);
                });
                if(indexTool.RedPacket.isStayTime()){
                    $("#redPacket_wait").hide();
                    $("#redPacket_rob").show();
                }else{
                    $("#redPacket_wait").show();
                    $("#redPacket_rob").hide();
                }
            });

            //关闭
            $('.redbag_pop .pop_close').click(function(){
                $(this).parent().parent().hide();
                if($(this).parent().parent().hasClass('pop2')){
                    $('.redbag_pop_box').hide();
                }
            });

            //关闭-mini窗
            $("#redPacket_mini .pop_close").bind("click", function(){
                var config = indexTool.RedPacket.config;
                var loc_popFlag = !$("#redPacket_popFlag").prop("checked");
                if(config.redPacketPopFlag != loc_popFlag){
                    config.redPacketPopFlag = loc_popFlag;
                    indexTool.store("redPacketPopFlag", loc_popFlag);
                }
                config.miniClose = true;
            });

            //关闭-normal窗
            $("#redPacket_normal .pop_close").bind("click", function(){
                if(!indexTool.RedPacket.config.miniClose && (indexTool.RedPacket.isStayTime() || indexTool.RedPacket.isCountDownTime())){
                    indexTool.RedPacket.config.miniClose = true;
                }
            });


            //免费注册
            $("#redPacket_regBtn, #redPacket_regBtn2").bind("click", function(){
                $("#register_a").trigger("click");
            });

            //登录
            $("#redPacket_loginBtn").bind("click", function(){
                $("#login_a").trigger("click");
            });

            //抢红包打开
            $('#redPacket_header').bind("click", function(){
                if(!indexTool.RedPacket.config.redPacketPopFlag){
                    indexTool.RedPacket.config.redPacketPopFlag = true;
                    indexTool.store("redPacketPopFlag", true);
                }
                if(indexJS.userInfo.isLogin){
                    indexTool.RedPacket.showPop("normal");
                }else{
                    indexTool.RedPacket.showPop("noLogin");
                }
            });

            //抢红包
            $("#redPacket_miniRob, #redPacket_rob").bind("click", function(){
                if(!indexTool.RedPacket.config.opened) {
                    indexTool.RedPacket.config.opened = true;
                    indexTool.RedPacket.rob();
                }
            });
        },

        /**显示视图*/
        view : function(){
            var config = indexTool.RedPacket.config;
            $("#redPacket_header").trigger("view");
            if($("#redPacket_normal").is(":visible")){
                $("#redPacket_normal").trigger("view");
            }else if($("#redPacket_mini").is(":visible")){
                $("#redPacket_mini").trigger("view");
            }else if(config.redPacketPopFlag && (indexTool.RedPacket.isStayTime() || indexTool.RedPacket.isCountDownTime())){
                if(!config.miniClose){
                    indexTool.RedPacket.showPop("mini");
                }
            }
        },

        /**显示弹窗*/
        showPop : function(type, arg){
            var $item = null;
            switch (type){
                case "noLogin":
                    $item = $("#redPacket_noLogin");
                    if(!$item.is(":visible")){
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css({'opacity':0,'left':'30%','top':'30%'}).show().animate({opacity:1,left:'50%',top:'50%'},300);
                    }
                    break;

                case "mini":
                    $item = $('#redPacket_mini');
                    if(!$item.is(":visible")){
                        $item.trigger("view");
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.show();
                        $('#redPacket_mini2').css({'opacity':0,'top':'-10%'}).show().animate({opacity:1,top:0},300);
                    }
                    break;

                case "normal":
                    $item = $('#redPacket_normal');
                    if(!$item.is(":visible")){
                        $item.trigger("view");
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css({'opacity':0,'left':'30%','top':'30%'}).show().animate({opacity:1,left:'50%',top:'50%'},300);
                    }
                    break;

                case "resNo":
                    $item = $('#redPacket_resNo');
                    if(!$item.is(":visible")){
                        $item.trigger("view", arg);
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css('opacity',0).show().animate({opacity:1},300);
                    }
                    break;

                case "resYes":
                    $item = $('#redPacket_resYes');
                    if(!$item.is(":visible")){
                        $item.trigger("view", arg);
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css('opacity',0).show().animate({opacity:1},300);
                    }
                    break;
            }
        },

        /**
         * 定时器
         */
        tick : function(){
            if(!this.config.init){
                return;
            }
            var config = this.config;
            var time = indexJS.serverTime;
            var today = new Date(time);
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            time -= today.getTime();
            if(indexTool.RedPacket.isStayTime()){ //当前是红包时间，延迟5秒不倒计时
                if(time - config.redPacketPeriods >= config.stayTime){
                    config.miniClose = false;
                    config.redPacketPeriods = 0;
                }
            }
            this.isRedPacketTime(function(isOK){
                if(isOK){
                    config.times = Math.ceil((time - config.startTime) / config.cycleTime);
                    config.timesLabel = config.times;
                    var countDown = config.cycleTime - ((time - config.startTime) % config.cycleTime);
                    config.minutes = Math.floor(countDown / 60000);
                    config.seconds = Math.floor(countDown % 60000 / 1000);
                    if(config.minutes == 0 && config.seconds == 0){
                        //抢红包开始，记录红包期数
                        config.redPacketPeriods = time;
                        config.minutes = Math.floor(config.cycleTime / 60000);
                        config.seconds = Math.floor(config.cycleTime % 60000 / 1000);
                    }
                    config.minutesLabel = (config.minutes < 10 ? "0" : "") + config.minutes;
                    config.secondsLabel = (config.seconds < 10 ? "0" : "") + config.seconds;
                }else{
                    config.times = 0;
                    config.timesLabel = "--";
                    config.minutes = -1;
                    config.minutesLabel = "--";
                    config.seconds = -1;
                    config.minutesLabel = "--";
                    config.redPacketPeriods = 0;
                }
                indexTool.RedPacket.view();
            });
        },

        /**
         * 初始化课程时间
         */
        initCourseTime : function(callback){
            var config = this.config;
            if(config.courseTime == -2 || (config.courseTime != -1 && config.courseTime > indexJS.serverTime)){
                callback(config.courseTime);
                return;
            }
            $.getJSON(indexJS.apiUrl + '/common/getCourse', {platform: "web24k", 'flag': 'S'}, function (data) {
                if (data.result == 0) {
                    if(!data.data || data.data.length == 0){
                        indexTool.RedPacket.config.courseTime = -2;
                    }else{
                        indexTool.RedPacket.config.courseTime = data.data[0].date + 86400000 - 1;
                    }
                    callback(indexTool.RedPacket.config.courseTime);
                }
            });
        },

        /**
         * 判断是都延迟抢红包时间
         */
        isStayTime : function(){
            return indexTool.RedPacket.config.redPacketPeriods != 0;
        },

        /**
         * 判断是否5秒倒计时时间
         */
        isCountDownTime : function(){
            return indexTool.RedPacket.config.minutes == 0 && indexTool.RedPacket.config.seconds <= 5;
        },

        /**
         * 是否红包时间
         */
        isRedPacketTime : function(callback){
            var today = new Date(indexJS.serverTime);
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            var time = indexJS.serverTime - today;
            if(time <= this.config.startTime || time > this.config.endTime){
                callback(false);
                return;
            }
            this.initCourseTime(function(courseTime){
                callback(today + 86400000 - 1 == courseTime);
            });
        },

        /**
         * 抢红包
         */
        rob : function(){
            var config = indexTool.RedPacket.config;
            if(!indexJS.userInfo.isLogin){
                this.showPop("noLogin");
            }else if(config.redPacketPeriods == 0){
                box.showMsg("红包已过期!");
            }else{
                common.getJson("/studio/rob", {t:indexJS.serverTime}, function(data){
                    if(data.result == 0){
                        indexTool.RedPacket.config.redPacketPeriods = 0;

                        var analyst = indexTool.RedPacket.getAnalyst();
                        if(data.money > 0){
                            indexTool.RedPacket.showPop("resYes", {money: data.money, wechatImg: analyst.wechatImg});
                        }else{
                            indexTool.RedPacket.showPop("resNo", {wechatImg: analyst.wechatImg});
                        }
                    }else{
                        //服务器时间异常，重新同步服务器时间
                        chat.socket.emit('serverTime');
                        box.showMsg(data.msg || "红包信息异常!");
                    }
                    indexTool.RedPacket.config.opened = false;
                });
            }
        },

        /**
         * 获取分析是信息
         */
        getAnalyst : function(){
            var today = new Date(indexJS.serverTime);
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            var time = indexJS.serverTime - today;
            var analysts = indexTool.RedPacket.config.analysts;
            var analystTmp = null;
            for(var i = analysts.length - 1; i > 0; i--){
                analystTmp = analysts[i];
                if(analystTmp.start <= time){
                    break;
                }
            }
            return analystTmp;
        }
    }
};
