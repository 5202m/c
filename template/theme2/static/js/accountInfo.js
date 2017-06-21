var AccountInfo = new Container({
    panel: $("#account_info"),
    url: "/theme2/template/account-information.html",
    onLoad: function() {
        AccountInfo.setEvent();
    },
    onShow: function() {
        AccountInfo.getUserInformation();
    }
});


AccountInfo.getUserInformation = function() {

}

AccountInfo.setEvent = function() {
    var userInfo = Data.userInfo;
    $("#myInfoAvatar").attr('src', userInfo.avatar ? userInfo.avatar : '/theme2/img/user-img.jpg');
    $("#myNickname").html(userInfo.nickname);
    $("#myName").html(userInfo.userName);
    $("#myEmail").html(userInfo.email);
    $("#myMobile").html(userInfo.mobilePhone);

    // /** 设置头像 */
    // $('#account_setAvatar').bind('click', function() {
    //     AccountAvatar.load();
    // });

    /** 设置昵称 */
    $('#account-setNickname').bind('click', function() {
        var nickname = $(this).find('span').html();
        AccountNickName.load(nickname);
    });

    /** 设置用户名 */
    $('#account-setUsername').bind('click', function() {
        AccountUserName.load();
    });

    /** 设置邮箱 */
    $('#account-set-mail').bind('click', function() {
        AccountEmail.load();
    });

    /** 设置邮箱 */
    $('#account-setPwd').bind('click', function() {
        AccountPwd.load();
    })

    /** 退出账号 */
    $('#account-logout').bind('click', function() {
        LoginAuto.setAutoLogin(false);
        window.location.href = "/logout";
        chatAnalyze.setUTM(false, $.extend({operationType:5,roomName:$('#room_roomName').text()}, Data.userInfo,Tool.courseTick.course));
    })

    //返回个人主页
    $('#info_back').bind('click', Container.back);
};