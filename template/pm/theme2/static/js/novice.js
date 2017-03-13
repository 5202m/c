/**
 * Created by Jade.zhu on 2017/3/6.
 * 新手专区首页
 */
var Novice = new Container({
    panel : $("#page_novice"),
    url : "/pm/theme2/template/novice.html",
    onLoad : function(){
        Novice.setEvent();
        Novice.initData();
    }
});

/**
 * 设置事件
 */
Novice.setEvent = function(){
    //回退
    $('#novice_back').bind('click', Container.back);
};

Novice.initData = function () {
    var mySwiper = new Swiper('.scroll-imbd', {
        pagination: '.dot-infobox',
        paginationClickable: true,
        loop: true,
        autoplay: 5000,
        autoplayDisableOnInteraction: false,
    });
}