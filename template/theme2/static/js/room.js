/**
 * 直播间手机版房间内页
 * author Dick.guo
 */
var Room = new Container({
    panel : $("#page_room"),
    url : "/theme2/template/room.html",
    lastTimeStamp : 0,
    lastScrollTop : 0,
    subscribeOpType : 1 , //订阅操作类型  1：订阅 2：取消订阅
    onLoad : function(){
        Player.init();
        Room.setEvent();
        Tool.getAllMarketPrice.init();
        Chat.setEvent();
    },
    onShow : function(){
        Room.initPage();
        Room.loadRoomClassNote();
        Room.handleNoviceRoom();
    },
    onHide : function(){
        Player.player.clear($("#roomVideo"));
    }
});

/**
 * 新手专区房间临时处理
 * 后续需要重新规划
 */
Room.handleNoviceRoom = function () {
    var currentRoomId = Data.userInfo.groupId;
    var rooms = Data.roomList || [{id:'studio_42',roomType:'simple'}];
    var noviceRoom = false;
    $.each(rooms,function (i,row) {
       if(row.roomType === 'simple' && row.id === currentRoomId){
           $("#room_chat").trigger('click');
           noviceRoom = true;
           $('#chat_close').hide();
           return false;
       }
    });
    if(!noviceRoom){
        $('#chat_close').show();
        $('#chat_close').trigger('click');
    }
}


/**当前显示的房间编号*/
Room.currGroupId = null;

/**
 * 初始化页面
 */
Room.initPage = function(){
    Data.getRoom(function(room){
        var isChangeRoom = room.id != Room.currGroupId;
        Chat.WhTalk.enable = room.allowWhisper;
        Chat.WhTalk.whisperRoles = room.whisperRoles;
        if(isChangeRoom){ //房间已经切换，
            Room.currGroupId = room.id;
            $("#room_roomName").html(room.name);
            Player.startPlay();
            Chat.init();
            Room.showCourse();
            PrivateChat.isChangeRoom = true;
        }
    });
};

Room.loadRoomClassNote = function(){
    //查看交易策略是否授权 //查看喊单/挂单是否授权
    ClassNote.strategyIsNotAuth = -1, ClassNote.callTradeIsNotAuth = -1;
    Room.lastTimeStamp = 0, Room.lastScrollTop = 0;
    //初始化数据
    $("#classNote_panel").empty();
    ClassNote.getAuthConfig(function(){
        //ClassNote.loadData(null, true);
        Room.loadRoomClassNoteData();
    })
};

/**
 * 绑定页面事件
 */
