/**
 * Created by ant.ding on 2017/3/10.
 * 教学课程
 */
var NoviceGuide = new Container({
    panel : $("#page_noviceGuide"),
    url : "/pm/theme2/template/noviceGuide/novice-guide.html",
    paginationObj : '',
    temp : '',
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
    $('#page_noviceGuide').on('click', '.course-con .head-top .btn-l', Container.back);
};

/**
 * 初始化
 */
NoviceGuide.initData = function () {
    $('#page_noviceGuide').empty().html(NoviceGuide.formatHtml(NoviceGuide.temp));
    var mySwiper = new Swiper('.swiper-container', {
        pagination: NoviceGuide.paginationObj,//'.swiper-pagination',
        paginationClickable: true,
        parallax: true,
        uniqueNavElements :false,
        speed: 600
    });
    if($('.swiper-container .swiper-slide').length<=1){
        $('.swiper-pagination').hide();
    }
}