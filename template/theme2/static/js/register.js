/**
 * Created by Saman.wan on 2017/8/1.
 */
var Register = new Container({
    panel: $("#page_register"),
    url: "/theme2/template/register.html",
    defaultTime: 120,
    /**配置信息：{$btn : $obj, $input : $obj, intervalId : Id, time : 120}*/
    verifyCodeMap: {}, //{reg:{useType : "studio_register", $btn : $obj, $input : $obj, intervalId : Id, time : 120}}
    groupId: null,
    onLoad: function() {
        Register.setEvent();
    }
});
/**
 * 设置事件
 */
Register.setEvent = function() {
    Register.verifyCodeMap = {
        register: {
            useType: "studio_reg",
            $btn: $("#regForm_vcb"),
            $input: $("#regForm_mb"),
            intervalId: null,
            time: 120
        }
    };
    /**
     * 返回
     */
    $('#back_login').bind('click', Container.back);
    $('.login-con').on('input propertychange', '.f-i-text', function() {
        $('.error-bar').addClass('dn');
        !this.value && $(this).parent().find('.i-input-op').hide();
        !!this.value && $(this).parent().find('.i-input-op').show();
        Register.submitBtnShow();
    });
    //输入清空
    $('.del-btn').bind('click', function() {
        $(this).hide();
        $('.submit-btn').addClass('login-btn-grey');
        $('.error-bar').addClass('dn');
        var _obj = $(this).closest('.input-group');
        _obj.find('.f-i-text').val(null);
    });

    //提交注册操作
    $('.login-con').on('click', '#doRegister', function() {
        Register.doRegister();
    });

    /**
     * 同步注册密码框内容
     */
    $('#passwordRaw').bind('keyup', function() {
        Register.onChangePasswordRaw($(this), 'passwordRaw2');
    });
    $('#passwordRaw2').bind('keyup', function() {
        Register.onChangePasswordRaw($(this), 'passwordRaw');
    });

    //手机校验
    $('#regForm_mb').bind("input propertychange", function() {
        var config = Register.verifyCodeMap['register'];
        if (!config || config.intervalId) {
            return;
        }
        if (Util.isMobilePhone($(this).val())) {
            config.$btn.addClass("pressed");
        } else {
            config.$btn.removeClass("pressed");
        }
    });
    /**
     * 获取动态验证码
     */
    $('#regForm_vcb').bind('click', function() {
        Register.getMobileVerifyCode($(this), 'register');
    });
};
/**
 * 同步输入的密码
 * @param param
 * @param param2
 */
Register.onChangePasswordRaw = function(param, param2) {
    $("#" + param2).val(param.val());
};
/**
 * 登录信息输入完成后高亮登录按钮
 */
Register.submitBtnShow = function() {
    var _inputlen = $('.input-group:visible .i-input-op').length;
    var _inputvlen = $('.input-group:visible .i-input-op:visible').length;
    (_inputvlen === _inputlen) && $('.submit-btn').removeClass('login-btn-grey');
    !(_inputvlen === _inputlen) && $('.submit-btn').addClass('login-btn-grey');
};

//获取验证码
Register.setTime = function(obj) {
    if (Register.countDown == 0) {
        obj.removeAttribute("disabled");
        obj.val("获取动态密码");
        Register.countDown = 119;
        return;
    } else {
        obj.setAttribute("disabled", true);
        obj.val("重新获取(" + Register.countDown + ")");
        Register.countDown--;
    }
    setTimeout(function() {
        Register.setTime(obj)
    }, 1000)
};
/**
 * 重置验证码
 */
Register.resetVerifyCode = function(key) {
    if (Register.verifyCodeMap[key]) {
        var config = Register.verifyCodeMap[key];
        if (config.intervalId) {
            clearInterval(config.intervalId);
            config.intervalId = null;
        }
        config.time = Register.defaultTime;
        config.$btn.val("获取验证码");
        config.$input.trigger("input");
    }
};

/**
 * 验证码倒计时
 */
Register.setVerifyCodeTime = function(key) {
    if (Register.verifyCodeMap[key]) {
        var config = Register.verifyCodeMap[key];
        if (!config.intervalId) {
            config.intervalId = window.setInterval('Register.setVerifyCodeTime("' + key + '")', 1000);
            config.time = 120;
        }
        if (config.time > 1) {
            config.time--;
            config.$btn.val("重新获取(" + (config.time - 1) + ")");
        } else {
            Register.resetVerifyCode(key);
        }
    }
};
/**
 * 获取动态密码
 * @param $this
 * @param vcKey
 */
