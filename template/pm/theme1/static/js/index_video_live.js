/**
 * 直播间视频区直播选项卡操作类
 * author Jade.zhu
 */
var videosLive = {
    init: function(){
        this.setEvent();
        this.getMarketPrice();
        this.setCftcCot();
        this.setSymbolOpenPositionRatios();
        this.initCalendar(function(){});
        this.setFinanceData("",1);
        this.setInformation();
    },
    setEvent: function(){
        /**
         * 切换房间
         */
        $(".tabcont .main_tab .s1 a").click(function(){
            if($(this).hasClass('on')){
                return false;
            }
            var thiz = $(this);
            var cgs=$(this).attr("cgs");
            var roomName = thiz.find("b").text();
            var roomType = thiz.attr("rt");
            if(thiz.attr("av") == "false" && indexJS.checkClientGroup('visitor')){
                //不允许游客进入，但当前是游客，直接要求登录，且登录框不允许关闭
                $("#login_a").trigger("click", {groupId : thiz.attr("rid"), closeable : false});
                return false;
            }
            if(!common.containSplitStr(cgs,indexJS.userInfo.clientGroup)){
                videosLive.changeRoomMsg({title:roomName, roomType:roomType, clientGroups: cgs});
                return false;
            }
            if(thiz.attr("st") == "2"){//权限受限
                if(roomType == "train"){
                    if(thiz.attr("ha")!="1"){
                        if(thiz.attr("sp") != "true"){
                            chatTeacher.trainDetailsLoad($(this).attr("userno"), $(this).text());
                        }else{
                            videosLive.changeRoomMsg({title:roomName, type:"onlyTrain"});
                        }
                        return false;
                    }
                    chatTeacher.trainRegis(thiz);
                    return false;
                }else{
                    if(thiz.attr("ha")!="1"){
                        videosLive.changeRoomMsg({title:roomName, type:"onlyMark"});
                        return false;
                    }
                }
            }
            common.getJson("/studio/checkGroupAuth",{groupId:thiz.attr("rid")},function(result){
                if(!result.isOK){
                    if(roomType=='train') {
                        common.getJson("/studio/getchatGroupByGroupId",{groupId:thiz.attr("rid")},function(result){
                            var traninClients =  result.traninClient;
                            var flag = false;
                            for(var i = 0;i<traninClients.length;i++){
                                var traninClient = traninClients[i];
                                if(indexJS.userInfo.userId == traninClient.clientId){
                                    flag = true;
                                    break;
                                }
                            }
                            if(flag){
                                if(result.point && Math.abs(result.point)>0){
                                    var tip='您未报名培训班或者未通过审核，是否消耗'+result.point+'积分直接进入房间？';
                                    videosLive.changeRoomMsg({title:roomName, msg:tip}, function(){
                                        var point = result.point;
                                        var params = {groupType:indexJS.userInfo.groupType,item:"prerogative_room",tag:'user_'+indexJS.userInfo.userId,val:-result.point,groupId:thiz.attr("rid")};
                                        if(point != 0){
                                            common.getJson('/studio/addPointsInfo',{params:JSON.stringify(params)}, function(result) {
                                                if (!result.isOK) {
                                                    box.showTipBox(result.msg);
                                                }else{
                                                    common.getJson('/studio/updateSession',{params:JSON.stringify(params)}, function(result) {
                                                        if(result.isOK){
                                                            indexJS.toRefreshView();
                                                        }
                                                    });
                                                }
                                            })
                                        }else{
                                            common.getJson('/studio/updateSession',{params:JSON.stringify(params)}, function(result) {
                                                if(result.isOK){
                                                    indexJS.toRefreshView();
                                                }
                                            });
                                        }
                                    });
                                }else{
                                    indexJS.toRefreshView();
                                }
                            }
                        });
                    }else{
                        videosLive.changeRoomMsg({title:roomName, roomType:roomType, clientGroups:cgs});
                    }
                }else{
                    indexJS.toRefreshView();
                }
            },true,function(err){
                if("success"!=err) {
                    videosLive.changeRoomMsg({title:roomName, type:"error"});
                }
            });
        });
        indexJS.setListScroll($(".tabcont .main_tab .infocont .rbox .scrollbox"));//行情持仓比例未平仓品种比率滚动条

        $('#calendarFinance').val(videosLive.currentDate());
        /*财经日历选择日期*/
        $('#calendarFinance').change(function(){
            var releaseTime = $(this).val();
            videosLive.setFinanceData(releaseTime, 1);
        });
        //绑定查询功能
        $('.calenda_sel a').click(function(){
            $(this).addClass("on").siblings("").removeClass("on");
            var htmlCar = $('.calenda_show .scrollbox ul').html();
            var data = $(this).attr("data");
            var releaseTime = $("#calendarFinance").val();
            videosLive.setFinanceData(releaseTime, 1,data);
        });
        //绑定点击事件
        $('.querybtn').click(function(){
            var releaseTime = $("#calendarFinance").val();
            videosLive.setFinanceData(releaseTime, 1);
        });
        //更多筛选
        $('.casel_more_sel').click(function(){
            common.openPopup('.blackbg,.calenda_select');
        });
        //国家筛选
        $('#countrySel li').click(function(){
            var releaseTime = $("#calendarFinance").val();
            var country =  $(this).find("img").attr("alt");
             $(".blackbg").hide();
             $(".calenda_select").hide();
             videosLive.setFinanceData(releaseTime, 1,"countrysel_"+country);
        });
        //星级筛选
        $('#importanceQuery li').click(function(){
            var releaseTime = $("#calendarFinance").val();
            var country =  $(this).attr("ta");
            $(".blackbg").hide();
            $(".calenda_select").hide();
            videosLive.setFinanceData(releaseTime, 1,"stars_"+country);
        });
    },
    /**
     * 返回服务器当天日期
     */
    currentDate:function(){
        return common.formatterDate(indexJS.serverTime,"-");
    },
    /**
     * 切换房间提示
     * @param ops {{title:string, [roomType]:String, [status]:String, [clientGroups]:String, [type]:String, [msg]:String}}
     * @param btnFn
     */
    changeRoomMsg : function(ops, btnFn){
        var msgMap = {
            "onlyTrain" : "该房间仅对培训班学员开放，",
            "onlyNew" : "该房间仅对新客户开放，",
            "onlyActive" : "已有真实账户并激活的客户才可进入该房间，您还不满足条件，",
            "onlyVip" : "该房间仅对VIP客户开放，",
            "onlyMark" : "该房间仅对指定客户开放，",
            "noAuth" : "您没有访问该房间的权限，",
            "error" : "操作失败，"
        };
        if(!btnFn){
            btnFn = function(){
                videosLive.contactTeacher();
                _gaq.push(['_trackEvent', 'pmchat_studio', 'left_zb_confirm', 'content_left', 1, true]);
            };
        }
        ops = ops||{};
        if(ops.type && msgMap.hasOwnProperty(ops.type)){
            ops.msg = msgMap[ops.type];
        }else if(ops.roomType == "train"){
            ops.msg = msgMap.onlyTrain;
        }else if(ops.status == "2"){
            ops.msg = msgMap.onlyMark;
        }else if(ops.clientGroups){
            if(/^((,visitor)|(,register))+$/.test( "," + ops.clientGroups)){
                ops.msg = msgMap["onlyNew"];
            }else if(ops.clientGroups == "vip"){
                ops.msg = msgMap["onlyVip"];
            }else if(/^((,active)|(,vip))+$/.test( "," + ops.clientGroups)){
                ops.msg = msgMap["onlyActive"];
            }
        }
        box.showMsg({
            title : ops.title || "",
            msg : ops.msg || msgMap["noAuth"],
            btns : [{
                txt : "确定",
                fn : btnFn
            }]
        });
        var subMsg = '<a class="contactContact" style="color:#2980d1; font-size:14px;text-decoration:none;cursor:pointer" onclick="videosLive.contactTeacher();_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_zb_callzhuli\', \'content_left\', 1, true]);">如有疑问请联系老师助理</a>。';
        $("#popMsgTxt").append(subMsg);
    },
    /**
     * 获取行情
     */
    getMarketPrice: function() {
        var url = "wss://kdata.gwfx.com:7087/websocket.do",
            data = "service=HqDataWebSocketService&method=pushMarketprice&symbol=XAGUSD|XAUUSD|USDX|CLWTI&dataType=simpleMarketPrice",
            httpUrl = "https://kdata.gwfx.com:7099/gateway.do?service=HqDataService&method=getMarkrtPriceDataFromCache",
            selfOptions = {from:'studio',fall:'fall'};
        getAllMarketpriceIndex(url, data, httpUrl, selfOptions);
        /*行情数据*/
    },
    /*CFTC持仓比例*/
    setCftcCot:function(){
        $.getJSON('https://oa.24k.hk/activity20160603/getShortRatiosList?callbackFun=?',null,function(data){
            var cftcName = {'LLG':'伦敦金', 'LLS':'伦敦银'};
            if(data != null && data){
                var percHtml = [];
                var percFormat = videosLive.formatHtml('cftcperc');
                $.each(cftcName, function(key, value){
                    var buy = key+'BuyRatios', sell = key+'SellRatios';
                    percHtml.push(percFormat.formatStr(data[buy], data[sell], value));
                    $('#ratioInfoUpdateTime').text('上次更新时间：' + data.LLGDate + ' 11:15 GMT+0800');
                });
                $('.rbox .infobox .ratioInfo').html(percHtml.join(''));
                videosLive.initEasyPieChart(function(){});
            }else{
                videosLive.setCftcCot();
            }
        });
    },
    /**
     * 行情投票环形饼图初始化
     */
    initEasyPieChart:function(callback){
        if(!$('.tabnav .live').hasClass('initEasyPieChart')) {
            var jsFileArr = [];
            if ($.browser.msie) {
                jsFileArr.push('/base/lib/excanvas.compiled.js');
            }
            jsFileArr.push('/base/lib/jquery.easy-pie-chart.min.js');
            /*行情投票环形饼图初始化*/
            LazyLoad.js(jsFileArr, function () {
                $('.percentage').easyPieChart({
                    barColor: '#e34b51',
                    trackColor: '#2bb38a',
                    scaleColor: false,
                    lineCap: 'square',
                    lineWidth: 2,
                    animate: 1000,
                    size: 65
                });
                callback();
            });
        }else{
            callback();
        }
    },
    /**
     * 未平仓品种比率
     */
    setSymbolOpenPositionRatios: function(){
        var symbol = {'LLS':'伦敦银', 'LLG':'伦敦金'};
        $.getJSON('/studio/getSymbolOpenPositionRatios',null,function(data){
            if(data!=null && data.code=='SUCCESS'){
                var result = data.result;
                var soprHtml = [], soprFormat = videosLive.formatHtml('symbolOpenPositionRatios');
                $.each(result, function(key, row){
                    soprHtml.push(soprFormat.formatStr(symbol[row.symbol], row.openPositionRatios));
                    $('#percentInfoUpdateTime').text('上次更新时间：' + common.formatterDate(row.date.time) + ' 11:15 GMT+0800');
                });
                $('.rbox .infobox .percentInfo').html(soprHtml.join(''));
            }
        });
    },
    /**
     * 初始化日历控件
     */
    initCalendar:function(callback){
        if(!$('.dr3').hasClass('initCalendar')) {/*避免多次初始化*/
            /*财经日历选择日期框*/
            LazyLoad.js(['/base/lib/pikaday/moment.min.js','/base/lib/pikaday/pikaday.min.js'], function () {
                var defaultDate = videosLive.currentDate();
                var i18n = { // 本地化
                    previousMonth: '上个月',
                    nextMonth: '下个月',
                    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                    weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
                };
                var picker = new Pikaday({
                    field: $('#calendarFinance')[0],
                    firstDay: 1,
                    container: $('#calendarContainer')[0],
                    defaultDate: defaultDate,
                    i18n: i18n,
                    minDate: new Date(2000, 0, 1),
                    maxDate: new Date(2050, 12, 31),
                    yearRange: [2000, 2050],
                    onSelect: function () {
                        var date = document.createTextNode(this.getMoment().format('YYYY-MM-DD') + ' '); //生成的时间格式化成 2013-09-25
                        //$('#calendarFinance').val(date);
                        //this.destroy();//不能使用销毁的方式，否则创建后为选择日期，会出现多个日历
                    }
                });
                callback();
            });
        }
        else{
            callback();
        }
    },
    /**
     * 财经日历数据
     * @param releaseTime 日期
     * @param dataTypeCon 数据类型
     */
    setFinanceData:function(releaseTime, dataTypeCon,data){

        if(common.isBlank(releaseTime)){
            releaseTime = videosLive.currentDate();
        }
        common.getJson('/studio/getFinancData', {releaseTime: releaseTime, dataTypeCon: dataTypeCon}, function(result){
            if(result.result == 0){
                var countryImg = {'德国':'Germany', '法国':'France', '欧元区':'EUR', '加拿大':'CAD', '美国':'USD', '澳大利亚':'AUD', '日本':'JPY', '瑞士':'CHF', '意大利':'Italy', '英国':'GBP', '中国':'CNY', '新西兰':'NZD', '韩国':'SK', '香港':'HKD', '西班牙':'Spain', '台湾':'Taiwan', '印度':'INR', '新加坡':'Singapore'};
                var financeHtml = '';
                var financeFormat = videosLive.formatHtml('finance');
                $.each(result.data.financeData, function(key, value){
                    var liOu = "";
                    if(key % 2 == 0 && key!=0){
                        liOu = "r";
                    }
                    /*if(key>3){
                     return false;
                     }*/
                    var name = common.isBlank(value.name)?'---':value.name;
                    var predictValue = common.isBlank(value.predictValue)?'---':value.predictValue;
                    var valueA = common.isBlank(value.value)?'---':value.value;
                    var time = value.time.substring(0,5);
                    var countryPic = common.isBlank(value.country)?'---':value.country;;
                    var country =  common.isBlank(countryImg[countryPic])?'none':countryImg[countryPic];
                    var  importanceLevel = videosLive.importanceLevel(value.importanceLevel);

                    if(typeof(data) != "undefined")
                    {
                        //美元指数
                        if(data=="usdx"){
                            if(countryPic == "欧元区" || countryPic== "美国"){
                                financeHtml += financeFormat.formatStr(liOu,name,predictValue,valueA,time,country,countryPic,importanceLevel);
                            }
                        }else if(data=="pm"){
                            var description = value.description;
                            var deStart = description.indexOf("PM_");
                            //判断是否已PM开头
                            if(deStart==0){
                                financeHtml += financeFormat.formatStr(liOu,name,predictValue,valueA,time,country,countryPic,importanceLevel);
                            }
                        }else if(data=="all"){
                            financeHtml += financeFormat.formatStr(liOu,name,predictValue,valueA,time,country,countryPic,importanceLevel);
                        }else{
                            if(data.indexOf("countrysel_")!=-1){
                               var datas = data.split("_")[1];
                                if(countryPic==datas){
                                    financeHtml += financeFormat.formatStr(liOu,name,predictValue,valueA,time,country,countryPic,importanceLevel);
                                }
                            }if(data.indexOf("stars_")!=-1){
                                var datastar = data.split("_")[1];
                                if(value.importanceLevel==datastar){
                                    financeHtml += financeFormat.formatStr(liOu,name,predictValue,valueA,time,country,countryPic,importanceLevel);
                                }
                            }
                        }
                    }else{
                           financeHtml += financeFormat.formatStr(liOu,name,predictValue,valueA,time,country,countryPic,importanceLevel);
                    }


                });
                $('.calenda_show .scrollbox ul').html(financeHtml);
                indexJS.setListScroll('.calenda_show .scrollbox',{isCustom:false,scrollbarPosition:"outside",theme:"dark-2"});//*设置滚动条*/
            }
        });
    },
    /**
     * 加载快讯数据
     */
    setInformation: function(){
        var scrollDom = $(".message_list ").find('.scrollbox'), intervalTime = $('#newInfoCount').attr('t');
        if(!common.isBlank(intervalTime) && indexJS.serverTime - intervalTime < 2*60*1000){
            return;
        }
        $.getJSON(indexJS.apiUrl+ '/common/getInformation?t='+indexJS.serverTime, null, function(result){
            if(result){
                if(result.isOK) {
                    var pt = $('#newInfoCount').attr('pt'), pubDateTime = null,newsHtml = '', newsFormatHtml = videosLive.formatHtml('news');
                    $.each(result.data.news.item, function(key, row){
                        if (pt == row.pubDate  && common.isValid(pt)) {
                            indexJS.infoNewCount++;
                            $('#newInfoCount').text(indexJS.infoNewCount).css("display", "inline-block");
                        }
                        if(key < 1){
                            pubDateTime = row.pubDate;
                        }
                        if(row.pubDate > pt || common.isBlank(pt)) {
                            newsHtml += newsFormatHtml.formatStr(row.pubDate.substring(10), row.title);
                        }
                    });
                    if(common.isValid(newsHtml)) {
                        $('.message_list .scrollbox ul').html(newsHtml);
                    }
                    if(common.isBlank(pt)){
                        $('#newInfoCount').attr('pt', pubDateTime);
                    }
                    indexJS.setListScroll(scrollDom);//设置滚动
                    $('#newInfoCount').attr('pt', pubDateTime);
                    if($(".message_list .scrollbox:eq(2)").hasClass('on')){
                        indexJS.infoNewCount = 0;
                        $('#newInfoCount').attr({'pt':pubDateTime,'t':indexJS.serverTime}).text(indexJS.infoNewCount).hide();
                    }

                }
            }
        });
    },
    /**
     * 根据传入的模块域标识返回待处理的html模板
     * @param region 模块域
     * @returns {string} html 财经日历模板
     */
    formatHtml: function(region){
        var formatHtmlArr = [];
        switch (region){
            case 'finance':
                formatHtmlArr.push('<li class="{0}">');
                formatHtmlArr.push('    <div class="cacont">');
                formatHtmlArr.push('        <div class="ca_item"><i></i><span>{1}</span></div>');
                formatHtmlArr.push('        <div class="ca_detail">');
                formatHtmlArr.push('            <table cellpadding="0" cellspacing="0" border="0" width="100%">');
                formatHtmlArr.push('                <tr>');
                formatHtmlArr.push('                    <td><strong>预测值:</strong>-<b>{2}</b> </td>');
                formatHtmlArr.push('                    <td class="t3"><strong>公布值:</strong>-<b>{3}</b></td>');
                formatHtmlArr.push('                </tr>');
                formatHtmlArr.push('                <tr>');
                formatHtmlArr.push('                    <td class="tl"><span class="timetag">{4}</span></td>');
                formatHtmlArr.push('                    <td><i class="country"><img src="//img.kgold852.com/public/economicCalenda/images/country/{5}.png" width="100%" alt="{6}"></i>{6}</td>');
                formatHtmlArr.push('                    <td><div class="star">{7}</div></td>');
                formatHtmlArr.push('                </tr>');
                formatHtmlArr.push('            </table>');
                formatHtmlArr.push('        </div>');
                formatHtmlArr.push('    </div>');
                formatHtmlArr.push('</li>');
                break;
            case 'news':
                formatHtmlArr.push('<li><span><i></i><b>{0} </b>{1}</span></li>');
                break;
            case 'cftcperc':
                formatHtmlArr.push('<div class="ratiobox">');
                formatHtmlArr.push('    <div class="data">');
                formatHtmlArr.push('        <span>多头<b>{0}</b>%</span><br>');
                formatHtmlArr.push('        <span class="b">空头<b>{1}</b>%</span>');
                formatHtmlArr.push('    </div>');
                formatHtmlArr.push('    <div class="percentage easyPieChart" data-percent="{1}">');
                formatHtmlArr.push('        <b class="rationame">{2}</b>');
                formatHtmlArr.push('    </div>');
                formatHtmlArr.push('</div>');
                break;
            case 'symbolOpenPositionRatios':
                formatHtmlArr.push('<div class="perbox">');
                formatHtmlArr.push('    <span class="pname">{0}</span>');
                formatHtmlArr.push('    <span class="pervalue">{1}%</span>');
                formatHtmlArr.push('    <div class="main"><b class="bar" style="width:{1}%"></b></div>');
                formatHtmlArr.push('</div>');
                break;
        }
        return formatHtmlArr.join('');
    },
    /**
     * 联系助理
     */
    contactTeacher:function(){
        if($(".pletter_win .mult_dialog a[utype=3]").length==0) {
            chat.getCSList();//设置所有客服
        }
        if($(this).hasClass('nocs')){
            box.showTipBox('助理失联中');
        }else {
            common.openPopup('.blackbg,.pletter_win');
        }

        $("#popMsgBox").hide();
    },
    /**
     * 根据重要级别返回星星
     * @param level 重要级别
     */
    importanceLevel:function(level){

        var html = '';
        switch(level) {
            case 1:
                html = '<span class="on">★</span><span>★</span><span>★</span><span>★</span><span>★</span>';
                break;
            case 2:
                html = '<span class="on">★</span><span class="on">★</span><span>★</span><span>★</span><span>★</span>';
                break;
            case 3:
                html = '<span class="on">★</span><span class="on">★</span><span class="on">★</span><span>★</span><span>★</span>';
                break;
            case 4:
                html = '<span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span><span>★</span>';
                break;
            case 5:
                html = '<span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span><span class="on">★</span>';
                break;
            default:
                html = '<span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>';
                break;
        }
        return html;
    }
};
