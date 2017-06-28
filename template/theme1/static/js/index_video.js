/**
 * 直播间视频通用操作类
 * author Alan.wu
 */
var videos = {
    init: function() {
        /** 滚动字幕事件 */
        this.rollNews.bindEvents();

        /** 初始化播放列表 */
        this.playlist.init();

        //播放视频
        this.playAuto(false);
        return this;
    },
    /**
     * 播放器
     */
    player: {
        /**
         * 视频数据
         * @param $panel
         * @param key
         * @param value
         * @returns {*}
         */
        videoData: function($panel, key, value) {
            var data = $panel.data("videoData") || {};
            if (arguments.length == 3) {
                data[key] = value;
                $panel.data("videoData", data);
                return data;
            } else {
                return data[key];
            }
        },

        /**
         * 使用iframe播放视频
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playByIframe: function($panel, url, title, autostart) {
            this.clear($panel);
            $panel.append('<iframe frameborder=0 width="100%" height="100%" src="' + url + '" allowfullscreen></iframe>');
        },

        /**
         * 使用blwsPlayer播放视频
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playByBLWS: function($panel, url, title, autostart) {
            var vidParams = url.split("&");
            if (vidParams.length > 1) {
                var vid = vidParams[1].replace(/^vid=/g, '');
                this.clear($panel);
                if (this.videoData($panel, "isLoading")) {
                    //加载中...
                } else if (!window.polyvObject) {
                    this.videoData($panel, "isLoading", true);
                    var thiz = this;
                    LazyLoad.js(['/base/lib/polyvplayer.min.js'], function() {
                        var player = polyvObject($panel).videoPlayer({
                            width: '100%',
                            height: '100%',
                            'vid': vid,
                            'flashvars': { "autoplay": autostart, "setScreen": "fill" },
                            onPlayOver: function(id) {}
                        });
                        thiz.videoData($panel, "player", player);
                        thiz.videoData($panel, "isLoading", false);
                    });
                } else {
                    var player = polyvObject($panel).videoPlayer({
                        width: '100%',
                        height: '100%',
                        'vid': vid,
                        'flashvars': { "autoplay": autostart, "setScreen": "fill" },
                        onPlayOver: function(id) {}
                    });
                    this.videoData($panel, "player", player);
                }
            }
        },

        /**
         * 使用SewisePlayer播放视频
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playBySewise: function($panel, url, title, autostart) {
            this.clear($panel);
            if (this.videoData($panel, "isLoading")) {
                //加载中...
            } else if (!window.Sewise) {
                this.videoData($panel, "isLoading", true);
                var thiz = this;
                LazyLoad.js(['/base/lib/sewise/sewise.player.min.js'], function() {
                    var player = new Sewise.SewisePlayer({
                        elid: $panel,
                        autostart: autostart,
                        url: url,
                        title: title,
                        skin: "vodWhite",
                        localPath: "/base/lib/sewise/"
                    });
                    if (autostart) {
                        player.startup();
                    }
                    thiz.videoData($panel, "player", player);
                    thiz.videoData($panel, "isLoading", false);
                });
            } else {
                var player = new Sewise.SewisePlayer({
                    elid: $panel,
                    autostart: autostart,
                    url: url,
                    title: title,
                    skin: "vodWhite",
                    localPath: "/base/lib/sewise/"
                });
                if (autostart) {
                    player.startup();
                }
                this.videoData($panel, "player", player);
            }
        },
        /**
         * 使用Embed元素播放视频
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playByEmbed: function($panel, url, title, autostart) {
            this.clear($panel);
            var html = [];
            html.push('<embed src="');
            html.push(url);
            html.push('" autostart="' + autostart + '" wmode="Opaque" quality="high" width="100%" height="100%" align="middle" allowScriptAccess="never" allowFullScreen="true" mode="transparent" type="application/x-shockwave-flash"></embed>');
            $panel.html(html.join(""));
        },

        /**
         * 使用video播放视频
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playByVideo: function($panel, url, title, autostart) {
            this.clear($panel);
            $panel.html('<video src="' + url + '" controls="true" webkit-playsinline autoplay="' + autostart + '" style="width: 100%; height: 100%; background-color: rgb(0, 0, 0);"></video>');
            var vDom = $panel.find("video");
            /*makeVideoPlayableInline(vDom.get(0));*/
            if (autostart) {
                vDom.trigger("play");
            } else {
                vDom.trigger("pause");
            }
        },

        /**
         * 使用腾讯云直播
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playByQCloud: function($panel, url, title, autostart){
            LazyLoad.js(['//imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer.js'], function() {
            //LazyLoad.js(['//qzonestyle.gtimg.cn/open/qcloud/video/live/h5/live_connect.js'], function() {
                var options = {
                    "autoplay" : autostart,      //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
                    //"coverpic" : "http://www.test.com/myimage.jpg",
                    "width" :  '100%',//视频的显示宽度，请尽量使用视频分辨率宽度
                    "height" : '100%'//视频的显示高度，请尽量使用视频分辨率高度
                };
                if (/\.m3u8/.test(url)){
                    options.m3u8 = url;
                }else{
                    options.flv = url;
                }
                var player =  new TcPlayer($panel, options);
                /*var option = {
                    "live_url": url,
                    "width": '100%',
                    "height": '100%',
                    "cache_time": 0.5
                };

                var player = new qcVideo.Player($panel, option);
                if (autostart) {
                    player.play();
                } else {
                    player.pause();
                }*/
            });
        },

        /**
         * 清空播放器
         */
        clear: function($panel) {
            $panel.empty();
            this.videoData($panel, "currVideoUrl", "");
            this.videoData($panel, "currVideoTitle", "");
        },

        /**
         * 播放视频
         * @param url
         * @param title
         */
        play: function(url, title) {
            if (url) {
                var $panel = $("#videoPlayerPanel");
                if (this.videoData($panel, "currVideoUrl") == url && this.videoData($panel, "currVideoTitle") == title) {
                    return;
                }
                this.videoData($panel, "currVideoUrl", url);
                this.videoData($panel, "currVideoTitle", title);

                if (/\.html/.test(url)) {
                    this.playByIframe($panel, url, title, true);
                } else if (/type=blws/.test(url)) {
                    var videoUrl = $("#teachVideoPanel .numbox .c_num a").filter(".activity_video").attr("vurl");
                    this.playByBLWS($panel, url, title, (videoUrl && videoUrl == url) ? true : false);
                } else if (/\.swf/.test(url)) {
                    this.playByEmbed($panel, url, title, true);
                } else if (/rtmp/.test(url)) {
                    if (/\.myqcloud\./.test(url)){
                        this.playByQCloud($panel.attr('id'), url, title, true);
                    } else {
                        obsPlayer.init(url, 'videoPlayerPanel', true);
                    }
                } else {
                    this.playBySewise($panel, url, title, true);
                }
                videos.setStudioInfo(false);
            }
        }
    },

    /**
     * 播放列表
     */
    playlist: {
        /**
         * 初始化
         */
        init: function() {
            indexJS.setListScroll($(".mod_livelist .livetab .scrollbox")); //设置今日直播滚动条
            this.setEvent();
            this.initToday(indexJS.syllabusData && indexJS.syllabusData.courses);
            //this.initYesterday();
        },
        /**
         * 设置今日直播
         */
        initToday: function(courses) {
            $("#playlist_panel ul[t='today']").html("");
            if (!courses) {
                $("#playlist_hide").trigger("click");
                return;
            }
            var curDay = new Date(indexJS.serverTime).getDay();
            var days = courses.days,
                tmks = courses.timeBuckets,
                courseObj;
            var html = [],
                index = 0;
            for (var i = 0, len = days.length; i < len; i++) {
                if (days[i].day == curDay && days[i].status == 1) {
                    for (var k = 0, tklen = tmks.length; k < tklen; k++) {
                        courseObj = tmks[k].course[i];
                        if (courseObj.status != 0 && courseObj.lecturer) {
                            index++;
                            html.push('<li class="" st="' + tmks[k].startTime + '" et="' + tmks[k].endTime + '">');
                            html.push('<span class="fl">');
                            html.push('<b>' + index + '</b>');
                            html.push(courseObj.title);
                            html.push('</span>');
                            html.push('<span class="fr">');
                            html.push(tmks[k].startTime + '-' + tmks[k].endTime);
                            html.push('</span></li>');
                        }
                    }
                    $("#playlist_panel ul[t='today']").html(html.join(""));
                    break;
                }
            }
            this.refreshStyle();
            //今日直播列表自动关闭
            window.setTimeout(function() {
                $("#playlist_hide").trigger("click");
            }, 5000);
        },

        /**
         * 设置昨日回顾
         */
        initYesterday: function() {
            $("#playlist_panel ul[t='yesterday']").html("");
            $.getJSON('/getSyllabusHis', {
                groupType: indexJS.userInfo.groupType,
                groupId: indexJS.userInfo.groupId
            }, function(datas) {
                if (!datas) {
                    return;
                }
                var course = null,
                    html = [];
                for (var i = 0, lenI = datas.length; i < lenI; i++) {
                    course = datas[i];
                    html.push('<li class="" st="' + course.startTime + '" et="' + course.endTime + '">');
                    html.push('<span class="fl">');
                    html.push('<b>' + i + '</b>');
                    html.push(course.title);
                    html.push('</span>');
                    html.push('<span class="fr">');
                    html.push(course.startTime + '-' + course.endTime);
                    html.push('</span></li>');
                }
                $("#playlist_panel ul[t='yesterday']").html(html.join(""));
            });
        },

        /**
         * 设置
         */
        setEvent: function() {
            //播放列表-tab切换
            $("#playlist_nav a").bind("click", function() {
                var loc_type = $(this).attr("t");
                $(this).addClass("on").siblings().removeClass("on");
                $("#playlist_panel ul[t!='" + loc_type + "']").hide();
                $("#playlist_panel ul[t='" + loc_type + "']").show();
            });

            //播放列表-隐藏
            $("#playlist_hide").bind("click", function() {
                $("#playlist_min").show();
                $("#playlist_max").hide();
            });

            //播放列表-显示
            $("#playlist_show").bind("click", function() {
                $("#playlist_min").hide();
                $("#playlist_max").show();
            });
        },

        /**
         * 刷新样式
         */
        refreshStyle: function() {
            var currTime = common.getHHMM(indexJS.serverTime);
            $("#playlist_panel ul[t='today'] li").each(function() {
                if (currTime < $(this).attr("st")) {
                    $(this).attr("class", "");
                } else if (currTime < $(this).attr("et")) {
                    $(this).attr("class", "on");
                } else {
                    $(this).attr("class", "over");
                }
            });
        }
    },

    /**
     * 滚动字幕（新闻）
     */
    rollNews: {
        /** 滚动定时器ID */
        newMarIntervalId: null,

        /**
         * 滚动新闻事件
         */
        bindEvents: function() {
            /**
             * 隐藏滚动文字
             */
            $('.mod_scrollnews .newsclose').click(function() {
                $('.mod_scrollnews .newslist').hide();
                $('.mod_scrollnews .newsbtn').show();
                clearInterval(videos.rollNews.newMarIntervalId);
                videos.rollNews.newMarIntervalId = null;
            });

            /**
             * 显示滚动文字
             */
            $('.mod_scrollnews .newsbtn').click(function() {
                $(this).hide();
                $('.mod_scrollnews .newslist').slideDown();
                videos.rollNews.newsMarquee(true);
            });

            /**
             * 点击显示详细内容
             */
            $("#newscont1 a").live("click", function() {
                if ($(this).attr('url') === 'false') {
                    $("#popMsgTit").text($(this).attr("title"));
                    $("#popMsgTxt").html($(this).data("content") || "没有内容");
                    $("#popMsgBox,.blackbg").show();
                    indexJS.setListScroll(".popMsgBox");
                    return false;
                }
            });

            /**
             * 点击显示详细内容
             */
            $("#newscont2 a").live("click", function() {
                if ($(this).attr('url') === 'false') {
                    $("#newscont1 a[tid='" + $(this).attr('tid') + "']").trigger("click");
                    return false;
                }
            });
        },
        /**
         * 滚动新闻
         * @param data
         */
        update: function(data) {
            var newsPanel = $('#newscont1');
            if (data["delete"]) {
                var ids = data.ids.split(',');
                if (ids.length > 0) {
                    for (var i = 0; i < ids.length; i++) {
                        newsPanel.find('a[tid="' + ids[i] + '"]').remove();
                    }
                }
            } else if (data.edit) {
                data.isValid = data.isValid == "true" ? true : false;
                //如果不在该组，remove元素；该处不判断房间，修改房间后只能推送到新房间，老房间不remove
                if (data.isValid && (!indexJS.userInfo.clientGroup || !data.clientGroup || $.inArray(indexJS.userInfo.clientGroup, data.clientGroup) == -1)) {
                    data.isValid = false;
                }
                var tids = newsPanel.find('a[tid="' + data.id + '"]');
                if (data.isValid) {
                    if (tids.size() > 0) { //修改
                        if (common.isValid(data.url)) {
                            tids.attr({ 'title': data.title, 'href': data.url, 'url': 'true' })
                                .html('<i></i><span>' + data.title + '</span>');
                        } else {
                            tids.attr({ 'title': data.title, 'url': 'false' })
                                .html('<i></i><span>' + data.title + '</span>')
                                .data('content', data.content);
                        }
                    } else { //新增
                        var title = $('<a href="javascript:void(0);" tid="' + data.id + '" title="' + data.title + '" target="_blank" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_sp_zimutxt\', \'content_left\', 1, true]);"><i></i><span>' + data.title + '</span></a>');
                        if (common.isValid(data.url)) {
                            title.attr({ 'href': data.url, 'url': 'true' });
                        } else {
                            title.attr({ 'url': 'false' }).data('content', data.content);
                        }
                        newsPanel.append(title);
                    }
                } else {
                    if (tids.size() > 0) {
                        tids.remove();
                    }
                }
            } else {
                if (data.infos) {
                    var count = data.infos.length,
                        title = null,
                        contents = '';
                    if (count > 0) {
                        for (var i = 0; i < count; i++) {
                            if (indexJS.userInfo.clientGroup && data.infos[i].clientGroup && $.inArray(indexJS.userInfo.clientGroup, data.infos[i].clientGroup) > -1) {
                                if (data.infos[i].pushType == 1 && data.infos[i].contentId && data.infos[i].title) {
                                    if (common.isValid(data.infos[i].url)) {
                                        title = $('<a href="' + data.infos[i].url + '" url="true" tid="' + data.infos[i].contentId + '" title="' + data.infos[i].title + '" target="_blank" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_sp_zimutxt\', \'content_left\', 1, true]);"><i></i><span>' + data.infos[i].title + '</span></a>');
                                    } else {
                                        title = $('<a href="javascript:void(0);" url="false" tid="' + data.infos[i].contentId + '" title="' + data.infos[i].title + '" target="_blank" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'left_sp_zimutxt\', \'content_left\', 1, true]);"><i></i><span>' + data.infos[i].title + '</span></a>');
                                        title.data('content', data.infos[i].content);
                                    }
                                    newsPanel.append(title);
                                }
                            }
                        }
                    }
                }
            }
            this.newsMarquee(true);
        },
        /**
         * 新闻滚动
         */
        newsMarquee: function(isShow) {
            //common.newsMarquee(videos.rollNews.newMarIntervalId, 30, ".mod_scrollnews", '#scrollnews_demo', '#newscont1', '#newscont2', isShow);
            //return;
            if (videos.rollNews.newMarIntervalId) {
                clearInterval(videos.rollNews.newMarIntervalId);
                videos.rollNews.newMarIntervalId = null;
            }
            var speed = 30;
            var newsPanel = $(".mod_scrollnews");
            var tab = $("#scrollnews_demo")[0];
            var tab1 = $("#newscont1");
            var tab2 = $("#newscont2");
            if (isShow && tab1.children().size() > 0) {
                newsPanel.show();
            } else {
                newsPanel.hide();
            }
            tab2.html("");
            $(tab).unbind("mouseover mouseout");
            if (isShow) {
                tab1.css("width", "auto");
                tab2.css("width", "auto");
                var widthTmp = newsPanel.width() - 27;
                if (tab1.width() < widthTmp) {
                    tab1.css("width", widthTmp);
                    tab2.css("width", widthTmp);
                }
                //需要滚动
                tab2.html(tab1.html());
                /**滚动*/
                var marqueeFunc = function() {
                    if (tab1.width() - tab.scrollLeft <= 0) {
                        tab.scrollLeft -= tab1.width();
                    } else {
                        tab.scrollLeft++;
                    }
                };
                videos.rollNews.newMarIntervalId = window.setInterval(marqueeFunc, speed);
                $(tab).bind("mouseover", function() {
                    window.clearInterval(videos.rollNews.newMarIntervalId);
                    videos.rollNews.newMarIntervalId = null;
                }).bind("mouseout", function() {
                    if (videos.rollNews.newMarIntervalId) {
                        window.clearInterval(videos.rollNews.newMarIntervalId);
                        videos.rollNews.newMarIntervalId = null;
                    }
                    videos.rollNews.newMarIntervalId = window.setInterval(marqueeFunc, speed);
                });
            }
        }
    },

    /**
     * 自动播放
     * @param isOnlyLive
     */
    playAuto: function(isOnlyLive) {
        var course = indexJS.courseTick.course;
        if (course.liveLink && course.liveLink.length > 0) {
            $.each(course.liveLink, function(i, row) {
                if (row.code == '1') {
                    course.studioLink = row.url;
                }
            });
        }

        var $panel = $("#videoPlayerPanel");
        if (!course ||
            !course.lecturerId ||
            course.isNext ||
            (course.courseType != 0 && course.courseType != 3 && common.isBlank(course.studioLink))) { //文字直播 汇通视讯没有链接
            if (isOnlyLive) {
                this.setStudioInfo(course);
                this.player.clear($panel);
            } else {
                this.setStudioInfo(false);
                videosTeach.playRandomTeach(true);
            }
        } else if (course.courseType == 0) { //文字直播
            this.setStudioInfo(course);
            this.player.clear($panel);
        } else { //视频直播时间
            this.setStudioInfo(false);
            this.player.play(course.studioLink, course.title);
        }
        videos.rollNews.newsMarquee(course && course.courseType == 1);
        this.refreshCourseStyle(course);
    },

    /**
     * 刷新视频--用于课程表时间到期
     */
    refreshVideo: function() {
        var course = indexJS.courseTick.course;
        //当前正在直播
        if ($('.tabnav a.tablink.live').is(".on")) {
            this.playAuto(true);
        } else {
            this.refreshCourseStyle(course);
        }
    },

    /**
     * 同步课程样式
     * @param course
     */
    refreshCourseStyle: function(course) {
        //今日直播
        this.playlist.refreshStyle();

        //房间直播状态
        var roomFlag = $("#roomList_panel a.on>i");
        if (!course || !course.lecturerId || course.isNext) {
            roomFlag.removeClass("living");
        } else {
            roomFlag.addClass("living");
        }

        //直播预告
        $('#course_panel li.on').removeClass("on");
        if (course && course.lecturerId) {
            $('#course_panel .main_tab[d=' + course.day + ']').find('li a[st="' + course.startTime + '"][et="' + course.endTime + '"]').parent().addClass("on");
            //chatTeacher.getShowTeacher(course.lecturerId);
        }
    },

    /**
     * 设置直播信息
     * @param course 课程信息，如果是false表示隐藏课程信息提示
     */
    setStudioInfo: function(course) {
        if (course === false) {
            $("#nextCourse").hide();
            return;
        }
        $("#nextCourse").show();
        if (!course || !course.lecturerId) {
            $("#nextCourse").find(".ntext").text("当前暂无直播");
            $("#nextCourse .nextbox").hide();
            return;
        }
        if (course.isNext || course.courseType == 0) {
            videos.setNextCourse(course);
        }
    },

    /**
     * 设置下个课程
     * @param course
     */
    setNextCourse: function(course, data) {
        if (course) {
            var txt = '当前暂无直播，请关注下节课';
            if (!course.isNext && course.courseType == 0) {
                txt = '当前正在文字直播';
            }
            $("#nextCourse").find(".ntext").text(txt);
            $("#nextCourse .nextbox").show();
            $("#nextCourse").find(".t_name").text(course.lecturer);
            $("#nextCourse").find(".live_name").text(course.title);
            $("#nextCourse").find(".time").text(common.daysCN[course.day] + ' ' + course.startTime + ' - ' + course.endTime);
            //加载分析师头像
            var $avatar = $("#nextCourse").find(".tec_head");
            var avatars = $avatar.data("avatars") || {};
            var currLecturer = course.lecturerId || "";
            currLecturer = currLecturer.replace(/(,\w+)*$/g, "");
            var currId = $avatar.data("lecturerId");
            if (currId != currLecturer && currLecturer) {
                if (avatars.hasOwnProperty(currId)) {
                    $avatar.find("img").attr("src", avatars[currId]);
                } else {
                    $avatar.data("lecturerId", currLecturer);
                    $.getJSON('/getUserInfo', { uid: currLecturer }, function(data) {
                        if (data && data.userNo) {
                            var $avatar = $("#nextCourse").find(".tec_head");
                            var avatars = $avatar.data("avatars") || {};
                            avatars[data.userNo] = data.avatar || "";
                            $avatar.data("avatars", avatars);
                            if ($avatar.data("lecturerId") == data.userNo) {
                                $avatar.find("img").attr("src", avatars[data.userNo]);
                            }
                        }
                    });
                }
            }
        }
        $("#lvVideoId").hide();
        $("#nextCourse").show();
    },

    /**
     * 刷新头像
     */
    refreshStudioInfoAvatar: function(avatar) {
        $("#nextCourse").find("img").attr("src", avatar);
    }
};

/*资讯区 切换*/
$(".slidebox").slide({
    mainCell: ".slideinner",
    effect: "left",
    autoPlay: false,
    delayTime: 300,
    interTime: 4000,
    prevCell: '.sl_prev',
    nextCell: '.sl_next'
});