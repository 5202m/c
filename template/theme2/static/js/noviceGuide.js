/**
 * Created by ant.ding on 2017/3/10.
 * 教学课程
 */
var NoviceGuide = new Container({
    panel : $("#page_noviceGuide"),
    url : "",
    title : '',
    isPaginationHide : false,
    currentPage : '11',
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
    $('#noviceGuide_back').bind('click', Container.back);
};

/**
 * 初始化
 */
NoviceGuide.initData = function () {
    var mySwiper = new Swiper('.swiper-container'.concat(NoviceGuide.currentPage), {
        pagination: '.swiper-pagination'.concat(NoviceGuide.currentPage),
        paginationClickable: true,
        parallax: true,
        //loop: true,
        speed: 600,
        longSwipesRatio: 0.3,
        touchRatio:1,
        observer:true,//修改swiper自己或子元素时，自动初始化swiper
        observeParents:true,//修改swiper的父元素时，自动初始化swipe
    });
    if($('.swiper-container .swiper-slide').length<=1 || NoviceGuide.isPaginationHide){
        $('.swiper-pagination').hide();
    }
    $("#noviceGuideTitle").text(NoviceGuide.title);
}