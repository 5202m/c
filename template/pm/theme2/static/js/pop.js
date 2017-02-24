/**
 * 直播间手机版弹窗类
 * author Dick.guo
 *
 * msg : 提示信息
 */
var Pop = {

    /**
     * 显示提示信息
     * @param ops {String || {msg:String, [closeable]:boolean, [autoClose]:Number, [onOK]:Function}}
     */
    msg : function(ops){
        ops = ops || {};
        if(typeof ops == "string"){
            ops = {msg : ops};
        }
        $.extend(ops, {
            //msg : "",
            closeable : true,
            autoClose : -1,
            onOK : $.noop
        });
        if(ops.closeable){
            $("#pop_msgClose").hide();
        }else{
            $("#pop_msgClose").show();
        }
        $("#pop_msgTxt").text(ops.msg);
        if(ops.autoClose > 0){
            $("#pop_msgBtn").hide();
            $("#pop_msg").fadeIn().delay(ops.autoClose).fadeOut();
            ops.onOK();
        }else{
            $("#pop_msgBtn").show();
            $("#pop_msg").fadeIn();
        }
        $("#pop_msgBtn").one('click', function(){
            ops.onOK();
            $("#pop_msg").hide();
        });
    },
    signIn : {
        /**
         * 初始化
         */
        init : function(){
            Pop.signIn.setEvent();
            var timeOutId = setTimeout(function(){
                Pop.signIn.showSignIn();
                clearTimeout(timeOutId);
            }, 30000);
        },
        /**
         * 设置事件
         */
        setEvent : function(){
            /**
             * 关闭签到
             */
            $('.sign-pop .animatebox .popcon .close-pop').bind('click', function(){
                $('.sign-pop').hide();
            });
            /**
             * 签到
             */
            $('.sign-pop .sign-btn').bind('click', function(){
                Pop.signIn.addSignIn();
            });
        },
        /**
         * 显示签到
         */
        showSignIn : function(){
            if (Data.userInfo.isLogin) {
                Util.postJson('/studio/checkTodaySignin', null, function (data) {
                    if (null != data) {
                        if(data.isOK == false){
                            var _obj = $('.sign-pop');
                            var _signc = _obj.find('.popcon .sign-main').eq(0);
                            var _signh = _signc.css('height', 'auto').height() > 307 ? _signc.css('height', 'auto').height() : 307;
                            var _signl = _obj.find('.i-line');
                            var _difh = parseInt(($(window).height() - _signh) / 2) + 9;
                            _signl.height(_difh);
                            _obj.show();
                            _obj.find('.animatebox').addClass('amin');
                        }
                    } else {
                        console.log("fail");
                    }
                });
            }
        },
        /**
         * 签到
         */
        addSignIn : function(){
            if (Data.userInfo.isLogin) {
                Util.postJson('/studio/addSignin', null, function (data) {
                    if (data.isOK) {
                        Pop.msg("签到成功!");
                        $('.sign-pop .animatebox .popcon .close-pop').trigger('click');
                    } else {
                        Pop.msg(data.msg);
                    }
                });
            }
        }
    }
};