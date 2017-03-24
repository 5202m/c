/**
 * 直播间手机版房间内页
 * author Dick.guo
 */
var Room = new Container({
    panel : $("#page_room"),
    url : "/theme2/template/room.html",
    onLoad : function(){
        Player.init();
        Room.setEvent();
        ClassNote.setEvent();
        Tool.getAllMarketPrice.init();
        Chat.setEvent();
    },
    onShow : function(){
        Room.initPage();
        ClassNote.init();
        ClassNote.lastTimeStamp = 0;
        ClassNote.lastScrollTop = 0;
    },
    onHide : function(){
        Player.player.clear($("#roomVideo"));
    }
});

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
    });

    /** 老师简介 */
    $("#room_teacher,#pride_teacher").bind("click", function(){
        Analyst.userNo = $(this).attr('userNo');
        Analyst.load();
    });

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
        $('#chat_player,#roomLiveAnalyst,#roomAnalystTagCourse').hide();
        $('#prideTopTitle,#prideShowAnalyst').show();
    });
    /**
     * 点击直播精华关闭按钮
     */
    $('#prideTopClose').bind('click', function(){
        $('#prideTopTitle,#prideShowAnalyst').hide();
        $('#chat_player,#roomLiveAnalyst,#roomAnalystTagCourse').show();
    });
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
