/**
 * 直播间手机版工具类
 * author Dick.guo
 */
var Util ={
    /**
     * 日期变量
     */
    daysCN:{"0":"周日","1":"周一","2":"周二","3":"周三","4":"周四","5":"周五","6":"周六"},
    /**
     * 组类型
     */
    clientGroupStr : {vip:'VIP会员',active:'激活会员',notActive:'真实会员',simulate:'模拟会员',register:'注册会员','visitor':'游客'},
    /**
     * 对象copy
     * @param srcObj
     * @param targetObj
     * @param hasTargetField 包含目标对象属性
     */
    copyObject:function(srcObj,targetObj,hasTargetField){
        if(!targetObj){
            return srcObj;
        }
        for(var row in srcObj){
            if(targetObj.hasOwnProperty(row) && Util.isNotBlank(targetObj[row])){
                srcObj[row]=targetObj[row];
            }
        }
        if(hasTargetField){
            for(var row in targetObj){
                if(!srcObj.hasOwnProperty(row)){
                    srcObj[row]=targetObj[row];
                }
            }
        }
    },

    /**
     * 时间对象的格式化;
     * eg:Util.format(new Date(), "yyyy-MM-dd HH:mm:ss:SSS")
     *      ==>2015-04-30 14:11:52:037
     * @param date
     * @param format
     * @returns {String}
     */
    formatDate : function (date, format) {
        if(date instanceof Date == false){
            date = new Date(date);
        }
        if(!format){
            format = "yyyy-MM-dd HH:mm:ss:SSS";
        }
        //获取日期指定部分
        var getPart = function(date, pattern){
            var loc_result = null;
            switch(pattern){
                case "yyyy":
                    loc_result = date.getFullYear();
                    break;
                case "yy":
                    loc_result = (date.getFullYear() + "").substring(2);
                    break;
                case "MM":
                    loc_result = date.getMonth() + 1;
                    loc_result = loc_result < 10 ? ("0" + loc_result) : loc_result;
                    break;
                case "M":
                    loc_result = (date.getMonth() + 1);
                    break;
                case "dd":
                    loc_result = date.getDate();
                    loc_result = loc_result < 10 ? ("0" + loc_result) : loc_result;
                    break;
                case "d":
                    loc_result = (date.getDate());
                    break;
                case "HH":
                    loc_result = date.getHours();
                    loc_result = loc_result < 10 ? ("0" + loc_result) : loc_result;
                    break;
                case "H":
                    loc_result = date.getHours();
                    break;
                case "hh":
                    loc_result = date.getHours() % 12;
                    loc_result = loc_result < 10 ? ("0" + loc_result) : loc_result;
                    break;
                case "h":
                    loc_result = (date.getHours() % 12);
                    break;
                case "mm":
                    loc_result = date.getMinutes();
                    loc_result = loc_result < 10 ? ("0" + loc_result) : loc_result;
                    break;
                case "m":
                    loc_result = date.getMinutes();
                    break;
                case "ss":
                    loc_result = date.getSeconds();
                    loc_result = loc_result < 10 ? ("0" + loc_result) : loc_result;
                    break;
                case "s":
                    loc_result = date.getSeconds();
                    break;
                case "SSS":
                    loc_result = date.getMilliseconds();
                    loc_result = loc_result < 10 ? ("00" + loc_result) : (loc_result < 100 ? ("0" + loc_result) : loc_result);
                    break;
                case "S":
                    loc_result = date.getMilliseconds();
                    break;
                case "q":
                    loc_result = Math.floor((date.getMonth() + 3) / 3);
                    break;
            }
            return loc_result;
        };
        var loc_result = format;
        var loc_patterns = ['yyyy', 'yy', 'MM', 'M', 'dd', 'd', 'HH', 'H', 'hh', 'h', 'mm', 'm', 'ss', 's', 'SSS', 'S', 'q'];
        for(var i = 0, lenI = loc_patterns.length; i < lenI; i++){
            if(new RegExp(loc_patterns[i]).test(loc_result)){
                loc_result = Util.replaceAll(loc_result, loc_patterns[i], getPart(date, loc_patterns[i]))
            }
        }
        return loc_result;
    },


    /**
     * 包含字符，逗号分隔
     * @param src
     * @param subStr
     */
    containSplitStr : function(src,subStr){
        if(Util.isBlank(src)||Util.isBlank(subStr)) {
            return false;
        }
        return (','+src+',').indexOf((','+subStr+','))!=-1;
    },

    /**
     * 字符串 替换 占位符
     * eg: Util.format("http://{0}/{1}", "www.xxx.com", "index.html");
     *      ==>http://www.xxx.com/index.html
     * @param str
     * @returns {String}
     */
    format : function (str) {
        if (arguments.length <= 1) return str;
        for (var s = str, i = 1, lenI = arguments.length; i < lenI; i++){
            s = s.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), arguments[i]);
        }
        return s;
    },


    /**
     * 字符串替换所有
     * eg: Util.replaceAll("1234a5e6", "[a-z]", "");
     *      ==>123456
     * @param str
     * @param s1
     * @param s2
     * @returns {string}
     */
    replaceAll : function (str, s1, s2) {
        var result = "";
        s2 = s2 || "";
        if(!s1){
            result = str;
        }else if(s1 instanceof RegExp){
            result = str.replace(new RegExp(s1.source, "gm"), s2);
        }else{
            var index = 0, len = s1.length, len2 = s2.length;
            result = str;
            while((index = result.indexOf(s1, index)) != -1){
                result = result.substring(0, index) + s2 + result.substring(index + len);
                index = index + len2;
            }
        }
        return result;
    },

    /**
     * 格式到json
     * @param str
     */
    parseJSON:function(str){
        if(!str){
            return null;
        }
        try{
            return JSON.parse(str);
        }catch(e){
            console.log("parse JSON error", e);
        }
        return null;
    },

    /**
     * 判断字符串是否为空
     * eg: Util.isEmpty("");
     * 		==>true
     * @param str
     * @returns {Boolean}
     */
    isEmpty : function (str) {
        return str === null || str === undefined || str === "";
    },

    /**
     * 判断字符串是否不空
     * eg: Util.isNotEmpty("");
     * 		==>false
     * @param str
     * @returns {Boolean}
     */
    isNotEmpty : function (str) {
        return !Util.isEmpty(str);
    },

    /**
     * 判断字符串是否为空(仅包含空白符也为空)
     * eg: Util.isBlank(" ");
     * 		==>true
     * @param str
     * @returns {Boolean}
     */
    isBlank : function (str) {
        return str === null || str === undefined || (str + "").replace(/\s+/g, "") === "";
    },

    /**
     * 判断字符串是否不空(仅包含空白符也为空)
     * eg: Util.isNotBlank(" ");
     * 		==>false
     * @param str
     * @returns {Boolean}
     */
    isNotBlank : function (str) {
        return !Util.isBlank(str);
    },

    /**
     * 查找数组元素下标。可以传递一个判定元素相同的方法。
     * eg: Util.indexOf([1,2,0], 0)
     *      ==>2
     *
     * @param arr
     * @param item
     * @param compareFunc
     * @returns {Number}
     */
    indexOf : function (arr, item, compareFunc) {
        var loc_result = -1;
        if(typeof compareFunc !== "function"){
            compareFunc = function(a, b){return a==b};
        }
        for(var i = 0, lenI = (!arr || arr instanceof Array == false) ? 0 : arr.length; i < lenI; i ++){
            if (compareFunc(arr[i], item)){
                return i;
            }
        }
        return loc_result;
    },

    /**
     * 查找数组中的元素
     * eg: Util.search([{name:"name1"}],"name1", function(item1, obj){ return item1.name === obj;})
     *      ==>{name:"name1"}
     *
     * @param arr
     * @param item
     * @param [compareFunc]
     * @returns {String}
     */
    search : function (arr, item, compareFunc) {
        var loc_index = Util.indexOf(arr, item, compareFunc);
        if(loc_index !== -1){
            return arr[loc_index];
        }else{
            return null;
        }
    },

    /**
     * 通用ajax方法
     * @param url
     * @param params
     * @param callback
     * @param async
     * @returns
     */
    postJson:function (url, params, callback, async, failCallBack) {
        var result = null;
        $.ajax({
            url: url,
            type: "POST",
            timeout : 100000, //超时时间设置，单位毫秒
            cache: false,
            async: (async!=undefined?async:(callback?true:false)),//默认为异步(true),false则为同步
            dataType: "json",
            data: params,
            success: typeof (callback) == "function" ? callback : function (data) {
                result = data;
            },
            error: function (obj,textStatus) {
                if(typeof (failCallBack) == "function"){
                    failCallBack(textStatus);
                }else{
                    if (Util.isNotBlank(obj.responseText) && obj.statusText != "OK") {
                        console.error(obj.responseText);
                    }else{
                        console.error("请求超时,请重试:url[%s]",url);
                    }
                }
            }
        });
        return result;
    },

    /**
     * 返回随机索引数
     * @param length
     * @returns {Number} 0至length-1
     */
    randomIndex:function(length){
        var lh=parseInt(Math.round(Math.random()*length));
        if(lh==length){
            lh=length-1;
        }
        return lh<0?0:lh;
    },

    /**
     * 随机生成数字
     * @param _idx  位数
     * @returns {string}
     */
    randomNumber:function(_idx){
        var str = '';
        for(var i = 0; i < _idx; i++){
            str += Math.floor(Math.random() * 10);
        }
        return str;
    },

    /**
     * 提取课程
     * @param data
     * @param serverTime
     */
    getSyllabusPlan:function(data,serverTime){
        if(!data||!data.courses){
            return null;
        }
        //提取课程
        var getCourses=function(tmBkTmp, i, day, studioLink, isNext){
            var course=null,courseTmp=tmBkTmp.course;
            if(courseTmp && courseTmp.length>i){
                course=courseTmp[i];
                if(course.status==0 || Util.isBlank(course.lecturerId)){
                    return null;
                }
                course.startTime=tmBkTmp.startTime;
                course.endTime=tmBkTmp.endTime;
                course.day=day;
                course.studioLink=studioLink;
                course.isNext=isNext;
                return course;
            }else{
                return null;
            }
        };
        var coursesObj=null;
        if(typeof data.courses !='object' && Util.isNotBlank(data.courses)) {
            coursesObj = JSON.parse(data.courses);
        }else{
            coursesObj=data.courses;
        }
        var days=coursesObj.days,timeBuckets=coursesObj.timeBuckets;
        var currDay = (new Date(serverTime).getDay() + 6) % 7, tmpDay;
        var currTime = Util.formatDate(serverTime, "HH:mm");
        var tmBk=null,courseObj=null;
        for(var i=0;i<days.length;i++){
            if(days[i].status==0){
                continue;
            }
            tmpDay = (days[i].day + 6) % 7;
            if(tmpDay>currDay){
                for(var k in timeBuckets){
                    tmBk=timeBuckets[k];
                    courseObj=getCourses(tmBk, i, days[i].day, data.studioLink, true);
                    if(courseObj){
                        return courseObj;
                    }
                }
            }else if(tmpDay==currDay){
                for(var k in timeBuckets){
                    tmBk=timeBuckets[k];
                    if(tmBk.startTime<=currTime && tmBk.endTime>=currTime){
                        courseObj=getCourses(tmBk, i, days[i].day, data.studioLink, false);
                    }else if(tmBk.startTime>currTime){
                        courseObj=getCourses(tmBk, i, days[i].day, data.studioLink, true);
                    }
                    if(courseObj){
                        return courseObj;
                    }
                }
            }
        }
        //课程安排跨周，返回首次课程
        if(!data.publishEnd){ //没有发布结束时间，不提供跨周数据
            return null;
        }
        for(var i=0;i<days.length;i++){
            if(days[i].status==0){
                continue;
            }
            tmpDay = (days[i].day + 6) % 7;
            if(data.publishEnd < (tmpDay + 7 - currDay) * 86400000 + serverTime){
                continue;
            }
            for(var k=0;k<timeBuckets.length;k++) {
                courseObj=getCourses(timeBuckets[k], i, days[i].day, data.studioLink, true);
                if(courseObj){
                    return courseObj;
                }
            }
        }
        return null;
    },
    /**
     * 清除html多余代码
     *  排除表情,去除其他所有html标签
     * @param msg
     * @returns {XML|string|void}
     */
    clearMsgHtml:function(msg){
        var msg=msg.replace(/((^((&nbsp;)+))|\n|\t|\r)/g,'').replace(/<\/?(?!(img|IMG)\s+src="[^>"]+\/face\/[^>"]+"\s*>)[^>]*>/g,'');
        if(msg){
            msg= $.trim(msg);
        }
        return msg;
    },
    /**
     * 提取socketIo
     * @param io
     * @param url
     * @returns {*|Mongoose}
     */
    getSocket:function(io,url,groupType){
        if(window.WebSocket){
            console.log("used websocket!");
            return io.connect(url.webSocket+'/'+groupType,{transports: ['websocket']});
        }else{
            return io.connect(url.socketIO+'/'+groupType);
        }
    },
    /**
     * 是否合法的昵称
     * @param name
     * @returns {boolean}
     */
    isRightName:function(name){
        return !(/^([0-9]{2,10})$/g.test(name)) && /^([\w\u4e00-\u9fa5]{2,10})$/g.test(name);
    },
    /**
     * 判断客户端是否手机
     */
    isMobile : function(userAgent){
        return /(iphone|ipod|ipad|android|mobile|playbook|bb10|meego)/.test((userAgent || navigator.userAgent).toLowerCase());
    },
    /**
     * 验证是否符合手机号码格式
     * @param val
     */
    isMobilePhone:function(val){
        return /(^[0-9]{11})$|(^86(-){0,3}[0-9]{11})$/.test(val);
    },
    /**
     * 获取url参数值
     * @param name
     * @returns {*}
     */
    getUrlParam: function(name, notEncode){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if(notEncode){
            if (r != null) {
                return r[2];
            }
        }else {
            if (r != null) {
                return unescape(r[2]);
            }
        }
        return null; //返回参数值
    },
    /**
     * 调试方法
     */
    console : function(){
        if(console && console.log){
            console.log.apply(null, arguments);
        }else{
            alert(JSON.stringify(arguments));
        }
    }
};
