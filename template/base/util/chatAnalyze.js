/**
 *  数据统计通用方法
 * create by alan.wu
 * 2015-10-21
 */
var _gaq = _gaq || [];

/**百度统计*/
var _hmt = _hmt || [];

function UUID() {
    this.id = this.createUUID();
}
UUID.prototype.valueOf = function() {
    return this.id;
};
UUID.prototype.toString = function() {
    return this.id;
};
UUID.prototype.createUUID = function(prefix) {
    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
    var dc = new Date();
    var t = dc.getTime() - dg.getTime();
    var tl = UUID.getIntegerBits(t, 0, 31);
    var tm = UUID.getIntegerBits(t, 32, 47);
    var thv = UUID.getIntegerBits(t, 48, 59) + '1';
    var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
    var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
    var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
        UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
        UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
        UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
        UUID.getIntegerBits(UUID.rand(8191), 0, 15);
    return (prefix || '') + tl + tm + thv + csar + csl + n;
};
UUID.getIntegerBits = function(val, start, end) {
    var base16 = UUID.returnBase(val, 16);
    var quadArray = new Array();
    var quadString = '';
    var i = 0;
    for (i = 0; i < base16.length; i++) {
        quadArray.push(base16.substring(i, i + 1));
    }
    for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
        if (!quadArray[i] || quadArray[i] == '')
            quadString += '0';
        else
            quadString += quadArray[i];
    }
    return quadString;
};
UUID.returnBase = function(number, base) {
    return (number).toString(base).toUpperCase();
};
UUID.rand = function(max) {
    return Math.floor(Math.random() * (max + 1));
};
// 初始化
var chatAnalyze = {
    localHref: window.location.href,
    dasUrl: "",
    requestParamsCookie: 'requestParamsCookie',
    utmStore: { //utm 数据统计全局数据
        userIp:'',
        storeKey:'GWAFLGPHONECOOIKETRACK',//userId key
        userId:'',//用户id
        roomId:'',//房间编号
        userTel:'',
        userType:'',
        userName:'',
        roomName:'',
        userSource:'web',
        useEquipment:'',
        tradingAccount:'',
        tradingPlatform:'',
        platformType:0,
        businessPlatform:'',
        operateEntrance:'',
        operationType:2,
        touristId:'',
        sessionId:'',
        nickName:'',
        email:'',
        videoId:'',
        videoName:'',
        courseId:'',
        courseName:'',
        teacherId:'',
        teacherName:'',
        requestParams:'',
        deviceId:'',
        utmctr:'',
        utmccn:'',
        utmcct:'',
        utmcmd:'',
        utmcsr:''

    },
    /**
     * 是否本地访问
     * @returns {boolean}
     */
    isLocalHref: function() {
        return /^https?:\/\/(\d{1,3}\.){3}\d{1,3}.+/.test(chatAnalyze.localHref);
    },
    getDasURL: function() {
        var protocol = document.location.protocol;
        var dasUrl =  "http://das.gwfx.com/put/insertRoom";
        if (this.isLocalHref()) {
            dasUrl = "http://testweboa.gwfx.com:8088/GwUserTrackingManager_NEW/put/insertRoom";
        }
        if (protocol.indexOf("https") != -1 && null!=dasUrl){
            dasUrl = dasUrl.replace('http://', 'https://').replace('8088', '7088');
        }

        return dasUrl;
    },
    /**
     * 初始化
     */
    init: function() {
        //引入GA分析
        if (!this.isLocalHref()) {
            this.initGA();
            this.setGA();
            this.setBaidu();
        }
    },
    //初始化GA
    initGA: function() {
        _gaq.push(['_setAccount', 'UA-31478987-1']);
        _gaq.push(['_setDomainName', '24k.hk']);
        _gaq.push(['_addIgnoredRef', '24k.hk']);
        _gaq.push(['_setAllowLinker', true]);
        _gaq.push(['_addOrganic', 'soso', 'w']);
        _gaq.push(['_addOrganic', 'sogou', 'query']);
        _gaq.push(['_addOrganic', 'youdao', 'q']);
        _gaq.push(['_addOrganic', 'baidu', 'word']);
        _gaq.push(['_addOrganic', 'baidu', 'q1']);
        _gaq.push(['_addOrganic', 'ucweb', 'keyword']);
        _gaq.push(['_addOrganic', 'ucweb', 'word']);
        _gaq.push(['_addOrganic', '114so', 'kw']);
        _gaq.push(['_addOrganic', '360', 'q']);
        _gaq.push(['_addOrganic', 'so', 'q']);
        _gaq.push(['_trackPageview']);
    },
    /**
     * 设置GA
     */
    setGA: function() {
        try {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = false;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        } catch (e) {
            console.log("Set GA fail!" + e);
        }
    },
    setBaidu: function() {
        try {
            var hm = document.createElement("script");
            hm.src = "//hm.baidu.com/hm.js?52a2828b884f1a2ba8a3e25efe98eb65";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
        } catch (e) {
            console.log("Set GA fail!" + e);
        }
    },
    /**
     * 获取ip
     * @param callback
     */
    getIp: function(callback) {
        if (chatAnalyze.utmStore.userIp) {
            callback && callback();
        } else {
            $.getJSON('https://oa.24k.hk/ajax/getIp?callback=ip&_=' + Math.random(), function(datas) {
                chatAnalyze.utmStore.userIp = datas.Ip;
                callback && callback();
            });
        }
    },
    /**
     * 获取utm cookie
     * @param cval
     * @param type
     */
    getUTMCookie: function() {
        var strCookie = document.cookie;
        var arrCookie = strCookie.split(/[;&]/);
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if ($.trim(arr[0]) == this.utmStore.storeKey) {
                return arr[1];
            }
        }
        var dm = '.24k.hk';
        var cval = UUID.prototype.createUUID(dm.indexOf("24k") != -1 ? 'G' : '');
        document.cookie = this.utmStore.storeKey + '=' + escape(cval) + '; expires=Tue, 31 Dec 2030 00:00:00 UTC; path=/;domain=' + dm;
        return cval;
    },
    /**
     * 设置utm系统所需行为
     */
    setUTM: function(init, data) {

        try {
            var isLocal = this.isLocalHref();
            chatAnalyze.utmStore.userId = chatAnalyze.getUTMCookie();//用户id
            chatAnalyze.utmStore.userType = chatAnalyze.getClientGroup(data.clientGroup);
            chatAnalyze.utmStore.businessPlatform = chatAnalyze.getGroupType(data.groupType);
            chatAnalyze.utmStore.roomId = data.groupId;//房间编号
            chatAnalyze.utmStore.userTel = typeof(data.userTel)!="undefined"?data.userTel:data.mobile;
            chatAnalyze.utmStore.userName = data.userName;
            chatAnalyze.utmStore.roomName = data.roomName;
            chatAnalyze.utmStore.platformType = common.isMobile(navigator.userAgent)?1:0;
            chatAnalyze.utmStore.touristId = data.visitorId;
            chatAnalyze.utmStore.sessionId = data.sid;
            chatAnalyze.utmStore.nickName = data.nickname;
            chatAnalyze.utmStore.email = data.email;
            chatAnalyze.utmStore.useEquipment = navigator.userAgent;
            chatAnalyze.utmStore.operateEntrance = common.isBlank(common.getUrlParam('platform'))?'web':common.getUrlParam('platform');
            chatAnalyze.utmStore.courseId = data.courseId||'';
            chatAnalyze.utmStore.courseName = data.courseName;
            chatAnalyze.utmStore.teacherId = data.lecturerId||'';
            chatAnalyze.utmStore.teacherName = data.lecturer||'';
            chatAnalyze.utmStore.requestParams = '';
            if(isLocal) {
                chatAnalyze.utmStore.userIp = data.ip;
            }
            chatAnalyze.utmStore.operationType = data.operationType;
            chatAnalyze.utmStore.tradingAccount = data.accountNo||'';
            if(data) {
                if(data.operationType==7) {
                    chatAnalyze.utmStore.videoId = data.videoId;
                    chatAnalyze.utmStore.videoName = data.videoName;
                }
            }
            data = chatAnalyze.utmStore;
            if(common.isValid(data.sessionId) && common.isValid(data.userId) && (common.isValid(data.touristId) || common.isValid(data.userTel)) && /*(*/common.isValid(data.operationType) /*|| $.inArray(data.userType, [7,8,9])>-1)*/){
                chatAnalyze.utmAjax(data, true);
            }
        } catch (e) {
            console.log("Set UTM fail!" + e);
        }
    },
    /**
     * utm AJAX
     * @param url
     * @param sendData
     */
    utmAjax:function(sendData){
        this.getGacookiesTrack(sendData);

    },
    /**
     * 处理ga字符串，返回解析后的数字
     * @param gaStr
     */
    dealGaNew:function(gaStr){
        var _c_json='{';
        try {
            gaStr = gaStr.substring(gaStr.indexOf("utmcsr"),gaStr.length);
            var _c_length = gaStr.split("\|").length;
            for(i=0;i<_c_length;i++){
                var _temp = gaStr.split("\|")[i];
                var _temp_index = _temp.split("=")[0];
                var _tempCsr = _temp.split("=")[1];
                if (_temp_index == "utmcsr" && _tempCsr =="") {
                    _tempCsr = "not set";
                }
                if (_temp_index == "utmcmd" && _tempCsr =="") {
                    _tempCsr = "not set";
                }
                _c_json=_c_json+'"'+_temp_index+'":'+'"'+_tempCsr+'"';
                if(i!=_c_length-1){
                    _c_json+=","
                }
            }

        } catch (e) {
            _c_json = "}";
        }

        return _c_json+"}";
    },
    /**
     * 设置GA cookie值并录入值
     * behaviorType 行为类型 访问(1)、咨询(2)
     * advisoryType 咨询类型 qq或者live800 1表示qq 2表示live800
     */
    getGacookiesTrack:function(options){
        try{
            var _options=options || {};
            var nowCval=_options.userId;
            var explorer = window.navigator.userAgent;
            var deviceId = _options.deviceId || "";
            var tracker ="";
            /**
             * ga追踪异常继续执行
             */
            try{
                tracker = _gat._getTrackerByName();
            }catch(e){

            }
            var linkerUrl = "";
            var gacookiesTrack = "";
            var gaData = "";
            if(!common.isBlank(tracker)){
                linkerUrl =tracker._getLinkerUrl('https://funds.gwfx.com/LoginForex');
                linkerUrl= linkerUrl.substring(linkerUrl.indexOf("?"),linkerUrl.length);
                linkerUrl=linkerUrl.substring(linkerUrl.indexOf("__utmz"));
                linkerUrl=linkerUrl.substring(0,linkerUrl.indexOf("&"));
                gacookiesTrack = linkerUrl;
                /**
                 *解析ga代码
                 */
                gaData = chatAnalyze.dealGaNew(gacookiesTrack);
                var obj = JSON.parse(gaData);
                chatAnalyze.utmStore.utmctr = obj.utmctr || "(direct)";
                chatAnalyze.utmStore.utmccn = obj.utmccn || "(direct)";
                chatAnalyze.utmStore.utmcct = obj.utmcct || "";
                chatAnalyze.utmStore.utmcmd = obj.utmcmd || "(none)";
                chatAnalyze.utmStore.utmcsr = obj.utmcsr || "(direct)";
            }

            /**
             *操作类型 1：上线 、2：公聊 、3：注册、4：登录、5:退出 、6:下线、7:视频 8：私聊
             */
            var operationType = _options.operationType;


            var userType = _options.userType || "";

            //获取ip和sessionId
            var sessionId = _options.sessionId;
            var data = null;
            //标识是手机还是pc访问，0和空代表pc访问，1代表手机访问（默认为0）
            var platformType = _options.platformType;
            var myDate = new Date();
            var referrer = document.referrer;
            var browser = navigator.userAgent || "";
            var _maq = _maq || [];
            var eventCategory = _options.eventCategory || "";
            var eventAction = _options.eventAction || "";
            var eventLabel = _options.eventLabel || "";

            var href = chatAnalyze.localHref || "";
            //session->
            _maq.push(['_setSessionId',sessionId]);
            //事业部-->
            _maq.push(['_setBusinessPlatform', '2']);
            //用户唯一标识（有状态）-->
            _maq.push(['_setUserId', nowCval]);
            //平台版本-->
            _maq.push(['_setPlatformVersion', 'V2.1.1']);
            //用户标识-->
            _maq.push(['_setDeviceId', deviceId]);
            //事件类型-->
            _maq.push(['_setOperationType', operationType]);
            //业务平台-->
            _maq.push(['_setPlatformName', 'PM直播间']);
            _maq.push(['_setPlatformType', platformType]);
            _maq.push(['_setlogType', '2']);
            _maq.push(['_setUrl',href]);
            _maq.push(['_setBrowser',browser]);
            _maq.push(['_setPrevUrl',referrer]);
            _maq.push(['_setUtmctr',_options.utmctr]);
            _maq.push(['_setUtmccn',_options.utmccn]);
            _maq.push(['_setUtmcct',_options.utmcct]);
            _maq.push(['_setUtmcmd',_options.utmcmd]);
            _maq.push(['_setUtmcsr',_options.utmcsr]);
            _maq.push(['_setUtmctr2',_options.utmctr2 || "(direct)"]);
            _maq.push(['_setUtmccn2',_options.utmccn2 || "(direct)"]);
            _maq.push(['_setUtmcct2',_options.utmcct2 || ""]);
            _maq.push(['_setUtmcmd2',_options.utmcmd2 || "(none)"]);
            _maq.push(['_setUtmcsr2',_options.utmcsr2 || "(direct)"]);
            _maq.push(['_setEventCategory',eventCategory]);
            _maq.push(['_setEventAction',eventAction]);
            _maq.push(['_setEventLabel',eventLabel]);
            _maq.push(['_setUserType',userType]);
            _maq.push(['_setUserTel',_options.userTel || ""]);
            _maq.push(['_setRoomId',_options.roomId || ""]);
            _maq.push(['_setUserName',_options.userName || ""]);
            _maq.push(['_setRoomName',_options.roomName || ""]);
            _maq.push(['_setUserType',_options.userType || ""]);
            _maq.push(['_setTouristId',_options.touristId || ""]);
            _maq.push(['_setNickName',_options.nickName || ""]);
            _maq.push(['_setEmail',_options.email || ""]);
            _maq.push(['_setOperateEntrance',_options.operateEntrance || ""]);
            _maq.push(['_setCourseName',_options.courseName || ""]);
            _maq.push(['_setCourseId',_options.courseId || ""]);
            _maq.push(['_setTeacherId',_options.teacherId || ""]);
            _maq.push(['_setTeacherName',_options.teacherName || ""]);
            _maq.push(['_setTradingAccount',_options.tradingAccount || ""]);
            _maq.push(['_setVideoId',_options.videoId || ""]);
            _maq.push(['_setVideoName',_options.videoName || ""]);
            _maq.push(['_setUserSource',_options.userSource || ""]);
            console.log("========="+_maq);
            setGWAnalysisParams(_maq);
        }
        catch(e){

        }
    },
    /**
     * 截取url问号后面的参数传给追踪系统接口
     * @returns {string}
     */
    hrefSplit: function() {
        var href = chatAnalyze.localHref;
        var hrefSplit = "";
        try {
            if (href.indexOf("?") != -1) {
                hrefSplit = href.split("?")[1];
            }
        } catch (e) {
            console.log("send hrefSplit fail!" + e);
        }
        return hrefSplit;
    },
    /**
     * 把追踪代码放到Cookie
     * @param id
     * @returns {*}
     */
    setUtmCookies: function(id) {
        var reqid = "";
        if (typeof(id) != "undefined" && id != "" && id != null) {
            reqid = id;
        } else {
            reqid = chatAnalyze.requestParamsCookie;
        }
        var spli = chatAnalyze.hrefSplit();
        if (typeof(spli) == "undefined" || spli == "" || spli == null) {
            spli = "";
        } else {

        }
        spli = encodeURIComponent(spli);
        chatAnalyze.setHC(reqid, spli);
    },
    //设置HTTP COOKIE;domain=.24k.hk
    setHC: function(cname, cval) {
        if (typeof(cval) != "undefined" && cval != "" && cval != null) {
            //s20是代表20秒
            //h是指小时，如12小时则是：h12
            //d是天数，30天则：d30
            var strsec = chatAnalyze.setExpiryTime("1h");
            var exp = new Date();
            //.24k.hk
            exp.setTime(exp.getTime() + strsec * 1);
            document.cookie = cname + '=; expires=' + exp.toGMTString() + '; path=/;domain=.24k.hk';
            document.cookie = cname + '=' + escape(cval) + '; expires=' + exp.toGMTString() + '; path=/;domain=.24k.hk';
        }
    },
    //cookie失效时间
    setExpiryTime: function(str) {
        var str1 = str.substring(1, str.length) * 1;
        var str2 = str.substring(0, 1);
        if (str2 == "s") {
            return str1 * 1000;
        } else if (str2 == "h") {
            return str1 * 60 * 60 * 1000;
        } else if (str2 == "d") {
            return str1 * 24 * 60 * 60 * 1000;
        }
    },
    /**
     * 根据客户在类别返回对应数字
     * @param clientGroup
     * @returns {number}
     */
    getClientGroup: function(clientGroup) {
        var userType = 1;
        switch (clientGroup) {
            case 'visitor':
                userType = 1;
                break;
            case 'register':
                userType = 2;
                break;
            case 'simulate':
                userType = 3;
                break;
            case 'active':
                userType = 4;
                break;
            case 'notActive':
                userType = 5;
                break;
            case 'vip':
                userType = 6;
                break;
            case 'analyst':
                userType = 7;
                break;
            case 'admin':
                userType = 8;
                break;
            case 'cs':
                userType = 9;
                break;
            default:
                userType = 1;
                break;
        }
        return userType;
    },
    /**
     * 根据groupType返回对应数字
     * @param groupType
     * @returns {number}
     */
    getGroupType: function(groupType) {
        var businessPlatform = 1;
        if (/^fx/.test(groupType)) {
            businessPlatform = 1;
        } else if (/^hx/.test(groupType)) {
            businessPlatform = 3;
        } else {
            businessPlatform = 2;
        }
        return businessPlatform;
    }
};
$(function() {
    chatAnalyze.init();
    chatAnalyze.setUtmCookies("");
});