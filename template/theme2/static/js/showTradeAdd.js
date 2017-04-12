/**
 * 我要晒单操作类 JS
 * Created by Jade.zhu on 2017/1/20.
 */
var ShowTradeAdd = new Container({
    panel : $("#page_showTradeAdd"),
    url : "/theme2/template/showTradeAdd.html",
    onLoad : function(){
        ShowTradeAdd.setEvent();
    }
});

/**
 * 上传晒单图片
 * @param formData
 * @returns {boolean}
 */
ShowTradeAdd.uploadShowTradeImg = function(formData,fileObj){
   var _this=fileObj;
    try{
        $.ajax({
            url: Data.apiUrl+'/upload/uploadFile',
            type: 'POST',
            data: formData,
            async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: function (dataRt) {
                if(dataRt.result==0){
                    var data=dataRt.data?dataRt.data[0]:null;
                    if(data){
                        $('#tradeImg').val(data.fileDomain+data.filePath);
                        $(_this).parent().find('.obj-upload').attr('src',data.fileDomain+data.filePath).removeClass('dn');
                        $(_this).val('');
                    }
                }else{
                    Pop.msg("上传图片失败，请联系在线客服！");
                }
            },
            error: function (result) {
                console.error("error:",result);
            }
        });
    }catch(es){
        console.error("上传图片失败",es);
    }

};

/**
 * 保存晒单数据
 */
ShowTradeAdd.saveShowTrade = function(){
    var title = $('#ttitle').text();
    var userName = $('#tuserName').text();
    var tradeImg = $('#tradeImg').val();
    var remark = $('#tremark').text();
    if(Util.isBlank(title)){
        Pop.msg('请输入标题');
    }else if(Util.isBlank(userName)){
        Pop.msg('请输入晒单人');
    }else if(!Util.isRightName(userName)){
        Pop.msg('晒单人为2至10位字符(数字/英文/中文/下划线)，不能全数字!');
    }else if(Util.isBlank(tradeImg)){
        Pop.msg('请上传晒单图片');
    }else{
        var params = {groupType:Data.userInfo.groupType,
            groupId:Data.userInfo.groupId,
            userNo:Data.userInfo.userId,
            avatar:Data.userInfo.avatar || '/theme2/img/user.png',
            userName:userName,
            tradeImg:tradeImg,
            remark:remark,
            title:title,
            tradeType:2
        };
        Util.postJson('/addShowTrade',{data:JSON.stringify(params)},function(data){
            if(data.isOK){
                Pop.msg({msg:'您的晒单已成功提交，等待系统审核！',onOK:function () {
                    //上传确认后回调处理
                    $('#ttitle').text('').trigger('blur');
                    $('#tremark').text('').trigger('blur');
                    $('#tradeImg').val('');
                    $('#flTradeImg').parent().find('.obj-upload').attr('src','').addClass('dn');
                    UserShowTrade.status = 0;
                    UserShowTrade.load();
                }});
            }else{
                Pop.msg(data.msg);
            }
        });
    }
};

/**
 * 设置事件
 */
ShowTradeAdd.setEvent = function(){
    /**
     * 设置晒单人
     */
    if(Data.userInfo.isLogin && (Util.isBlank(Data.userInfo.isSetName) || Data.userInfo.isSetName)) {
        $('#tuserName').text(Data.userInfo.nickname).attr('contenteditable', 'false');
        $('#tuserName').next('.placeholder').hide();
    }
    /**
     * 后退回到我的晒单
     */
    $('#back_userShowTrade').bind('click', Container.back);
    /**
     * 返回我的晒单
     */
    $('#to_userShowTrade').bind('click', function () {
        UserShowTrade.status = 0;
        Container.back();
    });
    /**
     * 上传图片
     */
    $('#showTradeAddForm .sfile-input').bind('change', function(e){
        if (!Data.userInfo.isLogin) {
            e.preventDefault();
            Login.load();
            return false;
        }
        var _this = this;
        var img = _this.files[0];
        // 判断是否图片
        if (!img) {
            return false;
        }
        // 判断图片格式
        if (!(img.type.indexOf('image') == 0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase()))) {
            Pop.msg('目前暂支持jpg,gif,png格式的图片！');
            return false;
        }
        var fileSize = img.size;
        //图片小于200kb直接上传
        if(fileSize <= 200 * 1024){
            var formData = new FormData($("#showTradeAddForm")[0]);
            ShowTradeAdd.uploadShowTradeImg(formData,_this);
            return false;
        }
        if (fileSize >= 1024 * 1024 * 3) {
            Pop.msg('发送的图片大小不要超过3MB.');
            return false;
        }
        //加载文件转成URL所需的文件流
        var reader = new FileReader();
        reader.readAsDataURL(img);

        reader.onload = function (e) {
            var result = this.result,fileImg = new Image();
            fileImg.src = result;
            //图片加载完毕之后进行压缩，然后上传
            if (fileImg.complete) {
                callback(img);
            } else {
                fileImg.onload = callback;
            }
            //回调处理
            function callback() {
                var base64Data = Util.compressImg(fileImg,1);
                ShowTradeAdd.uploadAfterCompress(base64Data,img.type);
                fileImg = null;
            }
            $('.obj-upload').attr('src',e.target.result);

        };
        reader.onprogress = function (e) {};
        reader.onloadend = function (e) {};
        $(this).val("");
    });
    /**
     * 提交晒单
     */
    $('#tsubmit').bind('click', function(){
        if(Data.userInfo.isLogin) {
            ShowTradeAdd.saveShowTrade();
        }
    });

    /**
     * 晒单标题事件绑定
     */
    $("#ttitle").bind("focus", function(){
        $(this).next().hide();
    }).bind("blur", function(e){
        var msg = $.trim($(this).html());
        if(!msg){
            $(this).next().fadeIn();
        }
    });
    /**
     * 晒单人事件绑定
     */
    $("#tuserName").bind("focus", function(){
        $(this).next().hide();
    }).bind("blur", function(e){
        var msg = $.trim($(this).html());
        if(!msg){
            $(this).next().fadeIn();
        }
    });
    /**
     * 晒单备注事件绑定
     */
    $("#tremark").bind("focus", function(){
        $(this).next().hide();
    }).bind("blur", function(e){
        var msg = $.trim($(this).html());
        if(!msg){
            $(this).next().fadeIn();
        }
    });

};
/**
 * 图片压缩后上传
 */
ShowTradeAdd.uploadAfterCompress = function(compressData,type){
    //base64数据转换成二进制对象blob并追加到相应formData
    var blob = Util.base64ToBlob(compressData,type);
    var formData = new FormData($("#showTradeAddForm")[0]);
    formData.append('flTradeImg',blob);
    ShowTradeAdd.uploadShowTradeImg(formData,$('#showTradeAddForm .sfile-input'));
}