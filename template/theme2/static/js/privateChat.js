/**
 * Created by ant.ding on 2017/3/6.
 * 新手专区/教学视频
 */
var PrivateChat = new Container({
    panel : $("#page_privateChat"),
    url : "/theme2/template/privateChat.html",
    privateChatToolView : "none",
    currentTalker : '',
    isChangeRoom : false,
    onLoad : function(){
        PrivateChat.setEvent();
        PrivateChat.setWhTab();
    },
    onShow : function () {
        if(PrivateChat.isChangeRoom){
            PrivateChat.setWhTab();
            PrivateChat.isChangeRoom = false;
        }
        $('#contentText').text('').trigger('input');
    }
});

/**
 * 设置事件
 */
PrivateChat.setEvent = function(){
    //返回上一级
    $('#privateChat_back').bind('click', Container.back);

    $('body>*').bind('click',function (e) {
        var _target = $(e.target);
        !_target.closest('.popcon').length && _target.closest('.popup').hide();
    });

    /**
     * 输入框相关事件
     */
    $('#contentText').bind('click',function () {
        $(this).parent().find('.placeholder').hide();
        $('#privateChat_tools').slideUp(300);
        $('#privateChat_tool2').slideUp(300);
        $('#privateChat_tool3').slideUp(300);
        $('#privateChat_tool3').hide();
        PrivateChat.privateChatToolView = "none";
    }).bind('focus',function () {
        $("#privateChat_contHolder").hide();
    }).bind('blur',function () {
        var msg = $.trim($(this).html());
        if(!msg){
            $("#privateChat_contHolder").fadeIn();
        }
        //如果是点击小加号的话，不执行
        window.setTimeout(function(){
            if(PrivateChat.privateChatToolView == "analyst" || PrivateChat.privateChatToolView == "face"){
                PrivateChat.showTool("none");
            }
        }, 100);
    }).bind('keypress',function (e) {
        var msg = $(this).html();
        if(e.keyCode==13){//回车键
            if(msg){
                $(this).html(msg.replace(/<div>|<\/div>/g,""));
                $("#privateChat_send").click();
            }
            return false;
        }
    }).bind('input',function () {
        var isOk = ($.trim($(this).text()) != $(this).find(".txt_dia").text() || $(this).find("img").size() > 0);
        if(isOk){
            $("#privateChat_contHolder").hide();
            $("#privateChat_send").fadeIn();
        }else{
            $("#privateChat_contHolder").fadeIn();
            $("#privateChat_send").hide();
        }
    });

    /**
     * 聊天框
     */
    $("#addbox-btn").bind("click", function(){
        $('#privateChat_tool2').toggle();
        //$('#privateChat_tools').slideToggle(300);
        if(PrivateChat.privateChatToolView == "btns"){
            PrivateChat.showTool("none");
        }else{
            PrivateChat.showTool("btns");
        }
        return false;
    });

    /**
     * 表情
     */
    $("#privateChat_face").bind("click", function(){
        PrivateChat.showTool("face");
        $('#privateChat_tool2').hide();
        if($.inArray(2,Chat.face.initArray) < 0){
            // 初始化表情
            Data.getRoom(function(room){
                //初始化标签
                Chat.face.init($("#privateChat_facePanel"),
                    $("#contentText"),
                    Data.filePath+'/face/',
                    !room || (!room.allowVisitor && "visitor"==Data.userInfo.clientGroup),2);
                //$("#contentText").focusEnd();
            });
        }
    });

    /** 发送 */
    $("#privateChat_send").bind("click", function(){
        var uiId = Chat.getUiId();
        var msg = Chat.getSendMsg($("#contentText"));
        var sendWhObj={uiId:uiId,fromUser:Data.userInfo,content:{msgType:Data.msgType.text,value:msg}};
        Chat.WhTalk.sendWhMsg(sendWhObj);
    });

    //通话方式选择
    $('.head-top .i-call').bind('click',function (e) {
        e.preventDefault();
        $('.select-callmethod').show();
    });
    $('.select-callmethod .cancel-btn').bind('click',function () {
        $(this).closest('.popup').hide();
    });
    $('#callMe').bind('click',function (e) {
        var uiId = Chat.getUiId();
        var sendWhObj={uiId:uiId,fromUser:Data.userInfo,content:{msgType:Data.msgType.text,value:PrivateChat.callMe},uiType:'callMe'};
        Chat.WhTalk.sendWhMsg(sendWhObj);
        if(!Chat.WhTalk.currCS.online){
            return;
        }
        sendWhObj={uiId:uiId,fromUser:Chat.WhTalk.currCS,content:{msgType:Data.msgType.text,value:'收到了您的回电请求，我会在第一时间给您回电的。额，如果未能及时回电，请您谅解，我一定在飞奔而来的路上...'}}
        sendWhObj.fromUser.userId = Chat.WhTalk.currCS.userNo;
        sendWhObj.fromUser.publishTime = uiId;
        sendWhObj.fromUser.nickname = Chat.WhTalk.currCS.userName;
        Chat.WhTalk.receiveWhMsg(sendWhObj,false,false)
        $('.select-callmethod .cancel-btn').click();
    });

    /**
     * 发送图片--选择图片
     */
    $("#privateChat_pic").click(function (e) {
        Data.getRoom(function(room) {
            if (!FileReader) {
                Pop.msg("发送图片功能目前只支持Chrome、Firefox、IE10或以上版本的浏览器！");
                return false;
            }
            if (!room.allowVisitor && Data.userInfo.clientGroup == 'visitor') {
                e.preventDefault();
                Login.load();
                return false;
            }
            if (Data.userInfo.isSetName === false) {
                return false;
            }
        });
    });

    /**
     * 发送图片
     */
    $("#privateChat_pic .sfile-input").bind("change", function () {
        var _this = this;
        var img = _this.files[0];
        // 判断是否图片
        if (!img) {
            return false;
        }
        // 判断图片格式
        if (!(img.type.indexOf('image') == 0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase()))) {
            Pop.msg('目前暂支持jpg,gif,png格式的图片！');
            return false;
        }
        var fileSize = img.size;
        if (fileSize >= 1024 * 1024) {
            Pop.msg('发送的图片大小不要超过1MB.');
            return false;
        }
        //加载文件转成URL所需的文件流
        var reader = new FileReader();
        reader.readAsDataURL(img);

        reader.onload = function (e) {
            var utype = $('#privateChatTabs .selected').attr('utype');
            var toUser = {
                userId : $('#privateChatTabs .selected').attr('uid'),
                nickname : $('#privateChatTabs .selected').find('.u-name').text(),
                talkStyle : 1,  //0 公聊  1：私聊
                userType : utype === 'cs' ? 3 : 2, // 1:系统管理员  2：分析师  3：客服
                avatar : $('#privateChatTabs .selected').find('img').attr('src')
            }
            Chat.setUploadImg(e.target.result, toUser);//处理并发送图片
        };
        reader.onprogress = function (e) {};
        reader.onloadend = function (e) {};
        $(this).val("");
    });

};

