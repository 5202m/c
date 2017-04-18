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
        userIp: '',
        storeKey: 'GWAFLGPHONECOOIKETRACK', //userId key
        userId: '', //用户id
        roomId: '', //房间编号
        userTel: '',
        userType: '',
        userName: '',
        roomName: '',
        userSource: 'web',
        useEquipment: '',
        tradingAccount: '',
        tradingPlatform: '',
        platformType: 0,
        businessPlatform: '',
        operateEntrance: '',
        operationType: 2,
        touristId: '',
        sessionId: '',
        nickName: '',
        email: '',
        videoId: '',
        videoName: '',
        courseId: '',
        courseName: '',
        teacherId: '',
        teacherName: '',
        requestParams: ''

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
        var dasUrl =  "http://das.gwfx.com/insertRoom";
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
            ga.async = true;
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
            //this.getIp();
            /*if(init){
                this.utmStore.roomId=data.groupId;
                this.utmStore.userId=data.userId;
                this.utmStore.userTel=data.userTel;
                this.utmStore.clientGroup=data.clientGroup;
                this.utmStore.groupType=data.groupType;
                $(window).unload(function(){
                    chatAnalyze.utmStore.onlineETM=new Date().getTime();
                    chatAnalyze.sendUTM(null);
                    window.event.returnValue=true;
                });
            }else{*/
            var isLocal = this.isLocalHref();
            chatAnalyze.utmStore.userId = chatAnalyze.getUTMCookie(); //用户id
            chatAnalyze.utmStore.userType = chatAnalyze.getClientGroup(data.clientGroup);
            chatAnalyze.utmStore.businessPlatform = chatAnalyze.getGroupType(data.groupType);
            chatAnalyze.utmStore.roomId = data.groupId; //房间编号
            chatAnalyze.utmStore.userTel = data.mobile;
            chatAnalyze.utmStore.userName = data.userName;
            chatAnalyze.utmStore.roomName = data.roomName;
            chatAnalyze.utmStore.platformType = common.isMobile(navigator.userAgent) ? 1 : 0;
            chatAnalyze.utmStore.touristId = data.visitorId;
            chatAnalyze.utmStore.sessionId = data.sid;
            chatAnalyze.utmStore.nickName = data.nickname;
            chatAnalyze.utmStore.email = data.email;
            chatAnalyze.utmStore.useEquipment = navigator.userAgent;
            chatAnalyze.utmStore.operateEntrance = common.isBlank(common.getUrlParam('platform')) ? 'web' : common.getUrlParam('platform');
            chatAnalyze.utmStore.courseId = data.courseId || '';
            chatAnalyze.utmStore.courseName = data.courseName;
            chatAnalyze.utmStore.teacherId = data.lecturerId || '';
            chatAnalyze.utmStore.teacherName = data.lecturer || '';
          //  chatAnalyze.utmStore.requestParams = data.requestParams || '';
            chatAnalyze.utmStore.requestParams = '';
            if (isLocal) {
                chatAnalyze.utmStore.userIp = data.ip;
            }
            chatAnalyze.utmStore.operationType = data.operationType;
            chatAnalyze.utmStore.tradingAccount = data.accountNo || '';
            if (data) {
                if (data.operationType == 7) {
                    chatAnalyze.utmStore.videoId = data.videoId;
                    chatAnalyze.utmStore.videoName = data.videoName;
                }
            }
            data = chatAnalyze.utmStore;
            if (common.isValid(data.sessionId) && common.isValid(data.userId) && (common.isValid(data.touristId) || common.isValid(data.userTel)) && /*(*/ common.isValid(data.operationType) /*|| $.inArray(data.userType, [7,8,9])>-1)*/ ) {
                if (isLocal) {
                    console.log("into utm--");
                    chatAnalyze.getIp(function() {
                        chatAnalyze.utmAjax(data, true);
                    });
                } else {
                    data = chatAnalyze.utmStore;
                    chatAnalyze.getIp(function() {
                        chatAnalyze.utmAjax(data, true)
                    });
                }
            }
            /* }*/
        } catch (e) {
            console.log("Set UTM fail!" + e);
        }
    },
    /**
     * utm AJAX
     * @param url
     * @param sendData
     */
    utmAjax: function(sendData) {
        var url = chatAnalyze.getDasURL();
        $.post(url, { data: JSON.stringify(sendData), callback: '?' });
    },
    /**
     * 发送utm数据
     */
    sendUTM: function(data) {
        try {
            if (!store.enabled) { // for more information, please refer to https://github.com/marcuswestin/store.js/
                console.log('Local storage is not supported by your browser.');
                return;
            }
            var tmpData = chatAnalyze.utmStore;
            if (!tmpData.roomId || !tmpData.groupType) {
                return;
            }
            if (!tmpData.userTel && !tmpData.userId) {
                var st = store.get('storeInfos_' + tmpData.groupType);
                if (!st) {
                    return;
                }
                tmpData.userId = st.userId;
            }
            var bPlatform = tmpData.groupType.indexOf('fx') != -1 ? 1 : 2;
            var userId = this.getUTMCookie();
           // var hrefSplit = this.hrefSplit();
            var hrefSplit = "";
            var sendData = {
                userId: userId,
                customerType: tmpData.clientGroup,
                ip: tmpData.ip,
                businessPlatform: bPlatform,
                platformType: (common.isMobile() ? 1 : 0),
                roomId: tmpData.roomId,
                requestParams: hrefSplit
            };
            if (tmpData.userTel) {
                sendData.operationTel = tmpData.userTel;
            } else {
                sendData.visitorId = tmpData.userId;
            }
            if (data && data.courseId) {
                sendData.courseId = data.courseId;
                this.utmAjax(sendData, true);
            } else {
                sendData.startDateTime = tmpData.onlineSTM;
                sendData.endDateTime = tmpData.onlineETM;
                sendData.speakCount = tmpData.speakCount;
                sendData.operationType = 6;
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(chatAnalyze.getDasURL() + "Close", JSON.stringify(sendData));
                } else {
                    this.utmAjax(sendData, false);
                }
            }
        } catch (e) {
            console.log("send UTM fail!" + e);
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
                console.log("href=" + href + ";hrefSplit=" + hrefSplit);
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