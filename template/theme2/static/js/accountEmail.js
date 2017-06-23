var AccountEmail = new Container({
    panel: $("#account_setMail"),
    url: "/theme2/template/account-set-mail.html",
    onLoad: function() {
        AccountEmail.setEvent();
    },
    onShow: function() {}
});


AccountEmail.setEvent = function() {

    $('#inputEmail').val(Data.userInfo.email);


    /** 返回个人资料主页 */
    $('#email_back').bind('click',function(){
        if (true == Room.isRoom_email) {
            $("#header").show();
        }
        Container.back();
    });

    $('#saveEmail').click(function() {
        var email = $('#inputEmail').val();
        if (common.isBlank(email)) {
            $('.acc-set-pad .error-bar').html('<i></i>请输入邮箱地址').removeClass('dn');
            return;
        } else if (!common.isEmail(email)) {
            $('.acc-set-pad .error-bar').html('<i></i>邮箱地址有误').removeClass('dn');
            return;
        } else {
            common.getJson("/modifyEmail", { params: JSON.stringify({ email: email }) }, function(result) {
                if (!result.isOK) {
                    Pop.msg((result.msg ? result.msg : "修改失败，请联系客服！"));
                    if (result.code == '102') {
                        AccountNickName.load();
                    }
                    return false;
                } else {
                    Pop.msg(result.msg);
                    var isRoom = Room.isRoom_email;
                    if (true == isRoom) {
                        $("#header").show();
                        Container.back();
                    }else{
                        AccountInfo.load();
                    }
                }
            }, true, function(err) {});
        }
    });
};