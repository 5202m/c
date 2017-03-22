/**
 * Created by Jade.zhu on 2017/2/8.
 */
var Login = new Container({
    panel : $("#page_login"),
    url : "/pm/theme2/template/login.html",
    defaultTime : 120,
    /**配置信息：{$btn : $obj, $input : $obj, intervalId : Id, time : 120}*/
    verifyCodeMap : {}, //{reg:{useType : "studio_login", $btn : $obj, $input : $obj, intervalId : Id, time : 120}}
    groupId : null,
    onLoad : function(){
        this.setEvent();
    }
});
/**
 * 设置事件
 */
Login.setEvent = function(){
    Login.verifyCodeMap = {login:{
        useType : "studio_login",
        $btn : $("#loginForm_vcb"),
        $input : $("#loginForm_mb"),
        intervalId : null,
        time : 120
    }};
    /**
     * 返回
     */
    $('#login_back').bind('click', Container.back);
    $('.login-con').on('input propertychange','.f-i-text',function(){
        $('.error-bar').addClass('dn');
        !this.value && $(this).parent().find('.i-input-op').hide();
        !!this.value && $(this).parent().find('.i-input-op').show();
        Login.submitBtnShow();
    });
    //输入清空
    $('.del-btn').bind('click', function(){
        $(this).hide();
        $('.submit-btn').addClass('login-btn-grey');
        $('.error-bar').addClass('dn');
        var _obj = $(this).closest('.input-group');
        _obj.find('.f-i-text').val(null);
    });
    //密码隐藏显示切换
    $('.i-psw').bind('click', function(){
        var parentDom = $(this).parent().parent();
        parentDom.children('input[type="text"]').val(parentDom.children('input[type="password"]').val());
        $(this).toggleClass('i-psw-show').toggleClass('i-psw-hide');
        var _obj = $(this).closest('.input-group');
        _obj.find('.f-i-text').toggle();
    });
    //提交登录操作
    $('.login-con').on('click','.submit-btn:not(.login-btn-grey)',function(){
        Login.doLogin();
        /*var _tips1 = "呀~ 手机号或密码不对哦，请重新输入";
        var _tips2 = "呀~ 手机号不对哦，请重新输入";
        var _tips = $('.get-dt-code').parent().is(':visible')?_tips2:_tips1;
        $('.error-bar').removeClass('dn').find('.tips-txt').text(_tips);*/
    });
    //登录切换
    $('.head-top .login-ms b').bind('click', function(){
        var _index = $(this).index();
        $('.error-bar').addClass('dn');
        $(this).addClass('current').siblings().removeClass('current');
        $('.login-panel').eq(_index).show().siblings('.login-panel').hide();
        _index && $('.forget_psw a').eq(0).show().siblings().hide();
        !_index && $('.forget_psw a').eq($('.sub-nav.active').index()).show().siblings().hide();
        Login.submitBtnShow();
    });
    //登录密码切换
    $('.password-tab .sub-nav').bind('click', function(){
        var _index = $(this).index();
        $('.error-bar').addClass('dn');
        $(this).addClass('active').siblings().removeClass('active');
        $('.password-panel').eq(_index).show().siblings('.password-panel').hide();
        $('.forget_psw a').eq(_index).show().siblings().hide();
        Login.submitBtnShow();
    });
    /**
     * 同步登录密码框内容
     */
    $('#passwordRaw').bind('keyup',function(){
        Login.onChangePasswordRaw($(this),'passwordRaw2');
    });
    $('#passwordRaw2').bind('keyup',function(){
        Login.onChangePasswordRaw($(this),'passwordRaw');
    });
    $('#npasswordRaw').bind('keyup', function(){
        Login.onChangePasswordRaw($(this),'npasswordRaw2');
    });
    $('#npasswordRaw2').bind('keyup', function(){
        Login.onChangePasswordRaw($(this),'npasswordRaw');
    });
    //手机校验
    $('#loginForm_mb').bind("input propertychange", function(){
        var config = Login.verifyCodeMap['login'];
        if(!config || config.intervalId){
            return;
        }
        if(Util.isMobilePhone($(this).val())){
            config.$btn.addClass("pressed");
        }else{
            config.$btn.removeClass("pressed");
        }
    });
    /**
     * 获取动态验证码
     */
    $('#loginForm_vcb').bind('click', function(){
        Login.getMobileVerifyCode($(this), 'login');
    });
    /**
     * 提取验证码
     */
    $('#verMalCodeId').bind('click', function () {
        $("#verMalCodeId img").attr("src",'/getVerifyCode?code=acLogin&t='+new Date().getTime());
    });
    $('#verMalCodeId').click();//获取图片验证码
};
/**
 * 同步输入的密码
 * @param param
 * @param param2
 */
Login.onChangePasswordRaw = function(param,param2){
    $("#"+param2).val(param.val());
};
/**
 * 登录信息输入完成后高亮登录按钮
 */
