
/**
 * 直播间手机版房间内页 -- 播放器
 * @author Dick.guo
 */
var Player = {
    /** 状态 */
    type : "text", //'text'-文字直播，'video'-视频直播，'audio'-音频直播
    isFlashSupport : false,
    isAutoplay : false,
    isQCloud: false,

    /**
     * 初始化
     */
    init : function(){
        if(navigator.userAgent.match(/Android/i)||(navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1)){
            this.isFlashSupport = false;
        }else{
            this.isFlashSupport = true;
        }
        var bf=Data.options.platform;
        this.isAutoplay=('webui'!=bf && 'app'!=bf);
        this.setEvent();
    },

    /**
     * 启动，智能选择播放
     */
    startPlay : function(){
        Data.getSyllabusPlan(function(course){
            if(!course||course.isNext||course.courseType==2||course.courseType==0){
                Player.change("text");
            }else{
                var links = Data.getVideoUrl(course);
                var url = "";
                if(Player.type == "text"){
                    Player.change("audio"); //默认音频直播
                }
                if(Player.type == "audio"){
                    url = links.audio;
                    Player.playAudio(true, url, course.title);
                }else if(Player.type == "video"){
                    url = links.mobile;
                    Player.play(url, course.title);
                }
            }
            Room.showLecturer(course && course.lecturerId);
        });
    },

    /**
     * 播放视频
     * @param url
     * @param title
     */
    play : function(url, title,dom){
        var $panel = dom || $("#roomVideo");
        if(this.player.videoData($panel, "currVideoUrl") == url && this.player.videoData($panel, "currVideoTitle") == title){
            return;
        }
        this.player.videoData($panel, "currVideoUrl", url);
        this.player.videoData($panel, "currVideoTitle", title);

        if(/type=blws/.test(url)){
            this.player.playByBLWS($panel, url, title, Player.isAutoplay);
        }else if(Player.isFlashSupport){
            this.player.playBySewise($panel, url, title, Player.isAutoplay);
        }else if(/\.myqcloud\./.test(url)){
            Player.isQCloud = true;
            this.player.playByQCloud($panel.attr('id'), url, title, Player.isAutoplay);
        }else{
            this.player.playByVideo($panel, url, title, Player.isAutoplay);
        }
    },

    /**
     * 播放声音直播
     * @param doPlay
     * @param [url]
     * @param [title]
     */
    playAudio:function(doPlay, url, title){
        var imgIdx = 0;
        if(doPlay){
            if(Util.isNotBlank(url)){
                this.change("audio");
                imgIdx = Util.randomIndex(5);
                this.play(url, title);
                // $('#roomAudio .voice_ctrl .tit span').text(title); TODO 视频标题
            }else{
                imgIdx = $('#roomAudioImg').attr("imgIdx") || imgIdx;
            }
            $('#roomAudioCtrl').removeClass("stopped");
            $('#roomAudioImg').attr("imgIdx", imgIdx).attr('src','/theme2/img/wave' + imgIdx + '.gif');
            if(!/\.myqcloud\./.test(url)) {
                this.player.doPlay($("#roomVideo"));
            }
        }else{
            imgIdx = $('#roomAudioImg').attr("imgIdx") || imgIdx;
            $('#roomAudioImg').attr('src','/theme2/img/wave' + imgIdx + '.jpg');
            $('#roomAudioCtrl').addClass("stopped");
            if(!/\.myqcloud\./.test(url)) {
                this.player.doPause($("#roomVideo"));
            }
        }
    },

    /**
     * 播放教学视频
     * @param category
     */
    playMp4:function(url, title){
        //TODO 播放教学视频
    },

    /**
     * 视频音频切换
     * @param type
     */
    change : function(type){
        if(this.type == type){
            return;
        }
        var videoPanel = $("#roomVideo");
        var audioPanel = $("#roomAudio");
        var playerCtrl = $("#room_playerCtrl");
        var playerCtrlTxt = $("#room_playerCtrlTxt");
        if(this.type == "video" || this.type == "audio"){
            if(!Player.isQCloud) {
                this.player.clear(videoPanel);
            }
        }
        if(type == "text"){
            playerCtrl.hide();
            videoPanel.hide();
            audioPanel.hide();
        }else if(type == "video"){
            playerCtrl.show().removeClass('switch-video').find(".top-icons").attr("class", "top-icons i-volume");
            playerCtrlTxt.text("转声音");
            videoPanel.slideDown();
            audioPanel.slideUp();
        }else if(type == "audio"){
            playerCtrl.show().addClass('switch-video').find(".top-icons").attr("class", "top-icons i-video");
            playerCtrlTxt.text("转视频");
            audioPanel.slideDown();
            videoPanel.slideUp();
        }
        this.type = type;
    },

    /**
     * 设置事件
     */
    setEvent : function(){
        //声音直播开始 暂停
        $("#roomAudioPlay, #roomAudioCtrl .voice_wave").bind("click", function(){
            Player.playAudio($("#roomAudioCtrl").is(".stopped"));
        });

        //视频直播 声音直播切换
        $("#room_playerCtrl").bind("click", function(){
            var isAudio = $(this).is(".switch-video");
            if(isAudio){
                Player.change("video");
                if(!Player.isQCloud) {
                    Player.startPlay();
                }
            }else{
                Player.change("audio");
                if(!Player.isQCloud) {
                    Player.startPlay();
                }
            }
        });

        //播放器尺寸
        $("#roomVideo").height($(window).width() * 0.55)
    },

    /**
     * 播放器
     */
    player : {
        /**
         * 视频数据
         * @param $panel
         * @param key
         * @param value
         * @returns {*}
         */
        videoData : function($panel, key, value){
            var data = $panel.data("videoData") || {};
            if(arguments.length == 3){
                data[key] = value;
                $panel.data("videoData", data);
                return data;
            }else{
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
        playByIframe : function($panel, url, title, autostart){
            this.clear($panel);
            $panel.append('<iframe frameborder=0 width="100%" height="100%" src="'+url+'" allowfullscreen></iframe>');
        },

        /**
         * 使用blwsPlayer播放视频
         * @param $panel
         * @param url
         * @param title
         * @param autostart
         */
        playByBLWS : function($panel, url, title, autostart){
            var vidParams=url.split("&");
            if(vidParams.length>1) {
                var vid = vidParams[1].replace(/^vid=/g, '');
                this.clear($panel);
                if(this.videoData($panel, "isLoading")){
                    //加载中...
                }else if(!window.polyvObject){
                    this.videoData($panel, "isLoading", true);
                    var thiz = this;
                    LazyLoad.js(['/base/lib/polyvplayer.min.js'], function () {
                        var player = polyvObject($panel).videoPlayer({
                            width:'100%',
                            height:'100%',
                            'vid' : vid,
                            'flashvars' : {"autoplay":autostart,"setScreen":"fill"},
                            onPlayOver:function(id){
                            }
                        });
                        thiz.videoData($panel, "player", player);
                        thiz.videoData($panel, "isLoading", false);
                    });
                }else{
                    var player = polyvObject($panel).videoPlayer({
                        width:'100%',
                        height:'100%',
                        'vid' : vid,
                        'flashvars' : {"autoplay":autostart,"setScreen":"fill"},
                        onPlayOver:function(id){
                        }
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
        playBySewise : function($panel, url, title, autostart){
            this.clear($panel);
            if(this.videoData($panel, "isLoading")){
                //加载中...
            }else if(!window.Sewise){
                this.videoData($panel, "isLoading", true);
                var thiz = this;
                LazyLoad.js(['/base/lib/sewise/sewise.player.min.js'], function () {
                    var player = new Sewise.SewisePlayer({
                        elid:$panel,
                        autostart:autostart,
                        url:url,
                        title:title,
                        skin:"vodWhite",
                        localPath : "/base/lib/sewise/"
                    });
                    if(autostart){
                        player.startup();
                    }
                    thiz.videoData($panel, "player", player);
                    thiz.videoData($panel, "isLoading", false);
                });
            }else{
                var player = new Sewise.SewisePlayer({
                    elid:$panel,
                    autostart:autostart,
                    url:url,
                    title:title,
                    skin:"vodWhite",
                    localPath : "/base/lib/sewise/"
                });
                if(autostart){
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
        playByEmbed : function($panel, url, title, autostart){
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
        playByVideo : function($panel, url, title, autostart){
            this.clear($panel);
            $panel.html('<video src="' + url + '" controls="true" webkit-playsinline autoplay="'+autostart+'" style="width: 100%; height: 100%; background-color: rgb(0, 0, 0);"></video>');
            var vDom=$panel.find("video");
            /*makeVideoPlayableInline(vDom.get(0));*/
            if(autostart){
                vDom.trigger("play");
            }else{
                vDom.trigger("pause");
            }
        },

        /**
         * 清空播放器
         */
        clear : function($panel){
            $panel.empty();
        },

        /**
         * 开始播放
         */
        doPlay : function($panel){
            $panel.find("video").trigger("play");
        },

        /**
         * 暂停播放
         */
        doPause : function($panel){
            $panel.find("video").trigger("pause");
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
                var player = new TcPlayer($panel, {
                    "m3u8": url,
                    "autoplay" : autostart,
                    "live" : true,
                    "x5_player" : true,
                    "width" :  '100%',
                    "height" : '100%'
                });
                $('.vcp-playtoggle').css({'background-repeat': 'no-repeat','background-position-x': '50%'});
                $('.vcp-fullscreen-toggle').hide();
            });
        }
    }
};