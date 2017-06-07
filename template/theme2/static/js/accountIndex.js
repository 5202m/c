var AccountIndex = new Container({
    panel: $("#account_index"),
    url: "/theme2/template/account-index.html",
    subscribeOpTeacher: '',
    onLoad: function() {
        AccountIndex.setEvent();
    },
    onShow: function() {
        $("#header").hide();
        AccountIndex.getUserPoint();
    }
});

AccountIndex.getUserPoint = function() {
    Data.getPointsInfo(function(data) {
        if (data) {
            var row = data.data;
            $("#mypoints").text(row.points);
        }
    });
};

AccountIndex.setEvent = function() {

    $("#nickname").text(Data.userInfo.nickname);
    $("#myAvatar").attr('src', Data.userInfo.avatar);

    var userLevel = AccountIndex.getUserLevelShortName(Data.userInfo.clientGroup);
    $("#myLevel").text(userLevel);

    var userClientGroup = AccountIndex.getUserClientShortName(Data.userInfo.clientGroup);
    $("#myGroup").html(userClientGroup);

    /** 我的积分 */
    $('#account_integral').bind('click', function() {
        AccountPoint.load();
    });
    /** 我的订阅 */
    $('#account_subscribe').bind('click', function() {
        AccountSubscribe.load();
    });

    /** 我的资料 */
    $('#account_info').bind('click', function() {
        AccountInfo.load();
    })

    /** 返回上一级 */
    $('#back_room').bind('click', function() {
        $("#header").show();
        Container.back();
    });

};


AccountIndex.getUserClientShortName = function(clientGroup) {
    var levelClsName = '';
    switch (clientGroup) {
        case "vip":
            levelClsName = "VIP会员";
            break;
        case "active":
            levelClsName = "激活会员";
            break;
        case "notActive":
            levelClsName = "真实会员";
            break;
        case "simulate":
            levelClsName = "模拟会员";
            break;
        case "register":
            levelClsName = "注册会员";
            break;
        default:
            levelClsName = "游客";
    }
    return levelClsName;
}

AccountIndex.getUserLevelShortName = function(clientGroup) {
    var levelClsName = '';
    switch (clientGroup) {
        case "vip":
            levelClsName = "L4";
            break;
        case "real":
            levelClsName = "L3";
            break;
        case "active":
            levelClsName = "L3";
            break;
        case "notActive":
            levelClsName = "L3";
            break;
        case "simulate":
            levelClsName = "L2";
            break;
        case "register":
            levelClsName = "L1";
            break;
        default:
            levelClsName = "L0";
    }
    return levelClsName;
}