Login.submitBtnShow = function(){
    var _inputlen = $('.input-group:visible .i-input-op').length;
    var _inputvlen = $('.input-group:visible .i-input-op:visible').length;
    (_inputvlen===_inputlen) && $('.submit-btn').removeClass('login-btn-grey');
    !(_inputvlen===_inputlen) && $('.submit-btn').addClass('login-btn-grey');
};

//获取验证码
Login.setTime = function(obj) {
    if (Login.countDown == 0) {
        obj.removeAttribute("disabled");
        obj.val("获取动态密码");
        Login.countDown = 119;
        return;
    } else {
        obj.setAttribute("disabled", true);
        obj.val("重新获取(" + Login.countDown + ")");
        Login.countDown--;
    }
    setTimeout(function() {Login.setTime(obj)},1000)
};
/**
 * 重置验证码
 */
Login.resetVerifyCode = function(key){
    if(Login.verifyCodeMap[key]) {
        var config = Login.verifyCodeMap[key];
        if(config.intervalId){
            clearInterval(config.intervalId);
            config.intervalId = null;
        }
        config.time = Login.defaultTime;
        config.$btn.val("获取验证码");
        config.$input.trigger("input");
    }
};

/**
 * 验证码倒计时
 */
Login.setVerifyCodeTime = function(key){
    if(Login.verifyCodeMap[key]) {
        var config = Login.verifyCodeMap[key];
        if(!config.intervalId){
            config.intervalId=window.setInterval('Login.setVerifyCodeTime("'+key+'")', 1000);
            config.time = 120;
        }
        if(config.time > 1){
            config.time--;
            config.$btn.val("重新获取(" + (config.time-1) + ")");
        }else{
            Login.resetVerifyCode(key);
        }
    }
};
/**
 * 获取动态密码
 * @param $this
 * @param vcKey
 */
Login.getMobileVerifyCode = function($this, vcKey){
    var config = Login.verifyCodeMap[vcKey];
    if(!config || !$this.hasClass("pressed")){
        return;
    }
    $this.removeClass("pressed").text("发送中...");
    var mobile=config.$input.val();
    var useType=config.useType;
    try{
        $.getJSON('/getMobileVerifyCode?t=' + new Date().getTime(),{mobilePhone:mobile, useType:useType},function(data){
            if(!data || data.result != 0){
                if(data.errcode == "1005"){
                    //studioMbPop.showMessage(data.errmsg);
                }else{
                    console.error("提取数据有误！");
                }
                Login.resetVerifyCode(vcKey);
            }else{
                Login.setVerifyCodeTime(vcKey);
            }
        });
    }catch (e){
        Login.resetVerifyCode();
        console.error("getMobileVerifyCode->"+e);
    }
};
/**
 * 防刷短信验证码
 * @param data
 * @param el
 * @param isNeedGeet
 * @param fn
 */
/*Login.getMobileVerifyCode = function(data,el,isNeedGeet,fn){
    //需要走geet验证码模式
    if(isNeedGeet){
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
    }else{
        handler(data);
    }
    function handler(data){
        el.addClass("pressed").html("发送中...");
        $.getJSON('/getMobileVerifyCode?group=studio&t=' + new Date().getTime(),data,function (result) {
            if (!result || result.result != 0) {
                if (result.errcode == "1019") {
                    box.getMobileVerifyCode(data,el,true,fn);
                    return;
                }
            }
            fn(result);
        });
    }
};*/
/**
 * 登录
 */
