

var PmGaTrace = {
    
    init : function () {
        PmGaTrace.setEvent();
    },

    setEvent : function () {

        //1.顶部菜单
        //金道直播间logo
        $('.logobar').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','header_logo', 'content_top',1,true]);
        });

        //QQ客服
        $('.rightbar a:eq(0)').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','header_QQ', 'content_top',1,true]);
        });

        //顶部登陆按钮
        $('#header_ui').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','header_login', 'content_top',1,true]);
        });

        //二级页面手机登录
        $('#mobileLogin').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','header_dl_phone', 'content_top',1,true]);
        });

        //二级页面账户登陆
        $('#accountLogin').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','header_dl_account', 'content_top',1,true]);
        });

        //登录
        $('.submit-btn').on('click',function () {
            var currentId = $('.current').attr('id');
            if(currentId == 'mobileLogin'){
                _gaq.push(['_trackEvent', 'm_studio','header_dl_login1', 'content_top',1,true]);
            }else if(currentId == 'accountLogin'){
                _gaq.push(['_trackEvent', 'm_studio','header_dl_login2', 'content_top',1,true]);
            }
        });

        //2.横幅海报
        //顶部banner栏目
        $('#slider>ul li').on('click',function () {
            var index = $(this).attr('data-swiper-slide-index');
            _gaq.push(['_trackEvent', 'm_studio','header_banner', index,1,true]);
        });

        //3.新手专区
        //海报banner栏目.
        $('#noviceSlider>ul li').on('click',function () {
            var index = $(this).attr('data-swiper-slide-index');
            _gaq.push(['_trackEvent', 'm_studio','XS_banner', index,1,true]);
        });

        //新手专区-模拟开户
        $('#teach_simuopen').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','XS_demo', 'content_XS',1,true]);
        });

        //新手专区-真实开户
        $('#teach_realopen').on('click',function () {
            _gaq.push(['_trackEvent', 'm_studio','XS_account', 'content_XS',1,true]);
        });

        //二级页-底部开户按钮
        $('#room_foot .infos-opbar .clearfix li:eq(1)').on('click',function () {
            var groupId = Data.userInfo.groupId, _action = '',_content = '';
            if(groupId == 'studio_3'){//直播大厅
                _action = 'ZB_account',_content = 'content_ZB';
            }else if(groupId == 'studio_24'){//新手专区
                _action = 'XS_account',_content = 'content_XS';
            }else if(PmGaTrace.isTrainRoom()){
                _action = 'PXB_account',_content = 'content_PXB';
            }else if(PmGaTrace.isVipRoom()){
                _action = 'ZC_account',_content = 'content_ZC';
            }
            _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
        });

    },

    //首页房间（新手专区,培训班,直播大厅、vip专场。。。）
    roomListGaEvent : function (roomType) {
        var _action = '',_content = '';
        if(roomType == 'simple'){
            _action = 'XS', _content = 'content_XS';
        }else if(roomType == 'train'){
            _action = 'PXB', _content = 'content_PXB';
        }else if(roomType == 'normal'){
            _action = 'ZB', _content = 'content_ZB';
        }else if(roomType == 'vip'){
            _action = 'ZC', _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //新手专区二级页面
    noviceRoomGaEvent : function(type){
        var _action = '';
        if(type == 'live'){
            _action = 'XS_ZBJ';
        }else if(type == 'primary'){
            _action = 'XS_CJJC';
        }else if(type == 'middle'){
            _action = 'XS_ZJJC';
        }else if(type == 'advanced'){
            _action = 'XS_GJJC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, 'content_XS',1,true]);
    },

    //课程列表
    roomSyllabusGaEvent : function(){
        var groupId = Data.userInfo.groupId, _action = '', _content = $('#roomCourse .s1').text();
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_KCLB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_ZBJ-KC';
        }else if(PmGaTrace.isTrainRoom()){
            _action = 'PXB_KCLB';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_KCLB';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //课程列表周一至周五
    syllabusListTabGaEvent : function (day) {
        var groupId = Data.userInfo.groupId, _action = '', _content = '';
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB-KC-zhou'.concat(day), _content = 'content_ZB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_ZBJ-KC-zhou'.concat(day), _content = 'content_XS';
        }else if(PmGaTrace.isTrainRoom()){
            _action = 'PXB-KC-zhou'.concat(day), _content = 'content_PXB';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC-KC-zhou'.concat(day), _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //课程列表-下方老师按钮
    syllabusListTeacherButtonGaEvent : function (userno,classinfo) {
        var _action = PmGaTrace.getSyllabusState(classinfo);
        _gaq.push(['_trackEvent', 'm_studio',_action, userno,1,true]);
    },
    
    //课程列表旁边-老师订阅
    syllabusListSubscribeGaEvent : function (userno) {
        var groupId = Data.userInfo.groupId, _action = '',_content = userno;
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_KCLB_Teacher';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_ZBJ-KC-Teacher';
        }else if(PmGaTrace.isTrainRoom()){
            _action = 'PXB_KCLB_Teacher';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_KCLB_Teacher';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //聊天室查看消息类型
    roomNoticeMsgTypeGaEvent : function (msgType) {
        var groupId = Data.userInfo.groupId, _action = '',suffix = '',_content = '';
        if('all' == msgType){
            suffix = 'all';
        }else if('analyst' == msgType){
            suffix = 'analyst';
        }else if('me' == msgType){
            suffix = 'Relevant';
        }
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB-'.concat(suffix),_content = 'content_ZB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_ZBJ-'.concat(suffix), _content = 'content_XS';
        }else if(PmGaTrace.isTrainRoom()){//培训班
            _action = 'PXB-'.concat(suffix), _content = 'content_ZB';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC-'.concat(suffix), _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //私聊框
    roomPrivateChatGaEvent : function () {
        var groupId = Data.userInfo.groupId, _action = '',_content = '';
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_KCLB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_ZBJ-PrivateChat', _content = 'content_XS';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_ZBJ-PrivateChat', _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //新手学堂 文字、视频点击
    noviceTeachItemGaEvent : function (itemType,itemTitle) {
        itemType =  itemType || 'wz';
        var currentId = '',_action = '';
        $('#page_teach section .listblock').each(function (index,row) {
           if($(row).is(':visible')){
               currentDiv = $(row).attr('id');
               return;
           }
        });
        if('primary' == currentId){
            _action = 'XS_CJJC-'.concat(itemType);
        }else if('middle' == currentId){
            _action = 'XS_ZJJC-'.concat(itemType);
        }else if('advanced' == currentId){
            _action = 'XS_GJJC-'.concat(itemType);
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, itemTitle,1,true]);
    },

    //房间查看挂单
    roomViewDataGaEvent : function (teacherno) {
        var groupId = Data.userInfo.groupId, _action = '',_content = teacherno;
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_GD_CK';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_GD_CK';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //直播精华
    roomClassNoteGaEvent : function () {
        var _action = 'ZB_Essence',_content = 'content_ZB';
        if(PmGaTrace.isTrainRoom()){
            _action = 'PXB_SCB_Essence',_content = 'content_PXB';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_Essence',_content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //二级页-聊天室
    roomChatGaEvent : function () {
        var _action = 'ZB_chat',_content = 'content_ZB';
        if(PmGaTrace.isTrainRoom()){
            _action = 'PXB_SCB_chat',_content = 'content_PXB';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_chat',_content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //二级页-转视频/转声音
    roomPlayCtrlGaEvent : function () {
        var _action = 'ZB_SPSY',_content = 'content_ZB';
        if(PmGaTrace.isTrainRoom()){
            _action = 'PXB_SPSY',_content = 'content_PXB';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_SPSY',_content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //二级页-老师按钮
    roomTeacherGaEvent : function () {
        _gaq.push(['_trackEvent', 'm_studio','ZB_LS', $('#room_teacher').attr('userno'),1,true]);
    },

    //二级页-晒单墙按钮
    showTradeEntryGaEvent : function () {
        var groupId = Data.userInfo.groupId, _action = '',_content = '';
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_SD', _content = 'content_ZB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_SD', _content = 'content_XS';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_SD', _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //三级页-我的晒单
    myShowTradeListGaEvent : function () {
        var groupId = Data.userInfo.groupId, _action = '',_content = '';
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_SD-WDSD', _content = 'content_ZB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_SD-WDSD', _content = 'content_XS';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_SD-WDSD', _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //三级级页-晒单墙右边的“+”按钮
    showTradeListPlusEntryGaEvent : function () {
        var groupId = Data.userInfo.groupId, _action = '',_content = '';
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_SD-Plus', _content = 'content_ZB';
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_SD-Plus', _content = 'content_XS';
        }else if(PmGaTrace.isVipRoom()){
            _action = 'ZC_SD-Plus', _content = 'content_ZC';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, _content,1,true]);
    },

    //培训班 入口按钮
    trainEntryGaEvent : function (stateName,trainName) {
        var _action = '';
        if(stateName == '已结束'){
            _action = 'PXB_End';
        }else if(stateName == '进入'){
            _action = 'PXB_Entry';
        }else if(stateName == '报名'){
            _action = 'PXB_Sign';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, trainName,1,true]);
    },

    //直播间订阅
    roomTeacherSubscribeGaEvent : function () {
        _gaq.push(['_trackEvent', 'm_studio','ZB_KCLB_DY', $('#room_teacher').attr('userno'),1,true]);
    },

    //老师
    //老师列表-订阅
    subscribePageSubscribeGaEvent : function (teacherno) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-lb_DZ', teacherno,1,true]);
    },
    //老师列表-点赞
    subscribePageThumbsUpGaEvent : function (teacherno) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-lb_DZ', teacherno,1,true]);
    },

    //老师简介-点赞
    analystPageThumbsUpGaEvent : function (teacherNo) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-DZ', teacherNo,1,true]);
    },

    //老师简介-打赏
    analystPageDollarGaEvent : function (teacherNo) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-DS', teacherNo,1,true]);
    },

    //老师简介-加微信
    analystPageWechatGaEvent : function (teacherNo) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-WX', teacherNo,1,true]);
    },

    //老师简介-订阅
    analystPageSubscribeGaEvent : function (teacherNo) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-DY', teacherNo,1,true]);
    },

    //老师简介-(精彩直播\学员风采\教学视频)
    analystPageZBVideoGaEvent : function (parentId,teacherNo) {
        var _action = '';
        if('analystVideoList' == parentId){
            _action = 'Teacher-JCZB';
        }else if('analystStudentVideoList' == parentId){
            _action = 'Teacher-XYFC';
        }else if('analystTeachVideoList ' == parentId){
            _action = 'Teacher-JXSP';
        }
        _gaq.push(['_trackEvent', 'm_studio',_action, teacherNo,1,true]);
    },

    //老师简介-更多老师
    analystPageMoreEntryGaEvent : function (teacherNo) {
        _gaq.push(['_trackEvent', 'm_studio','Teacher-GDLS', teacherNo,1,true]);
    },

    //获取当前课程状态信息
    getSyllabusState : function (classinfo) {
        var _action = '',groupId = Data.userInfo.groupId,suffix = '';
        if(classinfo.indexOf('status-orange') > -1){//即将开始
            suffix = 'ADVANCE';
        }else if(classinfo.indexOf('status-red') > -1){//正在播放
            suffix = 'ING';
        }else if(classinfo.indexOf('status-grey') > -1){//结束
            suffix = 'OVER';
        }
        if(groupId == 'studio_3'){//直播大厅
            _action = 'ZB_KCLB'.concat(suffix);
        }else if(groupId == 'studio_24'){//新手专区
            _action = 'XS_ZBJ-KC-'.concat(suffix);

        }
        return _action;
    },

    //判断当前是否为培训班
    isTrainRoom : function () {
        var flag = false;
        Data.getRoom(function(room) {
            if(room && room.roomType == 'train'){
                flag = true;
            }
        });
        return flag;
    },

    //判断当前是否为专场
    isVipRoom : function () {
        var flag = false;
        Data.getRoom(function(room) {
            if(room && room.roomType == 'vip'){
                flag = true;
            }
        });
        return flag;
    }

};

//初始化
PmGaTrace.init();