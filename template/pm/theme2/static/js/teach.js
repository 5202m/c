/**
 * Created by Jade.zhu on 2017/3/6.
 * 新手专区/教学视频
 */
var Teach = new Container({
    panel : $("#page_teach"),
    url : "/pm/theme2/template/teach.html",
    onLoad : function(){
        Teach.setEvent();
    }
});

/**
 * 设置事件
 */
Teach.setEvent = function(){
    /**
     * 返回首页
     */
    $('#teach_back').bind('click', Container.back);

    $('.list-item-desced.border-bt').bind('click', function(){
        TeachList.currentCode = $(this).parent().attr("t");
        TeachList.load();
    });

};