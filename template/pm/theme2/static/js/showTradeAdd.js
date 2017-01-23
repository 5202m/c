/**
 * 我要晒单操作类 JS
 * Created by Jade.zhu on 2017/1/20.
 */
var ShowTradeAdd = new Container({
    panel : $("#page_showTradeAdd"),
    url : "/pm/theme2/template/showTradeAdd.html",
    onLoad : function(){
        ShowTradeAdd.setEvent();
    },
    onShow : function(){
        $('body').attr('class', 'home bgf2f2f2');
    },
    onHide : function(){
        $('body').attr('class', 'home bgfff');
    }
});

/**
 * 上传晒单图片
 * @param fileObj
 * @returns {boolean}
 */
ShowTradeAdd.uploadShowTradeImg = function(fileObj){
    var _this=fileObj;
    var img = _this.files[0];
    // 判断是否图片
    if(!img){
        return false;
    }
    // 判断图片格式
    if(!(img.type.indexOf('image')==0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase())) ){
        Pop.msg('目前暂支持jpg,gif,png格式的图片！');
        return false;
    }
    var fileSize=img.size;
    if(fileSize>=1024*512){
        Pop.msg('上传的图片大小不要超过512KB.');
        return false ;
    }
    try{
        var formData = new FormData($("#showTradeAddForm")[0]);
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
    var title = $('#showTradeAddForm .title').text();
    var userName = $('#showTradeAddForm .userName').text();
    var tradeImg = $('#tradeImg').val();
    var remark = $('#showTradeAddForm .remark').text();
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
            avatar:Data.userInfo.avatar,
            userName:userName,
            tradeImg:tradeImg,
            remark:remark,
            title:title,
            tradeType:2
        };
        Util.postJson('/studio/addShowTrade',{data:JSON.stringify(params)},function(data){
            if(data.isOK){
                box.showMsg('您的晒单已成功提交，等待系统审核！');
                if(!Data.userInfo.isSetName){
                    //$('#myNickName').val(userName);
                    //$('#setNkBtn').click();
                }
                //$('.pop_addsd').hide();
                $('#showTradeAddForm .contentText,#tradeImg').empty();
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
    if(Util.isBlank(Data.userInfo.isSetName) || Data.userInfo.isSetName) {
        $('#showTradeAddForm .userName').text(Data.userInfo.nickname).attr('contenteditable', 'false');
        $('#showTradeAddForm .userName').next('.placeholder').hide();
    }
    /**
     * 后退回到我的晒单
     */
    $('#back_userShowTrade').bind('click', Container.back);
    /**
     * 返回我的晒单
     */
    $('#to_userShowTrade').bind('click', Container.back);
    /**
     * 输入框获得焦点后隐藏提示
     */
    $('#showTradeAddForm .contentText').bind('click', function(){
        $(this).parent().find('.placeholder').hide();
    });
    /**
     * 输入框失去焦点后无内容显示提示
     */
    $('#showTradeAddForm .contentText').bind('blur', function(){
        var _con = $(this).text();
        if(_con.length<=0){
            $(this).parent().find('.placeholder').show();
        }
    });
    /**
     * 上传图片
     */
    $('#showTradeAddForm .sfile-input').bind('change', function(){
        var _this = this;
        if(Data.userInfo.isLogin) {
            ShowTradeAdd.uploadShowTradeImg(_this);
        }
    });
    /**
     * 提交晒单
     */
    $('#showTradeAddForm .submit-btn').bind('click', function(){
        if(Data.userInfo.isLogin) {
            ShowTradeAdd.saveShowTrade();
        }
    });
};