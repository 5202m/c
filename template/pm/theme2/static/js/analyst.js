/**
 * 老师简介操作类JS
 * Created by Jade.zhu on 2017/1/18.
 */
var Analyst = new Container({
    panel : $("#page_analyst"),
    url : "/pm/theme2/template/analyst.html",
    userNo : null,
    tradeList : [],
    loadAll : false,
    onLoad : function(){
        Analyst.setEvent();
    },
    onShow : function(){
        Analyst.setAnalystInfo();
        Analyst.setVideoList();
    }
});

/**
 * 老师基本信息
 */
Analyst.setAnalystInfo = function(){
    if(Util.isNotBlank(Analyst.userNo)){
        var analystInfoHtml = '', analystPraiseHtml = '', analystIntroductionHtml = '', analystWechatHtml= '';
        Util.postJson('/studio/getShowTeacher',{data:JSON.stringify({groupId:Data.userInfo.groupId,authorId:Analyst.userNo})},function(data) {
            var userInfo = data.userInfo;//直播老师
            var teacherList = data.teacherList;//分析师列表
            Analyst.tradeList = data.tradeList?data.tradeList.tradeList : [];//直播老师晒单
            var trainList = data.trainList || [];//培训班列表
            var trAndClNum=data.trAndClNum;
            if (userInfo) {
                var tagHtml = [];
                if (Util.isNotBlank(userInfo.tag)) {
                    var tags = userInfo.tag.replace(/\s*，\s*/g, ',').split(',');
                    $.each(tags, function (k, v) {
                        tagHtml.push('<label class="u-badge">' + v + '<i class="i-badge-arrowr"></i></label>');
                    });
                }
                analystInfoHtml = Analyst.formatHtml('analystInfo',
                    userInfo.userName,
                    tagHtml.join(''),
                    userInfo.winRate ? userInfo.winRate.replace(/%/, '') : 0,
                    userInfo.earningsM ? userInfo.earningsM.replace(/%/, '') : 0,
                    0
                );
                analystPraiseHtml = Analyst.formatHtml('analystPraise', userInfo.praiseNum, userInfo.userNo);
                analystIntroductionHtml = Analyst.formatHtml('analystIntroduction', userInfo.introduction);
                analystWechatHtml = Analyst.formatHtml('analystWeChat', userInfo.wechatCodeImg, userInfo.wechatCode);
                $('#analystInfo').empty().html(analystInfoHtml);
                $('#analystPraiseTool').empty().html(analystPraiseHtml);
                $('#analystIntro').empty().html(analystIntroductionHtml);
                $('#analystWechat').empty().html(analystWechatHtml);
            }
            if(Analyst.tradeList.length>0) {
                Analyst.loadAll = false;
                Analyst.setShowTradeList();
            }
            Analyst.setTrain(trainList, trAndClNum);
        });
    }
};

/**
 * 晒单交易列表
 */
Analyst.setShowTradeList = function(){
    if(Analyst.loadAll){
        return false;
    }
    var start = $("#analystShowTrade li").size();
    var listData = Analyst.tradeList;
    var lenI = !listData ? 0 : listData.length;
    var trade = null;
    var html = [];
    var isNotAuth = false/*indexJS.checkClientGroup("new")*/, isPos = false;
    for(var i = start; i < lenI && i < start + 4; i++){
        trade = listData[i];
        isPos = !trade.profit;
        var proFit = '持仓中', tradeImg = '/pm/theme2/img/pic-4.png';
        if(!isPos){
            proFit = '获利 <span>'+trade.profit+'</span>';
            tradeImg = trade.tradeImg;
        }
        html.push(Analyst.formatHtml('analystShowTrade',
            proFit,
            tradeImg,
            Util.formatDate(trade.showDate, 'MM-dd HH:mm')
        ));
    }
    if(i >= lenI - 1){
        Analyst.loadAll = true;
    }
    $("#analystShowTrade").empty().html(html.join(""));
};

/**
 * 培训班列表
 * @param trainList
 * @param trAndClNum
 */
Analyst.setTrain = function(trainList, trAndClNum){
    if(trainList){
        var  trainHtml = [], trainTitleHtml = '';
        trainList.forEach(function(row,index){
            var txt = '报名',cls='trainbtn',numTxt='('+row.clientSize+'人)',clk=' onclick="chatTeacher.trainRegis(this);_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'right_ls_Signup\', \''+row.name+'\', 1, true]);"';
            if(row.allowInto){
                txt = '进入';
                numTxt = '';
            }else if(row.isEnd){
                txt = '已结束';
                cls += ' b2';
                clk = '';
                numTxt = '';
            }
            trainHtml.push(Analyst.formatHtml('analystTrainInfo',
                row.name,
                row.isEnd?'已结束':'',
                row.remark,
                txt,
                row.defaultAnalyst.userNo,
                row.allowInto,
                row.clientGroup,
                row._id,
                row.isEnd
            ));
        });
        if(trAndClNum){
            trainTitleHtml = Analyst.formatHtml('analystTrainTitle', trAndClNum.trainNum, trAndClNum.clientNum);
        }else{
            trainTitleHtml = Analyst.formatHtml('analystTrainTitle', 0, 0);
        }
        $('#analystTrain').empty().html(trainTitleHtml+trainHtml.join(''));
    }
};

