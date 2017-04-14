/**
 * 直播间手机版房间内页
 * author Dick.guo
 */
var Room = new Container({
    panel : $("#page_room"),
    url : "/theme2/template/room.html",
    wechatCode : null,
    onLoad : function(){
        Player.init();
        Room.setEvent();
        Tool.getAllMarketPrice.init();
        Chat.setEvent();
    },
    onShow: function() {
        Room.initPage();
        Room.loadRoomClassNote();
        Room.handleNoviceRoom();
        if(Util.isAppEnv())$('.upload-pic').parent().remove();
    },
    onHide: function() {
        Player.player.clear($("#roomVideo"));
    }
});

/**
 * 新手专区房间临时处理
 * 后续需要重新规划
 */
Room.handleNoviceRoom = function() {
    var currentRoomId = Data.userInfo.groupId;
    var rooms = Data.roomList || [{ id: 'studio_42', roomType: 'simple' }];
    var noviceRoom = false;
    $.each(rooms, function(i, row) {
        if (row.roomType === 'simple' && row.id === currentRoomId) {
            $("#room_chat").trigger('click');
            noviceRoom = true;
            $('#chat_close').hide();
            return false;
        }
    });
    if (!noviceRoom) {
        $('#chat_close').show();
        $('#chat_close').trigger('click');
    }
};


/**当前显示的房间编号*/
Room.currGroupId = null;

/**
 * 初始化页面
 */
Room.initPage = function() {
    Data.getRoom(function(room) {
        var isChangeRoom = room ? (room.id != Room.currGroupId) : false;
        Chat.WhTalk.enable = room.allowWhisper, Chat.WhTalk.whisperRoles = room.whisperRoles;
        if (isChangeRoom) { //房间已经切换，
            Room.currGroupId = room.id;
            $("#room_roomName").html(room.name);
            Player.startPlay();
            Chat.init();
            Room.showCourse();
            PrivateChat.isChangeRoom = true;
        }
        Room.watchRemind(room);
    });
};

/**
 * 游客累计观看提醒
 * @param room
 */
Room.watchRemind = function(room) {
    //未登录用户进入非新手房间：曾经已看3分钟，直接弹出。否则3分钟之后弹出提示框。
    if (!Data.userInfo.isLogin && room.roomType != "simple") {
        var lgt = room.loginBoxTime,
            lgtTips = room.loginBoxTip || "您已经观看了".concat(lgt).concat("分钟，赶紧登录再继续观看吧"); //后台控制登录弹框时间以及提示语
        if (/\d+(\.\d+)?/.test(lgt)) {
            lgt = parseFloat(lgt);
            if (Store.store("simpleTip")) {
                Room.showUnLoginWatchTip(true, lgt, lgtTips);
            } else {
                window.setTimeout(function() {
                    Store.store("simpleTip", true);
                    Room.showUnLoginWatchTip(true, lgt, lgtTips);
                }, lgt * 60 * 1000);
            }
        }
    } else {
        $('.login-guide').hide();
    }
};

/**
 * 未登录用户观看提示
 * @param isSetEvent
 * @param time
 */
Room.showUnLoginWatchTip = function(isSetEvent, time, tips) {
    /*    Pop.msg({msg:tips,onOK:function () {
            Login.load();
        }});*/
    $('#loginTips').text(tips);
    $('.login-guide').show();
};


Room.loadRoomClassNote = function() {
    //查看交易策略是否授权 //查看喊单/挂单是否授权
    ClassNote.strategyIsNotAuth = -1, ClassNote.callTradeIsNotAuth = -1;
    //初始化数据
    $("#classNote_panel").empty();
    ClassNote.getAuthConfig(function() {
        ClassNote.loadData(null, true, '');
    })
};

/**
 * 绑定页面事件
 */
