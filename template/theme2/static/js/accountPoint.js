var AccountPoint = new Container({
    panel: $("#account_point"),
    url: "/theme2/template/account-point.html",
    onLoad: function() {
        AccountPoint.setEvent();
    },
    onShow: function() {
        AccountPoint.getUserPoint();
    }
});

AccountPoint.getUserPoint = function() {
    Util.postJson('/getPointsInfo', { params: JSON.stringify({ groupType: Data.userInfo.groupType }) }, function(result) {
        if (result) {
            $('#myPoints').html(result.points);
            var pointsGetDetail = [],
                pointsConsumeDetail = [],
                pointsGetHtml = AccountPoint.formatHtml('getPoint'),
                pointsConsumeHtml = AccountPoint.formatHtml('pointConsume');
            var pointGetList = [],
                pointConsumeList = [];
            if (common.isValid(result.journal)) {
                $.each(result.journal, function(i, row) {
                    if (row.change > 0) {
                        pointGetList.push(row.change);
                        pointsGetDetail.unshift(pointsGetHtml.formatStr(
                            (row.remark ? row.remark : ''), row.change, common.formatterDate(row.date), '.'));
                    } else if (row.change < 0) {
                        pointConsumeList.push(row.change);
                        pointsConsumeDetail.unshift(pointsConsumeHtml.formatStr(
                            (row.remark ? row.remark : ''), row.change, common.formatterDate(row.date), '.'));
                    }
                });
            }
            var pointGetTotal = AccountPoint.countGetPoint(pointGetList);
            var pointConsumeTotal = AccountPoint.countConsumePoint(pointConsumeList);
            $("#pointGetTotal").html("+" + pointGetTotal);
            $("#pointConsumeTotal").html(pointConsumeTotal);
            $('#point_get_item').html(pointsGetDetail.join(''));
            $('#point_consume_item').html(pointsConsumeDetail.join(''));
            $('#banConId').css('height', '280px');
            // indexJS.setListScroll($('#banConId'));
        } else {
            $('#myPoints').html('0');
        }
    });

};

AccountPoint.countGetPoint = function(obj) {
    var totalGetPoint = 0;
    $.each(obj, function(i, row) {
        totalGetPoint += row;
    });
    return totalGetPoint;
}

AccountPoint.countConsumePoint = function(obj) {
    var totalConsumePoint = 0;
    $.each(obj, function(i, row) {
        totalConsumePoint += row;
    });
    return totalConsumePoint;
}

AccountPoint.formatHtml = function(region) {
    var formatHtmlArr = [];
    switch (region) {
        case 'getPoint':
            formatHtmlArr.push('<div class="cen-st-litem cen-item-line">');
            formatHtmlArr.push('{0}');
            formatHtmlArr.push('<p class="acc-item-rst"><span>+{1}</span><i>{2}</i></p>');
            formatHtmlArr.push('</div>');
            break;
        case 'pointConsume':
            formatHtmlArr.push('<div class="cen-st-litem cen-item-line">');
            formatHtmlArr.push('{0}');
            formatHtmlArr.push('<p class="acc-item-rst"><span>{1}</span><i>{2}</i></p>');
            formatHtmlArr.push('</div>');
            break;
    }
    return formatHtmlArr.join('');
}

AccountPoint.setEvent = function() {
    /** 返回个人主页 */
    $('#point_back').bind('click', Container.back);

    //积分切换
    $('#TabMenu span').bind('click', function() {
        var _index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $('.account-jf-item').eq(_index).show().siblings('.account-jf-item').hide();
    });
};