$(function(){
	var _mtbobj = $('body > .content_w > section');
	var _wheight = $(window).height();
	var _objheight = _mtbobj.outerHeight(true)-_mtbobj.height();
	$('body > .content_w').css("min-height",_wheight-_objheight+'px'); //高度控制
});

//滚动监听
$(window).scroll(function() {
	var _top = $(this).scrollTop();
	var _fixedH = $('article.content_w').offset().top;
	
	var _obj = $('article .video-infos');
	_obj.each(function(){
		var _objfix = $(this).find('.infos-block');
		var _difh = $(this).offset().top-_fixedH;
		if(_top>_difh) _objfix.addClass('fixed-bar')
		else _objfix.removeClass('fixed-bar')
	});
	
});
/**
 * 滚动到末尾加载数据
 */
$(window).scroll(function () {
	var contentH = $(document).height(),//内容高度
		viewH = $(window).height(),//可见高度
		scrollTop = $(window).scrollTop();//滚动高度
	if(scrollTop == contentH - viewH){
		//判断当前在哪个页面
		$('article.content_w').each(function(index,row){
			var _id = row.getAttribute('id');
			if($('#'+_id).is(':hidden') == false){
				var noteId = '',dom = null;
				if(_id === 'page_room'){
					dom = $("#classNote_panel>[dataid]:last");
					noteId = dom.size() > 0 ? dom.attr("dataid") || "" : "";
					ClassNote.loadData(true, true,noteId);
				}else if(_id === 'page_classNote'){
					dom = $("#classNodeContainer>[aid]:last");
					noteId = dom.size() > 0 ? dom.attr("aid") || "" : "";
					ClassNote.loadData(true, false,noteId);
				}
			}
		});

	}
});
				