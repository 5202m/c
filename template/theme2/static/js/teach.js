/**
 * Created by Jade.zhu on 2017/3/6.
 * 新手专区/教学视频
 */
var Teach = new Container({
    panel : $("#page_teach"),
    url : "/theme2/template/teach.html",
    currentRank : 'primary',
    currentCode : 'teach_video_initial_mb',
    onLoad : function(){
        Teach.setEvent();
    },
    onShow : function () {
        Teach.initPage();
    }
});

/**
 * 设置事件
 */
Teach.setEvent = function(){
    //返回上一级
    $('#teach_back').bind('click', Container.back);
    /**
     * 文章点击事件
     */
    $('.list-item-desced.border-bt').bind('click', function(){
        var num = $(this).parent().attr("t");
        var rank = $(this).parent().parent().parent().attr("id");
        var rankNum = rank === 'primary' ? '1' :(rank === 'middle' ? '2' : '3');
        NoviceGuide.url = Util.format('/theme2/template/noviceGuide/novice-guide{0}-{1}.html',rankNum,num);
        NoviceGuide.status = 0;
        NoviceGuide.currentPage = rankNum.concat(num);
        //手动处理下隐藏swiper的分页下标
        if(rankNum === "1" && (num === "2" || num === "4" || num === "5")){
            NoviceGuide.isPaginationHide = true;
        }else if(rankNum === "2" && num !=="2"){
            NoviceGuide.isPaginationHide = true;
        }else{
            NoviceGuide.isPaginationHide = false;
        }
        NoviceGuide.load();
    });
    /**
     * 视频点击事件
     */
    $('section .listblock.bgfff').on('click','.list-item-desced.border-bt',function () {
        var utype = $(this).parent().attr("utype");
        if(utype === 'video'){
            VideoPlay.videoUrl = $(this).parent().attr("uurl");
            VideoPlay.videoTitle = $(this).children('.list-main').children('a').text();
            VideoPlay.load();
        }
    });

};

/**
 * 初始化页面数据
 */
Teach.initPage = function () {
    $('.listblock.bgfff').each(function () {
        $(this).hide();
    });
    var currentTitle = '新手初级教程' ; //当前栏目title
    switch(Teach.currentRank){
        case 'primary' :
            currentTitle = '新手初级教程';
            NoviceGuide.title = '新手初级教程';
            Teach.currentCode = 'teach_video_initial_mb';
            $('#primary').show();
            break;
        case 'middle' :
            currentTitle = '新手中级教程';
            NoviceGuide.title = '新手中级教程';
            Teach.currentCode = 'teach_video_middle_mb';
            $('#middle').show();
            break;
        case 'advanced' :
            currentTitle = '新手高级教程';
            NoviceGuide.title = '新手高级教程';
            Teach.currentCode = 'teach_video_senior_mb';
            $('#advanced').show();
            break;
    }
    $('#teach_title').text(currentTitle);
    Teach.loadVideoData();
}

/**
 * 动态加载视频数据
 * @param isMore
 */
Teach.loadVideoData = function(isMore){
    Index.getArticleList({
        code : Teach.currentCode,
        platform : 'studio_teach', //当前后台配置为此，此处需要改
        hasContent : 1,
        pageSize : 30,
        pageKey: "",
        pageLess: isMore ? 1 : 0,
        isAll : 1,
        ids: "",
        callTradeIsNotAuth:0,
        strategyIsNotAuth:0
    }, function (dataList) {
        if (dataList && dataList.result == 0) {
            var dataArr = dataList.data || [];
            Teach.appendVideos(dataArr);
        }
    });
};

/**
 * 动态追加视频
 * @param dataArr
 */
Teach.appendVideos = function(dataArr){
    var html = [];
    $.each(dataArr,function (key, row) {
        var num = Util.randomIndex(16) + 11;
        var picUrl = '/theme2/img/thumb/'.concat(num).concat('.jpg');
        html.push(Teach.formatHtml('primaryVideo',
            row.detailList[0].title,
            row.detailList[0].remark,
            row._id,
            row.mediaUrl
        ).replace('/theme2/img/pic-11.jpg',picUrl));
    });
    //由于高级教程异于初。中，此处特殊处理
    var _select = Teach.currentRank === 'advanced' ?
                    '#' + Teach.currentRank + ' ul li' :
                    '#' + Teach.currentRank + ' ul li:gt(4)';
    $(_select).remove();
    _select = '#' + Teach.currentRank + ' ul';
    $(_select).append(html.join());
};
