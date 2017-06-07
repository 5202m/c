var AccountSubscribeDetail = new Container({
    subscribeData: null,
    panel: $("#account_subscribeDetail"),
    url: "/theme2/template/account-subscribe-detail.html",
    onLoad: function() {
        AccountSubscribeDetail.setEvent();
    },
    onShow: function() {
        AccountSubscribeDetail.chooseSubscribe();
    }
});


AccountSubscribeDetail.setEvent = function() {

    /** 返回订阅列表 */
    $('#subscribeDetail_back').bind('click', Container.back);

};

/**
 * 获取已订阅列表
 */
AccountSubscribeDetail.getSubscribeInfo = function() {
    common.getJson('/getSubscribe', {
        params: JSON.stringify({
            groupType: Data.userInfo.groupType
        })
    }, function(data) {
        if (data != null) {
            AccountSubscribeDetail.subscribeData = data;
            $.each(data, function(i, row) {
                var analystsArr = row.analyst.split(',');
                var noticeTypeArr = row.noticeType.split(',');
                $('input[name="' + row.type + '_analysts"]').val(row.analyst);
                $('input[name="' + row.type + '_noticeTypes"]').val(row.noticeType);
                $.each(analystsArr, function(k, v) {
                    $('#' + v + '_' + row.type).find('i').addClass('i-arrow-right');
                });
                $.each(noticeTypeArr, function(k, v) {
                    $('#' + v + '_' + row.type).find('i').addClass('i-arrow-right');
                });

                if (common.getDateDiff(row.startDate, row.endDate) > 7) {
                    $('#month_' + row.type).find('i').addClass('i-arrow-right');
                    $('input[name="' + row.type + '_noticeCycle"]').val("month");

                } else {
                    $('#week_' + row.type).find('i').addClass('i-arrow-right');
                    $('input[name="' + row.type + '_noticeCycle"]').val("week");
                }

                $('#subscribeBtn  button[t="' + row.type + '"]').attr({
                    'id': row._id,
                    'orip': row.point
                });

                AccountSubscribeDetail.getSubcribePoint();

            });
        }
    });
}

AccountSubscribeDetail.chooseSubscribe = function() {
    var tempSubcribeType = Data.userInfo.curSubscribeType;
    common.getJson('/getSubscribeType', {
        params: JSON.stringify({
            groupType: Data.userInfo.groupType
        })
    }, function(data) {
        if (data != null) {
            var subscribeTypeHtml = [], //noticeCycleObj={'week':'1周','month':'1月'},noticeTypesObj={'email':'邮件','sms':'短信','wechat':'微信'},
                subscribeType = AccountSubscribeDetail.formatHtml('subscribeType'),
                analysts = AccountSubscribeDetail.formatHtml('analysts'),
                noticeTypes = AccountSubscribeDetail.formatHtml('noticeTypes'),
                noticeCycle = AccountSubscribeDetail.formatHtml('noticeCycle'),
                subscribeBtn = AccountSubscribeDetail.formatHtml('subscribeBtn');
            cls1 = cls2 = '';
            $.each(data, function(i, row) {
                if (row.code == 'shout_single_strategy') {
                    return true;
                }
                if (row.code == tempSubcribeType) {
                    var analystsHtml = [],
                        noticeTypesHtml = [],
                        noticeCycleHtml = [],
                        subscribeBtnHtml = [];
                    var analystsArr = JSON.parse(row.analysts),
                        analystSize = analystsArr.length;
                    $.each(analystsArr, function(key, row1) {
                        var analystName = row1.name;
                        if (row1.name.indexOf('(') > -1) {
                            analystName = row1.name.substring(0, row1.name.indexOf('('));
                        }
                        analystsHtml.push(analysts.formatStr(row1.userId, analystName, row1.point, row.code));
                    });
                    var noticeTypesArr = JSON.parse(row.noticeTypes),
                        noticeTypeSize = noticeTypesArr.length;
                    $.each(noticeTypesArr, function(key, row1) {
                        if (key == 0) {
                            noticeTypesHtml.push('<ul>');
                        }
                        noticeTypesHtml.push(noticeTypes.formatStr(row1.type, row1.name, row1.point, row.code));
                        if (key == noticeTypeSize - 1) {
                            noticeTypesHtml.push('</ul>');
                            subscribeBtnHtml.push(subscribeBtn.formatStr(row.code, row.name, row.analysts, row.noticeTypes, row.noticeCycle));
                        }
                    });
                    if (common.isValid(row.noticeCycle)) {
                        cls2 = ' w1';
                        var noticeCycleArr = JSON.parse(row.noticeCycle);
                        $.each(noticeCycleArr, function(key, row1) {
                            noticeCycleHtml.push(noticeCycle.formatStr(row1.cycle, row1.name, row1.point, row.code));
                        });
                    }
                    subscribeTypeHtml.push(subscribeType.formatStr(analystsHtml.join(''), noticeTypesHtml.join(''), noticeCycleHtml.join(''), subscribeBtnHtml.join(''), cls1, cls2, row.code));
                    $("#subcribeList").html(subscribeTypeHtml.join(''));
                }

            });

            AccountSubscribeDetail.setSubscribeEvent();
            AccountSubscribeDetail.getSubscribeInfo();
        }
    });
};

