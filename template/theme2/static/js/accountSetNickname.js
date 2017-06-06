var AccountNickName = new Container({
    panel: $("#account_setNickname"),
    url: "/theme2/template/account-set-nickname.html",
    onLoad: function() {
        AccountNickName.setEvent();
    },
    onShow: function() {

    }
});


AccountNickName.setEvent = function() {

    $("#inputNickname").val(Data.userInfo.nickname);

    /** 返回个人资料主页 */
    $('#nickname_back').bind('click', Container.back);

    /**
     * 提交设置
     */
    $('#submitNickname').bind('click', function() {
        var nickName = $('#inputNickname').val();
        if (common.isBlank(nickName)) {
            $('.acc-set-pad .error-bar').html('<i></i>请输入昵称').removeClass('dn');
            return;
        } else if (!common.isRightName(nickName)) {
            $('.acc-set-pad .error-bar').html('<i></i>昵称为2至10位字符(数字/英文/中文/下划线)，不能全数字').removeClass('dn');
            return;
        } else {
            common.getJson("/modifyName", { nickname: nickName }, function(result) {
                if (!result.isOK) {
                    if (result.msg) {
                        $('.acc-set-pad .error-bar').html('<i></i>' + result.msg).removeClass('dn');
                    } else {
                        Pop.msg("修改失败，请联系客服！");
                    }
                } else {
                    AccountNickName.refreshNickname(result.nickname);
                    $('.acc-user-info').addClass('dn');
                    $(".error-bar").addClass('dn');
                    $("#myNickname").html(result.nickname);
                    $("#nickname").text(result.nickname);
                    Pop.msg("修改成功!");
                }
            }, true, function(err) {});
        }
    });
};

/**
 * 刷新昵称
 * @param isSetName
 * @param nickname
 */
AccountNickName.refreshNickname = function(nickname) {
    Data.userInfo.nickname = nickname;
    //头部
    $("#header_ui").html(nickname);
}