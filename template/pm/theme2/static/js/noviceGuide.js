/**
 * Created by ant.ding on 2017/3/10.
 * 教学课程
 */
var NoviceGuide = new Container({
    panel : $("#page_noviceGuide"),
    url : "/pm/theme2/template/noviceGuide/novice-guide1-1.html",
    onLoad : function(){
        NoviceGuide.setEvent();
    },
    onShow : function(){
        NoviceGuide.initData();
    }
});


/**
 * 设置事件
 */
NoviceGuide.setEvent = function(){
    //返回上一级
    $('#second_back').bind('click', Container.back);
};

/**
 * 初始化
 */
NoviceGuide.initData = function () {
    var mySwiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        parallax: true,
        loop: true,
        speed: 600
    });
    if($('.swiper-container .swiper-slide').length<=1){
        $('.swiper-pagination').hide();
    }
}