/**
 * 订阅按钮事件
 */
AccountSubscribeDetail.setSubscribeEvent = function() {

    $(".subcrp-list-con li").click(function() {
        var liChildrenN = $(this).children("p").children("i"),
            liClassName = liChildrenN.attr("class");
        if (liClassName == "i-arrow-right") {
            liChildrenN.removeClass("i-arrow-right");
            $("#noticeType,#noticeCycle").find("i").removeClass("i-arrow-right");
        } else {
            liChildrenN.addClass("i-arrow-right");
            $("#noticeType,#noticeCycle").find("i").addClass("i-arrow-right");
        }
        AccountSubscribeDetail.getSubcribePoint();
    });

    /**
     * 计算订阅所需积分
     */
    AccountSubscribeDetail.getSubcribePoint = function() {
        var curType = Data.userInfo.curSubscribeType;
        var totalPoint = 0,
            analystsArr = [],
            noticeTypesArr = [],
            noticeCycleArr = [];
        $('p[t="' + curType + '"]').each(function(i, row) {
            if ($(row).find('i').hasClass('i-arrow-right')) {
                totalPoint += parseInt($(this).attr('p'));
                if ($(this).attr('name') == 'analyst') {
                    analystsArr.push($(this).attr('value'));
                }
                if ($(this).attr('name') == 'noticeType') {
                    noticeTypesArr.push($(this).attr('value'));
                }
                if ($(this).attr('name') == 'noticeCycle') {
                    noticeCycleArr.push($(this).attr('value'));
                }
            }
        });
        $('input[name="' + curType + '_analysts"]').val(analystsArr.join(','));
        $('input[name="' + curType + '_noticeTypes"]').val(noticeTypesArr.join(','));
        $('input[name="' + curType + '_noticeCycle"]').val(noticeCycleArr.join(','));

        $('#subscribeBtn').find('span').text(totalPoint + '分');
        $('#subscribeBtn button[t="' + $(this).attr('t') + '"]').attr('p', totalPoint);
    };

    /**
     * 订阅结算按钮
     */
    $('#subscribeBtn .submit-btn').unbind('click');
    $('#subscribeBtn .submit-btn').click(function() {
        AccountSubscribeDetail.getSubcribePoint();
        var $this = $(this);
        if ($this.hasClass('clicked')) {
            return false;
        }
        $this.addClass('clicked');
        var params = {
            groupType: Data.userInfo.groupType,
            type: $this.attr('t'),
            point: (common.isBlank($this.attr('p')) ? 0 : parseInt($this.attr('p')))
        };
        params.noticeCycle = common.isBlank($('input[name="' + $this.attr('t') + '_noticeCycle"]').val()) ? '' : $('input[name="' + $this.attr('t') + '_noticeCycle"]').val();
        params.analyst = $('input[name="' + $this.attr('t') + '_analysts"]').val();
        params.noticeType = common.isBlank($('input[name="' + $this.attr('t') + '_noticeTypes"]').val()) ? $this.attr('nts') : $('input[name="' + $this.attr('t') + '_noticeTypes"]').val();
        params.pointsRemark = '订阅' + $this.attr('tn');
        params.id = common.isBlank($this.attr('id')) ? '' : $this.attr('id');
        params.orip = common.isBlank($this.attr('orip')) ? 0 : $this.attr('orip');
        if (common.isBlank(Data.userInfo.email) &&
            common.isValid(params.noticeType) &&
            $.inArray('email', params.noticeType.split(',')) > -1) {
            Pop.msg('请先绑定邮箱！');
            $('#infotab a[t="accountInfo"]').click();
        } else if (common.isBlank(params.id) && common.isBlank(params.analyst)) {
            Pop.msg('请选择订阅老师！');
        } else if (common.isBlank(params.id) && common.isBlank(params.noticeType)) {
            Pop.msg('请选择订阅方式！');
        } else if (common.isBlank(params.id) && common.isBlank(params.noticeCycle)) {
            Pop.msg('请选择订阅周期！');
        } else {
            if (common.isBlank(params.analyst) || common.isBlank(params.noticeType)) {
                params.point = 0;
                params.analyst = '';
                params.noticeType = '';
                params.noticeCycle = '';
            }
            var isModify = true;
            $.each(AccountSubscribeDetail.subscribeData, function(i, row) {
                if ($this.attr('t') == row.type && params.analyst == row.analyst && params.noticeType == row.noticeType) {
                    var cycle = common.getDateDiff(row.startDate, row.endDate) > 7 ? 'month' : 'week';
                    if (params.noticeCycle == cycle) {
                        isModify = false;
                        return false;
                    }
                }
            });
            if (isModify) {
                var id = '',
                    types = $this.attr('t').split(',');
                $this.addClass('clicked');
                var typeLen = types.length;
                var analystArr = params.analyst;
                $.each(types, function(k, v) {
                    if (v == 'live_reminder') {
                        id = $this.attr('lrid');
                    } else if (v == 'shout_single_strategy') {
                        id = $this.attr('ssid');
                    } else if (v == 'trading_strategy') {
                        id = $this.attr('tsid');
                    }
                    AccountSubscribeDetail.saveSubscribe($this, id, v, analystArr, k == (typeLen - 1), AccountSubscribeDetail.followHander);
                });
            } else {
                Pop.msg('你已订阅相关课程，无需重复订阅！');
            }


        }
    });
}