Register.getMobileVerifyCode = function($this, vcKey) {
    var config = Register.verifyCodeMap[vcKey];
    if (!config || !$this.hasClass("pressed")) {
        return;
    }
    $this.removeClass("pressed").text("发送中...");
    var mobile = config.$input.val();
    var useType = config.useType;
    try {
        $.getJSON('/getMobileVerifyCode?t=' + new Date().getTime(), {
            mobilePhone: mobile,
            useType: useType
        }, function(data) {
            if (!data || data.result != 0) {
                if (data.errcode == "1005") {
                    //studioMbPop.showMessage(data.errmsg);
                } else {
                    console.error("提取数据有误！");
                }
                Register.resetVerifyCode(vcKey);
            } else {
                Register.setVerifyCodeTime(vcKey);
            }
        });
    } catch (e) {
        Register.resetVerifyCode();
        console.error("getMobileVerifyCode->" + e);
    }
};

/**
 * 注册
 */
Register.doRegister = function() {
    Data.getRoom(function(roomInfo) {
        var url = '/reg';
        var params = {
            cookieId: chatAnalyze.getUTMCookie(),
            visitorId: (Data.userInfo.visitorId || ''),
            clientStoreId: (Data.userInfo.clientStoreId || '')
        };
        params.roomId = roomInfo ? roomInfo.id : '';
        params.roomName = roomInfo ? roomInfo.name : '';
        if (Util.isNotBlank(Tool.courseTick)) {
            params.courseId = Tool.courseTick.course.courseId || '';
            params.courseName = Tool.courseTick.course.courseName;
            params.teacherId = Tool.courseTick.course.lecturerId || '';
            params.teacherName = Tool.courseTick.course.lecturer || '';
        }
        params.mobilePhone = $('#regForm_mb').val();
        if (Util.isBlank(params.mobilePhone)) {
            $('.error-bar').removeClass('dn').find('.tips-txt').text('手机号码不能为空！');
            return false;
        } else if (!Util.isMobilePhone(params.mobilePhone)) {
            $('.error-bar').removeClass('dn').find('.tips-txt').text('请输入合法手机号码！');
            return false;
        }
        params.password = $('#password').val();
        params.password1 = $('#password2').val();

        if (Util.isBlank(params.password)) {
            $('.error-bar').removeClass('dn').find('.tips-txt').text('密码不能为空！');
            return false;
        }
        if (Util.isBlank(params.password1)) {
            $('.error-bar').removeClass('dn').find('.tips-txt').text('确认密码不能为空！');
            return false;
        }
        params.verifyCode = $('#regForm_vc').val();
        if (Util.isBlank(params.verifyCode)) {
            $('.error-bar').removeClass('dn').find('.tips-txt').text('动态密码不能为空！');
            return false;
        }

        $('.error-bar').addClass('dn');
        Util.postJson(url, params, function(result) {
            if (!result.isOK) {
                $('.error-bar').removeClass('dn').find('.tips-txt').text(result.msg);
                return false;
            } else {
                var key = 'storeInfos_' + Data.userInfo.groupType,
                    keyVal = Store.store(key);
                keyVal.loginId = Data.userInfo.userId;
                Store.store(key, keyVal);
                Register.reload();
                Data.userInfo.userTel = params.mobilePhone || result.userInfo.mobilePhone;
                try {
                    Data.userInfo.clientGroup = "register";
                    chatAnalyze.setUTM(false, $.extend({
                        operationType: 3,
                        roomName: $('#room_roomName').text(),
                        userTel: params.mobilePhone
                    }, Data.userInfo, Tool.courseTick.course));
                } catch (e) {
                    console.log("Set mbregister UTM fail!" + e);
                }
            }
        }, true, function() {
            Register.resetFormInput();
        });
    });
};

/**
 * 刷新页面
 */
Register.reload = function() {
    var url = window.location.href;
    var param = "ko=1&t=" + new Date().getTime();
    if (url.indexOf("?") == -1) {
        url = url + "?" + param;
    } else {
        url = url.replace(/&(t|ko)=\d*(?=&|$)/g, "");
        if (/\?(t|ko)=\d*(?=&|$)/.test(url)) {
            url = url.replace(/\?(t|ko)=\d*(?=&|$)/, "?" + param);
        } else {
            url = url + "&" + param;
        }
    }
    window.location.href = url;
};
/**
 * 重置输入框
 */
Register.resetFormInput = function() {
    $('#page_register input[type="text"],#page_register input[type="password"]').val(null);
};