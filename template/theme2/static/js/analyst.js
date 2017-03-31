/**
 * 老师简介操作类JS
 * Created by Jade.zhu on 2017/1/18.
 */
var Analyst = new Container({
    panel : $("#page_analyst"),
    url : "/theme2/template/analyst.html",
    userNo : null,
    subscribeStr : '订阅',
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
        Util.postJson('/getShowTeacher',{data:JSON.stringify({groupId:Data.userInfo.groupId,authorId:Analyst.userNo})},function(data) {
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
                analystPraiseHtml = Analyst.formatHtml('analystPraise', userInfo.praiseNum, userInfo.userNo,Analyst.subscribeStr,Analyst.userNo);
                analystIntroductionHtml = Analyst.formatHtml('analystIntroduction', userInfo.introduction);
                analystWechatHtml = Analyst.formatHtml('analystWeChat', userInfo.wechatCode,userInfo.wechatCodeImg).replace('/theme2/img/qr-code.png',userInfo.wechatCodeImg);
                $('#analystInfo').empty().html(analystInfoHtml);
                $('#analystPraiseTool').empty().html(analystPraiseHtml);
                $('#analystIntro').empty().html(analystIntroductionHtml);
                $('#analystWechat').empty().html(analystWechatHtml);
            }
            if(Analyst.tradeList.length>0) {
                Analyst.loadAll = false;
                Analyst.setShowTradeList();
            }else{
                $("#analystShowTrade").empty();
            }
            Analyst.setTrain(trainList, trAndClNum);
            Syllabus.setSubscribeAttr($('#analystSubscribe'),Analyst.userNo);
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
        var proFit = '持仓中', tradeImg = '/theme2/img/pic-4.png';
        if(!isPos){
            proFit = '获利 <span>'+trade.profit+'</span>';
            tradeImg = trade.tradeImg;
        }
        html.push(Analyst.formatHtml('analystShowTrade',
            proFit,
            //tradeImg,
            Util.formatDate(trade.showDate, 'MM-dd HH:mm')
        ).replace('/theme2/img/pic-4.png',tradeImg));
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
                        ).replace('/theme2/img/cm.png',article.mediaImgUrl));
                        teachLiveCount++;
                    }
                }else  if(article.categoryId == "student_style" ){ //学员风采
                    if(studentLiveCount <= 3){
                        studentLiveHtml.push(Analyst.formatHtml('analystStudentVideo',
                            //article.mediaUrl,
                            articleDetail.title,
                            articleDetail.tag
                        ).replace('/theme2/img/cm.png',article.mediaImgUrl));
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
                        ).replace('/theme2/img/cm.png',article.mediaImgUrl));
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
    /**
     * 返回老师列表
     */
    $('#back_subscribe').bind('click', Container.back);
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
    /**
     * 私聊
     */
    $('#analystPraiseTool').on('click','a.privateChat',function () {
        PrivateChat.load();
    });

    /**
     * 下载微信图片
     */
    $('#analystWechat').on('click','i.i-download',function (e) {
        //图片存在，则下载
        if($(this).parent().prev().attr('src')){
            Analyst.oDownLoad($(this).parent().prev().attr('src'),$(this).parent()[0]);
        }else{
            e.preventDefault();
        }

    });

    /**
     * 订阅
     */
    $('#analystPraiseTool').on('click','a.subscribe',function (e) {
        if(!Data.userInfo.isLogin){
            Login.load();
            return false;
        }
        var $this = $(this), id = '', types = $this.attr('type').split(',');
        var typeLen = types.length;
        var analystArr = [];
        var currAnalyst = $this.attr('analystId');
        if ($this.attr('subscribed') == 'true') {
            $this.children('label').html('订阅')
        } else {
            analystArr.push(currAnalyst);//未订阅的，则加入到订阅列表
            $this.children('label').html('已订阅');
        }
        $.each(types, function (k, v) {
            if (v == 'live_reminder') {
                id = $this.attr('lrid');
            } else if (v == 'shout_single_strategy') {
                id = $this.attr('ssid');
            } else if (v == 'trading_strategy') {
                id = $this.attr('tsid');
            }
            Subscribe.setSubscribe($this, id, v, analystArr, k == (typeLen - 1));
        });
    });
};

/**
 * 下载图片
 * @param url
 */
Analyst.oDownLoad = function(url,target){
    var odownLoad = target;
    var browserType = Analyst.myBrowser();
    if (browserType==="IE"||browserType==="Edge"){
        //IE
        odownLoad.href="#";
        var oImg=document.createElement("img");
        oImg.src=url;
        oImg.id="downImg";
        var odown=document.getElementById("down");
        odown.appendChild(oImg);
        Analyst.SaveAs5(document.getElementById('downImg').src)
    }else{
        //!IE
        odownLoad.href=url;
        odownLoad.download="";
    }
};

/**
 * 判断浏览器类型
 * @returns {*}
 */
Analyst.myBrowser = function(){
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
        return "Opera"
    }; //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1){
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        return "IE";
    }; //判断是否IE浏览器
    if (userAgent.indexOf("Trident") > -1) {
        return "Edge";
    } //判断是否Edge浏览器
};

Analyst.SaveAs5 = function(imgURL) {
    var oPop = window.open(imgURL,"","width=1, height=1, top=5000, left=5000");
    for(; oPop.document.readyState != "complete"; )
    {
        if (oPop.document.readyState == "complete")break;
    }
    oPop.document.execCommand("SaveAs");
    oPop.close();
}