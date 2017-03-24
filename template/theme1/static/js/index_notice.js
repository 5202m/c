/**
 * api财经日历推送通知操作类
 * Created by Jade.zhu on 2016/11/21.
 */
var noticeJS = {
    socket:null,
    init:function(){
        this.showLastReview();
        this.setSocket();
    },
    /**
     * 显示最后点评数据
     */
    showLastReview:function(){
        $.getJSON('/getLastReview',null,function(data){
            if(data && data.comments && data.comments.length > 0){
                var finance = data, comments = finance.comments[finance.comments.length-1];
                var reviewHtml = '', reviewFormatHtml = noticeJS.formatHtml('financeReview');
                var nationlFlag = noticeJS.getNationalFlag(finance.country);
                var nationlFlagStr = 'http://img.kgold852.com/public/economicCalenda/images/country/'+nationlFlag+'.png';
                var starHtml = noticeJS.getStar(finance.importanceLevel);
                var goodFlats = finance.description.split('_');
                var profitHtml = noticeJS.getProfit(goodFlats[3]);
                var predictValue = common.isValid(finance.predictValue) && $.isNumeric(finance.predictValue)?Number(finance.predictValue.toString().match(/^\d+(?:\.\d{0,2})?/)):finance.predictValue;
                var lastValue = common.isValid(finance.lastValue) && $.isNumeric(finance.lastValue)?Number(finance.lastValue.toString().match(/^\d+(?:\.\d{0,2})?/)):finance.lastValue;
                var value = common.isValid(finance.value) && $.isNumeric(finance.value)?Number(finance.value.toString().match(/^\d+(?:\.\d{0,2})?/)):finance.value;
                reviewHtml = reviewFormatHtml.formatStr(comments.avatar,nationlFlagStr, finance.country, finance.name, starHtml, (nationlFlag=='none'?'':nationlFlag), profitHtml, predictValue, lastValue, value,comments.comment);
                $('#financeDataAndReview .comment').html(reviewHtml);
                $('#financeDataAndReview').show();
                indexJS.setListScroll($(".tabcont .main_tab .livebrief_list .scrollbox"));//直播精华
            }else{
                $('#financeDataAndReview').hide();
            }
        });
    },
    /**
     * 连接socket
     */
    setSocket:function(){
        this.socket = io.connect(indexJS.socketUrl.apiSocket);
        //建立连接
        this.socket.on('connect',function(){
            console.log('connected to server!');
        });
        //出现异常
        this.socket.on("error",function(e){
            console.error('e:'+e);
        });
        //断开连接
        this.socket.on('disconnect',function(e){
            console.log('disconnect');
        });
        //通知信息 5星等级数据 及 点评数据
        this.socket.on('financeData',function(result){
            if(!result || !result.finance || (result.finance.importanceLevel < 4 || !result.review)){//非4 5星 非评论数据不显示
                return;
            }
            var comments = result.review, finance = result.finance;
            var dataHtml = '', reviewHtml = '', dataFormatHtml = noticeJS.formatHtml('financeData'), reviewFormatHtml = noticeJS.formatHtml('financeReview');
            var nationlFlag = noticeJS.getNationalFlag(finance.country);
            var nationlFlagStr = 'http://img.kgold852.com/public/economicCalenda/images/country/'+nationlFlag+'.png';
            var starHtml = noticeJS.getStar(finance.importanceLevel);
            var goodFlats = finance.description.split('_');
            var profitHtml = noticeJS.getProfit(goodFlats[3]);
            var predictValue = common.isValid(finance.predictValue) && $.isNumeric(finance.predictValue)?Number(finance.predictValue.toString().match(/^\d+(?:\.\d{0,2})?/)):finance.predictValue;
            var lastValue = common.isValid(finance.lastValue) && $.isNumeric(finance.lastValue)?Number(finance.lastValue.toString().match(/^\d+(?:\.\d{0,2})?/)):finance.lastValue;
            var value = common.isValid(finance.value) && $.isNumeric(finance.value)?Number(finance.value.toString().match(/^\d+(?:\.\d{0,2})?/)):finance.value;
            dataHtml = dataFormatHtml.formatStr(nationlFlagStr, finance.country, finance.name, starHtml, (nationlFlag=='none'?'':nationlFlag), profitHtml, predictValue, lastValue, value);
            if(comments){
                reviewHtml = reviewFormatHtml.formatStr(comments.avatar,nationlFlagStr, finance.country, finance.name, starHtml, (nationlFlag=='none'?'':nationlFlag), profitHtml, predictValue, lastValue, value,comments.comment);
                //$('#financeDataAndReview .financeData').html(dataHtml);
                $('#financeDataAndReview .comment').html(reviewHtml);
                $('#financeDataAndReview').show();
                $('#dialog_list').append('<div class="calendabox comment">'+reviewHtml+'</div>');
                indexJS.setListScroll($(".tabcont .main_tab .livebrief_list .scrollbox"));//直播精华
            }else{
                $('#dialog_list').append('<div class="calendabox">'+dataHtml+'</div>');
            }
            chat.setTalkListScroll(true);
            chat.showChatMsgNumTip(false);
        });
    },
    /**
     * 返回对应区域类型的html
     * @param region
     * @returns {string}
     */
    formatHtml:function(region){
        var html = [];
        switch(region){
            case 'financeData':
                html.push('<div class="ca_cont">');
                html.push('    <table class="ca_table" cellspacing="0" cellpadding="0" width="100%" border="0">');
                html.push('        <tbody><tr>');
                html.push('            <td rowspan="2">');
                html.push('                <div class="ctbox">');
                html.push('                    <div class="country"><img src="{0}" width="100%" alt="{1}" class="mCS_img_loaded"></div>');//国旗，国家名
                html.push('                    <span class="zbname">{2}</span>');//数据名称
                html.push('                </div>');
                html.push('            </td>');
                html.push('            <td>');
                html.push('                <div class="star">');
                html.push('                    {3}');//重要指数
                html.push('                </div>');
                html.push('                <div class="yx">');
                html.push('                    <b>{4}</b>');//国家英文缩写
                html.push('                    {5}');//利多/空/平
                html.push('                </div>');
                html.push('            </td>');
                html.push('        </tr>');
                html.push('        <tr>');
                html.push('            <td>');
                html.push('                <span class="ca_value">前值：<b>{6}</b></span>');
                html.push('                <span class="ca_value">预期值：<b>{7}</b></span>');
                html.push('                <span class="ca_value">实际值：<b>{8}</b></span>');
                html.push('            </td>');
                html.push('        </tr>');
                html.push('    </tbody></table>');
                html.push('</div>');
                break;
            case 'financeReview':
                html.push('<div class="ca_cont">');
                html.push('    <div class="himgline">');
                html.push('        <div class="himg"><img src="{0}" class="mCS_img_loaded"></div>');//分析师头像
                html.push('        <table class="ca_table" cellspacing="0" cellpadding="0" width="100%" border="0">');
                html.push('            <tbody><tr>');
                html.push('                <td rowspan="2">');
                html.push('                    <div class="ctbox">');
                html.push('                        <div class="country"><img src="{1}" width="100%" alt="{2}" class="mCS_img_loaded"></div>');//国旗，国家名
                html.push('                        <span class="zbname">{3}</span>');//标题
                html.push('                    </div>');
                html.push('                </td>');
                html.push('                <td>');
                html.push('                    <div class="star">');
                html.push('                        {4}');//重要指数
                html.push('                    </div>');
                html.push('                    <div class="yx">');
                html.push('                        <b>{5}</b>');//国家英文缩写
                html.push('                        {6}');//利多/空/平
                html.push('                    </div>');
                html.push('                </td>');
                html.push('            </tr>');
                html.push('            <tr>');
                html.push('                <td>');
                html.push('                    <span class="ca_value">前值：<b>{7}</b></span>');
                html.push('                    <span class="ca_value">预期值：<b>{8}</b></span>');
                html.push('                    <span class="ca_value">实际值：<b>{9}</b></span>');
                html.push('                </td>');
                html.push('            </tr>');
                html.push('        </tbody></table>');
                html.push('    </div>');
                html.push('    <div class="commentline">');
                html.push('        <span class="ctit">点评：</span>');
                html.push('        <div class="comtext">{10}</div>');
                html.push('    </div>');
                html.push('</div>');
                break;
        }
        return html.join('');
    },
    /**
     * 返回数据等级
     * @param star
     */
    getStar:function(star){
        var html = [];
        html.push('<i class="on">');
        for(var i = 0; i < star; i++){
            html.push('★');
        }
        html.push('</i>');
        html.push('<i>');
        for(var i = star; i < 5; i++){
            html.push('★');
        }
        html.push('</i>');
        return html.join('');
    },
    /**
     * 返回利多/空/平html
     * @param value
     * @returns {string}
     */
    getProfit:function(value){
        var html = [];
        switch (value){
            case 'GOOD':
                html.push('<span class="cz">利多</span>');
                break;
            case 'BAD':
                html.push('<span class="cz c2">利空</span>');
                break;
            case 'FLAT':
                html.push('<span class="cz c3">持平</span>');
                break;
        }
        return html.join('');
    },
    /**
     * 根据国家名获取国旗名称
     * @param currencyType
     * @returns {*}
     */
    getNationalFlag : function(currencyType){
        if("新西兰"==currencyType){
            return "NZD";
        }else if("韩国"==currencyType){
            return "SK";
        }else if("澳大利亚"==currencyType){
            return "AUD";
        }else if("日本"==currencyType){
            return "JPY";
        }else if("德国"==currencyType){
            return "Germany";//EUR
        }else if("瑞士"==currencyType){
            return "CHF";
        }else if("香港"==currencyType){
            return "HKD";
        }else if("西班牙"==currencyType){
            return "Spain";
        }else if("英国"==currencyType){
            return "GBP";
        }else if("意大利"==currencyType){
            return "Italy";
        }else if("加拿大"==currencyType){
            return "CAD";
        }else if("美国"==currencyType){
            return "USD";
        }else if("中国"==currencyType){
            return "CNY";
        }else if("台湾"==currencyType){
            return "Taiwan";
        }else if("印度"==currencyType){
            return "INR";
        }else if("法国"==currencyType){
            return "France";//EUR
        }else if("欧元区"==currencyType){
            return "EUR";
        }else if("新加坡"==currencyType){
            return "Singapore";
        }else if("OECD"==currencyType){
            return "none";
        }
        else{
            return "none";
        }
    }
};