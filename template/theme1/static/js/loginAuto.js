/**
 * 自动登录
 */
var LoginAuto = {
    sessionUser : null,
    enable : true,
    storeInfoKey : "storeInfos_",

    /**
     * 初始化
     */
    init : function(){
        this.enable = store && store.enabled;
        if (!this.enable && console){
            console.log('Local storage is not supported by your browser.');
        }

        this.storeInfoKey = 'storeInfos_' + (this.sessionUser && this.sessionUser.groupType);

        this.autoLogin();
    },

    /**
     * 获取对象
     * @returns {*}
     */
    get : function(){
        return this.enable ? store.get(this.storeInfoKey) : null;
    },

    /**
     * 设置对象
     * @param storeObj
     * @returns {boolean}
     */
    set : function(storeObj){
        if(!this.enable){
            return false;
        }else{
            store.set(this.storeInfoKey, storeObj);
            return true;
        }
    },

    /**
     * 设置自动登录状态
     * @param isAutoLogin
     * @returns {boolean}
     */
    setAutoLogin : function(isAutoLogin){
        var storeObj = this.get();
        if(storeObj){
            storeObj.autoLogin = isAutoLogin;
            return this.set(storeObj);
        }
        return false;
    },

    /**
     * 自动登录
     * @returns {boolean}
     */
    autoLogin : function(){
        var storeObj = this.get();
        if(!storeObj){
            return false;
        }
        if(this.sessionUser && !this.sessionUser.isLogin && storeObj.loginId && storeObj.autoLogin && !storeObj.doLogin){
            var params = {
                userId : storeObj.loginId,
                clientStoreId : storeObj.clientStoreId
            };
            var loginRes ={};
            var xhr = new XMLHttpRequest();
            xhr.open('post','/login',false);
            xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            xhr.onreadystatechange = function(){
                if(xhr.readyState==4){
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        try{
                            loginRes=JSON.parse(xhr.responseText);
                        }catch(e){
                            loginRes={};
                        }
                    }else{
                        console.log('检查自动登录无效，请联系客服！');
                    }
                }else{
                    console.log('检查自动登录无效，请联系客服！');
                }
            };
            xhr.send('userId='+storeObj.loginId+'&clientStoreId='+storeObj.clientStoreId/*+this.json2UrlParam(indexJS.courseTick.course,'')*/);
            if(loginRes.isOK){//自动登录成功
                this.stopLoad();
                storeObj.doLogin=true;
                LoginAuto.set(storeObj);
                window.location.reload();
                return true;
            }
        }
        if(storeObj.doLogin){//检测是否登录过了
            storeObj.doLogin=false;
            LoginAuto.set(storeObj);
        }
        return false;
    },

    /**
     * 阻止浏览器继续加载
     */
    stopLoad : function(){
        try{
            if (!!(window.attachEvent && !window.opera)) {
                document.execCommand("stop");
            } else {
                window.stop();
            }
        }catch(e){
            //stop load error
        }
    },
    /**
     * json对象转url 参数
     * @param param
     * @param key
     * @param encode
     * @returns {string}
     */
    json2UrlParam : function (param, key, encode) {
        if(param==null) return '';
        var paramStr = '';
        var t = typeof (param);
        if (t == 'string' || t == 'number' || t == 'boolean') {
            paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
        } else {
            for (var i in param) {
                var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                paramStr += this.json2UrlParam(param[i], k, encode);
            }
        }
        return paramStr;
    }
};