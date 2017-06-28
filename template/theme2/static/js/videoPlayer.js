/**
 * Created by Ant.ding on 2017/4/1.
 */
var VideoPlay = new Container({
    panel : $("#page_videoPlayer"),
    url : "/theme2/template/videoPlayer.html",
    videoUrl : '', //播放视频的url
    videoTitle : '', //播放视频的title
    onLoad : function(){
        VideoPlay.setEvent();
    },
    onShow : function () {
        VideoPlay.playVideo();
    }
});

/**
 * 设置事件
 */
VideoPlay.setEvent = function(){
    $('#videoPlay_back').bind('click',function () {
        //退出停止播放
        $('#videoPlay').html('');
        MbPlayer.player.videoData($('#videoPlay'),'currVideoTitle','');
        MbPlayer.player.videoData($('#videoPlay'),'currVideoUrl','');
        Container.back();
    });
};

/**
 * 播放视频
 */
VideoPlay.playVideo = function () {
    $('#videoPlay_title').text(VideoPlay.videoTitle);
    MbPlayer.play(VideoPlay.videoUrl, VideoPlay.videoTitle,$('#videoPlay'));
};