Room.setEvent = function(){
    /**返回房间列表*/
    $("#room_back").bind("click", function(){
        Container.back();
        if(Chat.socket){
            Chat.socket.disconnect();
            Chat.socket = null;
            Player.player.clear($("#roomVideo"));
            Room.currGroupId = null;
            $('#chat_msg,#classNote_panel').empty();
        }
    });

    /** 节目列表 */
    $("#room_syllabus").bind("click", function(){
        Syllabus.load();
    });

    /** 聊天室 */
    $("#room_chat").bind("click", function(){
        $("#room_classnote").hide();
        $("#room_foot").hide();
        $("#room_talk").show();
        Chat.setHeight();
        Chat.setTalkScroll(true);
        Chat.showChatMsgNumTip(true);
        $('#page_room').removeClass('bgfff');
        $('#page_room').addClass('bgf2f2f2');
    });

    $("#room_teacher,#pride_teacher").bind("click", function(){
        $(this).next('.teacher-ops').toggle();
    });
    /** 老师简介 */
    $('#room_teacherOps').on('click','.more-ops',function () {
        Analyst.userNo = $('#room_teacher').attr('userNo');
        $('#room_teacherOps').toggle();
        Analyst.load();
    })
    /**
     * 晒单墙
     */
    $('#room_showTrade').bind('click', function(){
        ShowTrade.load();
        ShowTrade.showShowTradeNumTip(true);
    });
    /**
     * 滚动监听
     */
    $('article.content_w').scroll(function(){
        var _top = $(this).scrollTop();
        var _fixh = 0;
        var _obj = $(this).find('.video-infos');
        _obj.each(function(){
            var _objfix = $(this).find('.infos-block');
            var _prevobj = $(this).prevAll();
            _prevobj.each(function(){
                _fixh += !$(this).is(':visible')? 0 : $(this).outerHeight(true);
            });
            if(_top>_fixh) _objfix.addClass('fixed-bar')
            else _objfix.removeClass('fixed-bar')
        })
    });
    /**
     * 展开交易策略
     */
    $('#classNote_panel').on('click', '.txt-block .toggle-op-btn', function(){
        $(this).find('i').toggleClass('i-arrow-up i-arrow-down');
        $(this).closest('.txt-block').children('.txt-details').toggleClass('sildeup');
        $(this).closest('.txt-block').children('.txt-details').children('.details-item-list').toggleClass('sildeup');
        $(this).closest('.txt-block').children('.txt-details').children('.call-infos').toggleClass('dn');
    });
    /**
     * 点击直播精华
     */
    $('#room_pride').bind('click', function(){
        ClassNote.load();
    });

    /**
     * 查看数据
     */
    $("#classNote_panel").on("click", ".btn-group", function () {
        //(判断用户是否登录)
        if (Data.userInfo.isLogin) {
            ClassNote.viewData($(this));
        } else {
            Login.load();
        }
    });

    /**
     * 滚动到末尾加载数据
     */
    $('#page_room').scroll(function (e) {
        if ((e.timeStamp - Room.lastTimeStamp) < 150) {
            return;
        } else {
            Room.lastTimeStamp = e.timeStamp;
        }
        var viewH = $(this).height(),//可见高度
            contentH = $(this).get(0).scrollHeight,//内容高度
            scrollTop = $(this).scrollTop();//滚动高度
        if (scrollTop / (contentH - viewH) >= 0.95 && scrollTop > Room.lastScrollTop) {
            Room.lastScrollTop = scrollTop;
            Room.loadRoomClassNoteData(true);
        } else {
            Room.lastTimeStamp = 0;
        }
    });

    /**
     * 打开微信QRCode
     */
    $('#room_teacherOps').on('click', 'a.add-wx', function(){
        $('#teacherWechat').show();
    });
    /**
     * 关闭微信QRCode
     */
    $('#teacherWechat').on('click', '.popcon .i-close3', function(){
        $('#teacherWechat').fadeOut();
    });
    /**
     * 打开打赏
     */
    $('#room_teacherOps').on('click', 'a.add-ds', function(){
        $('#teacherDollar').show();
    });
    /**
     * 关闭打赏
     */
    $('#teacherDollar').on('click', '.popcon .i-close3', function(){
        $('#teacherDollar').fadeOut();
    });
    /**
     * 下载微信图片
     */
    $('#teacherWechat,#teacherDollar').on('click','i.i-download',function (e) {
        //图片存在，则下载
        if($(this).parent().prev().attr('src')){
            Util.downloadByUrl($(this).parent().prev().attr('src'),$(this).parent()[0]);
        }else{
            e.preventDefault();
        }
    });

    /**
     * 点赞
     */
    $('#room_teacherOps').on('click', 'ul li a.support', function(){
        Subscribe.setPraise($(this), $(this).children('label'));
    });
    /**
     * 订阅
     */
    $('#room_teacherOps').on('click','a.subscribe',function (e) {
        if(!Data.userInfo.isLogin){
            Login.load();
            return false;
        }
        var $this = $(this), id = '', types = $this.attr('type').split(',');
        var typeLen = types.length;
        var analystArr = [];
        var currAnalyst = $this.attr('analystId');
        if ($this.attr('lrid') || $this.attr('ssid') || $this.attr('tsid')) {
            Room.subscribeOpType = 2;
        } else {
            analystArr.push(currAnalyst);//未订阅的，则加入到订阅列表
            Room.subscribeOpType = 1;
        }
        $.each(types, function (k, v) {
            if (v == 'live_reminder') {
                id = $this.attr('lrid');
            } else if (v == 'shout_single_strategy') {
                id = $this.attr('ssid');
            } else if (v == 'trading_strategy') {
                id = $this.attr('tsid');
            }
            Subscribe.setSubscribe($this, id, v, analystArr, k == (typeLen - 1),Room.followHander);
        });
    });
};
/**
 * 订阅回调处理
 * @param isOK
 */
Room.followHander = function(isOK){
    var obj = $("#roomSubscribe");
    //取消订阅
    if(Room.subscribeOpType === 2 && isOK){
        obj.attr('lrid',''),obj.attr('ssid',''),obj.attr('tsid','');
        obj.children('label').html('订阅');
        return;
    }else if(Room.subscribeOpType === 1 && isOK){
        obj.children('label').html('已订阅');
    }
    Subscribe.setSubscribeAttr(obj,obj.attr('analystId'));
};
/**
 * 显示讲师信息
 */
