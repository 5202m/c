/**
 * 直播间前台工具类
 * author Dick.guo
 *
 * Theme      : 主题
 * SimpleRoom : 新手房间
 * RedPacket  : 红包活动
 */
var indexTool = {
    /**
     * 从本地存储设置、获取布尔标识
     * @param attr
     * @param [val]
     * @returns {*}
     */
    store: function(attr, val) {
        var storeObj = LoginAuto.get();
        var result = null;
        if (arguments.length == 1) {
            result = storeObj && storeObj[attr];
        } else {
            if (storeObj) {
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
    Theme: {

        /**
         * 切换主题
         * @param theme
         * @param isSave
         */
        setTheme: function(theme, isSave) {
            theme = theme || "";
            var themes = null;
            if ($("#panel_theme").attr("ismin") == "true") {
                themes = {
                    "pm_darkblue": "/theme1/css/darkblue.min.css"
                }; //pm_def
            } else {
                themes = {
                    "pm_darkblue": "/theme1/css/darkblue.css"
                }; //pm_def
            }
            if (themes.hasOwnProperty(theme)) {
                LazyLoad.css(themes[theme], function(theme) {
                    $("#panel_theme .sebox.on").removeClass("on");
                    $("#panel_theme .sk_item[theme='" + theme + "'] .sebox").addClass("on");
                    $("head link[href='" + themes[theme] + "']").attr("theme", theme);
                }, theme);
            } else {
                $("#panel_theme .sebox.on").removeClass("on");
                $("#panel_theme .sk_item[theme='pm_def'] .sebox").addClass("on");
                $("head link[theme]").remove();
            }
            if (isSave && common.isValid(indexJS.userInfo.userId) && indexJS.userInfo.isLogin) {
                var themeObj = {
                    'theme': 'theme1',
                    'style': theme || "pm_def"
                };
                var params = {
                    defTemplate: JSON.stringify(themeObj)
                };
                common.getJson('/setThemeStyle', {
                    data: JSON.stringify(params)
                }, function(result) {});
            }
        }
    },

    /**
     * 新手房间
     */
    SimpleRoom: {
        countdown: {
            time: 10,
            id: 0
        },

        /**
         * 初始化
         */
        init: function() {
            var rootType = $("#roomInfoId").attr("rt");
            if (!indexJS.userInfo.isLogin && rootType != "simple") {
                //未登录用户进入非新手房间：曾经已看3分钟，直接弹出。否则3分钟之后弹出提示框。
                var lgt = $('#roomInfoId').attr("lgt"); //后台控制登录弹框时间
                if (/\d+(\.\d+)?/.test(lgt)) {
                    lgt = parseFloat(lgt);
                    if (indexTool.store("simpleTip")) {
                        this.showSimpleTip(true, lgt);
                    } else {
                        window.setTimeout(function() {
                            indexTool.store("simpleTip", true);
                            indexTool.SimpleRoom.showSimpleTip(true, lgt);
                        }, lgt * 60000);
                    }
                }
            } else if (rootType == "simple") { //新手房间引导
                //隐藏直播精华
                $(".mod_main .main_tabnav a[t='chat']").trigger("click");
                $(".mod_main .main_tabnav a[t='livepride'], .mod_main .tabcont .main_tab[t='livepride']").hide();
                if (!indexJS.userInfo.isLogin) {
                    var today0 = new Date(indexJS.serverTime);
                    today0 = new Date(today0.getFullYear(), today0.getMonth(), today0.getDate()).getTime();
                    var lastGuideTipTime = indexTool.store("guideTipTime");
                    if (!lastGuideTipTime || today0 > lastGuideTipTime) {
                        this.showSimpleGuideTip("start");
                    } else {
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
        showSimpleTip: function(isSetEvent, time) {
            if (isSetEvent) {
                $("#pop_stTime").html(time || 3);

                $("#pop_simpleTip .enteritem:first a").bind("click", function() {
                    $("#pop_simpleTip").hide();
                    $("#register_a").trigger("click", {
                        closeable: false
                    });
                });

                $("#pop_simpleTip .enteritem.newbie a").bind("click", function() {
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
        simpleTipCountdown: function() {
            window.setTimeout(function() {
                indexTool.SimpleRoom.countdown = {
                    time: 10,
                    id: null
                };
                $("#pop_stCountdown span").html(indexTool.SimpleRoom.countdown.time);
                $("#pop_stCountdown").show();
                indexTool.SimpleRoom.countdown.id = window.setInterval(function() {
                    var tickObj = indexTool.SimpleRoom.countdown;
                    tickObj.time--;
                    if (tickObj.time > 0) {
                        $("#pop_stCountdown span").html(indexTool.SimpleRoom.countdown.time);
                    } else {
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
        showSimpleGuide: function(isSetEvent) {
            if (isSetEvent) {
                //提示跳转
                $("#pop_simpleGuide .newbie_course li").bind("click", function() {
                    $("#pop_simpleGuide").hide();
                    var videoType = $(this).attr("vt");
                    if (videoType) {
                        $("#teachVideoId a[t='" + videoType + "']").trigger("click", [videosTeach.playTeachByUrlFunc, {
                            url: $(this).attr("url"),
                            title: $(this).text()
                        }]);
                    }
                    if ($(this).attr("t") == "connCs") {
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
        showSimpleGuideTip: function(step) {
            if (step == "start") {
                $("#pop_guideBg,#pop_guide").show();
                $("#pop_guide .jumpbtn").bind("click", function() {
                    indexTool.SimpleRoom.showSimpleGuideTip($(this).attr("step"));
                });
                $("#pop_guideLogin").bind("click", function() {
                    $("#pop_guideBg,#pop_guide").hide();
                    $("#login_a").trigger("click");
                });
                $("#pop_guideReg").bind("click", function() {
                    $("#pop_guideBg,#pop_guide").hide();
                    $("#register_a").trigger("click");
                });
                indexTool.SimpleRoom.showSimpleGuideTip(-1);
                indexTool.store("guideTipTime", indexJS.serverTime);
            } else if (step == "end") {
                $("#pop_guideBg,#pop_guide").hide();
                indexTool.SimpleRoom.showSimpleGuide(true);
            } else {
                $("#pop_guide .n_guide").each(function(index) {
                    if (index - 1 != step) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                });
            }
        }
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
                wechatImg: "/theme1/img/ce_liu.png"
            },
            opened: false //是否已经点击抢红包标记
        },

        /**
         * 初始化
         */
        init: function() {
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
            if (indexTool.RedPacket.getHC('visits') == "") {
                //第一次访问
                indexTool.RedPacket.setHC('visits', 1, 1);
                $(".hongb-laybox").slideDown(600);
            }
            //红包顶部获奖名单滚动
            var $this = $(".bot-gdbox"),
                scrollTimer;
            $this.hover(function() {
                clearInterval(scrollTimer);
            }, function() {
                scrollTimer = setInterval(function() {
                    indexTool.RedPacket.scrollNews($this);
                }, 3000);
            }).trigger("mouseout");


            $(function() {
                var $this = $(".gund-box"),
                    scrollTimer;
                $this.hover(function() {
                    clearInterval(scrollTimer);
                }, function() {
                    scrollTimer = setInterval(function() {
                        indexTool.RedPacket.scrollNews($this);
                    }, 3000);
                }).trigger("mouseout");
            });

            setInterval(indexTool.RedPacket.lightSwitch, 300);

            //红包视图-顶部
            $("#redPacket_header,#redPacket_chat").bind("click", function() {
                if (indexJS.userInfo.isLogin) {
                    //判断用户是否满足条件,2017 年06年12日00: 00: 00 至2017年6月30日23: 59: 59 注册直播间的用户
                    var beginDate = '2017-06-12 00:00:00';
                    var endDate = '2017-06-30 23:59:59';
                    if (!indexTool.RedPacket.isDateBetween(indexJS.userInfo.createDate, beginDate, endDate)) {
                        $("#activeNoChance").show();
                        return;
                    } else {
                        indexTool.RedPacket.queryLastRedPackageRob();
                    }
                } else {
                    indexTool.RedPacket.showPop("noLogin");
                }
            });

            /**
             * 即刻互动按钮
             */
            $("#joinChat").click(function() {
                $("#activeNoChance").hide();
                $(".hongb-laybox").fadeOut(600);
                $('.main_tabnav a[t="chat"]').click();
            });

            //抽奖卷盘关闭
            $(".lay-del-btn").click(function() {
                $(".hongb-laybox").fadeOut(600);
            });

            //返回抽奖
            $("#goRob").click(function() {
                $("#redPacket_resYes").hide();
                indexTool.RedPacket.queryLastRedPackageRob();
                $(".hongb-laybox").slideDown(600);
            });

            //抢红包
            $("#lotteryBtn").rotate({
                bind: {
                    click: function() {
                        if (indexJS.userInfo.isLogin) {
                            if (!indexTool.RedPacket.config.opened) {
                                indexTool.RedPacket.config.opened = true;
                                $(".hongb-laybox").slideDown(600);
                                $('#prizeCon1,#prizeCon2,#prizeCon3,#prizeCon4,#prizeCon5,#prizeCon6').hide();
                                $('#active_yes_threeChanceOver,#rigster_yes_hasNoChance,#active_yes_hasOneChance').hide();
                                indexTool.RedPacket.rob();
                            }
                        } else {
                            indexTool.RedPacket.showPop("noLogin");
                        }
                    }
                }
            });

            //红包视图-中奖页（{money:Number, wechatImg:String}）
            $("#redPacket_resYes").bind("view", function(e, data) {
                $("#redPacket_resYes [rp='money']").html(data.money);
                $("#redPacket_resYes [rp='wechatImg']").attr("src", data.wechatImg);
                $("#redPacket_resYes [rp='wechat']").html(data.wechat);
            });

            //免费注册
            $("#redPacket_regBtn").bind("click", function() {
                $('.popup_box').hide();
                $("#register_a").trigger("click");
            });

            //登录
            $("#redPacket_loginBtn").bind("click", function() {
                $('.popup_box').hide();
                $("#login_a").trigger("click");
            });

            /**
             * 中奖结果
             */
            $("#resultDel").click(function() {
                $(this).parent().fadeOut(600);
            });

        },

        /** 查询用户剩余抽奖次数 */
        queryLastRedPackageRob: function() {
            common.getJson("/getLastRobChance", {
                t: indexJS.serverTime
            }, function(data) {
                if (data.result == 0) {
                    $(".hongb-cout,#lastChance").html(data.residueDegree);
                    if (data.residueDegree > 0) {
                        $(".hongb-laybox").slideDown(600);
                    } else {
                        if ("active" == indexJS.userInfo.clientGroup) {
                            $("#activeNoChance").show();
                        } else {
                            $("#registerChanceOver").show();
                        }
                    }
                } else {
                    //服务器时间异常，重新同步服务器时间
                    chat.socket.emit('serverTime');
                    box.showMsg(data.msg || "获取剩余红包次数异常!");
                }
            });
        },

        //抽奖灯光切换
        lightSwitch: function() {
            $('.deng-box').toggleClass('deng-box2');
        },

        scrollNews: function(obj) {
            var $self = obj.find("ul:first");
            var lineHeight = $self.find("li:first").height();
            $self.animate({
                "margin-top": -lineHeight + "px"
            }, 600, function() {
                $self.css({
                    "margin-top": "0px"
                }).find("li:first").appendTo($self);
            })
        },

        /**显示弹窗*/
        showPop: function(type, arg) {
            var $item = null;
            switch (type) {
                case "noLogin":
                    $item = $("#redPacket_noLogin");
                    if (!$item.is(":visible")) {
                        $('.hongb-laybox').hide();
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
                        $('.hongb-laybox').hide();
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
            common.getJson("/rob", {
                t: indexJS.serverTime
            }, function(data) {
                if (data.result == 0) {
                    var analyst = indexTool.RedPacket.config.analyst;
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
                        var lastNum = data.residueDegree;
                        var activeTime = indexJS.userInfo.activeDate;
                        var registerTime = indexJS.userInfo.createDate;
                        var beginDate = '2017-06-13 00:00:00';
                        var endDate = '2017-06-13 23:59:59';
                        var lottryBeginDate = new Date(Date.parse(beginDate)).getTime();
                        //如果激活时间大于活动开始时间，且注册时间在活动范围内的，抽奖机会1次
                        if (activeTime < lottryBeginDate && indexTool.RedPacket.isDateBetween(registerTime, beginDate, endDate)) {
                            lastNum = 0;
                        }
                        indexTool.RedPacket.rotateFunc(flag, angle, data.money, analyst, lastNum);
                    } else {
                        if ("register" == indexJS.userInfo.clientGroup) {
                            $("#rigster_yes_hasNoChance").show();
                        } else {
                            $("#active_yes_threeChanceOver").show();
                        }
                    }
                } else {
                    //服务器时间异常，重新同步服务器时间
                    chat.socket.emit('serverTime');
                    box.showMsg(data.msg || "红包信息异常!");
                }
            });
        },

        /**
         * 转盘转动
         * @param awards
         * @param angle
         * @param text
         * @param analyst
         * @param lastNum
         */
        rotateFunc: function(awards, angle, text, analyst, lastNum) { //awards:奖项，angle:奖项对应的角度
            $('#lotteryYuan').stopRotate();
            $("#lotteryYuan").rotate({
                angle: 0,
                duration: 5000,
                animateTo: angle + 1440, //angle是图片上各奖项对应的角度，1440是我要让指针旋转4圈。所以最后的结束的角度就是这样子^^
                callback: function() {
                    indexTool.RedPacket.config.opened = false;
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
                    if ("register" == indexJS.userInfo.clientGroup) {
                        $("#rigster_yes_hasNoChance").show();
                    } else {
                        if (lastNum == 0) {
                            $("#active_yes_threeChanceOver").show();
                        } else {
                            $("#lastChance").html(lastNum);
                            $("#active_yes_hasOneChance").show();
                        }
                    }
                    $(".hongb-laybox").fadeOut(600);
                    indexTool.RedPacket.showPop("resYes", {
                        money: text,
                        wechatImg: analyst.wechatImg,
                        wechat: analyst.wechat
                    });
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
            var startFlag = (indexTool.RedPacket.dateCompare(dateString, startDateString) < 1);
            var endFlag = (indexTool.RedPacket.dateCompare(dateString, endDateString) > -1);
            if (startFlag && endFlag) {
                flag = true;
            }
            return flag;
        },
    }
};