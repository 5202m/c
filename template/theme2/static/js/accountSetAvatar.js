var AccountAvatar = new Container({
    panel: $("#account_setAvatar"),
    url: "/theme2/template/account-set-avatar.html",
    onLoad: function() {
        AccountAvatar.setEvent();
    },
    onShow: function() {}
});

/**
 * 上传头像
 * @param formData
 * @returns {boolean}
 */
AccountAvatar.uploadAccAvatarImg = function(formData, fileObj) {
    var _this = fileObj;
    try {
        $.ajax({
            url: Data.apiUrl + '/upload/uploadFile',
            type: 'POST',
            data: formData,
            async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: function(dataRt) {
                if (dataRt.result == 0) {
                    var data = dataRt.data ? dataRt.data[0] : null;
                    if (data) {
                        var params = {
                            item: 'register_avatar'
                        };
                        common.getJson("/modifyAvatar", {
                            avatar: (data.fileDomain + data.filePath),
                            params: JSON.stringify(params)
                        }, function(result) {
                            if (!result.isOK) {
                                console.error("上传头像失败，请联系在线客服！");
                            } else {

                                $('#tradeImg').val(result.avatar);
                                $('#accPhoto,#myInfoAvatar,#myAvatar').attr('src', result.avatar);
                                Data.userInfo.avatar = result.avatar;
                                $(_this).val('');
                            }
                        }, true, function() {
                            alert("上传头像失败，请联系在线客服！");
                        });
                    }
                } else {
                    Pop.msg("上传图片失败，请联系在线客服！");
                }
                $(".shadow").hide();
                $(".loading-box").hide();
            },
            error: function(result) {
                console.error("error:", result);
            }
        });
    } catch (es) {
        console.error("上传图片失败", es);
    }

};

AccountAvatar.setEvent = function() {

    $("#accPhoto").attr('src', Data.userInfo.avatar ? Data.userInfo.avatar : '/theme2/img/user-img.jpg');

    /**
     * 上传图片
     */
    $('#accountAvatarForm .hideCarmara').bind('change', function(e) {
        $(".shadow").show();
        $(".loading-box").show();
        var _this = this;
        var img = _this.files[0];
        // 判断是否图片
        if (!img) {
            $(".shadow").hide();
            $(".loading-box").hide();
            return false;
        }
        // 判断图片格式
        if (!(img.type.indexOf('image') == 0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase()))) {
            Pop.msg('目前暂支持jpg,gif,png格式的图片！');
            $(".shadow").hide();
            $(".loading-box").hide();
            return false;
        }
        var fileSize = img.size;
        //图片小于200kb直接上传
        if (fileSize <= 200 * 1024) {
            var formData = new FormData($("#accountAvatarForm")[0]);
            AccountAvatar.uploadAccAvatarImg(formData, _this);
            return false;
        }
        if (fileSize >= 1024 * 1024 * 3) {
            $(".shadow").hide();
            $(".loading-box").hide();
            Pop.msg('发送的图片大小不要超过3MB.');
            return false;
        }
        //加载文件转成URL所需的文件流
        var reader = new FileReader();
        reader.readAsDataURL(img);

        reader.onload = function(e) {
            var result = this.result,
                fileImg = new Image();
            fileImg.src = result;
            //图片加载完毕之后进行压缩，然后上传
            if (fileImg.complete) {
                callback(img);
            } else {
                fileImg.onload = callback;
            }
            //回调处理
            function callback() {
                var base64Data = Util.compressImg(fileImg, 1);
                AccountAvatar.uploadAfterCompress(base64Data, img.type);
                fileImg = null;
            }
            $('.obj-upload').attr('src', e.target.result);

        };
        reader.onprogress = function(e) {};
        reader.onloadend = function(e) {};
        $(this).val("");
    });

    /** 返回个人资料主页 */
    $('#avatar_back').bind('click', Container.back);
};

/**
 * 图片压缩后上传
 */
AccountAvatar.uploadAfterCompress = function(compressData, type) {
    //base64数据转换成二进制对象blob并追加到相应formData
    var blob = Util.base64ToBlob(compressData, type);
    var formData = new FormData($("#accountAvatarForm")[0]);
    formData.append('flTradeImg', blob);
    AccountAvatar.uploadAccAvatarImg(formData, $('#accountAvatarForm .hideCarmara'));
}