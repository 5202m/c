/**
 * 直播间手机版本地存储
 * author Dick.guo
 */
var Store ={
    enable : false,
    defaultStoreKey : "CHAT_STORE_PM",

    /**
     * 初始化
     */
    init : function(){
        this.enable = store && store.enabled;
        if (!this.enable && console){
            console.log('Local storage is not supported by your browser.');
        }
    },

    /**
     * 从本地存储设置、获取数据对象
     * @param storeKey
     * @param [storeVal]
     * @returns {*}
     */
    store : function(storeKey, storeVal){
        var result = null;
        if(arguments.length == 1){
            result = this.get(storeKey);
        }else{
            result = this.set(storeKey, storeVal);
        }
        return result;
    },

    /**
     * 从本地存储中默认对象中设置、获取属性
     * @param attr
     * @param [val]
     * @returns {*}
     */
    attr : function(attr, val){
        var storeInfo = this.get(this.defaultStoreKey);
        if(!storeInfo){
            storeInfo = {};
        }
        var result = null;
        if(arguments.length == 1){
            result = storeInfo.hasOwnProperty(attr) ? storeInfo[attr] : null;
        }else{
            storeInfo[attr] = val;
            this.set(this.defaultStoreKey, storeInfo);
            result = val;
        }
        return result;
    },

    /**
     * 从本地存储设置数据对象
     * @param storeKey
     * @returns {*}
     */
    get : function(storeKey){
        return (this.enable && storeKey) ? store.get(storeKey) : null;
    },

    /**
     * 从本地存储设置、获取数据对象
     * @param storeKey
     * @param storeVal
     * @returns {*}
     */
    set : function(storeKey, storeVal){
        if(!this.enable || !storeKey){
            return null;
        }else{
            store.set(storeKey, storeVal);
            return storeVal;
        }
    }
};