AccountSubscribeDetail.followHander = function(isOK, analyst) {
    setTimeout(function() {
        AccountSubscribeDetail.load();
    }, 5000);
};

/**
 * 保存订阅数据
 * @param params
 * @param $this
 */
AccountSubscribeDetail.saveSubscribe = function(obj, id, type, analysts, isLast, callback) {
    var remark = { 'live_reminder': '订阅直播提醒', 'shout_single_strategy': '订阅喊单策略', 'trading_strategy': '订阅交易策略' };
    var params = { id: id, groupType: Data.userInfo.groupType, noticeType: 'email', noticeCycle: 'week', type: type, pointsRemark: remark[type], point: 0 };
    params.analyst = analysts;
    Util.postJson('/subscribe', { params: JSON.stringify(params) }, function(data) {
        if (data.isOK) {
            if (Util.isBlank(params.analyst) || Util.isBlank(params.noticeType)) {
                Pop.msg('取消订阅成功！');
            } else if (Util.isNotBlank(params.id)) {
                Pop.msg('修改订阅成功！');
                $('#subscribeAnalyst .item-con .item-main .social-op a[analystId="' + obj.attr('analystId') + '"]').html('订阅').addClass('btn-blue').removeClass('btn-green').attr('subscribed', false);
            } else {
                var types = obj.attr('t').split(','),
                    tips = [];
                var remark = { 'live_reminder': '直播提醒', 'shout_single_strategy': '喊单策略', 'trading_strategy': '交易策略' }
                $.each(types, function(i, row) {
                    tips.push(remark[row]);
                });
                Pop.msg(tips.join('、') + '订阅成功！');
            }
        } else {
            Pop.msg(data.msg);
        }
        obj.removeClass('clicked');
        if (isLast) { //回调函数
            callback(data.isOK, analysts);
        }
    });
};

/**
 * 根据内容域模块名返回内容模板
 * @param region 内容域模块名
 * @returns {string}
 */