Room.setEvent = function() {
    /**返回房间列表*/
    $("#room_back").bind("click", function() {
        Container.back();
        if (Chat.socket) {
            Chat.socket.disconnect();
            Chat.socket = null;
            Player.player.clear($("#roomVideo"));
            Room.currGroupId = null;
            $('#chat_msg,#classNote_panel').empty();
        }
    });

    /** 节目列表 */
    $("#room_syllabus").bind("click", function() {
        Syllabus.load();
    });

    /** 聊天室 */
    $("#room_chat").bind("click", function() {
        $("#room_classnote").hide();
        $("#room_foot").hide();
        $("#room_talk").show();
        Chat.setHeight();
        Chat.setTalkScroll(true);
        Chat.showChatMsgNumTip(true);
        $('#page_room').removeClass('bgfff');
        $('#page_room').addClass('bgf2f2f2');
    });

    $("#room_teacher,#pride_teacher").bind("click", function() {
        $(this).next('.teacher-ops').toggle();
    });
    /** 老师简介 */
    $('#room_teacherOps').on('click', '.more-ops', function() {
            Analyst.userNo = $('#room_teacher').attr('userNo');
            $('#room_teacherOps').toggle();
            Analyst.load();
        })
        /**
         * 晒单墙
         */
    $('#room_showTrade').bind('click', function() {
        ShowTrade.load();
        ShowTrade.showShowTradeNumTip(true);
    });
    /**
     * 展开交易策略
     */
    $('#classNote_panel').on('click', '.txt-block .toggle-op-btn', function() {
        $(this).find('i').toggleClass('i-arrow-up i-arrow-down');
        $(this).closest('.txt-block').children('.txt-details').toggleClass('sildeup');
        $(this).closest('.txt-block').children('.txt-details').children('.details-item-list').toggleClass('sildeup');
        $(this).closest('.txt-block').children('.txt-details').children('.call-infos').toggleClass('dn');
    });
    /**
     * 点击直播精华
     */
    $('#room_pride').bind('click', function() {
        ClassNote.load();
    });

    /**
     * 查看数据
     */
    $("#classNote_panel").on("click", ".btn-group", function() {
        //(判断用户是否登录)
        if (Data.userInfo.isLogin) {
            ClassNote.viewData($(this));
        } else {
            Login.load();
        }
    });


    /*    $(window).scroll(function (e) {
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
        });*/

    /**
     * 打开微信QRCode
     */
    $('#room_teacherOps').on('click', 'a.add-wx', function() {
        if(Util.isAppEnv()){
            $('#teacherWechat i').remove();
            var tipText = '扫描上方二维码<br/>或者搜索微信号:'.concat(Room.wechatCode).concat('<br/>就可以加老师为微信好友');
            $('#teacherWechat .pop-msg').html(tipText);
        }
        $('#teacherWechat').show();
    });
    /**
     * 关闭微信QRCode
     */
    $('#teacherWechat').on('click', '.popcon .i-close3', function() {
        $('#teacherWechat').fadeOut();
    });
    /**
     * 打开打赏
     */
    $('#room_teacherOps').on('click', 'a.add-ds', function() {
        if(Util.isAppEnv()){
            $('#teacherDollar i').remove();
            var tipText = '扫描上方二维码<br/>或者搜索微信号:'.concat(Room.wechatCode).concat('<br/>加老师为微信好友<br/>就可以给老师打赏发红包啦');
            $('#teacherDollar .pop-msg').html(tipText);
        }
        $('#teacherDollar').show();
    });
    /**
     * 关闭打赏
     */
    $('#teacherDollar').on('click', '.popcon .i-close3', function() {
        $('#teacherDollar').fadeOut();
    });
    /**
     * 下载微信图片
     */
    $('#teacherWechat,#teacherDollar').on('click', 'i.i-download', function(e) {
        //图片存在，则下载
        if ($(this).parent().prev().attr('src')) {
            Util.downloadByUrl($(this).parent().prev().attr('src'), $(this).parent()[0]);
        } else {
            e.preventDefault();
        }
    });

    /**
     * 点赞
     */
    $('#room_teacherOps').on('click', 'ul li a.support', function() {
        Subscribe.setPraise($(this), $(this).children('label'));
    });
    /**
     * 订阅
     */
    $('#room_teacherOps').on('click', 'a.subscribe', function(e) {
        if (!Data.userInfo.isLogin) {
            Login.load();
            return false;
        }
        var $this = $(this),
            id = '',
            types = $this.attr('type').split(',');
        var typeLen = types.length;
        var analystArr = [];
        var currAnalyst = $this.attr('analystId');
        if ($this.attr('subscribed') != 'true') {
            analystArr.push(currAnalyst); //未订阅的，则加入到订阅列表
        }
        $.each(types, function(k, v) {
            if (v == 'live_reminder') {
                id = $this.attr('lrid');
            } else if (v == 'shout_single_strategy') {
                id = $this.attr('ssid');
            } else if (v == 'trading_strategy') {
                id = $this.attr('tsid');
            }
            Subscribe.setSubscribe($this, id, v, analystArr, k == (typeLen - 1), Room.followHander);
        });
    });

    $('#login_ul').on('click', 'li', function() {
        var _this = $(this);
        var _class = _this.children('div').attr('class');
        if (_class === 'bg-blue') { //登录
            Login.load();
        } else if (_class === 'bg-green') { //新手专栏
            var rooms = Data.roomList || [];
            $.each(rooms,function (index,row) {
               if(row.roomType === 'simple'){
                   Novice.currentRoomId = row.id;
                   return false;
               }
            });
            Novice.load();
        }
    });
};
/**
 * 订阅回调处理
 * @param isOK
 */
