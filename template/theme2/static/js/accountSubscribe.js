var AccountSubscribe = new Container({
    panel: $("#account_subscribe"),
    url: "/theme2/template/account-subscribe.html",
    onLoad: function() {
        AccountSubscribe.setEvent();
    },
    onShow: function() {
        AccountSubscribe.getSubscribeType();
    }
});


AccountSubscribe.setEvent = function() {

    /** 返回个人主页 */
    $('#subscribe_back').bind('click', Container.back);

    /** 进入订阅详情 */
    $(document).on("click", ".subType", function(e) {
        var $this = $(this);
        var subscribeType = $this.attr("id");
        Data.userInfo.curSubscribeType = subscribeType;
        AccountSubscribeDetail.load();
    });
};



AccountSubscribe.getSubscribeType = function() {
    common.getJson('/getSubscribeType', { params: JSON.stringify({ groupType: Data.userInfo.groupType }) }, function(data) {
        if (data != null) {
            var subscribeTypeHtml = [],
                subscribeType = AccountSubscribe.formatHtml('subscribeType');
            $.each(data, function(i, row) {
                if (row.code == 'shout_single_strategy') {
                    return true;
                }
                subscribeTypeHtml.push(subscribeType.formatStr(row.name, row.code));
                AccountSubscribe.setSubscribeData(row.code);
            });
            $('#account-subscribeDetail').html(subscribeTypeHtml.join(''));
        }
    });
}

AccountSubscribe.setSubscribeData = function(obj) {
    Util.postJson('/getSubscribe', { params: JSON.stringify({ groupType: Data.userInfo.groupType }) }, function(data) {
        if (data != null) {
            $.each(data, function(i, row) {
                if (row.type == obj) {
                    $('#' + row.type).find('span').html('已订阅');
                }
            });
        }
    });
};
AccountSubscribe.formatHtml = function(region) {
    var formatHtmlArr = [];
    switch (region) {
        case 'subscribeType':
            formatHtmlArr.push(' <div class="cen-st-litem cen-item-line" t="{1}"> ');
            formatHtmlArr.push('    <a href="javascript:void(0);" id="{1}" class="subType"> ' );
            formatHtmlArr.push('    {0} ');
            formatHtmlArr.push('    <p class="acc-item-rst"><span>未订阅</span><i class="i-arrow-down"></i></p> ');
            formatHtmlArr.push('    </a>');
            formatHtmlArr.push(' </div> ');
            break;
    }
    return formatHtmlArr.join("");
}