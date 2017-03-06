/**
 * Created by Jade.zhu on 2017/3/6.
 * 教学视频列表
 */
var TeachList = new Container({
    panel : $("#page_teachList"),
    url : "/pm/theme2/template/teachList.html",
    currentCode : '',  //当前栏目code
    onLoad : function(){
        TeachList.setEvent();
    },
    onShow : function(){
        TeachList.loadData();
        TeachList.setTitle();
    }
});

/**
 * 设置事件
 */
TeachList.setEvent = function(){
    /**
     * 返回新手专区
     */
    $('#teachList_back').bind('click', Container.back);
};

/**
 * 加载数据
 * @param isMore
 */
TeachList.loadData = function(isMore){
    Index.getArticleList({
        code : TeachList.currentCode,
        platform : Data.userInfo.groupId,
        hasContent : 1,
        pageSize : 25,
        pageKey: "",
        pageLess: isMore ? 1 : 0,
        isAll : 1,
        ids: "",
        callTradeIsNotAuth:0,
        strategyIsNotAuth:0
    }, function (dataList) {
        if (dataList && dataList.result == 0) {
            var dataArr = dataList.data || [];
            TeachList.appendArticles(dataArr);
        }
    });
};

/**
 * 追加到html页面
 * @param dataArr
 */
TeachList.appendArticles = function(dataArr){
    var html = [];
    $.each(dataArr,function (key, row) {
        html.push(TeachList.formatHtml('teachList_article',
            row.mediaImgUrl,
            row.detailList[0].title,
            row.detailList[0].remark
        ));

    });
    $('#teachList_articles').empty().html(html.join());
};

/**
 * 设置页面title
 */
TeachList.setTitle = function () {
    var currentTitle = '新手必看' ; //当前栏目title
    switch(TeachList.currentCode){
        case 'teach_video_simple' :
            currentTitle = '新手必看';
            break;
        case 'teach_video_base' :
            currentTitle = '基础进阶';
            break;
        case 'teach_video_gw' :
            currentTitle = '谈金论道';
            break;
        case 'teach_video_expert' :
            currentTitle = '专家锦囊';
            break;
    }
    $('#teachListTitle').text(currentTitle);
}