/**
 * 直播间手机版弹窗类
 * author Dick.guo
 *
 * msg : 提示信息
 */
var Pop = {

    /**
     * 显示提示信息
     * @param ops {String || {msg:String, [closeable]:boolean, [autoClose]:Number, [onOK]:Function}}
     */
    msg : function(ops){
        ops = ops || {};
        if(typeof ops == "string"){
            ops = {msg : ops};
        }
        $.extend(ops, {
            msg : "",
            closeable : true,
            autoClose : -1,
            onOK : $.noop
        });
        if(ops.closeable){
            $("#pop_msgClose").hide();
        }else{
            $("#pop_msgClose").show();
        }
        $("#pop_msgTxt").text(ops.msg);
        if(ops.autoClose > 0){
            $("#pop_msgBtn").hide();
            $("#pop_msg").fadeIn().delay(ops.autoClose).fadeOut();
            ops.onOK();
        }else{
            $("#pop_msgBtn").show();
            $("#pop_msg").fadeIn();
        }
        $("#pop_msgBtn").one(function(){
            ops.onOK();
            $("#pop_msg").hide();
        });
    }
};