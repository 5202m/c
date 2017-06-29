/**
 * 直播间视频区教学选项卡操作类
 * author Jade.zhu
 */
var videosTeach = {
    init: function() {
        this.setEvent();
    },
    setEvent: function() {
        /**
         * 教学视频列表切换
         */
        $('#teachVideoId a').bind("click", function(e, callback, params) {
            $('#teachVideoId a').removeClass('on');
            var $this = $(this);
            videosTeach.setVideoList($this.addClass("on").attr("t"), function() {
                if (typeof callback === "function") {
                    callback(params);
                }
            });
        });
    },
    /**
     * 设置视频
     * @param categoryId
     * @param callback
     */
    setVideoList: function(categoryId, callback) {
        var cateDiv = $('#teachVideoPanel .sub_tab .numbox .inner');
        var cateDivt = $('#teachVideoPanel').attr('t');
        if (cateDivt == categoryId) {
            return;
        }
        $('#teachVideoPanel').attr('t', categoryId);
        cateDiv.html("");
        categoryId += ",activity_video";
        indexJS.getArticleList(categoryId, indexJS.userInfo.groupId, 0, 1, 100, '{"categoryId":"desc","sequence":"desc","publishStartDate":"desc"}', null, function(dataList) {
            if (dataList && dataList.result == 0) {
                var data = dataList.data;
                var row;
                for (var i in data) {
                    row = data[i].detailList[0];
                    if (data[i].categoryId == 'activity_video') {
                        cateDiv.append('<div title="' + row.title + '" class="c_num" style="display: none"><a href="javascript:void(0);" class="activity_video" title="' + row.title + '" ct="' + data[i].categoryId + '" id="' + data[i]._id + '" t="' + ((common.isValid(data[i].mediaUrl) && data[i].mediaUrl.indexOf('.mp4') != -1) ? 'mp4' : '') + '" vurl="' + data[i].mediaUrl + '" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_jx_video\', \'' + row.title + '\', 1, true]);">' + (parseInt(i) + 1) + '</a></div>');
                    } else {
                        cateDiv.append('<div title="' + row.title + '" class="c_num"><a href="javascript:void(0);" title="' + row.title + '" ct="' + data[i].categoryId + '" id="' + data[i]._id + '" t="' + ((common.isValid(data[i].mediaUrl) && data[i].mediaUrl.indexOf('.mp4') != -1) ? 'mp4' : '') + '" vurl="' + data[i].mediaUrl + '" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_jx_video\', \'' + row.title + '\', 1, true]);">' + (parseInt(i) + 1) + '</a></div>');
                    }
                }
                /*页数滚动调用 数字是tab序号*/
                videosTeach.numSlide(0);
                //播放视频
                $("#teachVideoPanel .numbox .c_num a").click(function() {
                    $("#teachVideoPanel .numbox .c_num a").removeClass("on");
                    $(this).addClass("on");
                    var vTitle = $(this).attr("title");
                    videos.player.play($(this).attr("vurl"), vTitle);
                    //videos.setVideo($(this));
                    //显示课程简述
                    var vdId = $(this).attr("id");
                    if ($("#tvInfoId").attr("tid") == vdId) {
                        return;
                    }
                    indexJS.getArticleInfo(vdId, function(row) {
                        if (row) {
                            $("#tvInfoId").attr("tid", row._id);
                            var detail = row.detailList[0];
                            if (common.isBlank(row.mediaImgUrl)) {
                                $('#tvInfoId .cpic img').hide();
                            } else {
                                $('#tvInfoId .cpic img').attr('src', row.mediaImgUrl).show();
                            }
                            $("#tvInfoId .introtext p").text(detail.remark);
                        }
                    });
                    indexJS.setListScroll('#teachVideoPanel .scrollbox'); //设置滚动
                    try{
                        chatAnalyze.setUTM(false, $.extend({ operationType: 7, videoId: vdId, videoName: vTitle, roomName: $('#roomInfoId').text() }, indexJS.userInfo, indexJS.courseTick.course)); //统计教学视频点击数
                    }
                    catch(e){
                        console.log("Set video UTM fail!"+e);
                    }

                });
                if (typeof callback === "function") {
                    callback();
                }
            }
        });
    },

    /**
     * 获取随机一个教学视频
     * @param autoPlay true-自动播放，false-仅显示列表，不随机播放
     * @param [isAll] 仅autoPlay=true时有效：true-所有教学视频随机，false-mp4随机，
     */
    playRandomTeach: function(autoPlay, isAll) {
        if (!$('.tabnav a.teach').is(".on")) {
            $('.tabnav a.teach').trigger("click", [true]); //仅切换样式
        }
        if ($("#teachVideoId a.on").size() > 0) {
            videosTeach.playRandomTeachFunc(isAll);
        } else {
            var loc_items = $("#teachVideoId a");
            var loc_index = common.randomIndex(loc_items.size());
            if (autoPlay) {
                loc_items.eq(loc_index).trigger("click", [videosTeach.playRandomTeachFunc, isAll]);
            } else {
                loc_items.eq(loc_index).trigger("click");
            }
        }
    },
    /**
     * 随机播放教学视频
     * @param isAll
     */
    playRandomTeachFunc: function(isAll) {
        var loc_items = $("#teachVideoPanel .numbox .c_num a");
        if (loc_items.size() > 0) {
            var tmp = loc_items.filter(".activity_video");
            if (tmp.length > 0) {
                tmp.trigger("click");
                return;
            }
            //查看是否有选中的视频
            if (loc_items.is("on")) {
                $(this).trigger("click");
            } else {
                var loc_index = common.randomIndex(loc_items.size());
                var loc_item = loc_items.eq(loc_index);
                loc_item.trigger("click");
            }
        }
    },
    /**
     * 随机播放教学视频
     * @param videoInfo {{url:String, title:String}}
     */
    playTeachByUrlFunc: function(videoInfo) {
        if (videoInfo && videoInfo.url) {
            var hasVideo = false;
            $("#teachVideoPanel .numbox .c_num a").each(function() {
                var url = $(this).attr("vurl");
                if (url == videoInfo.url) {
                    $(this).trigger("click");
                    hasVideo = true;
                    return false;
                }
            });
            if (!hasVideo) {
                videos.player.play(videoInfo.url, videoInfo.title);
            }
        }
    },
    /** 页数滚动 */
    numSlide: function(tabnum) {
        var nowIndex = 0;
        var nowtab = $($('.teachlive .sub_tab')[tabnum]);
        //清除所有animate
        $(nowtab).find('.courseNum .inner').stop();
        var itemW = $('.courseNum .c_num').width();
        var itemNum = $(nowtab).find('.courseNum .c_num').size();
        $(nowtab).find('.courseNum .inner').width(function() {
            return (itemNum * itemW)
        }).css("left", 0);

        //避免重复绑定click 先unbind
        $(nowtab).find('.numctrl.next').unbind("click").click(function() {
            if ($(nowtab).find('.courseNum .inner').width() - nowIndex * itemW - $(nowtab).find('.courseNum .numbox').width() > 0) {
                nowIndex++;
                $(nowtab).find('.courseNum .inner').stop().animate({ left: -nowIndex * itemW });
            }
        });

        $(nowtab).find('.numctrl.prev').unbind("click").click(function() {
            if (nowIndex != 0) {
                nowIndex--;
                $(nowtab).find('.courseNum .inner').stop().animate({ left: -nowIndex * itemW });
            }
        });
    }
};