AccountSubscribeDetail.formatHtml = function(region) {
    var formatHtmlArr = [];
    switch (region) {
        case 'subscribe':
            formatHtmlArr.push('<tr>');
            formatHtmlArr.push('    <td><span class="fz12">{0}</span></td>');
            formatHtmlArr.push('    <td><span class="fz12">{1}</span></td>');
            formatHtmlArr.push('    <td>{2}</td>');
            formatHtmlArr.push('    <td>{3}</td>');
            formatHtmlArr.push('    <td>{4}</td>');
            formatHtmlArr.push('    <td>{5}</td>');
            formatHtmlArr.push('</tr>');
            break;
        case 'subscribeType':
            formatHtmlArr.push('<p class="subcrp-tt-yans">老师</p>');
            formatHtmlArr.push('<div class="account-cen-item subcrp-list-con account-box-style" id="teacherList">');
            formatHtmlArr.push('    <ul>{0}</ul><input type="hidden" name="{6}_analysts" /></div>');
            formatHtmlArr.push('<p class="subcrp-tt-yans">订阅方式</p>');
            formatHtmlArr.push('<div class="account-cen-item subcrp-list-con account-box-style" id="noticeType">');
            formatHtmlArr.push('    <ul>{1}</ul><input type="hidden" name="{6}_noticeTypes" /></div>');
            formatHtmlArr.push('<p class="subcrp-tt-yans">周期</p>');
            formatHtmlArr.push('<div class="account-cen-item subcrp-list-con account-box-style" id="noticeCycle">');
            formatHtmlArr.push('<ul>{2}</ul><input type="hidden" name="{6}_noticeCycle" /></div>');
            formatHtmlArr.push('<div class="sub-form subcrp-diny-btn" id="subscribeBtn">{3}</div>');
            break;
        case 'analysts':
            formatHtmlArr.push('<li class="cen-st-litem cen-item-line" id="{0}_{3}"  t="{3}">');
            formatHtmlArr.push('  {1}');
            formatHtmlArr.push('    <p class="acc-item-rst" p="{2}" name="analyst" value="{0}" cval="{1}" t="{3}"> ');
            formatHtmlArr.push('    <span>{2}积分</span><i></i></p>');
            formatHtmlArr.push('</li>');
            break;
        case 'analyst':
            formatHtmlArr.push('<div class="item">');
            formatHtmlArr.push('    <span class="inp_checkbox">');
            formatHtmlArr.push('    <input type="checkbox" name="analyst" id="{0}_{3}" value="{0}" p="{2}" cval="{1}" t="{3}" />');
            formatHtmlArr.push('    <label for="{0}_{3}"><i></i></label>');
            formatHtmlArr.push('    </span>');
            formatHtmlArr.push('    <span class="tname">{1}</span>');
            formatHtmlArr.push('</div>');
            break;
        case 'noticeTypes':
            formatHtmlArr.push('<li class="cen-st-litem" id="{0}_{3}"  t="{3}"> ');
            formatHtmlArr.push('{1}');
            formatHtmlArr.push('    <p class="acc-item-rst"  value="{0}" name="noticeType" p="{2}" cval="{1}" t="{3}">    ');
            formatHtmlArr.push('    <span>{2}积分</span><i></i></p>   ');
            formatHtmlArr.push('</li>');
            break;
        case 'noticeType':
            formatHtmlArr.push('<div class="pdbox {0}"><a href="javascript:void(0);" class="dybtn" t="{0}" tn="{1}" nts="email"');
            formatHtmlArr.push(' onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'header_dy_{0}\', \'content_top\', 1, true]);">');
            formatHtmlArr.push('邮件订阅</a></div>');
            break;
        case 'noticeCycle':
            formatHtmlArr.push('<li class="cen-st-litem" id="{0}_{3}" t="{3}">');
            formatHtmlArr.push('{1}');
            formatHtmlArr.push('    <p class="acc-item-rst"  value="{0}" name="noticeCycle" p="{2}" cval="{1}" t="{3}">    ');
            formatHtmlArr.push('    <span>{2}积分</span><i></i></p>   ');
            formatHtmlArr.push('</li>');
            break;
        case 'subscribeBtn':
            formatHtmlArr.push('<p>合计：<span>0积分</span></p>');
            formatHtmlArr.push('<button class="submit-btn" t="{0}" tn="{1}" a="{2}" t="{3}" c="{4}">订阅/结算</button>');
            break;
    }
    return formatHtmlArr.join("");
}