/**
 * 直播间手机版房间内页 -- 聊天功能
 * author Dick.guo
 */
var Chat = {
    socket:null,
    fullscreen : false,
    scrolling : false,
    chatMsgFilter : "all", //all-看所有人 analyst-看分析师 me-与我相关
    chatToolView : "none", //none-不显示 analyst-仅显示@ btns-显示@且显示工具栏 face显示表情
    userMap : {}, //在线用户Map 管理员+分析师+客服助理
    cntAdmin : 0, //在线管理员数量
    cntAnalyst : 0, //在线分析师数量
    cntOnline : 0,  //在线用户

    /**
     * 初始化
     */
    init : function(){
        this.setSocket();
        this.setOnlineNum(0, false, true);
    },

    /**
     * 设置socket
     */
    setSocket : function(){
        this.socket = Util.getSocket(io,Data.socketUrl,Data.userInfo.groupType);
        //建立连接
        this.socket.on('connect',function(){
            console.log('connected to server!');
            Chat.connectSocket();
        });
        //在线用户列表
        this.socket.on('onlineUserList', function(data,dataLength){
            Chat.setOnlineUsers(data, dataLength);
        });
        //断开连接
        this.socket.on('disconnect',function(){
            console.log('disconnect');
        });
        //出现异常
        this.socket.on("error",function(e){
            console.error('e:'+e);
        });
        //信息传输
        this.socket.on('sendMsg',function(data){
            Chat.receiveMsg(data, false, false);
        });
        //通知信息
        this.socket.on('notice',function(result){
            switch (result.type){
                case 'onlineNum':
                    if(result.data && result.data.onlineUserInfo){
                        Chat.setOnlineUser(result.data.onlineUserInfo, result.data.online, true);
                    }
                    break;

                case 'removeMsg':
                    Chat.removeMsg(result.data);
                    break;
                case 'leaveRoom':
                    Chat.leaveRoomTip(result.flag);
                    break;
                
                case 'approvalResult':
                    Chat.approveMsg(result.data);
                    break;

                case 'pushInfo':
                    Chat.pushMsg(result.data);
                    break;

                case 'showTrade'://晒单信息
                    var showTradeInfo = result.data;
                    ShowTrade.pushShowTradeInfo(showTradeInfo);
                    break;

                case 'serverTime':
                    Data.serverTime = result.data;
                    break;

                case 'articleInfo'://交易策略
                    var articleInfo = result.data;
                    if (articleInfo) {
                        switch (articleInfo.categoryId){
                            case "class_note"://直播精华
                                if(articleInfo.platform && articleInfo.platform.indexOf(indexJS.userInfo.groupId) != -1){
                                    var articleDetail=articleInfo.detailList && articleInfo.detailList[0];
                                    ClassNote.appendClassNote(articleInfo, true);
                                    /*if(Util.isValid(articleDetail.tag) && articleDetail.tag == 'trading_strategy') {
                                        chatPride.appendTradeStrategyNote(articleInfo, true, true, true);
                                    }else{
                                        chatPride.appendClassNoteInfo(articleInfo, true, true, true);
                                    }*/
                                    ClassNote.pushShoutSingleInfo(articleInfo);
                                }
                                break;
                        }
                    }
                    break;
            }
        });
        //信息传输
        this.socket.on('loadMsg',function(data){
            Chat.loadMsg(data);
        });
        //加载私聊信息
        this.socket.on('loadWhMsg',function(result){
            Chat.WhTalk.loadWhMsg(result.data)
        });
    },

    /**
     * 绑定事件
     */
    setEvent : function(){
        /**
         * 全屏聊天
         */
        $("#chat_fullscreen").bind("click", function(){
            Chat.fullscreen = !Chat.fullscreen;
            if(Chat.fullscreen){
                if(Player.type != "text"){
                    $("#chat_player").slideUp(300);
                    setTimeout(function(){
                        $("#chat_fullscreen").attr('class', 'i-arrow i-arrow-down4');
                        Chat.setHeight();
                    }, 300);
                }else{
                    $("#chat_fullscreen").attr('class', 'i-arrow i-arrow-down4');
                    Chat.setHeight();
                }
            }else{
                if(Player.type != "text"){
                    $("#chat_player").slideDown(300);
                    setTimeout(function(){
                        $("#chat_fullscreen").attr('class', 'i-arrow i-arrow-up4');
                        Chat.setHeight();
                    }, 300);
                }else{
                    $("#chat_fullscreen").attr('class', 'i-arrow i-arrow-up4');
                    Chat.setHeight();
                }
            }
        });

        /**
         * 关闭聊天
         */
        $("#chat_close").bind("click", function(){
            if(Chat.fullscreen){
                $("#chat_fullscreen").trigger("click");
            }
            $("#room_classnote").show();
            $("#room_foot").show();
            $("#room_talk").hide();
        });

        /**
         * 对话消息过滤
         */
        $("#chat_filter").bind("change", function(){
            Chat.filterMsg($(this).val());
        });

        /**
         * 打开私聊对话页面
         */
        $("#chat_whisper").bind("click", function(){
            //TODO 打开私聊对话页面
        });

        /**
         * 聊天框相关事件
         */
        $("#chat_cont").bind("focus", function(){
            $("#chat_contHolder").hide();
            if(Chat.chatToolView == "none"){
                Chat.showTool("analyst");
            }
        }).bind("blur", function(e){
            var msg = $.trim($(this).html());
            if(!msg){
                $("#chat_contHolder").fadeIn();
            }
            //如果是点击小加号的话，不执行
            window.setTimeout(function(){
                if(Chat.chatToolView == "analyst" || Chat.chatToolView == "face"){
                    Chat.showTool("none");
                }
            }, 100);
        }).bind("keypress", function(e){
            var msg = $(this).html();
            if(e.keyCode==13){//回车键
                if(msg){
                    $(this).html(msg.replace(/<div>|<\/div>/g,""));
                    $("#chat_send").click();
                }
                return false;
            }
        }).bind("keyup", function(e){

        }).bind("input", function(){
            var isOk = ($.trim($(this).text()) != $(this).find(".txt_dia").text() || $(this).find("img").size() > 0);
            if(isOk){
                $("#chat_send").fadeIn();
            }else{
                $("#chat_send").hide();
            }
        });

        /**
         * 聊天框“+”
         */
        $("#chat_contTool").bind("click", function(){
            if(Chat.chatToolView == "btns"){
                Chat.showTool("none");
            }else{
                Chat.showTool("btns");
            }
            return false;
        });

        /**
         * 表情
         */
        $("#chat_face").bind("click", function(){
            Chat.showTool("face");

            if(!Chat.face.initFace){
                // 初始化表情
                Data.getRoom(function(room){
                    //初始化标签
                    Chat.face.init($("#chat_facePanel"),
                        $("#chat_cont"),
                        Data.filePath+'/face/',
                        !room || (!room.allowVisitor && "visitor"==Data.userInfo.clientGroup));
                    $("#chat_cont").focusEnd();
                });
            }else{
                $("#chat_cont").focusEnd();
            }
        });

        /** 发送 */
        $("#chat_send").bind("click", function(){
            Chat.sendMsg();
        });
        /**
         * 发送图片--选择图片
         */
        $(".file-img").click(function () {
            Data.getRoom(function(room) {
                if (!FileReader) {
                    alert("发送图片功能目前只支持Chrome、Firefox、IE10或以上版本的浏览器！");
                    return false;
                }
                if (!Chat.WhTalk.tabCheck && !room.allowVisitor && Data.userInfo.clientGroup == 'visitor') {
                    Login.load();
                    return false;
                }
                if (Data.userInfo.isSetName === false) {
                    //TODO 弹出设置昵称//studioMbPop.popBox("set", {studioChatObj : studioChatMb});
                    return false;
                }
            });
        });
        /**
         * 发送图片
         */
        $(".file-img").bind("change", function () {
            var _this = this;
            var img = _this.files[0];
            // 判断是否图片
            if (!img) {
                return false;
            }
            // 判断图片格式
            if (!(img.type.indexOf('image') == 0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase()))) {
                alert('目前暂支持jpg,gif,png格式的图片！');
                return false;
            }
            var fileSize = img.size;
            if (fileSize >= 1024 * 1024) {
                alert('发送的图片大小不要超过1MB.');
                return false;
            }
            //加载文件转成URL所需的文件流
            var reader = new FileReader();
            reader.readAsDataURL(img);

            reader.onload = function (e) {
                Chat.setUploadImg(e.target.result, Chat.getToUser());//处理并发送图片
            };
            reader.onprogress = function (e) {};
            reader.onloadend = function (e) {};
            //studioChatMb.view.boardCtrl(1);
            $(this).val("");
        });
    },

    /**
     * 发送消息
     */
    sendMsg : function(){
        Chat.showTool("none");
        Data.getRoom(function(room){
            if(!room.allowVisitor && Data.userInfo.clientGroup == "visitor"){
                Login.load();
                return;
            }
            if(Data.userInfo.isSetName === false){
                // TODO 设置昵称
                return;
            }
            var toUser = Chat.getToUser();
            var msg = Chat.getSendMsg($("#chat_cont"));
            if(msg === false){
                return;
            }

            var sendObj={
                uiId : Chat.getUiId(),
                fromUser : Data.userInfo,
                content : {msgType:Data.msgType.text, value:msg}
            };
            sendObj.fromUser.toUser = toUser;
            $.post(Data.apiUrl+"/message/sendMsg", {data:sendObj}, function(){
                console.log("send message ok!");
            });
            Chat.receiveMsg(sendObj, true, false);//直接把数据填入内容栏

            //清空输入框
            $("#chat_cont").html("").trigger("input");//清空内容
            chatAnalyze.setUTM(false, $.extend({operationType:2}, Data.userInfo, Tool.courseTick.course));//统计发言次数
        });
    },

    /**
     * 提取uiId,用于标记记录的id，信息发送成功后取发布日期代替
     */
    getUiId:function(){
        return new Date().getTime()+"_ms";
    },

    /**
     * 提取@对话html
     */
    getToUser:function(){
        var curDom=$('#chat_cont .txt_dia');
        if(curDom.length>0){
            return {
                userId : curDom.attr("uid"),
                nickname : curDom.find("label").text(),
                talkStyle : 0,
                userType : curDom.attr("utype"),
                avatar : curDom.attr("avatar")
            };
        }
        return null;
    },

    /**
     * 过滤发送消息：过滤一些特殊字符等。
     * 如果返回值为false,则终止发送消息。
     */
    getSendMsg : function(dom){
        //校验聊天内容长度
        if(dom.text().length + dom.find("img").size() > 140){
            Pop.msg("消息内容超过最大长度限制（140字以内）！");
            return false;
        }

        var msg = dom.html();
        msg = Chat.clearMsgHtml(msg);
        if(Util.isBlank(msg)){
            dom.html("");
            return false;
        }
        if(dom.find(".txt_dia").length>0){
            dom.find(".txt_dia").remove();
            msg=dom.html();
            msg=msg.replace(/^(&nbsp;){1,2}/, "");
        }
        return msg;
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
     * 过滤显示消息
     * @param [type]
     */
    filterMsg : function (type) {
        //显示类型不发生改变，或者 加载消息的时候，本身就是“显示所有”时不需要处理
        if(Chat.chatMsgFilter == type || (!type && Chat.chatMsgFilter == "all")){
            return;
        }
        Chat.setTalkScroll();
        Chat.chatMsgFilter = type || Chat.chatMsgFilter;
        switch(Chat.chatMsgFilter){
            case "all":
                $("#chat_msg > .dialog").show();
                break;

            case "analyst":
                $("#chat_msg > .dialog").hide().filter(".tag-analyst").show();
                break;

            case "me":
                $("#chat_msg > .dialog").hide().filter(".tag-me").show();
                break;
        }
    },

    /**
     * 设置聊天框高度
     */
    setHeight : function(){
        var height = Data.windowHeight
            - 40 //$("#header").height()
            - 50 //$("#chat_editor").height()
            - 44; //$("#chat_ctrl").height()
        if(!Chat.fullscreen){
            height = height - 44 //$("#room_header").height()
            - (Player.type == "text" ? 0 : $("#chat_player").height());
        }
        $("#chat_msg").height(height);
    },
    /**
     * 在线用户列表
     * @param users
     * @param length
     */
    setOnlineUsers : function(users, length){
        for(var i in users){
            Chat.setOnlineUser(users[i], true, false);
        }
        if(Chat.WhTalk.enable){
            Chat.WhTalk.getCSList(); //加载客服列表
        }
        Chat.setOnlineNum(length, true, false);
    },
    /**
     * 在线用户
     * @param user
     * @param isOnline
     * @param setOnlineNum
     */
    setOnlineUser : function(user, isOnline, setOnlineNum){
        if(Chat.WhTalk.enable && user.userType == 3){
            Chat.WhTalk.setCSOnline(user.userId, isOnline);
        }
        //快捷@
        if(user.userType==1 || user.userType==2 || user.userType==3){
            Chat.setUsersMap(user, isOnline);
        }
        if(setOnlineNum){
            Chat.setOnlineNum(isOnline ? 1 : -1, false, false);
        }
    },
    /**
     * 设置在线人数
     */
    setOnlineNum:function(num, isAddVirtual, isReset){
        //初始化
        if(isReset){
            Chat.cntOnline = 0;
            return;
        }
        Chat.cntOnline += (num || 1);
        if(isAddVirtual){
            if(Chat.cntOnline <= 200){
                Chat.cntOnline += Chat.cntOnline <= 10 ? 60 : (200 / Chat.cntOnline) * 3 + 10;
                Chat.cntOnline = Math.round(Chat.cntOnline);
            }
        }
        Chat.cntOnline = Math.abs(Chat.cntOnline); //避免出现负数
        $("#chatOnlineNum").text(Chat.cntOnline);
    },
    /**
     * 设置后台在线用户列表
     */
    setUsersMap : function(userInfo, isOnline){
        if(!isOnline) {
            delete Chat.userMap[userInfo.userId];
        }else{
            Chat.userMap[userInfo.userId] = userInfo;
        }
        var fastAt = $("#chat_gwUsers"), fastAtHtml;
        switch (userInfo.userType){
            case 1:
                Chat.cntAdmin += (isOnline ? 1 : -1);
                fastAtHtml = Room.formatHtml("chat_gwUser", userInfo.userId, userInfo.nickName);
                if(isOnline){
                    fastAt.prepend(fastAtHtml);
                }else{
                    fastAt.find("[uid=" + userInfo.userId + "]").remove();
                }
                break;

            case 2:
                Chat.cntAnalyst += (isOnline ? 1 : -1);
                fastAtHtml = Room.formatHtml("chat_gwUser", userInfo.userId, userInfo.nickName);
                if(isOnline){
                    fastAt.append(fastAtHtml);
                }else{
                    fastAt.find("[uid=" + userInfo.userId + "]").remove();
                }
                break;

            case 3:
                break;
        }
    },
    /**
     * 连接socket
     */
    connectSocket : function(){
        Data.userInfo.socketId = Chat.socket.id;
        Data.getSyllabusPlan(function(syllabusPlan){
            Util.postJson(Data.getApiUrl("/message/join"), {
                courseId:syllabusPlan && syllabusPlan.courseId || "",
                courseName:syllabusPlan && syllabusPlan.courseName || "",
                cookieId:chatAnalyze.getUTMCookie(),
                userName:Data.userInfo.userName,
                roomName:Data.userInfo.roomName,
                email:Data.userInfo.email,
                userInfo:Data.userInfo,
                lastPublishTime : $("#chat_msg .dialog:last").attr("id"),
                fromPlatform : Data.options.platform,
                allowWhisper : Chat.WhTalk.enable,
                userAgent : navigator.userAgent
            }, function(){
                console.log("login socket server success!");
            })
        });
    },

    /**
     * 离开房间提示
     */
    leaveRoomTip:function(flag){
        if(flag=="roomClose"){
            Pop.msg({
                msg : "注意：房间已停用，正自动退出房间...",
                closeable : false,
                autoClose : 2000,
                onOK : function(){
                    Rooms.load();
                }
            });
        }else if(flag=="otherLogin"){
            Pop.msg({
                msg : "注意：房间已停用，正自动退出房间...",
                closeable : false,
                autoClose : 2000,
                onOK : function(){
                    window.location.href="/studio/logout";
                }
            });
        }
    },

    /**
     * 推送消息
     * @param data
     */
    pushMsg : function(data){
        if(data.position==1){//私聊框
            Data.pushWHTalk = data.infos || [];
        }else if(data.position==3){ //公聊框
            Data.pushTalk = data.infos || [];
            for(var i = 0, len = Data.pushTalk.length; i < len; i++){
                Data.pushTalk[i].nextTm = Data.pushTalk[i].serverTime + Data.pushTalk[i].onlineMin * 60 * 1000;
            }
        }
    },

    /**
     * 加载消息
     * @param data
     */
    loadMsg : function(data){
        var msgData=data.msgData,isAdd=data.isAdd;
        if(!isAdd) {
            $("#chat_msg").empty();
        }
        var msgArr = [], msgTmp;
        for(var i = 0, lenI = msgData ? msgData.length : 0; i < lenI; i++){
            msgTmp = msgData[i];
            if(msgTmp){
                msgArr.push({content : msgTmp.content, fromUser : msgTmp});
            }
        }
        msgArr.reverse();
        Chat.receiveMsg(msgArr, false, true);
    },

    /**
     * 接收消息
     * @param data
     * @param isMeSend
     * @param isLoadData
     */
    receiveMsg : function(data, isMeSend, isLoadData){
        var html = [];
        if(data instanceof Array){
            for(var i = 0, lenI = data ? data.length : 0; i < lenI; i++){
                html.push(Chat.getMsgHtml(data[i], isMeSend, isLoadData, false));
            }
        }else{
            html.push(Chat.getMsgHtml(data, isMeSend, isLoadData, false));
        }
        Chat.setTalkScroll();
        $("#chat_msg").append(html.join(""));
        Chat.filterMsg();
        if(!isLoadData){
            Chat.showChatMsgNumTip(false);
        }
    },

    /**
     * 格式发布日期
     */
    formatPublishTime : function(time){
        if(!time){
            return "";
        }
        var timeLS = Number(time.replace(/_.+/g,""));
        timeLS += Data.options.timezoneLs ; //时区转换
        return Util.formatDate(timeLS, "HH:mm");
    },

    /**
     * 设置聊天列表滚动条
     * @param [force] {boolean}
     */
    setTalkScroll : function(force){
        if(!Chat.scrolling){
            var panel = $("#chat_msg");
            if(force || panel.scrollTop() == 0 || panel.scrollTop() + panel.height() + 30 >= panel[0].scrollHeight){
                Chat.scrolling = true;
                window.setTimeout(function(){
                    $("#chat_msg").scrollTop($("#chat_msg")[0].scrollHeight);
                    Chat.scrolling = false;
                }, 300);

            }
        }
    },

    /**
     * 移除加载提示的dom
     * @param uiId
     */
    removeLoadDom:function(uiId){
        $('#'+uiId+' .img-loading,#'+uiId+' .img-load-gan,#'+uiId+' .shadow-box,#'+uiId+' .shadow-conut').remove();
    },

    /**
     * 格式化消息，获取HTML字符串
     * @param data
     * @param isMeSend
     * @param isLoadData
     * @param isWh
     * @returns {boolean | string}
     */
    getMsgHtml : function(data, isMeSend, isLoadData, isWh){
        if(!data || !data.fromUser){
            return "";
        }
        if(data.fromUser.toUser && data.fromUser.toUser.talkStyle==1){//如果是私聊则转到私聊框处理
            Chat.WhTalk.receiveWhMsg(data, false, false);
            return "";
        }
        if(!isMeSend && !data.serverSuccess && Data.userInfo.userId == data.fromUser.userId && !data.rule){
            return "";
        }
        var fromUser=data.fromUser;
        if(isMeSend){//发送，并检查状态
            fromUser.publishTime=data.uiId;
        }
        if(data.isVisitor){
            $("#"+data.uiId).remove();
            return "";
        }
        if(isLoadData && $("#"+fromUser.publishTime).length>0){
            $("#"+fromUser.publishTime+" .dcont .ruleTipStyle").remove();
            $("#"+fromUser.publishTime+" input").remove();
            return "";
        }
        if(data.rule){
            if(data.value){
                if(data.value.needApproval){
                    $('#'+data.uiId).attr("id", fromUser.publishTime);
                }else{
                    $('#'+data.uiId+' .dcont').append(Room.formatHtml("chat_dialogTip", data.value.tip || ""));
                }
            }
            return "";
        }
        if(!isMeSend && Data.userInfo.userId==fromUser.userId && data.serverSuccess){//发送成功，则去掉加载框，清除原始数据。
            $('#'+data.uiId+' .uname span').html(Chat.formatPublishTime(fromUser.publishTime));
            $('#'+data.uiId).attr("id",fromUser.publishTime);//发布成功id同步成服务器发布日期
            if(data.content.msgType==Data.msgType.img){
                Chat.removeLoadDom(fromUser.publishTime);//去掉加载框
                var aObj = $('#'+fromUser.publishTime+' [talk="a"]>a');
                var url=data.content.needMax?'/studio/getBigImg?publishTime='+fromUser.publishTime+'&userId='+fromUser.userId:aObj.children("img").attr("src");
                aObj.attr("href",url);
            }
            return "";
        }
        return Chat.formatMsg(data,isMeSend,isLoadData, false);
    },

    /**
     * 格式化消息
     * @param data
     * @param isMeSend
     * @param isLoadData
     * @param isWh
     * @returns {*}
     */
    formatMsg : function(data, isMeSend, isLoadData, isWh){
        var cls='', fromUser = data.fromUser, content = data.content || {};
        var result;
        if(content.msgType == Data.msgType.img){
            var url = content.value;
            if(content.needMax){
                url = Util.format("/studio/getBigImg?publishTime={0}&userId={1}", fromUser.publishTime, fromUser.userId);
            }
            result = Room.formatHtml("chat_dialogImg", url, content.value || "");
            if(isMeSend){
                result += Room.formatHtml("chat_dialogLoading");
            }
        }else{
            result = Chat.filterUrl(content.value || "");
        }

        if(fromUser.toUser && fromUser.toUser.question){ //问答模式
            result = Room.formatHtml("chat_dialogTxt2",
                fromUser.toUser.nickname || "",
                fromUser.toUser.question || "",
                result
            );
        }else{
            result = Room.formatHtml("chat_dialogTxt1", result);
        }

        var userTag = Chat.getUserTag(fromUser);
        if(isMeSend || fromUser.userId == Data.userInfo.userId){
            result = Room.formatHtml("chat_dialogMe",
                fromUser.publishTime,
                userTag.avatar,
                userTag.level,
                Chat.formatPublishTime(fromUser.publishTime),
                fromUser.nickname,
                result
            );
        }else{
            result = Room.formatHtml("chat_dialog",
                userTag.cls,
                fromUser.publishTime,
                fromUser.userId,
                userTag.avatar,
                userTag.level,
                userTag.appellation + fromUser.nickname,
                Chat.formatPublishTime(fromUser.publishTime),
                result
            );
        }
        return result;
    },

    /**
     * 获取用户标签
     * @param userInfo
     * @returns {{cls: String, level: String, avatar: String, appellation: String}}
     */
    getUserTag : function(userInfo){
        var result = {
            cls : "",
            level : "",
            avatar : "/pm/theme2/img/user_c.png",
            appellation : ""
        };
        if(userInfo){
            //名称 dialog样式、用户级别
            switch(userInfo.userType){
                case 2:
                    result.cls = " dialog-analyst tag-analyst";
                    break;

                case 1:
                    result.cls = " dialog-admin";
                    result.appellation = "管理员";
                    break;

                case 3:
                    result.cls = " dialog-admin";
                    result.appellation = "客服";
                    break;

                case 0:
                    result.level = Room.formatHtml("chat_dialogLevel", Data.getUserLevel(userInfo.pointsGlobal));
                    break;
            }
            if(userInfo.userId == Data.userInfo.userId || (userInfo.toUser && userInfo.toUser.userId == Data.userInfo.userId)){
                result.cls += " tag-me";
            }

            //头像
            if(userInfo.avatar){
                result.avatar = userInfo.avatar;
            }else{
                switch (userInfo.clientGroup){
                    case "vip":
                        result.avatar = "/pm/theme2/img/user_v.png";
                        break;

                    case "active":
                        var idTmp = 0;
                        if(userId && userId.length > 0){
                            idTmp += (userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1));
                        }
                        idTmp = (idTmp + 15) % 40;
                        result.avatar = Data.filePath + "/upload/pic/header/chat/visitor/" + idTmp + ".png";
                        break;

                    case "notActive":
                        result.avatar = "/pm/theme2/img/user_r.png";
                        break;

                    case "simulate":
                        result.avatar = "/pm/theme2/img/user_d.png";
                        break;

                    case "register":
                        result.avatar = "/pm/theme2/img/user_m.png";
                        break;

                    case "visitor":
                        var idTmp = userInfo.userId;
                        idTmp = parseInt(idTmp.substring(idTmp.length - 2), 10);
                        if(isNaN(idTmp)){
                            idTmp = 100;
                        }
                        idTmp = (idTmp + 17) % 40;
                        result.avatar = Data.filePath + '/upload/pic/header/chat/visitor/' + idTmp + '.png">';
                }
            }
        }

        return result;
    },

    /**
     * 格式化超链接
     */
    filterUrl : function(msg){
        if(!msg){
            return "";
        }
        var reg = /((?=[^"'])|^)http(s)?:\/\/[^"'\s]+((?=\s)|$)/gi;
        var matches = msg.match(reg), matchTmp, matchesMap = {};
        for(var i = 0, lenI = matches ? matches.length : 0; i < lenI; i++){
            matchTmp = matches[i];
            if(!matchTmp || matchesMap.hasOwnProperty(matchTmp)){
                continue;
            }
            matchesMap[matchTmp] = true;
            msg = Util.replaceAll(msg, matchTmp, Room.formatHtml('chat_dialogUrl', matchTmp));
        }
        return msg;
    },

    /**
     * 审核信息
     * @param data
     */
    approveMsg : function(data){
        var i = 0;
        if(data.refuseMsg){
            var publishTimeArr=data.publishTimeArr;
            for(i in publishTimeArr){
                $("#"+publishTimeArr[i]+" .dialog em[class=ruleTipStyle]").html("已拒绝");
            }
        }else{
            for (i in data) {
                Chat.formatUserToContent(data[i]);
            }
        }
    },

    /**
     * 移除信息
     * @param ids
     */
    removeMsg : function(ids){
        if(ids){
            $("#"+ids.replace(/,/g,",#")).remove();
        }
    },

    /**
     * 私聊
     */
    WhTalk : {
        enable : false,   //是否允许私聊
        status : 0,       //状态
        tabCheck : false, //当前是否选中私聊tab
        CSMap : {},       //老师助理列表
        currCS : null,    //当前私聊老师助理
        msgCnt : 0,       //未读消息数
        pushObj : null,   //私聊推送信息
        askMsgObj : null,
        viewSelect : false, //老师助理下拉是否选中

        /**
         * 初始化私聊
         */
        initWH : function(){
            this.enable = $("#currStudioInfo").attr("aw") == "true";
            this.refreshTips();

            /*在线客服下拉框*/
            $('#WhTalkBoxTab .view_select').click(function() {
                var loc_this = $(this);
                if(loc_this.is(".dw")){
                    loc_this.removeClass("dw");
                    Chat.WhTalk.viewSelect = false;
                }else{
                    loc_this.addClass("dw");
                    Chat.WhTalk.viewSelect = true;
                }
            }).find(".selectlist a").live("click", function(){
                if(!$(this).is(".on")){
                    var userId = $(this).attr("uid");
                    Chat.WhTalk.setWhCS({userId : userId});
                }
            });
        },

        /**
         * 私聊开关-标识当前是否选中了老师助理tab
         * @param isOpen
         */
        whSwitch : function(isOpen){
            if(isOpen){
                this.tabCheck = true;
                this.msgCnt = 0;
                this.refreshTips();
                this.setWHTalkListScroll();
                this.pushMsg();
            }else{
                this.tabCheck = false;
            }
        },

        /**
         * 加载私聊历史信息
         */
        getMsgHis : function(csId){
            if(!this.CSMap.hasOwnProperty(csId) || this.CSMap[csId].load){
                return;
            }
            var csTmp = this.CSMap[csId];
            csTmp.load = true;
            //加载私聊信息
            Chat.socket.emit("getWhMsg",{
                clientStoreId:Data.userInfo.clientStoreId,
                userType:Data.userInfo.userType,
                groupId:Data.userInfo.groupId,
                groupType:Data.userInfo.groupType,
                userId:Data.userInfo.userId,
                toUser:{userId:csTmp.userNo,userType:csTmp.userType}});
        },

        /**
         * 加载消息
         * @param data
         */
        loadWhMsg : function(data){
            if(data && $.isArray(data)){
                var row;
                for (var i = 0, lenI = data.length; i < lenI; i++) {
                    row = data[i];
                    Chat.formatUserToContent(row, true, result.toUserId);
                }
            }
        },

        /**
         * 设置当前老师助理
         * @param userInfo
         */
        setWhCS : function(userInfo) {
            var result = null;
            if (userInfo && userInfo.userId) {
                if(this.CSMap.hasOwnProperty(userInfo.userId)){
                    result = this.CSMap[userInfo.userId];
                }else{
                    result = {
                        userNo: userInfo.userId,
                        userName: userInfo.userName || userInfo.nickname,
                        online: true,
                        load: false,
                        userType: userInfo.userType,
                        avatar : userInfo.avatar
                    };
                    this.CSMap[userInfo.userId] = result;
                }
            }else{
                //随机选择一个，在线老师助理的优先
                var csTmp = null;
                for (var csId in this.CSMap) {
                    csTmp = this.CSMap[csId];
                    if(!result
                        ||(result.userType != 3 && csTmp.userType == 3)
                        ||(result.userType == csTmp.userType && !result.online && csTmp.online))
                    {
                        result = csTmp;
                    }
                }
            }
            if(!result){
                return null;
            }
            if(!result.load){
                this.getMsgHis(result.userNo);
            }
            if(result.userNo){
                this.currCS = result;
                //设置下拉列表框
                var csPanel = $("#WhTalkBoxTab .view_select");
                var csDom = csPanel.find("a[uid=" + this.currCS.userNo + "]");
                csPanel.find('.selectlist a').removeClass("on");
                if(csDom.size() == 0){
                    csPanel.find(".selectlist").append('<a href="javascript:void(0)" class="on" uid="' + this.currCS.userNo + '">' + this.currCS.userName + '</a>');
                    csPanel.find('.selected').text(this.currCS.userName);
                }else{
                    csDom.addClass("on");
                    csPanel.find('.selected').text(csDom.text());
                }
                if(csPanel.find(".selectlist a").size() <= 1){
                    csPanel.hide();
                }else{
                    csPanel.show();
                    $("#whDialog_list").children().hide();
                    $("#whDialog_list").children("[csid=" + this.currCS.userNo + "]").show();
                    this.setWHTalkListScroll();
                }
                return result;
            }else{
                return null;
            }
        },

        /**
         * 获取老师助理列表
         */
        getCSList : function(){
            try{
                $.getJSON('/fxstudio/getCS',{groupId:Data.userInfo.groupId},function(data){
                    if(data && data.length>0) {
                        var cs, csTmp;
                        for(var i = 0, lenI = data.length; i < lenI; i++){
                            cs = data[i];
                            if(Chat.WhTalk.CSMap.hasOwnProperty(cs.userNo)){
                                csTmp = Chat.WhTalk.CSMap[cs.userNo];
                            }else{
                                csTmp = {online : false};
                                Chat.WhTalk.CSMap[cs.userNo] = csTmp;
                            }
                            csTmp.userNo = cs.userNo;
                            csTmp.userName = cs.userName;
                            csTmp.userType = 3;
                            csTmp.avatar = Util.isValid(cs.avatar)?cs.avatar:'/fx/theme2/img/cm.png';
                            csTmp.load = false;
                        }
                    }
                });
            }catch (e){
                console.error("getCSList->"+e);
            }
        },

        /**
         * 设置客服在线状态
         */
        setCSOnline : function(csId, isOnline){
            var csTmp = null;
            if(this.CSMap.hasOwnProperty(csId)){
                csTmp = this.CSMap[csId];
            }else{
                csTmp = {};
                this.CSMap[csId] = csTmp;
            }
            csTmp.online = isOnline;
        },

        /**
         * 显示消息数量
         */
        refreshTips : function(){
            if(Chat.WhTalk.msgCnt > 0){
                $(".wh_tips").text(Chat.WhTalk.msgCnt).show();
            }else{
                $(".wh_tips").hide();
            }
        },

        /**
         * 设置聊天列表滚动条
         */
        setWHTalkListScroll:function(){
            $("#WhTalkPanel").scrollTop($('#WhTalkPanel')[0].scrollHeight);
        },

        /**
         * 接收消息
         */
        receiveWhMsg : function(data,isMeSend,isLoadData){
            var fromUser=data.fromUser;
            if(isMeSend){//发送，并检查状态
                fromUser.publishTime=data.uiId;
            }
            if(data.isVisitor){
                $("#"+data.uiId).remove();
                return;
            }
            if(isLoadData && $("#"+fromUser.publishTime).length>0){
                $("#"+fromUser.publishTime+" .dialog em.ruleTipStyle").remove();
                $("#"+fromUser.publishTime+" input").remove();
                return;
            }
            if(data.rule){
                if(data.value && data.value.needApproval){
                    $('#'+data.uiId).attr("id",fromUser.publishTime);
                }else{
                    $('#'+data.uiId+' .dialog').append('<em class="ruleTipStyle">'+(data.value.tip)+'</em>');
                }
                return;
            }
            if(!isMeSend && Data.userInfo.userId==fromUser.userId && data.serverSuccess){//发送成功，则去掉加载框，清除原始数据。
                $('#'+data.uiId+' .uname span').html(Chat.formatPublishTime(fromUser.publishTime));
                $('#'+data.uiId).attr("id",fromUser.publishTime);//发布成功id同步成服务器发布日期
                if(data.content.msgType==Data.msgType.img){
                    Chat.removeLoadDom(fromUser.publishTime);//去掉加载框
                    var aObj=$('#'+fromUser.publishTime+' span[contt="a"] a');
                    var url=data.content.needMax?'/studio/getBigImg?publishTime='+fromUser.publishTime+'&userId='+fromUser.userId:aObj.children("img").attr("src");
                    aObj.attr("href",url);
                }
                return;
            }
            var dialog=Chat.formatContentHtml(data,isMeSend,isLoadData, true);
            var talkPanel = $("#WhTalkPanel");
            //如果本身就在最底端显示，则自动滚动，否则不滚动
            var isScroll = talkPanel.scrollTop() + talkPanel.height() + 30 >= talkPanel.get(0).scrollHeight;
            if(isLoadData){
                $("#whDialog_list").prepend(dialog);
            }else{
                $("#whDialog_list").append(dialog);
            }
            if(isScroll && this.tabCheck){
                Chat.WhTalk.setWHTalkListScroll();
            }
            Chat.formatMsgToLink(fromUser.publishTime);//格式链接
            //昵称点击
            if(Data.userInfo.userId!=fromUser.userId){
                $('#'+fromUser.publishTime+' .uname,#'+fromUser.publishTime+' .headimg').click(function(){
                    var liDom = $(this).parents("li:first");
                    var csInfo = {
                        userId : liDom.find(".headimg").attr("uid"),
                        nickname : liDom.find(".uname strong").text(),
                        userType : liDom.attr("utype"),
                        avatar : liDom.find(".headimg img").attr("src")
                    };
                    Chat.WhTalk.setWhCS(csInfo);
                });
            }
            //消息数提示
            if(!this.tabCheck && !isLoadData){
                Chat.WhTalk.msgCnt++;
                this.refreshTips();
            }
            //设置当前聊天的老师助理
            if(!isLoadData && Data.userInfo.userId!=fromUser.userId){
                this.setWhCS(fromUser);
            }
            //如果不是加载历史消息记录，则下一次对话不带咨询内容（加载推送私聊消息时，会设定咨询内容，当有新的对话的时候，会清空咨询内容）
            if(!isLoadData){
                this.askMsgObj = null;
            }
            //私聊消息咨询内容
            if(isLoadData && fromUser.toUser && Util.isValid(fromUser.toUser.question)){
                var csTmp = this.setWhCS({userId : fromUser.toUser.userId});
                this.receiveWhMsg({
                    content : {
                        maxValue : "",
                        msgType : "text",
                        status : 1,
                        value : fromUser.toUser.question
                    },
                    fromUser : {
                        nickname : csTmp.userName,
                        userId : csTmp.userNo,
                        userType : csTmp.userType,
                        avatar : csTmp.avatar,
                        publishTime : fromUser.toUser.publishTime
                    }
                },false,true);
            }
        },

        /**
         * 推送消息
         */
        pushMsg : function(){
            if(!this.currCS){
                this.setWhCS();
            }
            if(!this.pushObj){
                return;
            }
            if(this.currCS){
                this.receiveWhMsg({
                    content : {
                        maxValue : "",
                        msgType : "text",
                        status : 1,
                        value : this.pushObj.info
                    },
                    fromUser : {
                        nickname : this.currCS.userName,
                        userId : this.currCS.userNo,
                        userType : this.currCS.userType,
                        avatar : this.currCS.avatar,
                        publishTime : this.pushObj.publishTime
                    }
                },false,false);
                this.askMsgObj = this.pushObj;
                this.pushObj = null;
            }
        },

        /**
         * 发送私聊信息
         * @param sendObj
         */
        sendWhMsg : function(sendObj){
            if(!this.currCS){
                this.setWhCS();
            }
            if(!this.currCS){
                Pop.msg("老师助理不在线，暂不可私聊！");
                return ;
            }
            sendObj.fromUser.toUser = {
                userId : this.currCS.userNo,
                nickname : this.currCS.nickname,
                talkStyle : 1,
                userType : this.currCS.userType
            };
            if(this.askMsgObj){
                sendObj.fromUser.toUser.question=this.askMsgObj.info;
                sendObj.fromUser.toUser.questionId=this.askMsgObj.infoId;
                sendObj.fromUser.toUser.publishTime=this.askMsgObj.publishTime;
            }
            Chat.WhTalk.receiveWhMsg(sendObj,true,false);//直接把数据填入内容栏
            if(sendObj.content.msgType != Data.msgType.img) {
                Chat.socket.emit('sendMsg', sendObj);//发送数据
            }
            chatAnalyze.setUTM(false,$.extend({operationType:8, userTel: $('#person_mb').text(),roomName:$('#currStudioInfo').attr('rn')}, Data.userInfo, Tool.courseTick.course));//统计发言次数
        }
    },

    /**
     * 显示工具栏
     */
    showTool : function(type){
        if(type == Chat.chatToolView){
            return;
        }
        // none-不显示 analyst-仅显示@ btns-显示@且显示工具栏 face显示表情
        switch (Chat.chatToolView){
            case "none":
                $("#chat_tools").show();
                break;

            case "analyst":
                if(type != "btns"){
                    $("#chat_tool1").fadeOut(300);
                }
                break;

            case "btns":
                if(type != "analyst"){
                    $("#chat_tool1").fadeOut(300);
                }
                $("#chat_tool2").slideUp(300);
                break;

            case "face":
                $("#chat_tool3").slideUp(300);
                break;
        }
        switch (type){
            case "none":
                $("#chat_tools").hide();
                break;

            case "analyst":
                if(Chat.chatToolView != "btns" && Chat.cntAdmin + Chat.cntAnalyst > 0){
                    $("#chat_tool1").fadeIn(300);
                }
                break;

            case "btns":
                if(Chat.chatToolView != "analyst" && Chat.cntAdmin + Chat.cntAnalyst > 0){
                    $("#chat_tool1").fadeIn(300);
                }
                $("#chat_tool2").slideDown(300);
                break;

            case "face":
                $("#chat_tool3").slideDown(300);
                break;
        }
        Chat.chatToolView = type;
    },

    /**
     * 表情控制
     */
    face:{
        initFace : false,

        /**
         * 初始化
         */
        init : function($panel, $assign, path, disabled){
            if(this.initFace){
                return;
            }
            this.build($panel, path);

            /**表情分页滑动*/
            new Swiper($panel.parent(), {
                pagination: '.swiper-pagination',
                paginationClickable: true
            });

            /**
             * 表情选择事件
             */
            $panel.find("img").bind("click", {
                panel : $panel,
                assign : $assign,
                disabled : disabled
            }, function(e){
                if(!e.data.disabled){
                    e.data.assign.append($(this).clone()).trigger("input").focusEnd();
                }
            });
            this.initFace = true;
        },
        /**
         * 构建表情
         * @param $panel
         * @param path
         */
        build : function($panel, path){
            var loc_face = [];
            var step = 7;
            for(var i = 1; i <= 75; i+=21){
                loc_face.push('<div class="swiper-slide"><table border="0" cellspacing="0" cellpadding="0">');
                for(var j = i, lenJ = Math.min(i + 20, 75); j <= lenJ; j++){
                    if(j % step == 1){
                        loc_face.push('<tr>');
                    }
                    loc_face.push('<td><img src="' + path + j + '.gif"/></td>');
                    if(j % step == 0 || j == lenJ){
                        loc_face.push('</tr>');
                    }
                }
                loc_face.push('</table></div>');
            }
            $panel.html(loc_face.join(""));
            //$(window).trigger("resize");
        }
    },

    /**
     * 设置并压缩图片
     */
    setUploadImg:function(base64Data, toUser){
        var uiId = Chat.getUiId();

        //先填充内容框
        var formUser={};
        Util.copyObject(formUser,Data.userInfo,true);
        formUser.toUser=toUser;
        var sendObj={uiId:uiId,fromUser:formUser,content:{msgType:Data.msgType.img,value:'',needMax:0,maxValue:''}};
        if(Chat.WhTalk.tabCheck) {
            Chat.WhTalk.sendWhMsg(sendObj);
        }else{
            this.receiveMsg(sendObj,true,false);
        }
        sendObj.content.value=base64Data;
        this.zipImg(sendObj,100,60,function(result,value){//压缩缩略图
            if(result.error){
                alert(result.error);
                $('#'+uiId).remove();
                return false;
            }
            var aObj=$("#"+result.uiId+" .dcont a");//[contt='a']
            aObj.attr("href", value)
                .children("img").attr("src",value).attr("needMax",result.content.needMax);
            Chat.dataUpload(result);
        });
    },

    /**
     * 图片压缩
     * @param sendObj
     * @param max
     * @param quality 压缩量
     * @param callback
     */
    zipImg:function(sendObj,max,quality,callback){
        var image = new Image();
        // 绑定 load 事件处理器，加载完成后执行
        image.onload = function(){
            var canvas = document.createElement('canvas');
            if(!canvas){
                callback({error:'发送图片功能目前只支持Chrome、Firefox、IE10或以上版本的浏览器！'});
            }
            var w = image.width;
            var h = image.height;
            if(h>=9*w){
                callback({error:'该图片高度太高，暂不支持发送！'});
                return false;
            }
            if(max>0) {
                if ((h > max) || (w > max)) {     //计算比例
                    sendObj.content.needMax=1;
                    if(h>max && w<=max){
                        w= (max/h)*w;
                        h = max;
                    }else{
                        h = (max / w) * h;
                        w = max;
                    }
                    image.height = h;
                    image.width = w;
                }
            }
            var ctx = canvas.getContext("2d");
            canvas.width = w;
            canvas.height = h;
            // canvas清屏
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 将图像绘制到canvas上
            ctx.drawImage(image, 0, 0, w, h);
            callback(sendObj,canvas.toDataURL("image/jpeg",quality/100));
        };
        image.src = sendObj.content.value;
    },
    /**
     * 数据上传
     * @param data
     */
    dataUpload:function(data){
        //上传图片到后端
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/studio/uploadData');
        xhr.addEventListener("progress", function(e){
            if (e.lengthComputable) {
                var ra= ((e.loaded / e.total *100)|0)+"%";
                $("#"+data.uiId+" .shadow-box").css({height:"'+ra+'"});
                $("#"+data.uiId+" .shadow-conut").html(ra);
            }
        }, false);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("dataUpload success!");
            }
        };
        data.fromUser.socketId=this.socket.id;
        xhr.send(JSON.stringify(data)); //发送base64
    },
    /**
     * 显示新消息数量角标
     */
    showChatMsgNumTip : function(isClear){
        var $tip = $("#chatMsgCount");
        if(isClear){
            $tip.data("cnt", 0).html("").hide();
        }else{
            if($('#room_talk').is(':hidden')){
                var cnt = ($tip.data("cnt") || 0) + 1;
                $tip.data("cnt", cnt).html(cnt).css("display", "inline-block");
            }
        }
    }
};