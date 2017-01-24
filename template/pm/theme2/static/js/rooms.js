/**
 * 直播间手机版房间列表页
 * author Dick.guo
 */
var Rooms = new Container({
    panel : $("#page_rooms"),
    url : "/pm/theme2/template/rooms.html",
    onLoad : function(){
        this.setAdvertisement();
        this.setStudioRoomList();
    },
    onShow : function(){
        $('body').attr('class', 'home');
    },
    onHide : function(){
        $('body').attr('class', 'home bgfff');
    }
});

/**
 * 设置广告
 */
Rooms.setAdvertisement = function(){
    var html = [];
    Index.getArticleList({
        code : "advertisement",
        platform : "studio_home",
        pageSize : 5,
        orderByStr : '{"sequence":"desc","publishStartDate":"desc"}'
    },function(dataList){
        if(dataList.result==0){
            var data=dataList.data;
            for(var i in data){
                html.push(Rooms.formatHtml("banner"
                    , (Util.isBlank(data[i].linkUrl)?"javascript:void(0);":data[i].linkUrl)
                    , data[i].mediaUrl
                    , data[i].detailList[0].title));
                if(data.length>1){
                    $("#position").append('<span class="'+(parseInt(i)==0?'p-click':'')+'"></span>');
                }
            }
            $("#slider ul").empty().html(html.join(''));
            if(data && data.length>1){
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
Rooms.setStudioRoomList = function(){
    var html = [], trainObj = null;
    Data.getRoomList(function(rooms){
        var cls = ['blue','red','green','brown'], trainNum = 0;
        $.each(rooms, function(i, row){
            if(row.roomType == 'train' && trainNum == 0){
                html.push(Rooms.formatHtml("roomInfo",
                    '',
                    4,
                    'brown',
                    '精品培训班',
                    row.roomType
                ));
                trainObj = row;
                trainNum++;
            } else {
                var loc_index = Util.randomIndex(4);
                Rooms.templates["roomInfo"]
                html.push(Rooms.formatHtml("roomInfo",
                    row.id,
                    (loc_index == 0 ? loc_index + 1 : loc_index),
                    cls[loc_index],
                    row.name,
                    row.roomType));
            }
        });
        $('#roomList').empty().html(html.join(''));
        if($('#roomList .block-item a[rt="train"]').size()>0 && trainObj) {
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
Rooms.setRoomCourseList = function(){
    Data.getSyllabuses(function(syllabuses){
        $('#roomList .block-item a[gi]').each(function(){
            var $this = $(this);
            var roomId = $this.attr("gi");
            //在线人数
            var size = (Data.onlineNumMap && Data.onlineNumMap[roomId]) || 0;

            Data.getRoom(roomId, function(room){
                if(room && room.isOpen && room.allowVisitor && size<=200){
                    size+=size<=10?60:(200/size)*3+10;
                    size=Math.round(size);
                }
                $this.find(".item-hd .block-tit .listenership span").text(size);
            });
            //课程安排
            Data.getSyllabusPlan(roomId, function(syllabusPlan){
                if(syllabusPlan && syllabusPlan.startTime){
                    $this.find('.item-hd .course-info .course-time').text(syllabusPlan.startTime+'~'+syllabusPlan.endTime);
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
Rooms.setEvent = function(){
    this.setEventRoom();
};

/**
 * 设置房间事件：房间介绍展示
 */
Rooms.setEventRoom = function(){
    /**
     * 进入房间
     */
    $('#roomList .block-item a').bind('click', function(){
        if($(this).attr("rt")=='train'){
            Trains.load();
        }else {
            Rooms.entryRoom($(this).attr("gi"));
        }
    });
};

/**
 * 进入房间
 */
Rooms.entryRoom = function(roomId){
    if(roomId == Data.userInfo.groupId){
        //当前已经在房间
        Room.load();
        return;
    }
    Data.getRoom(roomId, function(room){
        if(room){
            if(!room.allowVisitor && Data.userInfo.clientGroup == "visitor"){
                //TODO 弹出登录框
                return;
            }
            if(room.roomType == "train"){
                Rooms.entryTrain(room);
                return;
            }
            var checkRes = Rooms.checkRoomAuth(room);
            if(checkRes.isOK){
                Util.postJson("/studio/checkGroupAuth",{groupId:room.id},function(result){
                    if(!result.isOK){
                        Rooms.showChangeRoomMsg("您没有访问该房间的权限");
                    }else{
                        Data.userInfo.groupId = result.groupId;
                        Room.load();
                    }
                },true,function(err){
                    if("success"!=err) {
                        Rooms.showChangeRoomMsg("操作失败");
                    }
                });
            }else{
                Rooms.showChangeRoomMsg(checkRes.msg);
            }
        }
    });
};

/**
 * 进入培训班
 * @param room
 */
Rooms.entryTrain = function(room){
    //TODO 进入培训班
    if(room && room.roomType == "train"){
        var msg = null;
        if(room.trainAuth == -1){//未报名
            msg = "您还未报名该培训班";
        }else if(room.trainAuth == 0){//报名审核中
            if(room.isOpen){
                msg = "您的报名正在审批中";
            }else{
                msg = "";
            }
        }
    }
};

/**
 * 检查进入房间权限
 */
Rooms.checkRoomAuth = function(room){
    var result = {isOK:false, msg : ""};
    if(room){
        if(!Util.containSplitStr(room.clientGroup, Data.userInfo.clientGroup)){
            result.msg = "您没有访问该房间的权限";
        }else if(room.status == "2"){ //授权访问
            if(room.trainAuth != 1){
                result.msg = "该房间仅对指定客户开放";
            }else{
                result.isOK = true;
            }
        }else{
            result.isOK = true;
        }
    }
    return result;
};

/**
 * 显示切换房间提示
 * @param msg
 */
Rooms.showChangeRoomMsg = function(msg){
    Pop.msg(msg);
};