Login.doLogin = function(){
    Data.getRoom(function(roomInfo){
        var url = '/login';
        var params = {cookieId:chatAnalyze.getUTMCookie(),visitorId:(Data.userInfo.visitorId||''),clientStoreId:(Data.userInfo.clientStoreId||'')};
        params.roomId = roomInfo?roomInfo.id:'';
        params.roomName = roomInfo?roomInfo.name:'';
        if(Util.isNotBlank(Tool.courseTick)) {
            params.courseId = Tool.courseTick.course.courseId||'';
            params.courseName = Tool.courseTick.course.courseName;
            params.teacherId = Tool.courseTick.course.lecturerId||'';
            params.teacherName = Tool.courseTick.course.lecturer||'';
        }
        if($('#mobileLogin').hasClass('current')) {
            params.mobilePhone = $('#loginForm_mb').val();
            if(Util.isBlank(params.mobilePhone)){
                $('.error-bar').removeClass('dn').find('.tips-txt').text('手机号码不能为空！');
                return false;
            }else if(!Util.isMobilePhone(params.mobilePhone)){
                $('.error-bar').removeClass('dn').find('.tips-txt').text('请输入合法手机号码！');
                return false;
            }
            if($('#usePwd').hasClass('active')){
                params.loginType = 'pwd';
                params.password = $('#passwordRaw').val();
                if(Util.isBlank(params.password)){
                    $('.error-bar').removeClass('dn').find('.tips-txt').text('密码不能为空！');
                    return false;
                }
            }else if($('#useVcb').hasClass('active')) {
                params.loginType = 'verify';
                params.verifyCode = $('#loginForm_vc').val();
                if(Util.isBlank(params.verifyCode)){
                    $('.error-bar').removeClass('dn').find('.tips-txt').text('动态密码不能为空！');
                    return false;
                }
            }
        }else if($('#accountLogin').hasClass('current')){
            url = '/pmLogin';
            params.accountNo = $('#accountNo').val();
            params.pwd = $('#npasswordRaw').val();
            params.verMalCode = $('#verMalCode').val();
            if(Util.isBlank(params.accountNo)){
                $('.error-bar').removeClass('dn').find('.tips-txt').text('请输入交易账号！');
                return false;
            }else if(Util.isBlank(params.pwd)){
                $('.error-bar').removeClass('dn').find('.tips-txt').text('请输入密码！');
                return false;
            }else if(Util.isBlank(params.verMalCode)){
                $('.error-bar').removeClass('dn').find('.tips-txt').text('请输入验证码！');
                return false;
            }
        }
        $('.error-bar').addClass('dn');
        Util.postJson(url, params, function(result){
            if(!result.isOK){
                $('.error-bar').removeClass('dn').find('.tips-txt').text(result.error.errmsg);
                return false;
            }else{
                if(Util.isBlank(result.userInfo.nickname)){
                    result.userInfo.nickname = '匿名_'+result.userInfo.userId.substring(0,4);
                }
                $('#header_ui').text(result.userInfo.nickname);
                Data.userInfo.clientGroup = result.userInfo.clientGroup;
                Data.userInfo.clientStoreId = result.userInfo.clientStoreId;
                Data.userInfo.cookieId = result.userInfo.cookieId;
                Data.userInfo.email = result.userInfo.email;
                Data.userInfo.firstLogin = result.userInfo.firstLogin;
                Data.userInfo.groupType = result.userInfo.groupType;
                Data.userInfo.isLogin = result.userInfo.isLogin;
                Data.userInfo.mobilePhone = result.userInfo.mobilePhone;
                Data.userInfo.nickname = result.userInfo.nickname;
                Data.userInfo.password = result.userInfo.password;
                Data.userInfo.roomName = result.userInfo.roomName;
                Data.userInfo.userId = result.userInfo.userId;
                Data.userInfo.userName = result.userInfo.userName;
                Data.userInfo.visitorId = result.userInfo.visitorId;
                Data.userInfo.userType = 0;
                if(Login.groupId){
                    Login.changeRoom({groupId:Login.groupId});
                }else{
                    LoginAuto.setAutoLogin($("#autoLogin").prop("checked"));
                    Container.back();
                }
            }
        },true,function(){
            Login.resetFormInput();
        });
    });
};
/**
 * 切换房间
 * params :{{[groupId]:String, [roomType]:String}}
 */
Login.changeRoom = function(params){
    Util.postJson("/checkGroupAuth",params,function(result){
        if(!result.isOK){
            if(result.error && result.error.errcode === "1000"){
                Login.changeRoomMsg({msg: "您长时间未操作，请刷新页面后重试，"});
            }else{
                Login.changeRoomMsg({roomType: result.roomType, clientGroups : result.clientGroups});
            }
        }else{
            Container.back();
        }
    },true,function(err){
        if("success"!=err) {
            Login.changeRoomMsg({type: "error"});
        }
    });
};
/**
 * 重置输入框
 */
Login.resetFormInput = function(){
    $('#page_login input[type="text"],#page_login input[type="password"]').val(null);
};
/**
 * 切换房间提示
 * @param ops {{[roomType]:String, [status]:String, [clientGroups]:String, [type]:String, [msg]:String}}
 * @param btnFn
 */
Login.changeRoomMsg = function(ops){
    var msgMap = {
        "onlyTrain" : "该房间仅对培训班学员开放，",
        "onlyNew" : "该房间仅对新客户开放，",
        "onlyActive" : "已有真实账户并激活的客户才可进入该房间，您还不满足条件，",
        "onlyVip" : "该房间仅对VIP客户开放，",
        "onlyMark" : "该房间仅对指定客户开放，",
        "noAuth" : "您没有访问该房间的权限，",
        "error" : "操作失败，"
    };
    ops = ops||{};
    if(ops.type && msgMap.hasOwnProperty(ops.type)){
        ops.msg = msgMap[ops.type];
    }else if(ops.roomType == "train"){
        ops.msg = msgMap.onlyTrain;
    }else if(ops.status == "2"){
        ops.msg = msgMap.onlyMark;
    }else if(ops.clientGroups){
        if(/^((,visitor)|(,register))+$/.test( "," + ops.clientGroups)){
            ops.msg = msgMap["onlyNew"];
        }else if(ops.clientGroups == "vip"){
            ops.msg = msgMap["onlyVip"];
        }else if(/^((,active)|(,vip))+$/.test( "," + ops.clientGroups)){
            ops.msg = msgMap["onlyActive"];
        }
    }
    Pop.msg((ops.msg || msgMap["noAuth"]) + "如有疑问请联系老师助理。");
};