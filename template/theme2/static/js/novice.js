/**
 * Created by ant.ding on 2017/3/13.
 * 新手专区首页
 */
var Novice = new Container({
    panel : $("#page_novice"),
    url : "/theme2/template/novice.html",
    currentRoomId : 'studio_42', //当前新手专区直播间房号
    onLoad : function(){
        Novice.setEvent();
        Novice.setAdvertisement();
    },
    onShow : function () {
        Novice.setRoomCourseInfo();
        if (Util.isAppEnv()) {
            $('#novice_simuopen').attr('href','https://m.24k.hk/demoaccount_open.html?clientSource=app');
            $('#novice_realopen').attr('href','https://m.24k.hk/realaccount_open.html?clientSource=app');
        }
    }
});

/**
 * 设置事件
 */
Novice.setEvent = function(){
    //回退
    $('#novice_back').bind('click', Container.back);

    //入口事件绑定
    $('.novice').bind('click',function () {
        var entryType = $(this).attr('t');
        if(entryType == 'live') {//新手直播间
            Rooms.entryRoom(Novice.currentRoomId);
        }else{//初级.中级.高级
            Teach.currentRank = entryType;
            Teach.load();
        }
    });
};

/**
 * 设置房间直播课程信息
 */
Novice.setRoomCourseInfo = function () {
    //在线人数
    var size = (Data.onlineNumMap && Data.onlineNumMap[Novice.currentRoomId]) || 0;
    Data.getRoom(Novice.currentRoomId, function(room){
/*        if(room && room.isOpen && room.allowVisitor && size<=200){
            size+=size<=10?60:(200/size)*3+10;
            size=Math.round(size);
            size ++;
        }else if (room && room.isOpen && room.allowVisitor && size > 200){
            size = size + 300;//pc对于人数多的计算规则复杂，此处直接+300
            size ++;
        }*/
        size = Util.calculateRoomOnlineNum(room,size);
        $('.block-item.item-green.novice').find(".listenership span").text(size);
    });
    //课程安排
    Data.getSyllabusPlan(Novice.currentRoomId, function(syllabusPlan){
        if(syllabusPlan && syllabusPlan.startTime){
            $('.block-item.item-green.novice').find('.item-hd .course-info .course-time').text(syllabusPlan.startTime+'~'+syllabusPlan.endTime);
            $('.block-item.item-green.novice').find('.item-hd .course-info .teacher').text(syllabusPlan.lecturer);
            $('.block-item.item-green.novice').find('.item-hd .course-info .courseTitle').text(syllabusPlan.title);
        }
    });
}

/**
 * 新手专区广告轮播
 */
Novice.setAdvertisement = function(){
    var html = [];
    Index.getArticleList({
        code : "advertisement",
        platform : Novice.currentRoomId,
        pageSize : 5,
        orderByStr : '{"sequence":"desc","publishStartDate":"desc"}'
    },function(dataList){
        if(dataList.result==0){
            var data=dataList.data;
            for(var i in data){
                html.push(Novice.formatHtml("noviceBanner"
                    , (Util.isBlank(data[i].linkUrl)?"javascript:void(0);":data[i].linkUrl)
                    //, data[i].mediaUrl
                    , data[i].detailList[0].title).replace('/theme2/img/noviceGuide/banner-1.jpg',data[i].mediaUrl));
                if(data.length>1){
                    $("#novicePosition").append('<span class="'+(parseInt(i)==0?'p-click':'')+'"></span>');
                }
            }
            $("#noviceSlider ul").empty().html(html.join(''));
            if(data && data.length>1){
                new Swiper('.noviceSwiper', {
                    pagination: '.noviceSwiperPage',
                    paginationClickable: true,
                    loop: true,
                    autoplay: 5000,
                    autoplayDisableOnInteraction: false,
                });
            }
        }
    });
};