Room.showLecturer = function(lecturerId){
    if(!lecturerId){
        Data.getRoom(function(room){
            lecturerId = room && room.defaultAnalyst && room.defaultAnalyst.userNo;
            if(lecturerId){
                Room.showLecturer(lecturerId);
            }else{
                $("#room_teacher").hide();
            }
        });
        return;
    }
    Data.getAnalyst(lecturerId, function(lecturer){
        Room.setLecturerTool(lecturerId);
        if(lecturer){
/*            //设置私聊老师数据    （目前屏蔽私聊老师功能）
            var obj = {
                avatar:lecturer.avatar === '' ? '/theme2/img/h-avatar1.png' : lecturer.avatar,
                position:lecturer.position,
                userName:lecturer.userName,
                userNo:lecturer.userNo,
                userType : 2,
                type : 'analyst'};
            PrivateChat.talkers = [];
            PrivateChat.talkers.push(obj);
            Chat.WhTalk.analyst = obj;
            Chat.WhTalk.setWhCS();*/
            var tagHtml = [];
            $("#room_teacher,#pride_teacher").attr("userno", lecturer.userNo).show();
            $("#room_teacherAvatar,#pride_teacherAvatar").attr("src", lecturer.avatar || "");
            $("#room_teacherName,#pride_teacherName").text(lecturer.userName || "");
            var tags = Util.isNotBlank(lecturer.tag)?lecturer.tag.replace(/\s*，\s*/g, ',').split(','):[];
            $.each(tags, function(i, v){
                tagHtml.push(Room.formatHtml('analyst_tags', v));
            });
            $('#roomAnalystTag,#prideAnalystTags').empty().html(tagHtml.join(''));
        }else{
            $("#room_teacher").hide();
/*            PrivateChat.talkers = [];
            Chat.WhTalk.setWhCS();*/
        }
    });
};

Room.setLecturerTool = function (lecturerId) {
    if(!lecturerId) return;
    Util.postJson('/getShowTeacher',{data:JSON.stringify({groupId:Data.userInfo.groupId,authorId:lecturerId})},function(data) {
        var userInfo = data.userInfo;
        if(userInfo){
            var toolHtml = '<i class="tri3"></i>' + Room.formatHtml('room_teacherTool', userInfo.praiseNum, userInfo.userNo);
            $('#room_teacherOps').html(toolHtml);
            var wechatHtml = Room.formatHtml('teacherWechat', userInfo.wechatCode,userInfo.wechatCodeImg).replace('/theme2/img/qr-code.png',userInfo.wechatCodeImg);
            var dollarHtml = Room.formatHtml('teacherDollar', userInfo.wechatCode,userInfo.wechatCodeImg).replace('/theme2/img/qr-code.png',userInfo.wechatCodeImg);
            $('#teacherWechat').empty().html(wechatHtml);
            $('#teacherDollar').empty().html(dollarHtml);
            Subscribe.setSubscribeAttr($('#roomSubscribe'),lecturerId);
            Subscribe.setSubscribeType(function (subscribeType) {
                console.log(subscribeType);
                if(lecturerId === subscribeType.userId){
                    var type = $('#roomSubscribe').attr('type');
                    var types = type==='' ? [] : type.split(',');
                    types.push(subscribeType.code);
                    $('#roomSubscribe').attr('type',types.join(','));
                    return false;
                }
            });
        }

    });
}
/**
 * 显示当前课程及时间
 */
Room.showCourse = function(){
    Data.getSyllabusPlan(function(course){
        if(course){
            $('#roomCourse .s1,#prideCourse .s1').text(course.title);
            $('#roomCourse .s2,#prideCourse .s2').text(Util.formatDate(course.date, 'yyyy.MM.dd')+' '+course.startTime+'~'+course.endTime);
        }
    });
};

/**
 * 切换页面
 * @param groupId
 */
Room.toRefreshView = function(groupId){
    Data.userInfo.groupId = groupId;
    Room.load();
};

/**
 * 加载房间的直播精华数据
 */
Room.loadRoomClassNoteData = function (isMore) {
    var noteId = isMore ? $("#classNote_panel>[dataid]:last") : $("#classNote_panel>[dataid]:first");
    if (noteId.size() > 0) {
        noteId = noteId.attr("dataid") || "";
    } else {
        noteId = "";
    }
    Index.getArticleList({
        code: "class_note",
        platform: Data.userInfo.groupId,
        hasContent: 1,
        pageSize: 5,
        pageKey: noteId || "",
        pageLess: isMore ? 1 : 0,
        isAll: 1,
        ids: "",
        callTradeIsNotAuth: 0,
        strategyIsNotAuth: 0
    }, function (dataList) {
        if (dataList && dataList.result == 0) {
            var dataArr = dataList.data || [];
            Room.appendClassNoteData(dataArr, isMore ? isMore : false);
        }
    });
};
/**
 * 数据追加
 * @param dataArr
 * @param isMore
 */
Room.appendClassNoteData = function (dataArr, isMore) {
    var html = [];
    for (var i = 0, lenI = !dataArr ? 0 : dataArr.length; i < lenI; i++) {
        html.push(ClassNote.getRoomClassNoteHtml(dataArr[i]));
    }
    if (isMore) {
        $("#classNote_panel").append(html.join(""));
    } else {
        $("#classNote_panel").prepend(html.join(""));
    }
};