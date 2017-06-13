var AccountPwd = new Container({
    panel: $("#account_setPwd"),
    url: "/theme2/template/account-set-pwd.html",
    onLoad: function() {
        AccountPwd.setEvent();
    },
    onShow: function() {

    }
});


AccountPwd.setEvent = function() {

    /** 返回个人资料主页 */
    $('#pwd_back').bind('click', Container.back);

    $('#savePwd').click(function() {
        var
            password = $('#oPwd').val(),
            newPwd = $('#newPwd').val(),
            newPwd1 = $('#newPwd1').val();
        if (common.isBlank(password)) {
            $('.acc-set-pad .error-bar').html('<i></i>请输入原始密码！').removeClass('dn');
            return;
        } else if (common.isBlank(newPwd)) {
            $('.acc-set-pad .error-bar').html('<i></i>请输入新密码！').removeClass('dn');
            return;
        } else if (!/^.{6,20}$/.test(newPwd)) {
            $('.acc-set-pad .error-bar').html('<i></i>密码由6至20数字、字母、符号组成！').removeClass('dn');
            return;
        } else if (common.isBlank(newPwd1)) {
            $('.acc-set-pad .error-bar').html('<i></i>请输入确认新的密码！').removeClass('dn');
            return;
        } else if (newPwd != newPwd1) {
            $('.acc-set-pad .error-bar').html('<i></i>两次新密码输入不一致！').removeClass('dn');
            return;
        }
        $('.acc-set-pad .error-bar').addClass('dn');
        params = {
            password: password,
            newPwd: newPwd,
            newPwd1: newPwd1,
            item: ''
        };
        common.getJson("/modifyPwd", { params: JSON.stringify(params) }, function(result) {
            if (!result.isOK) {
                $('.acc-set-pad .error-bar').html('<i></i>' + (result.msg ? result.msg : "修改失败，请联系客服！")).removeClass('dn');
                return false;
            } else {
                $('.login-panel .input-group input[type="password"]').val('');
                $("#header").show();
                LoginAuto.setAutoLogin(false);
                Pop.msg("修改成功");
                Login.load();
            }
        }, true, function(err) {});
    });
};