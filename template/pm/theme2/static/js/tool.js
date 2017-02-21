/**
 * 直播间手机版工具类
 * author Dick.guo
 *
 * OnlineCS : 在线客服
 */
var Tool = {
    /**
     * 在线客服
     */
    OnlineCS : {
        /**
         * 联系在线客服
         * @param platform pm、fx、hx
         * @param type     qq、live800
         * @param device   pc、mb
         */
        connect : function(platform, type, device){
            device = device && "pc";
            switch(platform){
                case "pm":
                    this.connect2PM(type, device);
                    break;

                case "fx":
                    this.connect2FX(type, device);
                    break;

                case "hx":
                    this.connect2HX(type, device);
                    break;
            }
        },

        /**
         * 获取窗口特征
         * @param device
         */
        getWindowFeatures : function(device){
            return device == "pc" ? "height=520,width=740,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no" : "";
        },

        /**
         * PM联系在线客服
         * @param type
         * @param device
         */
        connect2PM : function(type, device){
            switch(type){
                case "qq":
                    window.open("http://wpa.b.qq.com/cgi/wpa.php?ln=2&uin=800018282", "WindowPMChatQQ", this.getWindowFeatures(device));
                    break;

                case "live800":
                    window.open("https://www.onlineservice-hk.com/k800/chatClient/chatbox.jsp?companyID=209&s=1",'WindowPMChatLive800', this.getWindowFeatures(device));
                    break;
            }
        },

        /**
         * FX联系在线客服
         * @param type
         * @param device
         */
        connect2FX : function(type, device){
            switch(type){
                case "qq":
                    window.open("http://wpa.b.qq.com/cgi/wpa.php?ln=2&uin=800018886", "WindowFXChatQQ", this.getWindowFeatures(device));
                    break;

                case "live800":
                    window.open("http://onlinecustomer-service.gwghk.com/live800/chatClient/chatbox.jsp?companyID=283&enterurl=http%3A%2F%2Fwww%2Egwfx%2Ecom%2F&tm=1355377642406",'WindowFXChatLive800', this.getWindowFeatures(device));
                    break;
            }

        },

        /**
         * HX联系在线客服
         * @param type
         * @param device
         */
        connect2HX : function(type, device){
            switch(type){
                case "qq":
                    window.open("http://crm2.qq.com/page/portalpage/wpa.php?uin=800025930&cref=&ref=&f=1&ty=1&ap=&as=&utm_source=hxstudio&utm_medium=yy&utm_content=TOP&utm_campaign=qqzx_hx", "WindowHXChatQQ", this.getWindowFeatures(device));
                    break;
            }
        }
    },
    /**
     * 课程表定时器
     */
    courseTick : {
        //当前课程或下次课程
        course : {courseId:'',courseType:0,courseTypeName:'',day:0,endTime:'',isNext:false,lecturer:'',lecturerId:'',startTime:'',status:0,studioLink:null,title:'',courseName:''},
        //下次校验时间
        nextTickTime : 0,
        roomId : null,
        //初始化或者重新校验
        tick : function(){
            if(Data.serverTime.time <= this.nextTickTime && this.roomId == Data.userInfo.groupId){
                return;
            }
            Data.getSyllabus(function(syllabusData){
                var currCourse = Util.getSyllabusPlan(syllabusData, Data.serverTime.time);
                if(!currCourse){
                    return;
                }
                var nextTime = 0;
                var timezoneOffset = new Date().getTimezoneOffset() * 60000;
                if(currCourse.isNext){ //下次课程开始作为下一次tick时间
                    //"17:51" eval("17*60+51")*60*1000
                    nextTime = eval(currCourse.startTime.replace(":", "*60+"))*60000 + Data.serverTime.time - Data.serverTime.time % 86400000 + timezoneOffset;
                }else{//本次课程结束后作为下一次tick时间
                    nextTime = eval(currCourse.endTime.replace(":", "*60+"))*60000 + Data.serverTime.time - Data.serverTime.time % 86400000 + timezoneOffset + 60000;
                }
                if(this.nextTickTime != nextTime) {
                    var courseType = {'0': '文字直播', '1': '视频直播', '2': 'oneTV直播'};
                    var courseId = Util.formatDate(Data.serverTime.time, 'yyyy-MM-dd') + '_' + currCourse.startTime + '_' + Data.userInfo.groupId;
                    this.course = currCourse;
                    this.course.courseId = courseId;
                    if(Util.isNotBlank(currCourse.title) && Util.isNotBlank(currCourse.lecturer) && Util.isNotBlank(currCourse.courseType)) {
                        this.course.courseTypeName = courseType[currCourse.courseType];
                        this.course.courseName = currCourse.title + '_' + currCourse.lecturer + '_' + courseType[currCourse.courseType];
                    }
                    this.nextTickTime = nextTime;
                    this.roomId = Data.userInfo.groupId;
                }
            });
        }
    },
    /**
     * 获取行情报价
     */
    getAllMarketPrice : {
        pkMarketSocket : null,//定义标价socket
        init : function(){
            var url = "wss://kdata.gwfx.com:7087/websocket.do",
                data = "service=HqDataWebSocketService&method=pushMarketprice&symbol=XAGUSD|XAUUSD|USDX|CLWTI&dataType=simpleMarketPrice",
                httpUrl = "https://kdata.gwfx.com:7099/gateway.do?service=HqDataService&method=getMarkrtPriceDataFromCache",
                selfOptions = null;
            Tool.getAllMarketPrice.getAllMarketpriceIndex(url, data, httpUrl, selfOptions);
            //底部信息轮播
            var curIndex = 0;
            var timeInterval = 3000;
            var _obj = $(".infos-play li");
            setInterval(changeinfos,timeInterval);
            function changeinfos() {
                if (curIndex == _obj.length-1) {
                    curIndex = 0;
                } else {
                    curIndex += 1;
                }
                _obj.eq(curIndex).fadeIn().siblings().fadeOut();
            }
        },
        /**
         * 获取行情报价入口
         * @param wsUrl
         * @param wsData
         * @param httpUrl
         * @param selfOptions
         */
         getAllMarketpriceIndex : function(wsUrl, wsData, httpUrl, selfOptions){
            try {
                if (!window.WebSocket) {
                    window.WebSocket = window.MozWebSocket;
                }
                if (window.WebSocket) {
                    if (!Tool.getAllMarketPrice.pkMarketSocket) {
                        Tool.getAllMarketPrice.pkMarketSocket = new ReconnectingWebSocket(wsUrl, null, {reconnectInterval: 3000});
                        Tool.getAllMarketPrice.pkMarketSocket.onmessage = function (event) {
                            var retData = JSON.parse(event.data);
                            if ("OK" == retData.code) {
                                Tool.getAllMarketPrice.parseMarketpriceIndex(retData, selfOptions);
                            }
                        };
                        Tool.getAllMarketPrice.pkMarketSocket.onopen = function (event) {
                            if (Tool.getAllMarketPrice.pkMarketSocket.readyState == WebSocket.OPEN) {
                                Tool.getAllMarketPrice.pkMarketSocket.send(wsData);
                            }
                        };
                    } else {
                        if (Tool.getAllMarketPrice.pkMarketSocket.readyState == WebSocket.OPEN) {
                            Tool.getAllMarketPrice.pkMarketSocket.send(wsData);
                        }
                    }
                } else {
                    setInterval(function () {
                        Tool.getAllMarketPrice.getMarketpriceCrossDomainIndex(httpUrl, selfOptions)
                    }, 1000 * 2);
                }
            } catch (e) {
                console.log("get price has error!");
            }
        },
        /**
         * 获取行情报价请求
         * @param url
         * @param selfOptions
         */
        getMarketpriceCrossDomainIndex : function(url,selfOptions) {
            $.ajax({
                type : "GET",
                url : url,
                dataType : "jsonp",
                success : function(data) {
                    if ("OK" == data.code) {
                        Tool.getAllMarketPrice.parseMarketpriceIndex(data,selfOptions);
                    }
                },
                error : function() {
                }
            });
        },
        /**
         * 返回行情报价页面数据
         * @param data
         * @param selfOptions
         */
        parseMarketpriceIndex : function(data,selfOptions) {
            var _index_price_type = 2,symbol='',deltaPrice= 0,deltaPercent= 0,price=0;
            for (var i = 0; i < data.listResult.length; i++) {
                symbol=data.listResult[i].symbol;
                deltaPrice=data.listResult[i].deltaPrice;
                price=data.listResult[i].price;
                deltaPercent=data.listResult[i].deltaPercent;
                if (symbol == "XAGUSD"||symbol == "USDJPY") {
                    _index_price_type = 3;
                } else if(symbol == "EURUSD"){
                    _index_price_type = 3;
                } else{
                    _index_price_type = 2;
                }
                var priceDom = $("#price_" +symbol);
                priceDom.html(parseFloat(price).toFixed(_index_price_type));
                var percentDom=$("#deltaPercent_" +symbol);
                if(!selfOptions){
                    var liDom = $("#li_" +symbol);
                    if (deltaPrice > 0) {
                        liDom.addClass("up");
                        liDom.find('.p1').children('i').removeClass('arrow-d-red').addClass('arrow-u-green');
                    } else {
                        liDom.removeClass("up");
                        liDom.find('.p1').children('i').removeClass('arrow-u-green').addClass('arrow-d-red');
                    }
                    percentDom.html(parseFloat(deltaPrice).toFixed(_index_price_type)+'('+(deltaPercent * 100).toFixed(2) + "%)");
                }else{
                    var priceFormat = parseFloat(price).toFixed(_index_price_type);
                    priceFormat = priceFormat.toString().substring(0,priceFormat.indexOf('.'))+'<span>.'+priceFormat.toString().substring(priceFormat.indexOf('.')+1)+'</span>';
                    priceDom.html(priceFormat+'<i changeCss="true"></i>');
                    var changeCssDom = $("#price_" +symbol+" i");
                    percentDom.text(deltaPrice + "  " +(deltaPercent * 100).toFixed(2) + "%");
                    if (deltaPrice > 0) {
                        if(changeCssDom.attr("changeCss")=="true"){
                            priceDom.removeClass(selfOptions.down);
                            percentDom.removeClass(selfOptions.down);
                            changeCssDom.removeClass(selfOptions.downCss).addClass(selfOptions.upCss);
                        }
                    } else {
                        if(changeCssDom.attr("changeCss")=="true"){
                            priceDom.addClass(selfOptions.down);
                            percentDom.addClass(selfOptions.down);
                            changeCssDom.removeClass(selfOptions.upCss).addClass(selfOptions.downCss);
                        }
                    }
                }
            }
        }
    }
};


/**
 * 可编辑div焦点定位通用方法
 * @returns {$.fn}
 */
$.fn.focusEnd = function() {
    $(this).focus();
    var tmp = $('<span/>').appendTo($(this)),
        node = tmp.get(0),
        range = null,
        sel = null;
    if (document.selection) {
        range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        range = document.createRange();
        range.selectNode(node);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    tmp.remove();
    return this;
};