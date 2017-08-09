/**
 * 直播间手机版工具类
 * author Dick.guo
 *
 * OnlineCS : 在线客服
 */
var Tool = {
    htmlBody: $('html, body'),
    /**
     * 在线客服
     */
    OnlineCS: {
        /**
         * 联系在线客服
         * @param platform pm、fx、hx
         * @param type     qq、live800
         * @param device   pc、mb
         */
        connect: function(platform, type, device) {
            device = device && "pc";
            switch (platform) {
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
        getWindowFeatures: function(device) {
            return device == "pc" ? "height=520,width=740,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no" : "";
        },

        /**
         * PM联系在线客服
         * @param type
         * @param device
         */
        connect2PM: function(type, device) {
            switch (type) {
                case "qq":
                    window.open("http://wpa.b.qq.com/cgi/wpa.php?ln=2&uin=800018282", "WindowPMChatQQ", this.getWindowFeatures(device));
                    break;

                case "live800":
                    window.open("https://www.onlineservice-hk.com/k800/chatClient/chatbox.jsp?companyID=209&s=1", 'WindowPMChatLive800', this.getWindowFeatures(device));
                    break;
            }
        },

        /**
         * FX联系在线客服
         * @param type
         * @param device
         */
        connect2FX: function(type, device) {
            switch (type) {
                case "qq":
                    window.open("http://wpa.b.qq.com/cgi/wpa.php?ln=2&uin=800018886", "WindowFXChatQQ", this.getWindowFeatures(device));
                    break;

                case "live800":
                    window.open("http://onlinecustomer-service.gwghk.com/live800/chatClient/chatbox.jsp?companyID=283&enterurl=http%3A%2F%2Fwww%2Egwfx%2Ecom%2F&tm=1355377642406", 'WindowFXChatLive800', this.getWindowFeatures(device));
                    break;
            }

        },

        /**
         * HX联系在线客服
         * @param type
         * @param device
         */
        connect2HX: function(type, device) {
            switch (type) {
                case "qq":
                    window.open("http://crm2.qq.com/page/portalpage/wpa.php?uin=800025930&cref=&ref=&f=1&ty=1&ap=&as=&utm_source=hxstudio&utm_medium=yy&utm_content=TOP&utm_campaign=qqzx_hx", "WindowHXChatQQ", this.getWindowFeatures(device));
                    break;
            }
        }
    },
    /**
     * 课程表定时器
     */
    courseTick: {
        //当前课程或下次课程
        course: { courseId: '', courseType: 0, courseTypeName: '', day: 0, endTime: '', isNext: false, lecturer: '', lecturerId: '', startTime: '', status: 0, studioLink: null, title: '', courseName: '' },
        //下次校验时间
        nextTickTime: 0,
        roomId: null,
        //初始化或者重新校验
        tick: function() {
            if (Data.serverTime.time <= this.nextTickTime && this.roomId == Data.userInfo.groupId) {
                return;
            }
            Data.getSyllabus(function(syllabusData) {
                var currCourse = Util.getSyllabusPlan(syllabusData, Data.serverTime.time);
                if (!currCourse) {
                    return;
                }
                var nextTime = 0;
                var timezoneOffset = new Date().getTimezoneOffset() * 60000;
                if (currCourse.isNext) { //下次课程开始作为下一次tick时间
                    //"17:51" eval("17*60+51")*60*1000
                    nextTime = eval(currCourse.startTime.replace(":", "*60+")) * 60000 + Data.serverTime.time - Data.serverTime.time % 86400000 + timezoneOffset;
                } else { //本次课程结束后作为下一次tick时间
                    nextTime = eval(currCourse.endTime.replace(":", "*60+")) * 60000 + Data.serverTime.time - Data.serverTime.time % 86400000 + timezoneOffset + 60000;
                }
                if (this.nextTickTime != nextTime) {
                    var courseType = { '0': '文字直播', '1': '视频直播', '2': 'oneTV直播' };
                    var courseId = Util.formatDate(Data.serverTime.time, 'yyyy-MM-dd') + '_' + currCourse.startTime + '_' + Data.userInfo.groupId;
                    this.course = currCourse;
                    this.course.courseId = courseId;
                    if (Util.isNotBlank(currCourse.title) && Util.isNotBlank(currCourse.lecturer) && Util.isNotBlank(currCourse.courseType)) {
                        this.course.courseTypeName = courseType[currCourse.courseType];
                        this.course.courseName = currCourse.title + '_' + currCourse.lecturer + '_' + courseType[currCourse.courseType];
                    }
                    this.nextTickTime = nextTime;
                    this.roomId = Data.userInfo.groupId;
                }
            });
        }
    },
    /**
     * 获取行情报价
     */
    getAllMarketPrice: {
        pkMarketSocket: null, //定义标价socket
        init: function() {
            var url = "wss://kdata.gwfx.com:7087/websocket.do",
                data = "service=HqDataWebSocketService&method=pushMarketprice&symbol=XAGUSD|XAUUSD|USDX|CLWTI&dataType=simpleMarketPrice",
                httpUrl = "https://kdata.gwfx.com:7099/gateway.do?service=HqDataService&method=getMarkrtPriceDataFromCache",
                selfOptions = null;
            Tool.getAllMarketPrice.getAllMarketpriceIndex(url, data, httpUrl, selfOptions);
            //底部信息轮播
            var curIndex = 0;
            var timeInterval = 3000;
            var _obj = $(".infos-play li");
            setInterval(changeinfos, timeInterval);

            function changeinfos() {
                if (curIndex == _obj.length - 1) {
                    curIndex = 0;
                } else {
                    curIndex += 1;
                }
                _obj.eq(curIndex).fadeIn().siblings().fadeOut();
            }
        },
        /**
         * 获取行情报价入口
         * @param wsUrl
         * @param wsData
         * @param httpUrl
         * @param selfOptions
         */
        getAllMarketpriceIndex: function(wsUrl, wsData, httpUrl, selfOptions) {
            try {
                if (!window.WebSocket) {
                    window.WebSocket = window.MozWebSocket;
                }
                if (window.WebSocket) {
                    if (!Tool.getAllMarketPrice.pkMarketSocket) {
                        Tool.getAllMarketPrice.pkMarketSocket = new ReconnectingWebSocket(wsUrl, null, { reconnectInterval: 3000 });
                        Tool.getAllMarketPrice.pkMarketSocket.onmessage = function(event) {
                            var retData = JSON.parse(event.data);
                            if ("OK" == retData.code) {
                                Tool.getAllMarketPrice.parseMarketpriceIndex(retData, selfOptions);
                            }
                        };
                        Tool.getAllMarketPrice.pkMarketSocket.onopen = function(event) {
                            if (Tool.getAllMarketPrice.pkMarketSocket.readyState == WebSocket.OPEN) {
                                Tool.getAllMarketPrice.pkMarketSocket.send(wsData);
                            }
                        };
                    } else {
                        if (Tool.getAllMarketPrice.pkMarketSocket.readyState == WebSocket.OPEN) {
                            Tool.getAllMarketPrice.pkMarketSocket.send(wsData);
                        }
                    }
                } else {
                    setInterval(function() {
                        Tool.getAllMarketPrice.getMarketpriceCrossDomainIndex(httpUrl, selfOptions)
                    }, 1000 * 2);
                }
            } catch (e) {
                console.log("get price has error!");
            }
        },
        /**
         * 获取行情报价请求
         * @param url
         * @param selfOptions
         */
        getMarketpriceCrossDomainIndex: function(url, selfOptions) {
            $.ajax({
                type: "GET",
                url: url,
                dataType: "jsonp",
                success: function(data) {
                    if ("OK" == data.code) {
                        Tool.getAllMarketPrice.parseMarketpriceIndex(data, selfOptions);
                    }
                },
                error: function() {}
            });
        },
        /**
         * 返回行情报价页面数据
         * @param data
         * @param selfOptions
         */
        parseMarketpriceIndex: function(data, selfOptions) {
            var _index_price_type = 2,
                symbol = '',
                deltaPrice = 0,
                deltaPercent = 0,
                price = 0;
            for (var i = 0; i < data.listResult.length; i++) {
                symbol = data.listResult[i].symbol;
                deltaPrice = data.listResult[i].deltaPrice;
                price = data.listResult[i].price;
                deltaPercent = data.listResult[i].deltaPercent;
                if (symbol == "XAGUSD" || symbol == "USDJPY") {
                    _index_price_type = 3;
                } else if (symbol == "EURUSD") {
                    _index_price_type = 3;
                } else {
                    _index_price_type = 2;
                }
                var priceDom = $("#price_" + symbol);
                priceDom.html(parseFloat(price).toFixed(_index_price_type));
                var percentDom = $("#deltaPercent_" + symbol);
                if (!selfOptions) {
                    var liDom = $("#li_" + symbol);
                    if (deltaPrice > 0) {
                        liDom.addClass("up");
                        liDom.find('.p1').children('i').removeClass('arrow-d-red').addClass('arrow-u-green');
                    } else {
                        liDom.removeClass("up");
                        liDom.find('.p1').children('i').removeClass('arrow-u-green').addClass('arrow-d-red');
                    }
                    percentDom.html(parseFloat(deltaPrice).toFixed(_index_price_type) + '(' + (deltaPercent * 100).toFixed(2) + "%)");
                } else {
                    var priceFormat = parseFloat(price).toFixed(_index_price_type);
                    priceFormat = priceFormat.toString().substring(0, priceFormat.indexOf('.')) + '<span>.' + priceFormat.toString().substring(priceFormat.indexOf('.') + 1) + '</span>';
                    priceDom.html(priceFormat + '<i changeCss="true"></i>');
                    var changeCssDom = $("#price_" + symbol + " i");
                    percentDom.text(deltaPrice + "  " + (deltaPercent * 100).toFixed(2) + "%");
                    if (deltaPrice > 0) {
                        if (changeCssDom.attr("changeCss") == "true") {
                            priceDom.removeClass(selfOptions.down);
                            percentDom.removeClass(selfOptions.down);
                            changeCssDom.removeClass(selfOptions.downCss).addClass(selfOptions.upCss);
                        }
                    } else {
                        if (changeCssDom.attr("changeCss") == "true") {
                            priceDom.addClass(selfOptions.down);
                            percentDom.addClass(selfOptions.down);
                            changeCssDom.removeClass(selfOptions.upCss).addClass(selfOptions.downCss);
                        }
                    }
                }
            }
        }
    },
    /**
     * 去看看-策略、喊单、挂单、晒单
     */
    gotoLook: function() {
        $('a[to="look"]').unbind('click');
        $('a[to="look"]').bind('click', function() {
            var t = $(this).attr('t'),
                _id = $(this).attr('_id');
            $('#chat_close').trigger('click');
            if (t == 'classNote') {
                Tool.htmlBody.animate({
                    scrollTop: $('div[dataid="' + _id + '"]').offset().top
                }, 500);
            } else if (t == 'showTrade') {
                ShowTrade.load();
                Tool.htmlBody.animate({
                    scrollTop: $('div[sid="' + _id + '"]').offset().top
                }, 500);
            }
        });
    },

    RedPacket: {
        /**配置信息*/
        config: {
            init: false, //初始化
            cycleTime: 300000, //红包周期5分钟
            stayTime: 5000, //红包停留时间5秒
            startTime: 30720000, //08:30
            endTime: 84600000, //23:30
            courseTime: -1, //课程时间 -3正在请求课程接口 -2没有课程、-1未初始化、其他当前课程或者最近课程安排所在日期的最后1毫秒
            analysts: [
                /*08:32*/
                {
                    start: 30720000,
                    userId: "lin_gw24k",
                    userName: "林意轩",
                    wechat: "lin_gw24k",
                    wechatImg: "/theme2/img/yx_lin.png"
                }
            ],
            redPacketPopFlag: true, //红包弹出标记
            miniClose: false, //mini窗关闭标识，手动关闭后，当次不再弹出
            opened: false, //是否已经点击抢红包标记
            times: 0, //次数
            minutes: 0, //分钟数
            seconds: 0, //秒数
            timesLabel: "--", //次数
            minutesLabel: "--", //分钟数
            secondsLabel: "--", //秒数
            redPacketPeriods: 0 //红包期数，为0时表示非抢红包时间，其他为红包的期数
        },

        setHC: function(c_name, value, expiredays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + expiredays);
            document.cookie = c_name + "=" + escape(value) +
                ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
        },

        getHC: function(c_name) {
            if (document.cookie.length > 0) {
                c_start = document.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) c_end = document.cookie.length
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        },

        /**
         * 初始化
         */
        init: function(userInfo, apiUrl) {
            this.config.userInfo = userInfo;
            this.config.apiUrl = apiUrl;
            this.config.redPacketPopFlag = Store.store("redPacketPopFlag") !== false;
            this.setEvent();
            this.config.init = true;
        },

        /**
         * 绑定事件
         */
        setEvent: function() {
            if (Tool.RedPacket.getHC('visits') == "") {
                Tool.RedPacket.setHC('visits', 1, 1);
                if (Data.userInfo.isLogin) {
                    Tool.RedPacket.showPop("normal");
                } else {
                    Tool.RedPacket.showPop("noLogin");
                }
            }
            //红包视图-顶部
            $("#redPacket_header").bind("view", function() {
                var config = Tool.RedPacket.config;
                $(this).find("[rp]").each(function() {
                    $(this).text(config[$(this).attr("rp")]);
                });
            });

            //红包视图-右侧小窗
            $("#redPacket_mini").bind("view", function() {
                var config = Tool.RedPacket.config;
                $("#redPacket_mini [rp='timesLabel']").text(config.timesLabel);
                if (Tool.RedPacket.isStayTime()) {
                    $("#redPacket_miniWait").hide();
                    $("#redPacket_miniRob").show();
                } else if (Tool.RedPacket.isCountDownTime()) {
                    $("#redPacket_mini [rp='seconds']").attr("class", "t" + config.seconds).text(config.seconds);
                    $("#redPacket_miniWait").show();
                    $("#redPacket_miniRob").hide();
                } else {
                    //未中奖结果
                    var analyst = Tool.RedPacket.getAnalyst();
                    Tool.RedPacket.showPop("resNo", { wechat: analyst.wechat, wechatImg: analyst.wechatImg });
                }
            });

            //红包视图-中奖页（{money:Number, wechatImg:String}）
            $("#redPacket_resYes").bind("view", function(e, data) {
                $("#redPacket_resYes [rp='money']").html(data.money);
                $("#redPacket_resYes [rp='wechat']").html(data.wechat);
                $("#redPacket_resYes [rp='wechatImg']").attr("src", data.wechatImg);
                $("#redPacket_resYes [rp='doubleMoney']").html(data.money * 2);
            });

            //红包视图-未中奖页（{wechatImg:String}）
            $("#redPacket_resNo").bind("view", function(e, data) {
                $("#redPacket_resNo [rp='wechatCode']").html(data.wechat);
                $("#redPacket_resNo [rp='wechatImg']").attr("src", data.wechatImg);
            });

            //红包视图-主界面
            $("#redPacket_normal").bind("view", function() {
                var config = Tool.RedPacket.config;
                $(this).find("[rp]").each(function() {
                    $(this).text(config[$(this).attr("rp")]);
                });
                if (Tool.RedPacket.isStayTime()) {
                    $("#redPacket_wait").hide();
                    $("#redPacket_rob").show();
                } else {
                    $("#redPacket_wait").show();
                    $("#redPacket_rob").hide();
                }
            });

            //下次不再提示
            $("#redPacket_popFlag").bind("click", function() {
                var config = Tool.RedPacket.config;
                var loc_popFlag = !$(this).prop("checked");
                if (config.redPacketPopFlag != loc_popFlag) {
                    config.redPacketPopFlag = loc_popFlag;
                    Store.store("redPacketPopFlag", loc_popFlag);
                }
            });

            //关闭
            $('.redbag_pop .pop_close a').click(function() {
                // studioMbPop.onHideTrigger();
                if ($(this).parent().parent().parent().hasClass('pop2')) {
                    $(this).parent().parent().parent().animate({ opacity: 0, bottom: 0 }, 300, function() {
                        $(this).hide()
                    });
                } else {
                    $(this).parent().parent().parent().animate({ opacity: 0, top: '30%' }, 300, function() {
                        $(this).hide()
                    });
                }
            });

            //关闭-mini窗
            $("#redPacket_mini .pop_close a").bind("click", function() {
                Tool.RedPacket.config.miniClose = true;
            });

            //关闭-normal窗
            $("#redPacket_normal .pop_close a").bind("click", function() {
                if (!Tool.RedPacket.config.miniClose && (Tool.RedPacket.isStayTime() || Tool.RedPacket.isCountDownTime())) {
                    Tool.RedPacket.config.miniClose = true;
                }
            });

            //抢红包打开
            $('#redPacket_header').bind("click", function() {
                var config = Tool.RedPacket.config;
                if (!config.redPacketPopFlag) {
                    config.redPacketPopFlag = true;
                    $("#redPacket_popFlag").prop("checked", false);
                    Store.store("redPacketPopFlag", true);
                }
                if (config.userInfo.isLogin) {
                    Tool.RedPacket.showPop("normal");
                } else {
                    Tool.RedPacket.showPop("noLogin");
                }
            });

            //抢红包
            $("#redPacket_rob,#redPacket_miniRob").bind("click", function() {
                if (!Tool.RedPacket.config.opened) {
                    Tool.RedPacket.config.opened = true;
                    Tool.RedPacket.rob();
                }
            });

            //登录
            $("#redPacket_loginBtn").bind("click", function() {
                $("#redPacket_noLogin").hide();
                Login.load();
            });

        },

        /**显示视图*/
        view: function() {
            var config = Tool.RedPacket.config;
            $("#redPacket_header").trigger("view");
            if ($("#redPacket_normal").is(":visible")) {
                $("#redPacket_normal").trigger("view");
            } else if ($("#redPacket_mini").is(":visible")) {
                $("#redPacket_mini").trigger("view");
            } else if (config.redPacketPopFlag && (Tool.RedPacket.isStayTime() || Tool.RedPacket.isCountDownTime())) {
                if (!config.miniClose && Tool.RedPacket.config.userInfo.isLogin) {
                    Tool.RedPacket.showPop("mini");
                }
            }
        },

        /**显示弹窗*/
        showPop: function(type, arg) {
            var $item = null;
            switch (type) {
                case "noLogin":
                    $item = $("#redPacket_noLogin");
                    if (!$item.is(":visible")) {
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css({ 'opacity': 0, 'left': '30%', 'top': '30%' }).show().animate({ opacity: 1, left: '50%', top: '50%' }, 300);
                    }
                    break;

                case "mini":
                    $item = $('#redPacket_mini');
                    if (!$item.is(":visible")) {
                        $item.trigger("view");
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.show();
                        $('#redPacket_mini2').css({ 'opacity': 0, 'top': '-10%' }).show().animate({ opacity: 1, top: 0 }, 300);
                    }
                    break;

                case "normal":
                    $item = $('#redPacket_normal');
                    if (!$item.is(":visible")) {
                        $item.trigger("view");
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css({ 'opacity': 0, 'left': '30%', 'top': '30%' }).show().animate({ opacity: 1, left: '50%', top: '50%' }, 300);
                    }
                    break;

                case "resNo":
                    $item = $('#redPacket_resNo');
                    if (!$item.is(":visible")) {
                        $item.trigger("view", arg);
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css('opacity', 0).show().animate({ opacity: 1 }, 300);
                    }
                    break;

                case "resYes":
                    $item = $('#redPacket_resYes');
                    if (!$item.is(":visible")) {
                        $item.trigger("view", arg);
                        $('.redbag_pop_box,.redbag_pop').hide();
                        $item.css('opacity', 0).show().animate({ opacity: 1 }, 300);
                    }
                    break;
            }
        },

        /**
         * 隐藏所有红包弹窗
         */
        hideAllPop: function() {
            $('.redbag_pop').hide();
        },

        /**
         * 定时器
         */
        tick: function() {
            if (!this.config.init) {
                return;
            }
            var config = this.config;
            var time = Data.serverTime;
            var today = new Date(time);
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            time -= today.getTime();
            if (Tool.RedPacket.isStayTime()) { //当前是红包时间，延迟5秒不倒计时
                if (time - config.redPacketPeriods >= config.stayTime) {
                    config.miniClose = false;
                    config.redPacketPeriods = 0;
                }
            }
            this.isRedPacketTime(function(isOK) {
                if (isOK) {
                    config.times = Math.ceil((time - config.startTime) / config.cycleTime);
                    config.timesLabel = config.times;
                    var countDown = config.cycleTime - ((time - config.startTime) % config.cycleTime);
                    config.minutes = Math.floor(countDown / 60000);
                    config.seconds = Math.floor(countDown % 60000 / 1000);
                    if (config.minutes == 0 && config.seconds == 0) {
                        //抢红包开始，记录红包期数
                        config.redPacketPeriods = time;
                        config.minutes = Math.floor(config.cycleTime / 60000);
                        config.seconds = Math.floor(config.cycleTime % 60000 / 1000);
                    }
                    config.minutesLabel = (config.minutes < 10 ? "0" : "") + config.minutes;
                    config.secondsLabel = (config.seconds < 10 ? "0" : "") + config.seconds;
                } else {
                    config.times = 0;
                    config.timesLabel = "--";
                    config.minutes = -1;
                    config.minutesLabel = "--";
                    config.seconds = -1;
                    config.secondsLabel = "--";
                    config.redPacketPeriods = 0;
                }
                Tool.RedPacket.view();
            });
        },

        /**
         * 初始化课程时间
         */
        initCourseTime: function(callback) {
            var config = this.config;
            if (config.courseTime == -3 || config.courseTime == -2 || (config.courseTime != -1 && config.courseTime > Data.serverTime)) {
                callback(config.courseTime);
                return;
            }
            config.courseTime = -3;

            var groupId = config.userInfo.groupId || Data.appDefaultGroupId;
            var groupType = config.userInfo.groupType;

            $.getJSON(config.apiUrl + '/common/getCourse', { 'flag': 'D', 'groupId': groupId, 'groupType': groupType }, function(data) {
                if (data.result == 0) {
                    if (!data.data || data.data.length == 0) {
                        Tool.RedPacket.config.courseTime = -2;
                    } else {
                        Tool.RedPacket.config.courseTime = data.data[0].date + 86400000 - 1;
                    }
                    callback(Tool.RedPacket.config.courseTime);
                }
            });
        },

        /**
         * 判断是都延迟抢红包时间
         */
        isStayTime: function() {
            return Tool.RedPacket.config.redPacketPeriods != 0;
        },

        /**
         * 判断是否5秒倒计时时间
         */
        isCountDownTime: function() {
            return Tool.RedPacket.config.minutes == 0 && Tool.RedPacket.config.seconds <= 5;
        },

        /**
         * 是否红包时间
         */
        isRedPacketTime: function(callback) {
            var today = new Date(Data.serverTime);
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            var time = Data.serverTime - today;
            if (time <= this.config.startTime || time > this.config.endTime) {
                callback(false);
                return;
            }
            this.initCourseTime(function(courseTime) {
                callback(today + 86400000 - 1 == courseTime);
            });
        },

        /**
         * 抢红包
         */
        rob: function() {
            var config = Tool.RedPacket.config;
            if (!config.userInfo.isLogin) {
                this.showPop("noLogin");
            } else if (config.redPacketPeriods == 0) {
                Pop.msg("红包已过期!");
            } else {
                Util.postJson("/rob", { t: Data.serverTime }, function(data) {
                    var analyst = Tool.RedPacket.getAnalyst();
                    if (data.result == 0) {
                        if (data.money > 0) {
                            Tool.RedPacket.config.miniClose = true;
                            Tool.RedPacket.showPop("resYes", {
                                money: data.money,
                                wechatImg: analyst.wechatImg,
                                wechat: analyst.wechat
                            });
                        }
                    } else {
                        if (data.code == 1004 || data.code == 1005 || data.code == 1006 || data.code == 1007) {
                            Tool.RedPacket.config.miniClose = true;
                            Tool.RedPacket.showPop("resNo", {
                                wechatImg: analyst.wechatImg,
                                wechat: analyst.wechat
                            });
                        } else {
                            alert(data.msg || "红包信息异常!");
                        }
                    }
                    Tool.RedPacket.config.opened = false;
                });
            }
        },
        /**
         * 获取分析是信息
         */
        getAnalyst: function() {
            var today = new Date(Data.serverTime);
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            var time = Data.serverTime - today;
            var analysts = Tool.RedPacket.config.analysts;
            var analystTmp = null;
            for (var i = analysts.length - 1; i >= 0; i--) {
                analystTmp = analysts[i];
                if (analystTmp.start <= time) {
                    break;
                }
            }
            return analystTmp;
        }
    },

    /*****  8月活动 start 2017.8.3  *****/
    activity_201708 : {

        remainNum : 0,

        init : function () {
/*            var lineHeight = $(".comment-box li").height();
            $(".comment-gdbox").css("height",lineHeight);*/

            var $this = $(".gund-box"), scrollTimer;
            $this.hover(function(){
                clearInterval(scrollTimer);
            },function(){
                scrollTimer = setInterval(function(){
                    Tool.activity_201708.scrollNews($this);
                },3000 );
            }).trigger("mouseout");

            Tool.activity_201708.setEvent();
            Tool.activity_201708.activityLotteryList();
            Tool.activity_201708.getSurplusChance();
            Tool.activity_201708.replaceTeacherWX();
            Tool.activity_201708.isCurrentDayFirstLogin(Data.userInfo.userId);

        },

        setEvent : function () {

            $("#showTrade_header").click(function(){
                $(".shadow").show();
                Tool.activity_201708.getSurplusChance();
                $(".redbag-july-box").slideDown(600);
            });

            $(".lay-del-btn").click(function(){
                $(".shadow").hide();
                $(".redbag-july-box").hide();
            });

            $(".hongb-bot-p,.adv-rule-btn").click(function(){
                $(".shadow").show();
                $("#ruleConLayer").slideDown(600);
            });

            $(".lay-del-btn2").click(function(){
                if($('.redbag-july-box').is(':hidden')){
                    $(".shadow").hide();
                }
                $("#ruleConLayer").slideUp(600);
            });

            $('.adver-tan-btn').click(function () {
                $("#showTrade_header").trigger('click');
            });

            $('#resultSuccCon4 .lay-del-btn2').on('click',function () {
                $("#resultSuccCon4").slideUp(600);
            });

            $('#resultSuccCon3 .lay-del-btn2').on('click',function () {
                $("#resultSuccCon3").slideUp(600);
            });

            $('#resultSuccCon2 .lay-del-btn2').on('click',function () {
                $("#resultSuccCon2").slideUp(600);
            });

            $('#resultSuccCon .lay-del-btn2').on('click',function () {
                $("#resultSuccCon").slideUp(600);
            });

            $('.redbag-btn-sub').on('click',function () {
               $(this).parent().parent().parent().slideUp(600);
            });

            $("#lotteryBtn").rotate({
                bind:
                {
                    click: function(){
                        if (!Data.userInfo.isLogin) {
                            Login.load();
                            $('.lay-del-btn').trigger('click');
                            return false;
                        }

                        if(Tool.activity_201708.remainNum < 1){
                            $('#resultSuccCon3').show();
                            return;
                        }
                        Tool.activity_201708.timeOut();
                        Tool.activity_201708.activityLottery(function (result) {
                            Tool.activity_201708.remainNum = result.num;
                            $('.hongb-cout span').text(result.num);
                            if(result.code != 0){
                                if(result.code == 20007){
                                    $('#resultSuccCon3').show();
                                }else{
                                    Pop.msg(result.msg || '网络超时，请稍后再试！');
                                }
                                return;
                            }
                            var giftNumber = result.giftNumber,data = 0;
                            if(giftNumber && giftNumber.indexOf("@") > -1){
                                giftNumber = giftNumber.substr(0,giftNumber.indexOf("@"));
                                data = parseInt(giftNumber);
                            }
/*                            if(data==1){
                                Tool.activity_201708.rotateFunc(1,0,'大疆智能航拍无人机')
                            }
                            if(data==2){
                                Tool.activity_201708.rotateFunc(2,315,'1000元京东购物卡')
                            }*/
                            if(data==4){
                                Tool.activity_201708.rotateFunc(4,45,'10元微信红包');
                            }else if(data==5){
                                Tool.activity_201708.rotateFunc(5,270,'5元微信红包');
                            }else if(data==6){
                                Tool.activity_201708.rotateFunc(6,90,'2元微信红包');
                            }else if(data==7){
                                Tool.activity_201708.rotateFunc(7,135,'30M流量包');
                            }else if(data==9){
                                Tool.activity_201708.rotateFunc(9,180,'5000积分');
                            }else if(data==10){
                                Tool.activity_201708.rotateFunc(10,225,'投资秘籍');
                            }else{
                                Tool.activity_201708.rotateFunc(10,225,'投资秘籍');
                            }

                        });


                    }
                }
            });
        },

        timeOut: function () {  //超时函数
            $("#lotteryYuan").rotate({
                angle: 0,
                duration: 10000,
                animateTo: 2160 + 225, //这里是设置请求超时后返回的角度，所以应该还是回到最原始的位置，2160是因为我要让它转6圈，就是360*6得来的
                callback: function () {
                    //alert('网络超时')
                }
            });
        },

        //中奖结果展示
        rotateFunc: function (awards, angle, text) {  //awards:奖项，angle:奖项对应的角度
            $('#lotteryYuan').stopRotate();
            $("#lotteryYuan").rotate({
                angle: 0,
                duration: 5000,
                animateTo: angle + 1440, //angle是图片上各奖项对应的角度，1440是我要让指针旋转4圈。所以最后的结束的角度就是这样子^^
                callback: function () {
                    var wxAwards = [4,5,6];
                    if(wxAwards.indexOf(awards) > -1){//微信红包奖项
                        $('#resultSuccCon h3 span').text(text);
                        $('#resultSuccCon').show();
                    }else if(awards == 9){
                        $('#ewm_phone').hide();
                        $('#resultSuccCon2 h3 span').text(text);
                        $('.redbag-kf-text').html('所获积分将在1小时内自动存入您的账户余额');
                        $('#resultSuccCon2').show();
                    }else if(awards == 7){
                        $('#ewm_phone').hide();
                        $('#resultSuccCon2 h3 span').text(text);
                        $('.redbag-kf-text').html('所获流量将在1小时内自动存入您的注册手机');
                        $('#resultSuccCon2').show();
                    }else if(awards == 10){
                        $('#resultSuccCon4').show();
                    }else {//非微信红包奖项
                        $('#ewm_phone').show();
                        $('#resultSuccCon2 h3 span').text(text);
                        $('.redbag-kf-text').html('活动结束后<br />客服MM会联系您发放奖品');
                        $('#resultSuccCon2').show();
                    }
                    var len = Data.userInfo.nickname.length;
                    var item = '<li>'.concat('**'+Data.userInfo.nickname.substr(len -2)).concat(' 获').concat(text);
                    $('.gund-box ul').append(item);
                }
            });
        },

        //无缝滚动
        scrollNews: function (obj) {
            var $self = obj.find("ul:first");
            var lineHeight = $self.find("li:first").height();
            $self.animate({"margin-top": -lineHeight + "px"}, 600, function () {
                $self.css({"margin-top": "0px"}).find("li:first").appendTo($self);
            })
        },

        //替换老师微信二维码
        replaceTeacherWX : function () {
            if(Data.serverTime > new Date('2017-08-21').getTime()){
                $('#resultSuccCon .redbag-ewm-im img').attr('src','/theme2/img/redbag201708/layer_yangduoduo.png');
                $('#resultSuccCon .redbag-ewm-fon p').html('微信号 gw_yang24k<br/>添加分析师微信，核实身份后领奖');
            }else if(Data.serverTime > new Date('2017-08-14').getTime()){
                $('#resultSuccCon .redbag-ewm-im img').attr('src','/theme2/img/redbag201708/layer_liuce.png');
                $('#resultSuccCon .redbag-ewm-fon p').html('微信号 liu_gw24k<br/>添加分析师微信，核实身份后领奖');
            }
        },

        //活动期间当天首次登陆
        isCurrentDayFirstLogin : function (visitorId) {
            if (Util.isNotBlank(visitorId)) {
                Util.postJson('/isCurrentDayFirstLogin', { data: JSON.stringify({ userNo: visitorId }) }, function(data) {
                    if (data) {
                        if (data.data) {
                            $("#showTrade_header").trigger('click');
                        }
                    }
                });
            }
        },

        //获取当前用户的抽奖机会
        getSurplusChance: function() {
            if(!Data.userInfo.isLogin){
                $('.hongb-cout span').text(0);
                return;
            }
            Util.postJson('/getSurplusChance',{}, function(data) {
                if(data){
                    $('.hongb-cout span').text(data.num);
                    Tool.activity_201708.remainNum = parseInt(data.num);
                }

            });
        },

        //抽奖
        activityLottery: function(callback) {
            Util.postJson('/freeibLottery',{}, function(data) {
                if(data){
                    if(data.code != 0 && data.code != '20007'){
                        data.num = Tool.activity_201708.remainNum;
                    }
                    callback(data);
                }else{
                    var msg = data.msg || "小主，状态不佳，请刷新页面后再抽奖";
                    $('.hongb-cout span').text(Tool.activity_201708.remainNum);
                    Pop.msg(msg);
                }

            });
        },

        //中奖列表
        activityLotteryList: function() {
            Util.postJson('/freeibLotteryList',{}, function(data) {
                if(data && data.code == 0 && data.list){
                    var html = [];
                    for(var i = 0, len = data.list.length; i < len; i++){
                        var item = data.list[i];
                        html.push('<li>');
                        html.push(item.guestName);
                        html.push(' 获');
                        html.push(item.lotteryGiftName);
                    }
                    $('.gund-box ul').append(html.join(''));
                }
            });
        },
        //自己的中奖list
        myLotteryList: function() {
            Util.postJson('/freeibMyLotteryList',{}, function(data) {
                if(data && data.code == 0 && data.list){
                    var html = [];
                    for(var i = 0, len = data.list.length; i < len; i++){
                        var item = data.list[i];
                        html.push('<li>');
                        html.push(item.guestName);
                        html.push(' 获');
                        html.push(item.lotteryGiftName);
                    }
                    console.log(html);
                    $('.gund-box ul').append(html.join(''));
                }
            });
        }
    }
    /*****  8月活动 end 2017.8.3  *****/

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