/**
 * 自动登录
 */
var LoginAuto = {
    sessionUser : null,
    loginUserStoreKey : "storeInfo_",

    /**
     * 初始化
     */
    init : function(){
        this.loginUserStoreKey = 'storeInfo_' + (this.sessionUser && this.sessionUser.groupType);

        this.autoLogin();
    },

    /**
     * 自动登录
     * @returns {boolean}
     */
    autoLogin : function(){
        var storeObj = Store.store(this.loginUserStoreKey);
        if(!storeObj){
            return false;
        }
        if(this.sessionUser && !this.sessionUser.isLogin && storeObj.loginId && storeObj.autoLogin && !storeObj.doLogin){
            var loginRes ={};
            var xhr = new XMLHttpRequest();
            xhr.open('post','/studio/login',false);
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
            xhr.send('userId='+storeObj.loginId+'&clientStoreId='+storeObj.clientStoreId);
            if(loginRes.isOK){//自动登录成功
                LoginAuto.sessionUser = loginRes.userInfo;
                Store.store(LoginAuto.loginUserStoreKey, LoginAuto.sessionUser);
                //自动登录
                return true;
            }
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
    }
};