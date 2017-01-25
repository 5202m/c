/**
 * 直播间手机版房间内页 -- 聊天功能
 * author Dick.guo
 */
var Chat = {
    socket:null,
    fullscreen : false,
    chatMsgFilter : "all", //all-看所有人 analyst-看分析师 me-与我相关
    chatToolView : "none", //none-不显示 analyst-仅显示@ btns-显示@且显示工具栏 face显示表情

    /**
     * 初始化
     */
    init : function(){
        this.setSocket();
        this.setEvent();
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
            Chat.receiveMsg(data);
        });
        //通知信息
        this.socket.on('notice',function(result){
            switch (result.type){
                case 'onlineNum':
                    Chat.setOnlineUser(result.data);
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

                case 'serverTime':
                    Data.serverTime = result.data;
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
            var $this = $(this);
            Chat.fullscreen = !Chat.fullscreen;
            if(Chat.fullscreen){
                $this.text("边看边聊");
                if(Player.type != "text"){
                    $("#chat_player").slideUp(300);
                    setTimeout(function(){
                        $("#chat_ctrl").addClass('fixed-bar');
                        Chat.setHeight();
                    }, 300);
                }else{
                    $("#chat_ctrl").addClass('fixed-bar');
                    Chat.setHeight();
                }
            }else{
                $this.text("全屏聊天");
                if(Player.type != "text"){
                    $("#chat_player").slideDown(300);
                    setTimeout(function(){
                        $("#chat_ctrl").removeClass('fixed-bar');
                        Chat.setHeight();
                    }, 300);
                }else{
                    $("#chat_ctrl").removeClass('fixed-bar');
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
                        !room || (!room.allowVisitor && "visitor"==studioChatMb.userInfo.clientGroup));
                    $("#chat_cont").focusEnd();
                });
            }else{
                $("#chat_cont").focusEnd();
            }
        });

        /** 发送 */
        $("#chat_send").bind("click", function(){
            //TODO 发送消息
        });
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
            if(Chat.WhTalk.enable && users[i].userType==3){
                Chat.WhTalk.setCSOnline(users[i].userId, true);
            }
            //快捷@
            if(users[i].userType==3 || users[i].userType==2){
                studioChatMb.setFastContact(users[i], true);
            }
        }
        if(Chat.WhTalk.enable){
            Chat.WhTalk.getCSList(); //加载客服列表
        }
    },

    /**
     * 在线用户列表
     * @param data
     */
    setOnlineUser : function(data){
        var userInfoTmp=data.onlineUserInfo;
        if(userInfoTmp.userType==3 && Chat.WhTalk.enable){
            Chat.WhTalk.setCSOnline(userInfoTmp.userId, data.online);
        }
        //快捷@
        if(userInfoTmp.userType==3 || userInfoTmp.userType==2){
            Chat.setFastContact(userInfoTmp, data.online);
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
        Chat.receiveMsg(msgArr);
    },

    /**
     * 接收消息
     */
    receiveMsg : function(data){
        var html = [];
        if(data instanceof Array){
            for(var i = 0, lenI = data ? data.length : 0; i < lenI; i++){
                html.push(Chat.getMsgHtml(data[i], false, true, false));
            }
        }else{
            html.push(Chat.getMsgHtml(data, false, true, false));
        }
        $("#chat_msg").append(html.join(""));
        Chat.setTalkScroll();
        Chat.filterMsg();
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
     */
    setTalkScroll : function(){
        var panel = $("#chat_msg");
        if(panel.scrollTop() + panel.height() + 30 >= panel.get(0).scrollHeight){
            panel.scrollTop(panel[0].scrollHeight);
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
        if(!data.serverSuccess && Data.userInfo.userId == data.fromUser.userId && !data.rule){
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
            if(data.content.msgType==studioChatMb.msgType.img){
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
                fromUser.userId,
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
                        result.avatar = Chat.filePath + '/upload/pic/header/chat/visitor/' + idTmp + '.png">';
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
            studioChatMb.socket.emit("getWhMsg",{
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
                    studioChatMb.formatUserToContent(row, true, result.toUserId);
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
                            csTmp.avatar = common.isValid(cs.avatar)?cs.avatar:'/fx/theme2/img/cm.png';
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
                $('#'+data.uiId+' .uname span').html(studioChatMb.formatPublishTime(fromUser.publishTime));
                $('#'+data.uiId).attr("id",fromUser.publishTime);//发布成功id同步成服务器发布日期
                if(data.content.msgType==studioChatMb.msgType.img){
                    studioChatMb.removeLoadDom(fromUser.publishTime);//去掉加载框
                    var aObj=$('#'+fromUser.publishTime+' span[contt="a"] a');
                    var url=data.content.needMax?'/fxstudio/getBigImg?publishTime='+fromUser.publishTime+'&userId='+fromUser.userId:aObj.children("img").attr("src");
                    aObj.attr("href",url);
                }
                return;
            }
            var dialog=studioChatMb.formatContentHtml(data,isMeSend,isLoadData, true);
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
            studioChatMb.formatMsgToLink(fromUser.publishTime);//格式链接
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
            if(isLoadData && fromUser.toUser && common.isValid(fromUser.toUser.question)){
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
                studioMbPop.showMessage("老师助理不在线，暂不可私聊！");
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
            if(sendObj.content.msgType != studioChatMb.msgType.img) {
                studioChatMb.socket.emit('sendMsg', sendObj);//发送数据
            }
            chatAnalyze.setUTM(false,$.extend({operationType:8, userTel: $('#person_mb').text(),roomName:$('#currStudioInfo').attr('rn')}, Data.userInfo, studioChatMb.courseTick.course));//统计发言次数
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
                if(Chat.chatToolView != "btns"){
                    $("#chat_tool1").fadeIn(300);
                }
                break;

            case "btns":
                if(Chat.chatToolView != "analyst"){
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
};