Room.followHander = function(isOK) {
    var obj = $("#roomSubscribe");
    //取消订阅
    if (obj.attr('subscribed') === 'true' && isOK) {
        obj.attr('lrid', ''), obj.attr('ssid', ''), obj.attr('tsid', '');
        obj.children('label').html('订阅');
        return;
    } else if (obj.attr('subscribed') != 'true' && isOK) {
        obj.children('label').html('已订阅');
    }
    Subscribe.setSubscribeAttr(obj, obj.attr('analystId'));
};
/**
 * 显示讲师信息
 */
Room.showLecturer = function(lecturerId) {
    if (!lecturerId) {
        Data.getRoom(function(room) {
            lecturerId = room && room.defaultAnalyst && room.defaultAnalyst.userNo;
            if (lecturerId) {
                Room.showLecturer(lecturerId);
            } else {
                $("#room_teacher").hide();
            }
        });
        return;
    }
    Data.getAnalyst(lecturerId, function(lecturer) {
        //此处为隐藏数据延时加载
        setTimeout(function() {
            Room.setLecturerTool(lecturerId);
        }, 500);
        if (lecturer) {
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
            var tags = Util.isNotBlank(lecturer.tag) ? lecturer.tag.replace(/\s*，\s*/g, ',').split(',') : [];
            $.each(tags, function(i, v) {
                tagHtml.push(Room.formatHtml('analyst_tags', v));
            });
            $('#roomAnalystTag,#prideAnalystTags').empty().html(tagHtml.join(''));
        } else {
            $("#room_teacher").hide();
            /*            PrivateChat.talkers = [];
                        Chat.WhTalk.setWhCS();*/
        }
    });
};

/**
 * 显示讲师工具栏
 * @param lecturerId
 */
Room.setLecturerTool = function (lecturerId) {
    if(!lecturerId) return;
    Util.postJson('/getShowTeacher',{data:JSON.stringify({groupId:Data.userInfo.groupId,authorId:lecturerId})},function(data) {
        var userInfo = data.userInfo;
        if(userInfo){
            var toolHtml = '<i class="tri3"></i>' + Room.formatHtml('room_teacherTool', userInfo.praiseNum, userInfo.userNo);
            $('#room_teacherOps').html(toolHtml);
            Room.wechatCode = userInfo.wechatCode;
            var wechatHtml = Room.formatHtml('teacherWechat', userInfo.wechatCode,userInfo.wechatCodeImg).replace('/theme2/img/qr-code.png',userInfo.wechatCodeImg);
            var dollarHtml = Room.formatHtml('teacherDollar', userInfo.wechatCode,userInfo.wechatCodeImg).replace('/theme2/img/qr-code.png',userInfo.wechatCodeImg);
            $('#teacherWechat').empty().html(wechatHtml);
            $('#teacherDollar').empty().html(dollarHtml);
            Subscribe.setSubscribeAttr($('#roomSubscribe'),lecturerId);
            Subscribe.setSubscribeType(function (subscribeType) {
                if(lecturerId === subscribeType.userId){
                    var type = $('#roomSubscribe').attr('type');
                    var types = type==='' ? [] : type.split(',');
                    types.push(subscribeType.code);
                    $('#roomSubscribe').attr('type',types.join(','));
                    $('#roomSubscribe').show();
                    return false;
                }
            });
        }

        });
    }
    /**
     * 显示当前课程及时间
     */
Room.showCourse = function() {
    Data.getSyllabusPlan(function(course) {
        if (course) {
            $('#roomCourse .s1,#prideCourse .s1').text(course.title);
            $('#roomCourse .s2,#prideCourse .s2').text(Util.formatDate(course.date, 'yyyy.MM.dd') + ' ' + course.startTime + '~' + course.endTime);
        }
    });
};

/**
 * 切换页面
 * @param groupId
 */
Room.toRefreshView = function(groupId) {
    Data.userInfo.groupId = groupId;
    Room.load();
};