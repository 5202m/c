/**
 * 直播间弹框操作类
 * author Alan.wu
 */
var box = {
    verifyCodeIntMap: {},
    toRoomId: null,
    enable: true, //是否使用store
    storeInfoKey: "storeInfo_VerifyCodeTime",
    /**
     * 方法入口
     */
    init: function() {
        this.setEvent();
    },
    /**
     * 设置事件
     */
    setEvent: function() {
        /**
         * 显示签到信息
         */
        $(".signinbox .progressbar").bind("signin", function(e, days) {
            //设置当前签到用户信息
            var alldays = common.getDaysInMonth(new Date(indexJS.serverTime));
            if (alldays < 30) {
                $(".signinbox .progressbar .rewardpoint[days='30']").hide();
            }
            $('.signinbox .progressbar .barcont .current').text(days + "天");
            var signinPointsCfg = [
                { days: 3, start: 0, step: 8 },
                { days: 7, start: 24, step: 6 },
                { days: 10, start: 48, step: 8 },
                { days: 30, start: 72, step: 1.235 },
                { days: 31, start: 96.7, step: 3.3 }
            ];
            var pos = 0,
                dayStart = 0;
            for (var i = 0, lenI = signinPointsCfg.length; i < lenI; i++) {
                if (days > signinPointsCfg[i].days && i != lenI - 1) {
                    dayStart = signinPointsCfg[i].days;
                } else {
                    pos = signinPointsCfg[i].start + ((days - dayStart) * signinPointsCfg[i].step);
                    break;
                }
            }
            $(".signinbox .progressbar .bar").width(pos + "%");
        });

        /**
         * 签到按钮事件
         */
        $('.tosigninbtn').click(function() {
            if (indexJS.userInfo.isLogin) {
                common.getJson('/getSignin', null, function(data) {
                    if (null != data) {
                        var signinInfo = data.signinInfo;
                        var signinUser = data.signinUser;
                        $(".signinbox .progressbar").trigger("signin", signinInfo.signDays);

                        //设置其他用户签到信息
                        var currentDate = new Date(indexJS.serverTime);
                        var signinListHtml = [],
                            signinFormatHtml = box.formatHtml('signin');
                        if (null != signinUser) {
                            for (var i in signinUser) {
                                var row = signinUser[i];
                                var avatar = row.avatar != null ? row.avatar : '/theme1/img/user.jpg';
                                var minuteDiff = common.getMinuteDiff(currentDate, row.signinTime);
                                minuteDiff = minuteDiff <= 0 ? 1 : minuteDiff;
                                if (minuteDiff > 59) {
                                    var hourdiff = common.getHourDiff(currentDate, row.signinTime);
                                    signinListHtml.push(signinFormatHtml.formatStr(avatar, hourdiff + '小时前'));
                                } else {
                                    signinListHtml.push(signinFormatHtml.formatStr(avatar, minuteDiff + '分钟前'));
                                }
                            }
                        }
                        $('.signinbox .sign_vistor ul').empty().prepend(signinListHtml.join(''));
                        $('#sign_vistor').height(75);
                        indexJS.setListScroll($('#sign_vistor'));
                        common.openPopup('.blackbg,.signin');
                    } else {
                        console.log("fail");
                        box.showMsg(data.msg);
                    }
                });
            } else {
                common.openPopup('.blackbg,.login');
            }
        });
        /*弹出框关闭按钮*/
        $('.popup_box .pop_close,.formbtn[t=close]').click(function() {
            $(this).parent().parent().hide();
            if ($('div.popup_box:visible').length < 1 && $("div.pletter_win:visible").length < 1) {
                $(".blackbg").hide();
            }
            $(".blackbg form").each(function() {
                this.reset();
            });
        });
        /**
         * 资料下载上一页按钮事件
         */
        $('#prev').click(function() {
            var currPage = parseInt($('#page b').text()),
                prev = 0;
            if (currPage > 1) {
                prev = currPage - 1;
                box.setDownloadPPT(prev, box.getDownloadSort());
            } else {
                return false;
            }
        });
        /**
         * 资料下载下一页按钮事件
         */
        $('#next').click(function() {
            var currPage = parseInt($('#page b').text()),
                next = 0;
            if (currPage < parseInt($('#page span').text())) {
                next = currPage + 1;
                box.setDownloadPPT(next, box.getDownloadSort());
            } else {
                return false;
            }
        });
        /**
         * 资料下载排序按钮事件
         */
        $('.infodown .ranknavbar a.rankbtn').click(function() {
            $('.infodown .ranknavbar a.rankbtn').removeClass('on');
            $(this).addClass('on');
            box.setDownloadPPT(1, box.getDownloadSort());
        });
        /**
         * 在结果中搜索按钮事件
         */
        $('.infodown .ranknavbar .search_bar .sbtn').click(function() {
            var keyword = $('.infodown .ranknavbar .search_bar .sinp').val();
            if (common.isBlank(keyword)) {
                $('.infodown .downtable table tbody tr').show();
            } else {
                $('.infodown .downtable table tbody tr').hide();
                $('.infodown .downtable table tbody tr').each(function() {
                    if ($(this).find('td.sname').text().indexOf(keyword) != -1) {
                        $(this).show();
                    }
                });
            }
        });
        //继续上一次的获取验证码间隔时间，防刷新
        //this.contVerifyCodeTime();
        //登录相关事件
        this.loginEvent();
        //账号升级事件
        //this.upgradeEvent();
        //修改头像事件
        this.modifyAvatarEvent();
        //修改用户名事件
        this.modifyUserNameEvent();
        //修改昵称事件
        this.modifyNickNameEvent();
        //修改邮箱事件
        this.modifyEmailEvent();
        //修改密码事件
        this.modifyPasswordEvent();
        //交易账号登录事件
        this.accountLoginEvent();
    },
    /**
     * 账号升级事件
     */
    upgradeEvent: function() {
        /**
         * 等级说明提示
         */
        $("#tipbtnId").hover(function() {
            $(".upg_tip").show();
        }, function() {
            $(".upg_tip").hide();
        });
        /**
         * 升级事件
         */
        $(".upgradebtn").click(function() {
            try {
                $(".upgrade,#up_loading").show();
                $.getJSON('/getClientGroupList', null, function(data) {
                    $("#up_loading").hide();
                    if (data) {
                        $("#upg_tbody_id").html("");
                        var currLevel = '',
                            seq = 0,
                            rowTmp = null,
                            curCls = '';
                        for (var t in data) { //找出对应排序号，按排序号分等级
                            if (data[t].clientGroupId == indexJS.userInfo.clientGroup) {
                                seq = data[t].sequence;
                            }
                        }
                        for (var i = 0; i < data.length; i++) {
                            rowTmp = data[i];
                            curCls = '';
                            if (rowTmp.clientGroupId == indexJS.userInfo.clientGroup) {
                                currLevel = "当前级别";
                                curCls = "current";
                            } else if (rowTmp.clientGroupId != "visitor" && seq < rowTmp.sequence) {
                                currLevel = rowTmp.clientGroupId == 'vip' ? '联系客服升级' : '<a href="javascript:" t="' + rowTmp.clientGroupId + '">升级</a>';
                            } else {
                                currLevel = '---';
                            }
                            if (common.isBlank(common.trim(rowTmp.remark))) {
                                continue;
                            }
                            var trDomArr = [];
                            trDomArr.push('<tr class="' + curCls + '"><td><p>' + box.getUserLevelShortName(rowTmp.clientGroupId) + '</p></td><td><p class="p2">' + common.trim(rowTmp.remark) + '</p></td><td><p>' + common.trim(rowTmp.authorityDes) + '</p></td><td>' + currLevel + '</td></tr>');
                            $("#upg_tbody_id").append(trDomArr.join(""));
                        }
                        //升级点击事件
                        $("#upg_tbody_id a").click(function() {
                            var _this = $(this);
                            var loc_upLevel = _this.attr("t");
                            common.getJson("/upgrade", { clientGroup: loc_upLevel }, function(result) {
                                _this.attr('disabled', false);
                                if (result.isOK) {
                                    if (result.clientGroup === "active" && "notActive" === loc_upLevel) {
                                        $("#studioUpgA").show();
                                    } else {
                                        $("#studioUpgA").hide();
                                    }
                                    $(".upgrade,.upgrade_result .fail").hide();
                                    $(".upgrade_result,.upgrade_result .succ").show();
                                } else {
                                    var loc_msg = "";
                                    if ("active" === loc_upLevel) {
                                        loc_msg = "很遗憾，您未激活金道真实交易账户，升级失败！<br>如有疑问请联系客服！";
                                    } else if ("notActive" === loc_upLevel) {
                                        loc_msg = "很遗憾，您未开通金道真实交易账户，升级失败！<br>如有疑问请联系客服！";
                                    } else if ("simulate" === loc_upLevel) {
                                        loc_msg = "很遗憾，您未开通金道模拟交易账户，升级失败！<br>如有疑问请联系客服！";
                                    }
                                    $(".upgrade_result .succ").hide();
                                    $(".upgrade_result,.upgrade_result .fail").show();
                                    $(".upgrade_result .fail>span").html(loc_msg);
                                }
                            }, true, function(err) {
                                _this.attr('disabled', false);
                            });
                        });
                    }
                });
            } catch (e) {
                $("#up_loading").hide();
                console.error("getClientGroupList->" + e);
            }
        });
    },

    /**
     * 交易账号登录事件
     */
    accountLoginEvent: function() {
        /**
         * 提取验证码
         */
        $('#verMalCodeId').click(function() {
            $("#verMalCodeId img").attr("src", '/getVerifyCode?code=acLogin&t=' + new Date().getTime());
        });
        /**
         * 登录按钮事件
         */
        $('#accountLoginBtn').click(function() {
            if ($(this).prop("disabled")) {
                return;
            }
            if (common.isBlank($('#loginForm [name="accountNo"]').val())) {
                $('#acclogtip').html('<i></i>请输入交易账号').show();
            } else if (common.isBlank($('#loginForm [name="pwd"]').val())) {
                $('#acclogtip').html('<i></i>请输入密码').show();
            } else if (common.isBlank($('#loginForm [name="verMalCode"]').val())) {
                $('#acclogtip').html('<i></i>请输入验证码').show();
            } else {
                $(this).prop('disabled', true);
                var _this = this;
                $('#formBtnLoad').show();
                $('#acclogtip').hide();
                $('#loginForm input[name=clientStoreId]').val(indexJS.userInfo.clientStoreId);
                $('#loginForm [name="cookieId"]').val(chatAnalyze.getUTMCookie());
                $('#loginForm [name="visitorId"]').val(indexJS.userInfo.visitorId || '');
                $('#loginForm [name="roomName"]').val($('#roomInfoId').text());
                $('#loginForm [name="roomId"]').val(indexJS.userInfo.groupId);
                $('#loginForm [name="courseId"]').val(indexJS.courseTick.course.courseId || '');
                $('#loginForm [name="courseName"]').val(indexJS.courseTick.course.courseName);
                $('#loginForm [name="teacherId"]').val(indexJS.courseTick.course.lecturerId || '');
                $('#loginForm [name="teacherName"]').val(indexJS.courseTick.course.lecturer || '');
                common.getJson("/pmLogin", $("#loginForm").serialize(), function(result) {
                    $("#loginForm .error").hide();
                    $(_this).prop('disabled', false);
                    $('#formBtnLoad').hide();
                    if (!result.isOK) {
                        $("#loginForm .error").html("<i></i>" + result.error.errmsg).show();
                        $('#verMalCodeId').click(); //获取图片验证码
                        return false;
                    } else {
                        $(".blackbg,#loginBox").hide();
                        LoginAuto.setAutoLogin($("#acAutoLogin").prop("checked"));
                        indexJS.userInfo.clientGroup = result.userInfo.clientGroup;
                        if (box.toRoomId) {
                            videosTrain.changeRoomOrSignup(box.toRoomId);
                        } else {
                            indexJS.toRefreshView();
                        }
                    }
                }, true, function(err) {
                    $(_this).prop('disabled', false);
                    $('#formBtnLoad').hide();
                });
            }
        });
    },

    /**
     * 登录相关事件
     */
    loginEvent: function() {
        //登录界面控制
        $("#loginForm .login_option a").bind("click", function() {
            var type = $(this).attr("lt");
            $("#loginForm .login_option a.selected").removeClass("selected");
            $(this).addClass("selected");
            $("#loginForm .in_line[lt]").hide();
            $("#loginForm .in_line[lt='" + type + "']").show();
            $("#loginForm .fr[lt]").hide();
            $("#loginForm .fr[lt='" + type + "']").show();
            $("#loginType").val(type);
        });
        //忘记密码
        $("#preSetPwdBtn,#preSetPwdBtn2").bind("click", function() {
            box.openSettingBox("password2");
        });

        /**
         * 忘记密码2
         */
        $("#popBoxPassword2 .set_submit").click(function() {
            if ($(this).prop("disabled") || !box.checkFormInput($("#popBoxPassword2"))) {
                return;
            }
            $(this).prop('disabled', true);
            $('#popBoxPassword2 .img-loading').show();
            var _this = this;
            common.getJson("/resetPwd", $("#popBoxPassword2 form").serialize(), function(result) {
                box.showBoxError($("#popBoxPassword2"));
                $(_this).prop('disabled', false);
                $('#popBoxPassword2 .img-loading').hide();
                if (!result.isOK) {
                    box.showBoxError($("#popBoxPassword2"), "<i></i>" + result.msg);
                    return false;
                } else {
                    $("#popBoxPassword3_mb").val(result.mobilePhone);
                    box.openSettingBox("password3");
                }
            }, true, function(err) {
                $(_this).prop('disabled', false);
                $('#popBoxPassword2 .img-loading').hide();
            });
        });

        /**
         * 忘记密码3
         */
        $("#popBoxPassword3 .set_submit").click(function() {
            if ($(this).prop("disabled") || !box.checkFormInput($("#popBoxPassword3"))) {
                return;
            }
            $(this).prop('disabled', true);
            $('#popBoxPassword3 .img-loading').show();
            var _this = this;
            common.getJson("/resetPwd", $("#popBoxPassword3 form").serialize(), function(result) {
                box.showBoxError($("#popBoxPassword3"));
                $(_this).prop('disabled', false);
                $('#popBoxPassword3 .img-loading').hide();
                if (!result.isOK) {
                    box.showBoxError($("#popBoxPassword3"), "<i></i>" + result.msg);
                    return false;
                } else {
                    box.showTipBox("重置密码成功，请使用新密码登录！");
                    box.openLgBox();
                }
            }, true, function(err) {
                $(_this).prop('disabled', false);
                $('#popBoxPassword3 .img-loading').hide();
            });
        });

        //用户注册
        $("#preRegBtn").bind("click", function() {
            box.openSettingBox("reg");
        });
        //注册页面登录按钮
        $("#reg_login").bind("click", function() {
            box.openLgBox();
        });
        /*登录方式tab切换*/
        $('.logintabnav a').click(function() {
            $(this).parent().find('a').removeClass('on');
            $(this).parent().parent().find('.logintab').removeClass('on');
            $(this).addClass('on');
            $($(this).parent().parent().find('.logintab')[$(this).index()]).addClass('on');
            // 账号登录时获取图片验证码
            if ($(this).index() == 1) {
                $('#verMalCodeId').click();
            }
        });
        /**
         * 用户注册
         */
        $("#popBoxRegister .set_submit").click(function() {
            if ($(this).prop("disabled") || !box.checkFormInput($("#popBoxRegister"))) {
                return;
            }
            $(this).prop('disabled', true);
            $('#popBoxRegister .img-loading').show();
            $('#popBoxRegister form [name="cookieId"]').val(chatAnalyze.getUTMCookie());
            $('#popBoxRegister form [name="visitorId"]').val(indexJS.userInfo.visitorId || '');
            $('#popBoxRegister form [name="clientStoreId"]').val(indexJS.userInfo.clientStoreId || '');
            $('#popBoxRegister form [name="roomName"]').val($('#roomInfoId').text());
            $('#popBoxRegister form [name="courseId"]').val(indexJS.courseTick.course.courseId || '');
            $('#popBoxRegister form [name="courseName"]').val(indexJS.courseTick.course.courseName);
            $('#popBoxRegister form [name="teacherId"]').val(indexJS.courseTick.course.lecturerId || '');
            $('#popBoxRegister form [name="teacherName"]').val(indexJS.courseTick.course.lecturer || '');
            var _this = this;
            common.getJson("/reg", $("#popBoxRegister form").serialize(), function(result) {
                box.showBoxError($("#popBoxRegister"));
                $(_this).prop('disabled', false);
                $('#popBoxRegister .img-loading').hide();
                if (!result.isOK) {
                    box.showBoxError($("#popBoxRegister"), "<i></i>" + result.msg);
                    return false;
                } else {
                    $(".blackbg,#popBoxRegister").hide();
                    $("#regLpBtn").attr("href", "http://www.24k.hk/activity/studioLottery/index.html?userId=" + result.userId + "#ba");
                    $(".register_result").show();
                }
            }, true, function(err) {
                $(_this).prop('disabled', false);
                $('#popBoxRegister .img-loading').hide();
            });
        });
        //注册成功
        $(".register_result .pop_close").bind("click", function() {
            indexJS.toRefreshView();
        });
        // 弹出登录框
        $('#login_a').bind("click", function(e, ops) {
            ops = ops || {};
            box.toRoomId = ops.groupId;
            box.openLgBox(ops.closeable, ops.showTip, ops.loginTime);
        });
        /**
         * 注销
         */
        $("#logout").bind("click", function() {
            LoginAuto.setAutoLogin(false);
            window.location.href = "/logout?platform=" + indexJS.fromPlatform + '&cookieId=' + chatAnalyze.getUTMCookie() + '&roomName=' + $('#roomInfoId').text() +
                '&courseName=' + indexJS.courseTick.course.courseName + '&courseId=' + indexJS.courseTick.course.courseId || '' + '&teacherId=' + indexJS.courseTick.course.lecturerId || '' +
                '&teacherName=' + indexJS.courseTick.course.lecturer || '';
        });
        //验证码事件
        $('#loginForm .rbtn,#popBoxPassword2 .rbtn,#popBoxRegister .rbtn').click(function() {
            if ($(this).hasClass("pressed")) {
                return;
            }
            var boxPanel = $(this).parents(".popup_box:first");
            var mobile = boxPanel.find("input[name=mobilePhone]").val();
            if (!common.isMobilePhone(mobile)) {
                box.showBoxError(boxPanel, "<i></i>手机号码有误，请重新输入！");
                return;
            }
            var jsonData = {
                mobilePhone: mobile,
                useType: $(this).attr("ut")
            }
            box.getMobileVerifyCode(jsonData, $(this), false, function(data) {
                if (!data || data.result != 0) {
                    if (data.errcode == "1005") {
                        box.showBoxError(boxPanel, "<i></i>" + data.errmsg);
                    } else {
                        console.error("提取数据有误！");
                    }
                    box.resetVerifyCode(boxPanel);
                } else {
                    box.showBoxError(boxPanel);
                    box.setVerifyCodeTime(boxPanel.attr("id"));
                }
            });

        });
        /**
         * 按钮按回车键事件
         */
        $("#loginForm input[name=verifyCode],#setNkForm input[name=nickname],#loginForm input[name=password]").keydown(function(e) {
            if (e.keyCode == 13) {
                $(this).parents("form").find(".set_submit").click();
                return false;
            }
        });
        /**
         * 登录按钮事件
         */
        $("#logBtnSub").click(function() {
            if ($(this).prop("disabled")) {
                return;
            }
            $('#loginForm input[name=clientStoreId]').val(indexJS.userInfo.clientStoreId);
            if (!box.checkFormInput($("#loginForm"))) {
                return;
            }
            $(this).prop('disabled', true);
            var _this = this;
            $('#formBtnLoad').show();
            $('#loginForm [name="cookieId"]').val(chatAnalyze.getUTMCookie());
            $('#loginForm [name="visitorId"]').val(indexJS.userInfo.visitorId || '');
            $('#loginForm [name="roomName"]').val($('#roomInfoId').text());
            $('#loginForm [name="roomId"]').val(indexJS.userInfo.groupId || '');
            $('#loginForm [name="courseId"]').val(indexJS.courseTick.course.courseId || '');
            $('#loginForm [name="courseName"]').val(indexJS.courseTick.course.courseName);
            $('#loginForm [name="teacherId"]').val(indexJS.courseTick.course.lecturerId || '');
            $('#loginForm [name="teacherName"]').val(indexJS.courseTick.course.lecturer);
            common.getJson("/login", $("#loginForm").serialize(), function(result) {
                var verifyCode = $('#loginForm input[name="verifyCode"]').val();
                var mobile = $('#loginForm input[name="mobilePhone"]').val();
                $("#mobilVerifyCode").val(verifyCode);
                $("#mobile").val(mobile);
                $("#loginForm .error").hide();
                $(_this).prop('disabled', false);
                $('#formBtnLoad').hide();
                if (!result.isOK) {
                    if (result.error.errcode == '1008' && $("#loginType").val() == 'verify') {
                        $(".blackbg,#loginBox").hide();
                        $('.set_psw').show();
                    } else {
                        $("#loginForm .error").html("<i></i>" + result.error.errmsg).show();
                        return false;
                    }
                } else {
                    $(".blackbg,#loginBox").hide();
                    LoginAuto.setAutoLogin($("#autoLogin").prop("checked"));
                    indexJS.userInfo.clientGroup = result.userInfo.clientGroup;
                    if (box.toRoomId) {
                        videosTrain.changeRoomOrSignup(box.toRoomId);
                    } else {
                        indexJS.toRefreshView();
                    }
                }
            }, true, function(err) {
                $(_this).prop('disabled', false);
                $('#formBtnLoad').hide();
            });
        });

        $(".sdking_rule .rank_tabnav a").click(function() {
            $(".sdking_rule .rank_tabnav a").removeClass("on");
            $('.sdking_rule .sd_ranklist .ranklist').removeClass("on");
            $(this).addClass("on");
            $('.sdking_rule .sd_ranklist .ranklist[t=' + $(this).attr("t") + ']').addClass("on");
        });
        $('.sdking_rule .sd_ranklist').css('height', '240px');
        indexJS.setListScroll('.sdking_rule .sd_ranklist');


        /* 设置初始密码 */
        $('#setPwd').click(function() {
            var oldPwd = $("#mobilVerifyCode").val(),
                newPwd = $('#loginNewPwd').val();
            if (common.isBlank(newPwd)) {
                $('.set_psw .error').html('<i></i>请输入新密码！').removeClass('dn');
                return;
            } else if (!/^.{6,20}$/.test(newPwd)) {
                $('.set_psw .error').html('<i></i>密码由6至20数字、字母、符号组成！').removeClass('dn');
                return;
            }
            $('.set_psw .error').addClass('dn');
            $(this).prop('disabled', true);
            var _this = this,
                params = { password: oldPwd, newPwd: newPwd, newPwd1: newPwd, item: '' };
            common.getJson("/modifyPwd", { params: JSON.stringify(params) }, function(result) {
                $(_this).attr('disabled', false);
                if (!result.isOK) {
                    $('.set_psw .error').html('<i></i>' + (result.msg ? result.msg : "修改失败，请联系客服！")).removeClass('dn');
                    return false;
                } else {
                    box.openLgBox(true, false, null);
                    $('.set_psw').hide();
                    $('.set_psw form input[name="loginNewPwd"]').val('');
                    indexJS.toRefreshView();
                }
            }, true, function(err) {
                $(_this).prop('disabled', false);
            });
        });

        /* 设置密码跳过 */
        $('.jumpbtn').click(function() {
            $('.set_psw').hide();
            indexJS.toRefreshView();
        });
    },
    /**
     * 提取用户等级简称
     * @param clientGroup
     */
    getUserLevelShortName: function(clientGroup) {
        var levelClsName = '';
        switch (clientGroup) {
            case "vip":
                levelClsName = "l4";
                break;
            case "real":
                levelClsName = "l3";
                break;
            case "active":
                levelClsName = "l3";
                break;
            case "notActive":
                levelClsName = "l3";
                break;
            case "simulate":
                levelClsName = "l2";
                break;
            case "register":
                levelClsName = "l1";
                break;
            default:
                levelClsName = "l0";
        }
        return '<i class="level ' + levelClsName + '"></i>';
    },
    /**
     * 检查页面输入
     */
    checkFormInput: function(formDom) {
        var isTrue = true;
        box.showBoxError(formDom);
        formDom.find("input").each(function() {
            if (!$(this).is(":visible")) {
                return;
            }
            if (common.isBlank($(this).val())) {
                if (this.name == 'mobilePhone' || this.name == 'userId') {
                    box.showBoxError(formDom, "<i></i>手机号码不能为空！");
                }
                if (this.name == 'verifyCode') {
                    box.showBoxError(formDom, "<i></i>验证码不能为空！");
                }
                if (this.name == 'nickname') {
                    box.showBoxError(formDom, "<i></i>昵称不能为空！");
                }
                if (this.name == 'password0') {
                    box.showBoxError(formDom, "<i></i>原始密码不能为空！");
                }
                if (this.name == 'password') {
                    box.showBoxError(formDom, "<i></i>密码不能为空！");
                }
                if (this.name == 'password1') {
                    box.showBoxError(formDom, "<i></i>确认密码不能为空！");
                }
                isTrue = false;
                return isTrue;
            } else {
                if (this.name == 'nickname' && !common.isRightName(this.value)) {
                    box.showBoxError(formDom, "<i></i>昵称为2至10位字符(数字/英文/中文/下划线)，不能全数字!");
                    isTrue = false;
                    return isTrue;
                }
                if (this.name == "password") {
                    if (!/^.{6,20}$/.test(this.value) && formDom.attr("id") != "loginForm") {
                        box.showBoxError(formDom, "<i></i>密码由6至20数字、字母、符号组成！");
                        isTrue = false;
                        return isTrue;
                    }
                }
            }
        });
        if (!isTrue) {
            return isTrue;
        }
        var pwdInputs = formDom.find("input[type='password']");
        var size = pwdInputs.size();
        if (size == 2 && pwdInputs.eq(size - 2).val() != pwdInputs.eq(size - 1).val() && formDom.attr("id") != 'loginForm') {
            box.showBoxError(formDom, "<i></i>两次密码输入不一致！");
            isTrue = false;
            return isTrue;
        }
        return isTrue;
    },
    /**
     * 设置验证码
     * @param tId
     */
    setVerifyCodeTime: function(tId) {
        var rbtn = $("#" + tId + " .rbtn");
        var t = parseInt(rbtn.attr("t")) || 120;
        if (!this.verifyCodeIntMap[tId]) {
            this.verifyCodeIntMap[tId] = setInterval("box.setVerifyCodeTime('" + tId + "')", 1000);
        }
        if (t > 1) {
            rbtn.attr("t", t - 1).html("重新获取(" + (t - 1) + ")");
        } else {
            clearInterval(this.verifyCodeIntMap[tId]);
            this.verifyCodeIntMap[tId] = null;
            rbtn.attr("t", 120).html("获取验证码").removeClass("pressed");
        }
    },
    /**
     * 重置验证码
     */
    resetVerifyCode: function(boxPanel) {
        var tId = boxPanel.attr("id");
        if (this.verifyCodeIntMap[tId]) {
            clearInterval(this.verifyCodeIntMap[tId]);
            this.verifyCodeIntMap[tId] = null;
        }
        boxPanel.find(".rbtn").attr("t", 120).html("获取验证码").removeClass("pressed");
    },
    /**
     * 弹出登录框
     */
    openLgBox: function(closeable, showTip, lgTime) {
        if (closeable === false || $(".login").data("closeable") === false) {
            $(".pop_close").hide();
            $(".login").data("closeable", false);
        } else {
            $(".pop_close").show();
        }
        if (showTip) {
            lgTime = lgTime || 1;
            $("#login_tip").show().text($('#setlogintip').text());
        } else {
            $("#login_tip").hide();
        }
        $(".popup_box").hide();
        common.openPopup('.blackbg,.login');
        $('#verMalCodeId').click(); //获取图片验证码
    },
    /**
     * 打开用户相关设置框（注册框、重设密码）
     * @param type reg password1 password2 password3 nickname
     */
    openSettingBox: function(type) {
        $(".popup_box").hide();
        var boxPanel = null;
        switch (type) {
            case "reg":
                boxPanel = $("#popBoxRegister");
                break;
            case "password1":
                boxPanel = $("#popBoxPassword1");
                break;
            case "password2":
                boxPanel = $("#popBoxPassword2");
                break;
            case "password3":
                boxPanel = $("#popBoxPassword3");
                break;
            case "nickname":
                boxPanel = $("#popBoxNickname");
                break;
        }
        if (box) {
            box.showBoxError(boxPanel);
            boxPanel.find("input[type='text'],input[type='password']").each(function() {
                $(this).val("");
            });
            boxPanel.show();
            $(".blackbg").show();
        }
    },
    /**
     * 显示错误消息
     * @param panel
     * @param [message]
     */
    showBoxError: function(panel, message) {
        if (message) {
            panel.find(".error").html(message).show();
        } else {
            panel.find(".error").html("").hide();
        }
    },
    /**
     * 提取验证码
     */
    refreshVerifyCode: function() {
        var groupType = LoginAuto.sessionUser['groupType'];
        $("#verifyCodeId img").attr("src", '/getVerifyCode?code=email&v=' + Math.random());
    },
    /**
     * 修改头像事件
     */
    modifyAvatarEvent: function() {
        /*修改头像按钮事件*/
        $("#modifyAvatar").click(function() {
            var fFrom = $("#fileForm");
            var file = fFrom.find("input[type=file]");
            if ("true" != fFrom.attr("hasEv")) {
                fFrom.attr("hasEv", "true");
                file.change(function() {
                    var _this = this;
                    var img = _this.files[0];
                    // 判断是否图片
                    if (!img) {
                        return false;
                    }
                    // 判断图片格式
                    if (!(img.type.indexOf('image') == 0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase()))) {
                        alert('目前暂支持jpg,gif,png格式的图片！');
                        return false;
                    }
                    var fileSize = img.size;
                    if (fileSize >= 1024 * 512) {
                        alert('上传的图片大小不要超过512KB.');
                        return false;
                    }
                    try {
                        var formData = new FormData($("#fileForm")[0]);
                        $.ajax({
                            url: indexJS.apiUrl + '/upload/uploadFile',
                            type: 'POST',
                            data: formData,
                            async: false,
                            cache: false,
                            contentType: false,
                            processData: false,
                            success: function(dataRt) {
                                if (dataRt.result == 0) {
                                    var data = dataRt.data ? dataRt.data[0] : null;
                                    if (data) {
                                        var params = { item: 'register_avatar' };
                                        common.getJson("/modifyAvatar", { avatar: (data.fileDomain + data.filePath), params: JSON.stringify(params) }, function(result) {
                                            if (!result.isOK) {
                                                console.error("上传头像失败，请联系在线客服！");
                                            } else {
                                                $("#avatarInfoId").attr("src", result.avatar);
                                                $("#userListId li .mynk").prev().find("img").attr("src", result.avatar);
                                                indexJS.userInfo.avatar = result.avatar;
                                                $(_this).val('');
                                            }
                                        }, true, function() {
                                            alert("上传头像失败，请联系在线客服！");
                                        });
                                    }
                                } else {
                                    alert("上传头像失败，请联系在线客服！");
                                }
                            },
                            error: function(result) {
                                console.error("error:", result);
                            }
                        });
                    } catch (es) {
                        console.error("上传图片失败", es);
                    }

                });
            }
            file.click();
        });
    },
    /**
     * 修改用户名事件
     */
    modifyUserNameEvent: function() {
        $('#setUserName').click(function() {
            $(this).addClass('dn');
            $('#myUserName').removeAttr('disabled').focus();
            $('#saveUserName').removeClass('dn');
        });
        /**
         * 设置用户名
         */
        $("#saveUserName").click(function() {
            var userName = $('#myUserName').val();
            if (common.isBlank(userName)) {
                box.showMsg('请输入用户名');
                return;
            }
            $(this).prop('disabled', true);
            var _this = this;
            common.getJson("/modifyUName", { params: JSON.stringify({ userName: userName, item: '' }) }, function(result) {
                $(_this).attr('disabled', false);
                if (!result.isOK) {
                    box.showMsg((result.msg ? result.msg : "修改失败，请联系客服！"));
                    return false;
                } else {
                    box.showMsg("修改成功");
                    $('#myUserName').prop('disabled', true);
                    $('#saveUserName').addClass('dn');
                    $('#setUserName').removeClass('dn');
                }
            }, true, function(err) {
                $(_this).attr('disabled', false);
            });
        });
    },
    /**
     * 修改邮箱事件
     */
    modifyEmailEvent: function() {
        $('#bindEmail').click(function() {
            $(this).addClass('dn');
            $('#myEmail').removeAttr('disabled').focus();
            $('#saveEmail').removeClass('dn');
        });
        $('#saveEmail').click(function() {
            var email = $('#myEmail').val();
            if (common.isBlank(email)) {
                box.showMsg('请输入邮箱地址');
                return;
            } else if (!common.isEmail(email)) {
                box.showMsg('邮箱地址有误');
                return;
            } else {
                $(this).prop('disabled', true);
                var _this = this;
                common.getJson("/modifyEmail", { params: JSON.stringify({ email: email }) }, function(result) {
                    $(_this).attr('disabled', false);
                    if (!result.isOK) {
                        box.showMsg((result.msg ? result.msg : "修改失败，请联系客服！"));
                        return false;
                    } else {
                        box.showMsg(result.msg);
                        $('#myEmail').prop('disabled', true);
                        $('#saveEmail').addClass('dn');
                        $('#bindEmail').removeClass('dn');
                    }
                }, true, function(err) {
                    $(_this).attr('disabled', false);
                });
            }
        });
    },
    /**
     * 修改昵称事件
     */
    modifyNickNameEvent: function() {
        $('#modifyNk').click(function() {
            $(this).addClass('dn');
            $('#myNickName').removeAttr('disabled').focus();
            $('#setNkBtn').removeClass('dn');
        });
        /**
         * 设置昵称信息
         */
        $("#setNkBtn").click(function() {
            var nickName = $('#myNickName').val();
            if (common.isBlank(nickName)) {
                box.showMsg('请输入昵称');
                return;
            } else if (!common.isRightName(nickName)) {
                box.showMsg('昵称为2至10位字符(数字/英文/中文/下划线)，不能全数字!');
                return;
            } else {
                $(this).prop('disabled', true);
                var _this = this;
                common.getJson("/modifyName", { nickname: nickName }, function(result) {
                    $(_this).attr('disabled', false);
                    if (!result.isOK) {
                        box.showMsg((result.msg ? result.msg : "修改失败，请联系客服！"));
                        return false;
                    } else {
                        indexJS.refreshNickname(true, result.nickname);
                        $('#myNickName').prop('disabled', true);
                        $('#setNkBtn').addClass('dn');
                        $('#modifyNk').removeClass('dn');
                        $('.nickNameTip').addClass('dn');
                    }
                }, true, function(err) {
                    $(_this).attr('disabled', false);
                });
            }
        });
    },
    /**
     * 修改密码事件
     */
    modifyPasswordEvent: function() {
        $('#modifyPwd').click(function() {
            common.openPopup($('.change_psw'));
        });
        $('#savePwd').click(function() {
            var password = $('#oPwd').val(),
                newPwd = $('#newPwd').val(),
                newPwd1 = $('#newPwd1').val();
            if (common.isBlank(password) && $('#oPwd').attr('s') == 'true') {
                $('.change_psw .error').html('<i></i>请输入原始密码！').removeClass('dn');
                return;
            } else if (common.isBlank(newPwd)) {
                $('.change_psw .error').html('<i></i>请输入新密码！').removeClass('dn');
                return;
            } else if (!/^.{6,20}$/.test(newPwd)) {
                $('.change_psw .error').html('<i></i>密码由6至20数字、字母、符号组成！').removeClass('dn');
                return;
            } else if (common.isBlank(newPwd1)) {
                $('.change_psw .error').html('<i></i>请输入确认新的密码！').removeClass('dn');
                return;
            } else if (newPwd != newPwd1) {
                $('.change_psw .error').html('<i></i>两次密码输入不一致！').removeClass('dn');
                return;
            }
            $('.change_psw .error').addClass('dn');
            $(this).prop('disabled', true);
            var _this = this,
                params = { password: password, newPwd: newPwd, newPwd1: newPwd1, item: '' };
            common.getJson("/modifyPwd", { params: JSON.stringify(params) }, function(result) {
                $(_this).attr('disabled', false);
                if (!result.isOK) {
                    $('.change_psw .error').html('<i></i>' + (result.msg ? result.msg : "修改失败，请联系客服！")).removeClass('dn');
                    return false;
                } else {
                    box.openLgBox(true, false, null);
                    $('#myPwd').prop('disabled', true);
                    $('.change_psw').hide();
                    $('.change_psw form input[type="password"]').val('');
                }
            }, true, function(err) {
                $(_this).prop('disabled', false);
            });
        });
    },
    /**隐藏消息*/
    hideMsg: function() {
        if ($("#popMsgBox").is(":visible")) {
            $("#popMsgBox").fadeOut("normal", "swing", function() {
                if ($('div.popup_box:visible').length < 1 && $("div.pletter_win:visible").length < 1) {
                    $(".blackbg").hide();
                }
            });
        }
    },
    /**显示消息*/
    showMsg: function(ops) {
        if (typeof ops == "string") {
            ops = { msg: ops };
        }
        ops = $.extend({
            closeable: true,
            title: "",
            msg: "",
            modal: true,
            delay: 0,
            btns: [{
                txt: "确定",
                fn: function() {
                    box.hideMsg();
                }
            }]
        }, ops);
        $("#popMsgTit").text(ops.title || "");
        $("#popMsgTxt").html(ops.msg);
        var contDom = $("#popMsgCont");
        contDom.find("a.yesbtn").remove();
        var btnObj = null,
            btnDom = null;
        for (var i = 0, lenI = ops.btns ? ops.btns.length : 0; i < lenI; i++) {
            btnObj = ops.btns[i];
            btnDom = $('<a class="yesbtn" href="javascript:void(0)">' + btnObj.txt + '</a>');
            contDom.append(btnDom);
            btnDom.click(btnObj.fn);
        }
        if (ops.closeable) {
            $("#popMsgClo").show();
        } else {
            $("#popMsgClo").hide();
        }
        $("#popMsgBox").show();
        if (ops.modal) {
            $(".blackbg").show();
        }
        if (ops.delay) {
            window.setTimeout(function() {
                box.hideMsg();
            }, ops.delay);
        }
    },
    /**
     * 信息浮动提示
     * @param msg
     */
    showTipBox: function(msg) {
        $(".tipsbox").fadeIn().delay(1000).fadeOut(200).find(".cont").text(msg);
    },
    /**
     * 防止刷新获取手机验证码
     */
    contVerifyCodeTime: function() {
        var mobile = $("#loginForm input[name=mobilePhone]").val();
        if (mobile && this.enable) {
            var key = this.storeInfoKey + mobile;
            var t = store.get(key);
            if (t > 1) {
                var tId = "#loginForm .rbtn";
                $(tId).attr("t", t).addClass("pressed");
                box.setVerifyCodeTime(tId);
            }
        }
    },
    /**
     * 课件下载
     */
    setDownloadPPT: function(currPage, sort) {
        if (common.isBlank(sort)) {
            sort = '{"sequence":"desc","publishStartDate":"desc"}';
        }
        indexJS.getArticleList("download", indexJS.userInfo.groupId, 1, currPage, 5, sort, null, function(dataList) {
            $('#totalRecords').text('共' + dataList.totalRecords);
            $('#page b').text(dataList.pageNo);
            $('#page span').text(Math.ceil(dataList.totalRecords / 5));
            if (dataList && dataList.result == 0) {
                var data = dataList.data,
                    row = null;
                var pptHtml = [],
                    pptFormat = box.formatHtml('download');
                var $panel = $('.downtable table tbody');
                $panel.html("");
                for (var i in data) {
                    pptHtml = [];
                    row = data[i].detailList[0];
                    var suffix = data[i].mediaUrl.substring(data[i].mediaUrl.lastIndexOf('.') + 1).toLowerCase();
                    var name = row.title + '.' + suffix;
                    var publishDate = common.formatterDate(data[i].publishStartDate, '-').replace('-', '/').replace('-', '/');
                    pptHtml.push(pptFormat.formatStr(suffix, row.title, (row.authorInfo ? row.authorInfo.name : ''), publishDate, data[i].point, (common.isBlank(data[i].downloads) ? 0 : data[i].downloads), name, data[i]._id, row.remark, (common.isBlank(row.remark) ? ' style="display:none;"' : '')));
                    pptHtml = $(pptHtml.join(""));
                    $(pptHtml).find('a.downbtn').data("file_url", data[i].mediaUrl);
                    $panel.append(pptHtml);
                }
                box.setDownloads();
            }
        });
    },
    /**
     * 设置下载次数
     */
    setDownloads: function() {
        $('.downtable table tbody a.downbtn').click(function() {
            var _this = $(this);
            var params = { groupType: indexJS.userInfo.groupType, item: 'used_download', remark: '下载' + _this.attr('dn'), val: -parseInt(_this.attr('p')), tag: 'download_' + _this.attr('_id') };
            common.getJson('/addPointsInfo', { params: JSON.stringify(params) }, function(result) {
                if (result.isOK) {
                    common.getJson(indexJS.apiUrl + '/common/modifyArticle', { id: _this.attr('_id'), 'type': 'downloads' }, function(data) {
                        if (data.isOK) {
                            if (common.isValid(result.msg) && typeof result.msg.change == 'number') {
                                box.showMsg('消费' + (-result.msg.change) + '积分');
                            }
                            _this.parent().prev().text(data.num);
                        }
                    });
                    if ($.inArray(_this.attr('sufix'), ['pdf', 'png', 'jpg', 'jpeg', 'gif']) > -1) {
                        window.open(_this.data("file_url"));
                    } else {
                        window.location.href = _this.data("file_url");
                    }
                } else {
                    box.showMsg(result.msg);
                    return false;
                }
            });
        });
    },
    /**
     * 获取资料下载排序
     * @returns {string}
     */
    getDownloadSort: function() {
        var sort = '';
        switch ($('.infodown .ranknavbar a.on').attr('sort')) {
            case 'point':
                sort = '{"point":"desc"}';
                break;
            case 'uptime':
                sort = '{"createDate":"desc"}';
                break;
        }
        return sort;
    },
    /**
     * 获取会员权益内容
     * @param code
     */
    setVipBeneFit: function(code) {
        if (common.isBlank(code)) {
            code = 'member_activity';
        }
        indexJS.getArticleList(code, indexJS.userInfo.groupId, 1, 1, 1, '{"sequence":"desc","publishStartDate":"desc"}', null, function(dataList) {
            if (dataList && dataList.result == 0) {
                var data = dataList.data[0].detailList[0];
                $('div[t=' + code + '] .benefit_table').html(data.content);
            }
        });
    },
    /**
     * 根据内容域模块名返回内容模板
     * @param region 内容域模块名
     * @returns {string}
     */
    formatHtml: function(region) {
        var formatHtmlArr = [];
        switch (region) {
            case 'download':
                formatHtmlArr.push('<tr>');
                formatHtmlArr.push('    <td>{0}</td>');
                formatHtmlArr.push('    <td class="sname">{1}');
                formatHtmlArr.push('        <div class="arr"{9}><i></i><i class="i2"></i></div>');
                formatHtmlArr.push('        <div class="cmbox"{9}>');
                formatHtmlArr.push('            <div class="cont">');
                formatHtmlArr.push('                <b>推荐理由：</b>');
                formatHtmlArr.push('                <p>{8}</p>');
                formatHtmlArr.push('            </div>');
                formatHtmlArr.push('        </div>');
                formatHtmlArr.push('    </td>');
                formatHtmlArr.push('    <td>{2}</td>');
                formatHtmlArr.push('    <td>{3}</td>');
                formatHtmlArr.push('    <td>{4}积分</td>');
                formatHtmlArr.push('    <td>{5}</td>');
                formatHtmlArr.push('    <td><a href="javascript:void(0);" target="download" dn="{6}" p="{4}" _id="{7}" class="downbtn" sufix="{0}" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'header_zl_download\', \'content_top\', 1, true]);">下载</a></td>');
                formatHtmlArr.push('</tr>');
                break;
            case 'signin':
                formatHtmlArr.push('<li>');
                formatHtmlArr.push('     <div class="himg"><img src="{0}" alt=""></div>');
                formatHtmlArr.push('     <span>{1}</span>');
                formatHtmlArr.push('</li>');
                break;
        }
        return formatHtmlArr.join('');
    },
    getMobileVerifyCode: function(data, el, isNeedGeet, fn) {
        //需要走geet验证码模式
        if (isNeedGeet) {
            indexJS.geetest.popup.show();
            //重置验证码按钮 避免关闭滑动验证码时 无法再次获取验证码
            box.resetVerifyCode(el.parents(".popup_box:first"));
            indexJS.geetest.popup.onSuccess(function() {
                var validate = indexJS.geetest.popup.getValidate();
                data.geetest_challenge = validate.geetest_challenge;
                data.geetest_validate = validate.geetest_validate;
                data.geetest_seccode = validate.geetest_seccode;
                handler(data);
            });
        } else {
            handler(data);
        }

        function handler(data) {
            el.addClass("pressed").html("发送中...");
            $.getJSON('/getMobileVerifyCode?group=studio&t=' + new Date().getTime(), data, function(result) {
                if (!result || result.result != 0) {
                    if (result.errcode == "1019") {
                        box.getMobileVerifyCode(data, el, true, fn);
                        return;
                    }
                }
                fn(result);
            });
        }
    }
};