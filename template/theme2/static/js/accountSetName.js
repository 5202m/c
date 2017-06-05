var AccountUserName = new Container({
    panel: $("#account_setName"),
    url: "/theme2/template/account-set-username.html",
    onLoad: function() {
        AccountUserName.setEvent();
    },
    onShow: function() {

    }
});


AccountUserName.setEvent = function() {

    $('#myUserName').val(Data.userInfo.userName);

    /** 返回个人资料主页 */
    $('#username_back').bind('click', Container.back);

    /**
     * 设置用户名
     */
    $("#saveUserName").click(function() {
        var userName = $('#myUserName').val();
        if (common.isBlank(userName)) {
            $('.acc-set-pad .error-bar').html('<i></i>请输入用户名').removeClass('dn');
            return;
        }
        common.getJson("/modifyUName", { params: JSON.stringify({ userName: userName, item: '' }) }, function(result) {
            if (!result.isOK) {
                if (result.msg) {
                    $('.acc-set-pad .error-bar').html('<i></i>' + result.msg).removeClass('dn');
                } else {
                    $('.acc-set-pad .error-bar').html('<i></i>修改失败，请联系客服').removeClass('dn');
                }
                return false;
            } else {
                Pop.msg("修改成功");
                $("#myName").html(result.userName);
                $('.error-bar').addClass('dn');
            }
        }, true, function(err) {});
    });
};