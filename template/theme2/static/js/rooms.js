/**
 * 直播间手机版房间列表页
 * author Dick.guo
 */
var Rooms = new Container({
    panel: $("#page_rooms"),
    url: "/theme2/template/rooms.html",
    onLoad: function() {
        this.setAdvertisement();
        this.setStudioRoomList();
    },
    onShow: function() {
        $('body').attr('class', 'home');
    },
    onHide: function() {
        $('body').attr('class', 'home bgfff');
    }
});

/**
 * 设置广告
 */
Rooms.setAdvertisement = function() {
    var html = [];
    Index.getArticleList({
        code: "advertisement",
        platform: "studio_home",
        pageSize: 5,
        orderByStr: '{"sequence":"desc","publishStartDate":"desc"}'
    }, function(dataList) {
        if (dataList.result == 0) {
            var data = dataList.data;
            for (var i in data) {
                html.push(Rooms.formatHtml("banner", (Util.isBlank(data[i].linkUrl) ? "javascript:void(0);" : data[i].linkUrl), data[i].mediaUrl, data[i].detailList[0].title).replace('/theme2/img/noviceGuide/banner-1.jpg', data[i].mediaUrl));
                if (data.length > 1) {
                    $("#position").append('<span class="' + (parseInt(i) == 0 ? 'p-click' : '') + '"></span>');
                }
            }
            $("#slider ul").empty().html(html.join(''));
            if (data && data.length > 1) {
                new Swiper('.scroll-imbd', {
                    pagination: '.dot-infobox',
                    paginationClickable: true,
                    loop: true,
                    autoplay: 5000,
                    autoplayDisableOnInteraction: false,
                });
            }
        }
    });
};

/**
 * 获取房间列表
 */
Rooms.setStudioRoomList = function() {
    var html = [],
        trainObj = null,
        currDate = Util.formatDate(Data.serverTime, 'yyyy-MM-dd');
    Data.getRoomList(function(rooms) {
        var cls = ['blue', 'red', 'green', 'brown','green2'],
            trainNum = 0;
        $.each(rooms, function(i, row) {
            if (row.roomType == 'train') {
                if (trainNum == 0) {
                    html.push(Rooms.formatHtml("roomInfo",
                        '',
                        'brown',
                        '精品培训班',
                        row.roomType
                    ));
                    trainNum++;
                }
                if (row.openDate.beginDate <= currDate && row.openDate.endDate >= currDate) {
                    trainObj = row;
                }
            } else {
                var loc_index = Util.randomIndex(3), uurl = '';
                if (row.roomType == 'simple') {
                    loc_index = 2;
                } else if (row.roomType == 'normal') {
                    loc_index = 0;
                    if(row.name.split('(').length > 1){
                        if(row.name.length > 6){
                            row.name = row.name.substring(0,6).concat('...');
                        }
                        loc_index = 4;
                    }
                } else {
                    loc_index = 1;
                }
                uurl = Util.format('/theme2/img/block-bg{0}.jpg', loc_index + 1);
                html.push(Rooms.formatHtml("roomInfo",
                    row.id,
                    cls[loc_index],
                    row.name,
                    row.roomType).replace('/theme2/img/block-bg4.jpg', uurl));
            }
        });
        $('#roomList').empty().html(html.join(''));
        if ($('#roomList .block-item a[rt="train"]').size() > 0 && trainObj) {
            $('#roomList .block-item a[rt="train"] .item-hd .course-info .course-time').text(trainObj.openDate.beginDate + '~' + trainObj.openDate.endDate);
            $('#roomList .block-item a[rt="train"] .item-hd .course-info .teacher').text(trainObj.name);
            $('#roomList .block-item a[rt="train"] .item-hd .course-info .courseTitle').text(trainObj.remark);
        }
        $('#roomList .block-item a[rt="train"] .item-hd .block-tit .listenership').hide();
        Rooms.setRoomCourseList();
        Rooms.setEvent();
    });
};

/**
 * 获取直播时间及课程信息
 */
Rooms.setRoomCourseList = function() {
    Data.getSyllabuses(function(syllabuses) {
        $('#roomList .block-item a[gi]').each(function() {
            var $this = $(this);
            var roomId = $this.attr("gi");
            //在线人数
            var size = (Data.onlineNumMap && Data.onlineNumMap[roomId]) || 0;

            Data.getRoom(roomId, function(room) {
                if (room && room.isOpen && room.allowVisitor && size <= 200) {
                    size += size <= 10 ? 60 : (200 / size) * 3 + 10;
                    size = Math.round(size);
                    size ++;
                }else if (room && room.isOpen && room.allowVisitor && size > 200){
                    size = size + 300;//pc对于人数多的计算规则复杂，此处直接+300
                    size ++;
                }
                $this.find(".item-hd .block-tit .listenership span").text(size);
            });
            //课程安排
            Data.getSyllabusPlan(roomId, function(syllabusPlan) {
                if (syllabusPlan && syllabusPlan.startTime) {
                    $this.find('.item-hd .course-info .course-time').text(syllabusPlan.startTime + '~' + syllabusPlan.endTime);
                    $this.find('.item-hd .course-info .teacher').text(syllabusPlan.lecturer);
                    $this.find('.item-hd .course-info .courseTitle').text(syllabusPlan.title);
                }
            });
        })
    });
};

/**
 * 绑定页面各类事件
 */
Rooms.setEvent = function() {
    this.setEventRoom();
};

/**
 * 设置房间事件：房间介绍展示
 */
Rooms.setEventRoom = function() {
    /**
     * 进入房间
     */
    $('#roomList .block-item a').bind('click', function() {
        if ($(this).attr("rt") == 'train') {
            //培训班
            Trains.load();
        } else if ($(this).attr("rt") == 'simple') {
            //新手学堂
            Novice.currentRoomId = $(this).attr("gi");
            Novice.load();
        } else {
            Rooms.entryRoom($(this).attr("gi"));
        }
    });
};

/**
 * 进入房间
 */
Rooms.entryRoom = function(roomId) {
    if (roomId == Data.userInfo.groupId) {
        //当前已经在房间
        Room.load();
        return;
    }
    Trains.changeRoom(roomId);
};

/**
 * 检查进入房间权限
 */
Rooms.checkRoomAuth = function(room) {
    var result = { isOK: false, msg: "" };
    if (room) {
        if (!Util.containSplitStr(room.clientGroup, Data.userInfo.clientGroup)) {
            result.msg = "您没有访问该房间的权限";
        } else if (room.status == "2") { //授权访问
            if (room.trainAuth != 1) {
                result.msg = "该房间仅对指定客户开放";
            } else {
                result.isOK = true;
            }
        } else {
            result.isOK = true;
        }
    }
    return result;
};

/**
 * 显示切换房间提示
 * @param msg
 */
Rooms.showChangeRoomMsg = function(msg) {
    Pop.msg(msg);
};