/**
 * 查询精采直播、学员风采、教学视频
 */
Analyst.setVideoList = function(){
    Index.getArticleList({code:"teach_video_base,teach_video_expert,teach_video_financial,teach_video_gw,student_style,teach_live_video",platform:Data.userInfo.groupId,hasContent:0,pageNo:1,pageSize:20,orderByStr:'{"createDate":"desc"}',authorId:Analyst.userNo},function(dataList){
        if(dataList && dataList.result==0){
            var articleList = dataList.data;
            var teachLiveCount = 1,studentLiveCount = 1,teachVideoCount = 1;
            var teachLiveHtml = [],studentLiveHtml = [],teachVideoHtml = [];
            var article =null,articleDetail = null;
            for(var i = 0;i<articleList.length;i++){
                article = articleList[i];
                articleDetail = articleList[i].detailList[0];
                //精彩直播
                if(article.categoryId == "teach_live_video" ){
                    if(teachLiveCount <= 6){
                        teachLiveHtml.push(Analyst.formatHtml('analystVideo',
                            article.mediaImgUrl,
                            articleDetail.title,
                            article.categoryId,
                            article._id,
                            article.mediaUrl
                        ));
                        teachLiveCount++;
                    }
                }else  if(article.categoryId == "student_style" ){ //学员风采
                    if(studentLiveCount <= 3){
                        studentLiveHtml.push(Analyst.formatHtml('analystStudentVideo',
                            article.mediaUrl,
                            articleDetail.title,
                            articleDetail.tag
                        ));
                        studentLiveCount++;
                    }
                }else{//教学视频
                    if(teachVideoCount <= 3){
                        teachVideoHtml.push(Analyst.formatHtml('analystTeachVideo',
                            article.mediaImgUrl,
                            articleDetail.title,
                            article.categoryId,
                            article._id,
                            article.mediaUrl
                        ));
                        teachVideoCount++;
                    }
                }
            }
            $('#analystVideoList').empty().html(teachLiveHtml.join("")); //精彩直播
            $('#analystStudentVideoList').empty().html(studentLiveHtml.join("")); //学员风采
            $('#analystTeachVideoList').empty().html(teachVideoHtml.join("")); //教学视频
            /*//精采视频播放
            $('.main_tab .teacherlist .teacherbox .tebox_teachLive ul li a').click(function(){
                $('.main_tab .teacherlist .teacherbox .tebox_teachLive ul li .vlink').removeClass("on");
                if($(this).attr("class") =="imga"){
                    $(this).next(".vlink").addClass("on");
                }
                if($(this).attr("class") =="vlink"){
                    $(this).addClass("on");
                }
                var vTitle = $(this).attr("title");
                videos.player.play($(this).attr("vurl"), vTitle);
                var vdId=$(this).attr("articleId");
                chatAnalyze.setUTM(false,$.extend({operationType:7,videoId:vdId,videoName:vTitle}, indexJS.userInfo, indexJS.courseTick.course));//统计教学视频点击数
            });
            //教学视频播放
            $('.main_tab .teacherlist .teacherbox .tebox_teachVideo ul li a').click(function(){
                $('.main_tab .teacherlist .teacherbox .tebox_teachVideo ul li .vlink').removeClass("on");
                if($(this).attr("class") =="imga"){
                    $(this).next(".vlink").addClass("on");
                }
                if($(this).attr("class") =="vlink"){
                    $(this).addClass("on");
                }
                var vTitle = $(this).attr("title");
                videos.player.play($(this).attr("vurl"), vTitle);
                var vdId=$(this).attr("articleId");
                chatAnalyze.setUTM(false,$.extend({operationType:7,videoId:vdId,videoName:vTitle}, indexJS.userInfo, indexJS.courseTick.course));//统计教学视频点击数
            });*/
        }
    });
};

/**
 * 设置事件
 */
Analyst.setEvent = function(){
    $('body').addClass('bgfff').removeClass('bgf2f2f2');
    /**
     * 返回老师列表
     */
    $('#back_subscribe').bind('click', function(){
        Subscribe.load();
    });
    /**
     * 更多老师
     */
    $('#analyst_more').bind('click', function(){
        Subscribe.load();
    });
    /**
     * 点赞
     */
    $('#analystPraiseTool').on('click', 'ul li a.support', function(){
        Subscribe.setPraise($(this), $(this).children('label'));
    });
    /**
     * 打开微信QRCode
     */
    $('#analystPraiseTool').on('click', 'a.add-wx', function(){
        $('#analystWechat').show();
    });
    /**
     * 关闭微信QRCode
     */
    $('#analystWechat').on('click', '.popcon .i-close3', function(){
        $('#analystWechat').fadeOut();
    });
};