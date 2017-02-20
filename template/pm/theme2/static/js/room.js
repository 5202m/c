/**
 * 直播间手机版房间内页
 * author Dick.guo
 */
var Room = new Container({
    panel : $("#page_room"),
    url : "/pm/theme2/template/room.html",
    onLoad : function(){
        Player.init();
        Room.setEvent();
        ClassNote.setEvent();
    },
    onShow : function(){
        Room.initPage();
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
        if(isChangeRoom){ //房间已经切换，
            Room.currGroupId = room.id;
            $("#room_roomName").html(room.name);
            Player.startPlay();
            ClassNote.init();
            Chat.init();
        }
    });
};

/**
 * 绑定页面事件
 */
Room.setEvent = function(){
    /**返回房间列表*/
    $("#room_back").bind("click", Container.back);

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
    });

    /** 老师简介 */
    $("#room_teacher").bind("click", function(){
        Analyst.userNo = $(this).attr('userNo');
        Analyst.load();
    });

    /**
     * 晒单墙
     */
    $('#room_showTrade').bind('click', function(){
        ShowTrade.load();
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
            $("#room_teacher").attr("userno", lecturer.userNo).show();
            $("#room_teacherAvatar").attr("src", lecturer.avatar || "");
            $("#room_teacherName").text(lecturer.userName || "");
        }else{
            $("#room_teacher").hide();
        }
    });
};