/**
 * 设置私聊tab
 */
PrivateChat.setWhTab = function () {
    var tabHtml = [], msgHtml = [];
    //设置当前私聊人
    for(var i = 0 ,len = PrivateChat.talkers.length; i < len ; i++){
        var obj = PrivateChat.talkers[i];
        var clazz = '';
        if(obj.type === 'cs'){
            clazz = 'selected';
            PrivateChat.currentTalker = 'privateChat_msg'+obj.userNo;
        }
        tabHtml.push(PrivateChat.formatHtml("privateChat_whTalker",
            clazz,
            //obj.avatar,
            obj.unreadNum > 0 ? obj.unreadNum : '',
            obj.userName,
            obj.userNo,
            obj.type
        ).replace('/theme2/img/cm.png',obj.avatar));
        msgHtml.push(PrivateChat.formatHtml("privateChat_msgTemp",
            obj.userNo
        ));
    }
    $('#privateChatTabs').empty().html(tabHtml.join(''));
    $('#privateChatMsgDiv').empty().html(msgHtml.join(''));
    //切换私聊tab
    $('.item-list a').bind('click',function () {
        $('.item-list a').each(function (index,obj) {
            $(obj).removeClass('selected');
        })
        $(this).addClass('selected');
        PrivateChat.currentTalker = 'privateChat_msg' + $(this).attr('uid');
        Chat.WhTalk.whObjType = $(this).attr('utype');
        //切换对应的私聊消息
        $('#privateChatMsgDiv').children().each(function () {
            $(this).hide();
        });
        $('#'+PrivateChat.currentTalker).show();
        $(this).find('.i-tips-txt').text('');
    });
    //出发选中tab点击事件--》其他tab对应的div则display：none
    $('.item-list .selected').trigger('click');
    if(Chat.WhTalk.currCS && Chat.WhTalk.currCS.userNo && Data.userInfo.isLogin){
        Chat.WhTalk.getMsgHis(Chat.WhTalk.currCS.userNo,'cs');
    }
    if(Chat.WhTalk.analyst && Chat.WhTalk.analyst.userNo && Data.userInfo.isLogin){
        Chat.WhTalk.getMsgHis(Chat.WhTalk.analyst.userNo,'analyst');
    }
}

/**
 * 显示工具栏
 */
PrivateChat.showTool = function(type){
    if(type == PrivateChat.privateChatToolView){
        return;
    }
    // none-不显示 analyst-仅显示@ btns-显示@且显示工具栏 face显示表情
    switch (PrivateChat.privateChatToolView){
        case "none":
            $("#privateChat_tools").show();
            break;
        case "analyst":
            break;
        case "btns":
            $("#privateChat_tool2").slideUp(300);
            break;
        case "face":
            $("#privateChat_tool3").slideUp(300);
            break;
        default :
            $("#privateChat_tools").show();
            break;
    }
    switch (type){
        case "none":
            $("#privateChat_tools").hide();
            break;
        case "analyst":
            break;
        case "btns":
            $("#privateChat_tool2").slideDown(300);
            break;
        case "face":
            $("#privateChat_tool3").slideDown(300);
            break;
    }
    PrivateChat.privateChatToolView = type;
};

//相关常量
PrivateChat.talkers = [];

PrivateChat.callMe = '给我回电';

PrivateChat.csNumber = '(852) 8109 9928';
