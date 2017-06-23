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

    /**
     * 红包活动
     */
    RedPacket: {
        /**配置信息*/
        config: {
            init: false, //初始化
            analyst: {
                userId: "liu_gw24k",
                userName: "刘策",
                wechat: "liu_gw24k",
                wechatImg: "/theme2/img/ce_liu.png"
            },
            opened: false //是否已经点击抢红包标记
        },

        /**
         * 初始化
         */
        init: function(userInfo, apiUrl) {
            this.config.userInfo = userInfo;
            this.config.apiUrl = apiUrl;
            this.setEvent();
            this.config.init = true;
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
         * 绑定事件
         */
        setEvent: function() {

            //用户第一次访问网站默认打开抽奖卷盘
            if (Tool.RedPacket.getHC('visits') == "") {
                //第一次访问
                Tool.RedPacket.setHC('visits', 1, 1);
                $(".hongb-laybox").slideDown(600);
            }

            //抽奖灯光切换
            function lightSwitch() {
                $('.deng-box').toggleClass('deng-box2');
            };

            //转盘灯光定时转动
            setInterval(lightSwitch, 300);

            //活动规则层打开
            $(".rule-mfon").click(function() {
                $(".shadow").show();
                $(".zhuan-rule-con").slideDown();
            });

            //活动规则层关闭
            $("#closeRule").click(function() {
                $(".shadow").hide();
                $(".zhuan-rule-con").fadeOut(600);
            });

            //关闭提示框
            $("#closeNoLogin,#closeActiveNoChance,#closeRegisterChanceOver,#closeRedPacket_resYes").click(function() {
                $(".shadow").hide();
                $(this).parent().slideUp();
            });

            //登录
            $("#redPacket_loginBtn").bind("click", function() {
                $(".shadow").hide();
                $("#redPacket_noLogin").hide();
                $(".hongb-laybox").fadeOut(600);
                Login.load();
            })

            //抽奖灯光无缝滚动
            function scrollNews(obj) {
                var $self = obj.find("ul:first");
                var lineHeight = $self.find("li:first").height();
                $self.animate({
                    "margin-top": -lineHeight + "px"
                }, 600, function() {
                    $self.css({
                        "margin-top": "0px"
                    }).find("li:first").appendTo($self);
                })
            }
            var lineHeight = $(".comment-box li").height();
            $(".comment-gdbox").css("height", lineHeight);

            //获奖名单滚动
            var $this = $(".bot-gdbox"),
                scrollTimer;
            $this.hover(function() {
                clearInterval(scrollTimer);
            }, function() {
                scrollTimer = setInterval(function() {
                    scrollNews($this);
                }, 3000);
            }).trigger("mouseout");


            //抽奖卷盘关闭
            $(".lay-del-btn").click(function() {
                $(".hongb-laybox").fadeOut(600);
            });

            //参与互动
            $("#joinChat").click(function() {
                $("#activeNoChance").hide();
                $(".shadow").hide();
                $(".hongb-laybox").fadeOut(600);
                $('#roomList a[gi="studio_teach"]').click();
            });

            //转盘弹出
            $("#redPacket_header").bind("click", function() {
                if (Data.userInfo.isLogin) {
                    console.log("click redPacket_header==>mobileAndCreateDate:", Data.userInfo.mobilePhone, ",", new Date(Data.userInfo.createDate));
                    Tool.RedPacket.queryLastRedPackageRob();
                } else {
                    $(".shadow").show();
                    Tool.RedPacket.showPop('noLogin');
                }
            });

            //抽奖
            $("#lotteryBtn").rotate({
                bind: {
                    click: function() {
                        if (Data.userInfo.isLogin) {
                            if (!Tool.RedPacket.config.opened) {
                                Tool.RedPacket.config.opened = true;
                                $(".hongb-laybox").slideDown(600);
                                $('#prizeCon1,#prizeCon2,#prizeCon3,#prizeCon4,#prizeCon5,#prizeCon6').hide();
                                $('#active_yes_threeChanceOver,#rigster_yes_hasNoChance,#active_yes_hasOneChance').hide();
                                Tool.RedPacket.rob();
                            }
                        } else {
                            Tool.RedPacket.showPop('noLogin');
                        }
                    }
                }
            });

            //返回抽奖
            $("#back_rob").click(function() {
                $(".shadow").hide();
                $("#redPacket_resYes").hide();
                Tool.RedPacket.queryLastRedPackageRob();
                $(".hongb-laybox").slideDown(600);
            });

            //红包视图-中奖页（{money:Number, wechatImg:String}）
            $("#redPacket_resYes").bind("view", function(e, data) {
                $("#redPacket_resYes [rp='money']").html(data.money);
                $("#redPacket_resYes [rp='wechat']").html(data.wechat);
                $("#redPacket_resYes [rp='wechatImg']").attr("src", data.wechatImg);
            });

            //红包视图-未中奖页（{wechatImg:String}）
            $("#redPacket_resNo").bind("view", function(e, data) {
                $("#redPacket_resNo [rp='wechatCode']").html(data.wechat);
                $("#redPacket_resNo [rp='wechatImg']").attr("src", data.wechatImg);
            });

            //关闭
            $('.redbag_pop .pop_close a').click(function() {
                if ($(this).parent().parent().parent().hasClass('pop2')) {
                    $(this).parent().parent().parent().animate({
                        opacity: 0,
                        bottom: 0
                    }, 300, function() {
                        $(this).hide()
                    });
                } else {
                    $(this).parent().parent().parent().animate({
                        opacity: 0,
                        top: '30%'
                    }, 300, function() {
                        $(this).hide()
                    });
                }
            });
        },

        /** 查询用户剩余抽奖次数 */
        queryLastRedPackageRob: function() {
            common.getJson("/getLastRobChance", {
                t: Data.serverTime
            }, function(data) {
                if (data.result == 0) {
                    $(".hongb-cout").html(data.residueDegree);
                    if (data.residueDegree > 0) {
                        $(".hongb-laybox").slideDown(600);
                    } else {
                        if ("active" == Data.userInfo.clientGroup) {
                            $(".shadow").show();
                            $("#activeNoChance").show();
                        } else {
                            $(".shadow").show();
                            $("#registerChanceOver").show();
                        }
                    }
                } else {
                    //服务器时间异常，重新同步服务器时间
                    chat.socket.emit('serverTime');
                    Pop.msg(data.msg || "获取剩余红包次数异常!");
                }
            });
        },

        /**
         * 抽奖转动
         */
        rotateFunc: function(awards, angle, text, analyst, lastNum) { //awards:奖项，angle:奖项对应的角度
            $('#lotteryYuan').stopRotate();
            $("#lotteryYuan").rotate({
                angle: 0,
                duration: 5000,
                animateTo: angle + 1440, //angle是图片上各奖项对应的角度，1440是我要让指针旋转4圈。所以最后的结束的角度就是这样子^^
                callback: function() {
                    Tool.RedPacket.config.opened = false;
                    if (5 == text) {
                        $("#prizeCon1").show();
                    } else if (10 == text) {
                        $("#prizeCon2").show();
                    } else if (50 == text) {
                        $("#prizeCon3").show();
                    } else if (100 == text) {
                        $("#prizeCon4").show();
                    } else if (200 == text) {
                        $("#prizeCon5").show();
                    } else if (500 == text) {
                        $("#prizeCon6").show();
                    }
                    if ("active" == Data.userInfo.clientGroup) {
                        if (lastNum == 0) {
                            $("#active_yes_threeChanceOver").show();
                        } else {
                            $("#lastChance").html(lastNum);
                            $("#active_yes_hasOneChance").show();
                        }
                    } else {
                        $("#rigster_yes_hasNoChance").show();
                    }
                    $(".hongb-laybox").fadeOut(600);
                    Tool.RedPacket.showPop("resYes", {
                        money: text,
                        wechatImg: analyst.wechatImg,
                        wechat: analyst.wechat
                    });
                }

            });
        },
        /**显示弹窗*/
        showPop: function(type, arg) {
            var $item = null;
            switch (type) {
                case "noLogin":
                    $item = $("#redPacket_noLogin");
                    if (!$item.is(":visible")) {
                        $item.css({
                            'opacity': 0,
                            'left': '30%',
                            'top': '30%'
                        }).show().animate({
                            opacity: 1,
                            left: '50%',
                            top: '50%'
                        }, 300);
                    }
                    break;

                case "resYes":
                    $item = $('#redPacket_resYes');
                    if (!$item.is(":visible")) {
                        $item.trigger("view", arg);
                        $item.css('opacity', 0).show().animate({
                            opacity: 1
                        }, 300);
                    }
                    break;
            }
        },

        /**
         * 抢红包
         */
        rob: function() {
            Util.postJson("/rob", {
                t: Data.serverTime
            }, function(data) {
                if (data.result == 0) {
                    var analyst = Tool.RedPacket.config.analyst;
                    var flag, angle;
                    if (data.money > 0) {
                        if (data.money == 5) {
                            flag = 1;
                            angle = 92;
                        } else if (data.money == 10) {
                            flag = 2;
                            angle = 212;
                        } else if (data.money == 50) {
                            flag = 3;
                            angle = 332;
                        } else if (data.money == 100) {
                            flag = 4;
                            angle = 152;
                        } else if (data.money == 200) {
                            flag = 5;
                            angle = 272;
                        } else if (data.money == 500) {
                            flag = 6;
                            angle = 32;
                        }
                        Tool.RedPacket.rotateFunc(flag, angle, data.money, analyst, data.residueDegree);
                    } else {
                        if ("active" == Data.userInfo.clientGroup) {
                            $(".shadow").hide();
                            $("#activeNoChance").show();
                        } else {
                            $(".shadow").hide();
                            $("#registerChanceOver").show();
                        }
                    }
                } else {
                    //服务器时间异常，重新同步服务器时间
                    chat.socket.emit('serverTime');
                    Pop.msg(data.msg || "红包信息异常!");
                }
            });
        },

        /**
         * 日期比较大小
         * compareDateString大于dateString，返回1； 
         * 等于返回0； 
         * compareDateString小于dateString，返回-1 
         * @param dateString 日期 
         * @param compareDateString 比较的日期 
         */
        dateCompare: function(dateString, compareDateString) {
            var dateTime = new Date(Date.parse(dateString)).getTime();
            var compareDateTime = new Date(Date.parse(compareDateString)).getTime();
            if (compareDateTime > dateTime) {
                return 1;
            } else if (compareDateTime == dateTime) {
                return 0;
            } else {
                return -1;
            }
        },
        /** 
         * 判断日期是否在区间内，在区间内返回true，否返回false 
         * @param dateString 日期字符串 
         * @param startDateString 区间开始日期字符串 
         * @param endDateString 区间结束日期字符串 
         * @returns {Number} 
         */
        isDateBetween: function(dateString, startDateString, endDateString) {
            var flag = false;
            var startFlag = (Tool.RedPacket.dateCompare(dateString, startDateString) < 1);
            var endFlag = (Tool.RedPacket.dateCompare(dateString, endDateString) > -1);
            if (startFlag && endFlag) {
                flag = true;
            }
            return flag;
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