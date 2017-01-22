/**
 * 直播间手机版工具类
 * author Dick.guo
 *
 * OnlineCS : 在线客服
 * Container : 页面容器
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

    /**页面容器*/
    Container : {

    }
};