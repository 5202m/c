/**
 * 直播间聊天区晒单墙选项卡操作类
 * author Jade.zhu
 */
var chatShowTrade = {
    tradeForUser: null, //指定用户的晒单(userNo)
    tradeList: [], //晒单数据
    tradeLoadAll: false,
    cur_status: "less",
    showComment: "",
    init: function() {
        this.setEvent();
    },
    setEvent: function() {
        /**
         * 如果已经登录，则直接取积分
         */
        if (indexJS.userInfo.isLogin) {
            chatShowTrade.getPointsInfo();
        }
        /*我要晒单按钮事件*/
        $('#wantShowTrade,.cybtn').click(function() {
            if (indexJS.userInfo.isLogin) {
                if (common.isBlank(indexJS.userInfo.isSetName) || indexJS.userInfo.isSetName) {
                    $('#userName').val(indexJS.userInfo.nickname).attr('readonly', 'readonly');
                }
                common.openPopup('.pop_addsd,.blackbg');
            } else {
                var ops = ops || {};
                box.openLgBox(ops.closeable, ops.showTip);
            }
        });
        /*我的晒单按钮事件*/
        $('#myShowTrade').click(function() {
            if (indexJS.userInfo.isLogin) {
                $('.pop_mysd .sd_list .sd_ul').empty();
                chatShowTrade.getPointsInfo();
                chatShowTrade.tradeForUser = indexJS.userInfo.userId;
                chatShowTrade.initShowTrade();
                $('.pop_mysd .personal_info .headimg img').attr('src', $('#avatarInfoId').attr('src'));
                $('.pop_mysd .personal_info .username').text(indexJS.userInfo.nickname);
                $('.pop_mysd .personal_info .infobar').removeClass('dn');
                common.openPopup('.pop_mysd,.blackbg');
            } else {
                var ops = {};
                box.openLgBox(ops.closeable, ops.showTip);
            }
        });
        /*上传晒单图片*/
        $("#flTradeImg").change(function() {
            var _this = this;
            var img = _this.files[0];
            // 判断是否图片
            if (!img) {
                return false;
            }
            // 判断图片格式
            if (!(img.type.indexOf('image') == 0 && img.type && /\.(?:jpg|png|gif)$/.test(img.name.toLowerCase()))) {
                alert('目前暂支持jpg,gif,png格式的图片！');
                return false;
            }
            var fileSize = img.size;
            if (fileSize >= 1024 * 512) {
                alert('上传的图片大小不要超过512KB.');
                return false;
            }
            try {
                var formData = new FormData($("#showTradeForm")[0]);
                $.ajax({
                    url: indexJS.apiUrl + '/upload/uploadFile',
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
                                $('#tradeImg').val(data.fileDomain + data.filePath);
                                $(_this).val('');
                            }
                        } else {
                            alert("上传图片失败，请联系在线客服！");
                        }
                    },
                    error: function(result) {
                        console.error("error:", result);
                    }
                });
            } catch (es) {
                console.error("上传图片失败", es);
            }
        });
        /*提交晒单数据*/
        $('#tradeSubmit').click(function() {
            chatShowTrade.showTrade();
        });

        $('#openRule').click(function() {
            common.openPopup($('.sdking_rule'));
        });

        //发表晒单评论
        $(document).on("click", ".addc_btn", function(e) {
            var $this = $(this);
            var nickname = indexJS.userInfo.nickname;
            var divinput = $this.parent().find(".ui-autocomplete-input");
            var content = divinput.text();
            var commentAt = divinput.attr("data");
            var cid = divinput.attr("cid");
            var replyInit = divinput.attr("replyInit");
            var replyComment = null;
            var refId = $this.parents('li').attr("sid");
            if (typeof(commentAt) == "undefined") { //自己评论
                replyComment = '<p cid="' + cid + '"><a href="javascript:void(0)" class="sd_author">' + nickname + '</a>：<span>' + content + '</span><span class="time">' + common.formatterDateTime(new Date(), '/').substr(5, 11) + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
            } else {
                if (content.indexOf(replyInit) >= 0) { //如果包含回复xx
                    content = content.substr(replyInit.length, content.length);
                }
                //if回复内容如果去掉回复xx
                //if回复内容如果包含有多个:
                if (commentAt == nickname) { //自己评论自己
                    replyComment = '<p cid="' + cid + '"><a href="javascript:void(0)" class="sd_author">' + nickname + '</a>：<span>' + content + '</span><span class="time">' + common.formatterDateTime(new Date(), '/').substr(5, 11) + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                    cid = "";
                } else { //自己评论别人
                    replyComment = '<p cid="' + cid + '"><a href="javascript:void(0)" class="sd_author">' + nickname + '</a>  回复 <a href="javascript:void(0)" class="sd_author">' + commentAt + '</a>：<span>' + content + '</span><span class="time">' + common.formatterDateTime(new Date(), '/').substr(5, 11) + ' <a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                }
            }
            if ("" == content) {
                box.showMsg("您尚未输入内容，请随便写点什么吧");
                return false;
            }
            if (content.length > 140) {
                box.showMsg("已超出字数限制140字!");
                return false;
            }
            if (typeof(cid) == "undefined") {
                cid = "";
            }
            var content = common.clearMsgHtml(content); //评论内容校验
            var params = {
                id: refId,
                refId: cid,
                content: content,
                nickname: nickname
            };
            common.getJson('/addShowTradeComment', { data: JSON.stringify(params) }, function(data) {
                if (data.isOK) {
                    $("#commentList").show();
                    var commentList = $this.parents(".cont").find("#commentList");
                    if (commentList.find(".sd_loadcomment").length > 0) {
                        commentList.find('p:last').after(replyComment);
                    } else {
                        $(commentList).append(replyComment);
                    }
                    $this.parent().parent().siblings(".sd_bot").find(".comment").removeClass("clicked");
                    $this.parent().parent().hide();
                } else {
                    box.showMsg(data.msg);
                }
            });
        });


        // 加载全部
        $(document).on("click", "#contentText#", function() {

        }).keyup(function(e) {
            var obj = e.target;
            var sid = obj.id;
            var $liSid = $('#showTradeDiv ul.sd_ul').find("li[sid='" + sid + "']");
            var outHtml = $liSid.find("div[id='" + sid + "']");
            var replyinit = outHtml.attr('replyinit');
            var replyinitLength = 0;
            if (typeof(replyinit) != 'undefined') {
                replyinitLength = replyinit.length;
            }
            var limitNum = 140;
            var counter = obj.innerHTML.length - replyinitLength;
            var pattern = '还可以输入' + '<b>' + limitNum + '</b>' + '字符';
            if (counter > limitNum) {
                pattern = "已超出" + '<b>' + (counter - limitNum) + '</b>' + "字";
            } else {
                var result = limitNum - counter;
                pattern = '还可以输入' + '<b>' + result + '</b>' + '字符';
            }
            $liSid.find('.inptip').html(pattern);
        });

        /**
         * 晒单墙评论事件
         */
        $(document).on("click", "#showTradeDiv .scrollbox ul li .comment,.com-replybtn", function() {
            var $this = $(this);
            var refUser = $this.parent().siblings('.sd_author:eq(0)').text();
            var cid = $this.parent().parent().attr("cid");
            var refId = $this.parents('li').attr("sid");
            var tempHtml = '<div class="sd_comment" id="replyComment"><div class="add_comment"><div class="inpbox">';
            var inputMoreHtml = '<span class="inptip">可以输入<b>140</b>字</span><a href="javascript:void(0);" class="addc_btn">发表</a></div></div></div>';

            var txt = $this[0].title;
            var commentListHtml = $this.parents('.cont').find("#commentList");
            commentListHtml.show();
            if (txt == "回复") {
                tempHtml += '<div id="' + refId + '" contenteditable="true" replyInit="回复 ' + refUser + '：" data="' + refUser + '" cid="' + cid + '" class="ctextarea ui-autocomplete-input" autocomplete="off">回复 ' + refUser + '：</div></div>';
                tempHtml += inputMoreHtml;
                var replyCommentHtml = $this.parents('.cont').find("#replyComment");
                replyCommentHtml.remove();
                if (commentListHtml.length == 0) {
                    commentListHtml.children().last().after(tempHtml);
                } else {
                    commentListHtml.append(tempHtml);
                }
                //评论框触发焦点事件 也就是变高
                $("#contentText").focus();
            } else {
                tempHtml += '<div id="' + refId + '" contenteditable="true" class="ctextarea ui-autocomplete-input" autocomplete="off"></div></div>';
                tempHtml += inputMoreHtml;
                var replyCommentHtml = $this.parents('.cont').find("#replyComment");
                replyCommentHtml.remove();
                if (commentListHtml.length == 0) {
                    commentListHtml.children().last().after(tempHtml);
                } else {
                    commentListHtml.append(tempHtml);
                }

            }
        });

    },

    /**
     * 获取晒单数据
     * @param pageNo
     * @param pageSize
     */
    initShowTrade: function() {
        var params = { groupType: indexJS.userInfo.groupType };
        if (common.isValid(chatShowTrade.tradeForUser)) {
            params.userNo = chatShowTrade.tradeForUser;
        }
        common.getJson('/getShowTrade', { data: JSON.stringify(params) }, function(data) {
            if (data.isOK && common.isValid(data.data)) {
                if (common.isValid(chatShowTrade.tradeForUser)) {
                    $('.pop_mysd .sd_list .sd_ul').empty();
                }
                chatShowTrade.tradeList = data.data.tradeList || [];
                chatShowTrade.tradeLoadAll = false;
                chatShowTrade.setShowTrade();
            }
        });
    },

    appendComments: function(commentListData, commentList) {
        var sidComments = "";
        var temp = '<div class="sd_comment" id="tempCommentList" style="display: none"></div>';
        for (var i = 0; i < commentListData.length; i++) {
            var showTradeDate = common.formatterDateTime(commentListData[i].dateTime, '/').substr(5, 11);
            sidComments += '<p cid="' + commentListData[i]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentListData[i].userName + '</a>：<span>' + commentListData[i].content + '</span>' +
                '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复" ></a></span></p>';
        }
        commentList.append($(temp).append(sidComments));
        return commentList;
    },




    /**
     * 组装加载更多晒单评论
     * @param commentListData
     * @param commentList
     * @param showComment
     */
    loadCommentData: function(commentListData, commentList, showComment) {
        var tempList = chatShowTrade.appendComments(commentListData, commentList);
        for (var j = 2; j < commentListData.length; j++) {
            var showTradeDate = common.formatterDateTime(commentListData[j].dateTime, '/').substr(5, 11);
            if (commentListData[j].refId != "") {
                var object = $(tempList).find("p[cid='" + commentListData[j].refId + "']").children().eq(0);
                var user = object.text();
                if (user != commentListData[j].userName) {
                    //commentList.append('<p cid="'+commentListData[j]._id+'" refId="'+commentListData[j].refId+'"><a href="javascript:void(0)" class="sd_author">'+commentListData[j].userName+'</a>  回复 <a href="javascript:void(0)" class="sd_author">'+user+'</a>：<span>'+commentListData[j].content+'</span><span class="time">'+showTradeDate+' <a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>');
                    showComment += '<p cid="' + commentListData[j]._id + '" refId="' + commentListData[j].refId + '"><a href="javascript:void(0)" class="sd_author">' + commentListData[j].userName + '</a>  回复 <a href="javascript:void(0)" class="sd_author">' + user + '</a>：<span>' + commentListData[j].content + '</span><span class="time">' + showTradeDate + ' <a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                } else {
                    //commentList.
                    //    append('<p cid="'+commentListData[j]._id+'"><a href="javascript:void(0)" class="sd_author">'+commentListData[j].userName+'</a>：<span>'+commentListData[j].content+'</span>' +
                    //    '<span class="time">'+showTradeDate+'<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>');
                    showComment += '<p cid="' + commentListData[j]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentListData[j].userName + '</a>：<span>' + commentListData[j].content + '</span>' +
                        '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                }
            } else {
                //commentList.
                //    append('<p cid="'+commentListData[j]._id+'"><a href="javascript:void(0)" class="sd_author">'+commentListData[j].userName+'</a>：<span>'+commentListData[j].content+'</span>' +
                //    '<span class="time">'+showTradeDate+'<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>');
                showComment += '<p cid="' + commentListData[j]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentListData[j].userName + '</a>：<span>' + commentListData[j].content + '</span>' +
                    '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
            }

        }
        return showComment;
    },



    /**
     * 加载全部晒单评论
     * @param data
     */
    loadAllCommment: function(sid) {

        var $liSid = $('#showTradeDiv ul.sd_ul').find("li[sid='" + sid + "']");

        var commentListData = $liSid.data("commentListData");

        var initialComments = $liSid.data("initialComments"); //初始晒单评论

        var showComment = ""; //最终显示所有评论

        var commentList = $($liSid).find('#commentList');

        var sd_loadcomment = commentList.find('.sd_loadcomment');

        if (chatShowTrade.cur_status == "less") {
            //组装数据
            var showComment = chatShowTrade.loadCommentData(commentListData, commentList, showComment);

            commentList.append(showComment);

            sd_loadcomment.children().html("收起");

            chatShowTrade.cur_status = "more";
        } else {
            commentList.children().remove();

            commentList.append(initialComments);

            sd_loadcomment.children().html("展开全部");

            chatShowTrade.cur_status = "less";
        }
        commentList.find("p:last").after(sd_loadcomment);
    },

    /**
     * 设置晒单墙数据显示
     * @returns {boolean}
     */
    setShowTrade: function() {
        if (chatShowTrade.tradeLoadAll) {
            return false;
        }
        var start = common.isBlank(chatShowTrade.tradeForUser) ? $("#showTradeDiv .scrollbox ul.sd_ul li").size() : $(".pop_mysd .sd_list .sd_ul li").size();
        var listData = chatShowTrade.tradeList;
        var row = null;
        var commentTemp = null;
        var length = listData.length;
        var tradeHtml = '',
            tradeFormat = common.isBlank(chatShowTrade.tradeForUser) ? chatShowTrade.formatHtml('showTradeAll') : chatShowTrade.formatHtml('showTradeUser'),
            cls;
        for (var i = start; i < length && i < start + 20; i++) {
            row = listData[i];
            if ($('#showTradeDiv .sd_ul li[sid="' + row._id + '"]').length > 0 && common.isBlank(chatShowTrade.tradeForUser)) {
                continue;
            }
            switch (row.status) {
                case 1:
                    cls = '';
                    break;
                case 0:
                    cls = ' class="checking"';
                    break;
                case -1:
                    cls = ' class="failed"';
                    break;
            }
            var showTradeDate = common.formatterDateTime(row.showDate, '/').substr(5, 11);
            commentTemp = row.comments; //晒单评论列表
            if (common.isBlank(chatShowTrade.tradeForUser)) {
                var sid = row._id;
                tradeHtml = tradeFormat.formatStr(row.title, row.user.userName, showTradeDate, row.tradeImg, row.remark, common.isBlank(row.praise) ? 0 : row.praise, row._id, row.user.userNo, row.user.avatar);
                var tempTrade = $(tradeHtml);
                if (i % 2 != 0) { //右边晒单
                    $('#showTradeDiv .scrollbox ul.sd_ul li').removeClass('r');
                    //加载晒单评论
                    chatShowTrade.setTradeComments(commentTemp, tempTrade, sid);
                    $('#right_sdul').append(tempTrade);
                    $('#showTradeDiv .scrollbox ul.sd_ul li:odd').addClass('r');
                } else { //左边晒单
                    $('#showTradeDiv .scrollbox ul.sd_ul li').removeClass('r');
                    //加载晒单评论
                    chatShowTrade.setTradeComments(commentTemp, tempTrade, sid);
                    $('#left_sdul').append(tempTrade);
                    $('#showTradeDiv .scrollbox ul.sd_ul li:odd').addClass('r');
                }
            } else { //我的晒单
                tradeHtml = tradeFormat.formatStr(row.title, showTradeDate, row.tradeImg, row.remark, common.isBlank(row.praise) ? 0 : row.praise, row._id, cls);
                if (i % 2 != 0) {
                    $('.pop_mysd .sd_list .sd_ul li').removeClass('r');
                    $('#right_sdul_me').append(tradeHtml);
                    $('.pop_mysd .sd_list .sd_ul li:odd').addClass('r');
                } else {
                    $('.pop_mysd .sd_list .sd_ul li').removeClass('r');
                    $('#left_sdul_me').append(tradeHtml);
                    $('.pop_mysd .sd_list .sd_ul li:odd').addClass('r');
                }
            }
        }
        if (i >= length - 1) {
            chatShowTrade.tradeLoadAll = true;
        }
        chatShowTrade.setUserShowTrade();
        chatShowTrade.showTradePraise();
        if (common.isBlank(chatShowTrade.tradeForUser)) {
            indexJS.setListScroll('#showTradeDiv .scrollbox', null, { callbacks: { onTotalScroll: function() { chatShowTrade.setShowTrade(); } } }); /*设置滚动条*/
        } else {
            $('.pop_mysd .sd_list .scrollbox').height(340);
            indexJS.setListScroll('.pop_mysd .sd_list .scrollbox', null, { callbacks: { onTotalScroll: function() { chatShowTrade.setShowTrade(); } } }); /*设置滚动条*/
        }
    },

    /**
     * 用户晒单评论
     */
    setTradeComments: function(commentTemp, tempTrade, sid) {
        $(tempTrade).find('.cont').append('<div class="sd_comment" id="commentList" ></div>');
        var index = 0;
        var initialComments = "";
        if (commentTemp.length > 0) {
            $(tempTrade).data("commentListData", commentTemp);
            for (var j = 0; j < commentTemp.length; j++) {
                index++;
                if (index > 2) {
                    var loadHtml = '<div class="sd_loadcomment"><a href="javascript:void(0)" onclick="chatShowTrade.loadAllCommment(\'' + sid + '\')">展开全部</a></div>';
                    $(tempTrade).find('#commentList').append(loadHtml);
                    break;
                }
                var showTradeDate = common.formatterDateTime(commentTemp[j].dateTime, '/').substr(5, 11);
                var commentList = $(tempTrade).find('#commentList');
                if (commentTemp[j].refId != "") {
                    var object = commentList.find("p[cid='" + commentTemp[j].refId + "']").children().eq(0);
                    var user = object.text();
                    if (user != commentTemp[j].userName) {
                        commentList.append('<p cid="' + commentTemp[j]._id + '" refId="' + commentTemp[j].refId + '"><a href="javascript:void(0)" class="sd_author">' + commentTemp[j].userName + '</a>  回复 <a href="javascript:void(0)" class="sd_author">' + user + '</a>：<span>' + commentTemp[j].content + '</span><span class="time">' + showTradeDate + ' <a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>');
                        initialComments += '<p cid="' + commentTemp[j]._id + '" refId="' + commentTemp[j].refId + '"><a href="javascript:void(0)" class="sd_author">' + commentTemp[j].userName + '</a>  回复 <a href="javascript:void(0)" class="sd_author">' + user + '</a>：<span>' + commentTemp[j].content + '</span><span class="time">' + showTradeDate + ' <a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                    } else {
                        commentList.
                        append('<p cid="' + commentTemp[j]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentTemp[j].userName + '</a>：<span>' + commentTemp[j].content + '</span>' +
                            '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>');
                        initialComments += '<p cid="' + commentTemp[j]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentTemp[j].userName + '</a>：<span>' + commentTemp[j].content + '</span>' +
                            '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                    }
                } else {
                    initialComments += '<p cid="' + commentTemp[j]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentTemp[j].userName + '</a>：<span>' + commentTemp[j].content + '</span>' +
                        '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>';
                    commentList.
                    append('<p cid="' + commentTemp[j]._id + '"><a href="javascript:void(0)" class="sd_author">' + commentTemp[j].userName + '</a>：<span>' + commentTemp[j].content + '</span>' +
                        '<span class="time">' + showTradeDate + '<a href="javascript:void(0)" class="com-replybtn" title="回复"></a></span></p>');
                }
            }
            $(tempTrade).data("initialComments", initialComments); //初始晒单评论
        } else {
            $(tempTrade).find('#commentList').hide();
        }
    },

    /**
     * 用户晒单数据
     */
    setUserShowTrade: function() {
        $('#showTradeDiv .sd_ul li .sd_tit .dep a').unbind("click").click(function() {
            chatShowTrade.tradeForUser = $(this).attr('userId');
            chatShowTrade.initShowTrade();
            $('.pop_mysd .personal_info .headimg img').attr('src', $(this).attr('avatar'));
            $('.pop_mysd .personal_info .username').text($(this).text());
            $('.pop_mysd .personal_info .infobar').addClass('dn');
            common.openPopup('.pop_mysd,.blackbg');
        });
    },
    /**
     * 我要晒单提交
     */
    showTrade: function() {
        var title = $('#title').val();
        var userName = $('#userName').val();
        var tradeImg = $('#tradeImg').val();
        var remark = $('#remark').val();
        if (common.isBlank(title)) {
            $('#trade_error').text('请输入标题').show();
        } else if (common.isBlank(userName)) {
            $('#trade_error').text('请输入晒单人').show();
        } else if (!common.isRightName(userName)) {
            $('#trade_error').text('晒单人为2至10位字符(数字/英文/中文/下划线)，不能全数字!');
        } else if (common.isBlank(tradeImg)) {
            $('#trade_error').text('请上传晒单图片').show();
        } else {
            var params = {
                groupType: indexJS.userInfo.groupType,
                groupId: indexJS.userInfo.groupId,
                userNo: indexJS.userInfo.userId,
                avatar: $('#avatarInfoId').attr('src'),
                userName: userName,
                tradeImg: tradeImg,
                remark: remark,
                title: title,
                tradeType: 2
            };
            common.getJson('/addShowTrade', { data: JSON.stringify(params) }, function(data) {
                if (data.isOK) {
                    box.showMsg('您的晒单已成功提交，等待系统审核！');
                    if (!indexJS.userInfo.isSetName) {
                        $('#myNickName').val(userName);
                        $('#setNkBtn').click();
                    }
                    $('.pop_addsd').hide();
                    $('.pop_addsd input[type="text"],.pop_addsd textarea').empty();
                } else {
                    box.showMsg(data.msg);
                }
            });
        }
    },
    /**
     * 晒单墙点赞事件
     */
    showTradePraise: function() {
        $('#showTradeDiv .scrollbox ul li .support,.pop_mysd .sd_list .sd_ul li .support').unbind("click").click(function() {
            var $this = $(this);
            var params = { clientId: indexJS.userInfo.userId, praiseId: $(this).parent().attr('id') };
            common.getJson("/setTradePraise", { data: JSON.stringify(params) }, function(result) {
                if (result.isOK) {
                    //$this.find('i').fadeIn().delay(400).fadeOut();
                    var sp = $this.parent().find("span");
                    sp.text(common.isValid(sp.text()) ? (parseInt(sp.text()) + 1) : 0);
                } else {
                    // box.showTipBox('亲，已点赞，当天只能点赞一次！');
                    box.showMsg('亲，已点赞，当天只能点赞一次！');
                }
                $this.addClass('supported');
                $this.attr('title', '已点赞');
            }, true);
        });
    },

    /**
     * 获取积分
     */
    getPointsInfo: function(sendGet) {
        common.getJson('/getPointsInfo', { params: JSON.stringify({ groupType: indexJS.userInfo.groupType }) }, function(data) {
            if (data) {
                var levelPointObj = {},
                    nextPointObj = {};
                for (var i = indexJS.pointLevel.length - 1; i >= 0; i--) {
                    var obj = indexJS.pointLevel[i];
                    if (data.pointsGlobal >= obj.points) {
                        levelPointObj = obj;
                        nextPointObj = indexJS.pointLevel[i + 1];
                        break;
                    }
                }
                $('#myLevel,#sdLevel').text(levelPointObj.name);
                $('.personal_center .levelbar .progress b,.pop_mysd .levelbar .progress b').css('width', (data.pointsGlobal / nextPointObj.points * 100) + '%');
                $('.personal_center .levelbar .le_detail,.pop_mysd .levelbar .le_detail').attr({ 'pg': data.pointsGlobal, 'sendget': sendGet }).text(data.pointsGlobal + '/' + nextPointObj.points);
                $('#mypoints,#sdPoints').text(data.points);
                var pointsGetDetail = [],
                    pointsConsumeDetail = [],
                    pointsGetHtml = chatShowTrade.formatHtml('getPoint'),
                    pointsConsumeHtml = chatShowTrade.formatHtml('pointConsume');
                if (common.isValid(data.journal)) {
                    $.each(data.journal, function(i, row) {
                        if (row.change > 0) {
                            pointsGetDetail.unshift(pointsGetHtml.formatStr(
                                common.formatterDate(row.date, '.'),
                                (row.remark ? row.remark + '，' : ''),
                                row.change));
                        } else if (row.change < 0) {
                            pointsConsumeDetail.unshift(
                                pointsConsumeHtml.formatStr(
                                    common.formatterDate(row.date, '.'),
                                    (row.remark ? row.remark + '，' : ''),
                                    Math.abs(row.change)));
                        }
                    });
                }
                $('#myPointsDetail .get .borbox table tbody').html(pointsGetDetail.join(''));
                $('#myPointsDetail .consume .borbox table tbody').html(pointsConsumeDetail.join(''));
                $('#myPointsDetail').css('height', '280px');
                indexJS.setListScroll($('#myPointsDetail'));
            } else {
                $('#myLevel,#sdLevel').text('L0');
                $('.personal_center .levelbar .progress b,.pop_mysd .levelbar .progress b').css('width', '0%');
                $('.personal_center .levelbar .le_detail,.pop_mysd .levelbar .le_detail').text('0/0');
                $('#mypoints,#sdPoints').text('0');
            }
        });
    },
    /**
     * 聊天室 推送用户晒单提示消息
     * @param data
     */
    pushShowTradeInfo: function(data) {
        var leftTradeHtml = '',
            rightTradeHtml = '',
            tradeFormat = chatShowTrade.formatHtml('showTradeAll'),
            row = null,
            txt = null;
        var html = chatShowTrade.formatHtml('pushShowTradeInfo');
        for (var i = 0, length = data.length; i < length; i++) {
            row = data[i];
            if ($('#showTradeDiv .sd_ul li[sid="' + row.id + '"]').length == 0) {
                var showTradeDate = common.formatterDateTime(row.showDate.time, '/').substr(5, 11);
                var sdCommentListHtml = '<div class="sd_comment" id="commentList" style="display: none"></div>';
                if (i % 2 != 0) {
                    $('#showTradeDiv .scrollbox ul #right_sdul li').removeClass('r');
                    rightTradeHtml = tradeFormat.formatStr(row.title, row.boUser.userName, showTradeDate, row.tradeImg, row.remark, (common.isBlank(row.praise) ? 0 : row.praise), row.id, row.boUser.userNo, row.boUser.avatar);
                    rightTradeHtml.find(".cont").append(sdCommentListHtml);
                    rightTradeHtml.insertBefore($("#right_sdul li").eq(0));
                    $('#showTradeDiv .scrollbox ul #right_sdul li:odd').addClass('r');
                } else {
                    $('#showTradeDiv .scrollbox ul #left_sdul li').removeClass('r');
                    leftTradeHtml = tradeFormat.formatStr(row.title, row.boUser.userName, showTradeDate, row.tradeImg, row.remark, (common.isBlank(row.praise) ? 0 : row.praise), row.id, row.boUser.userNo, row.boUser.avatar);
                    var $leftTradeHtml = $(leftTradeHtml);
                    $leftTradeHtml.find(".cont").append(sdCommentListHtml);
                    $leftTradeHtml.insertBefore($("#left_sdul li").eq(0));
                    $('#showTradeDiv .scrollbox ul #left_sdul li:odd').addClass('r');
                }
                indexJS.setListScroll('#showTradeDiv .scrollbox', null, { callbacks: { onTotalScroll: function() { chatShowTrade.setShowTrade(); } } }); /*设置滚动条*/
            }
            txt = row.boUser.userName + '在晒单墙晒了一单，' + (common.isBlank(row.title) ? '...' : row.title);
            $('#chatMsgContentDiv .dialoglist').append(html.formatStr(txt, row.id));
            chat.showSystemTopInfo("showTrade", row.id, txt);
        }
        chat.setTalkListScroll(true);
        $('#chatMsgContentDiv .dialoglist .pushclose').unbind('click');
        $('#chatMsgContentDiv .dialoglist .pushclose').click(function() {
            $(this).parent().hide();
        });
        $('#chatMsgContentDiv .dialoglist .showtrade').unbind('click');
        $('#chatMsgContentDiv .dialoglist .showtrade').click(function() {
            chatShowTrade.gotoLook($(this).attr('_id'));
        });
        chatShowTrade.showTradePraise();
    },
    /**去看看-晒单*/
    gotoLook: function(showTradeId) {
        $('.main_tabnav a[t="showtrade"]').click();
        if (common.isValid(showTradeId)) {
            /*滚动到指定位置*/
            indexJS.setListScroll('#showTradeDiv .scrollbox', $('#showTradeDiv #left_sdul li[sid="' + showTradeId + '"]').offset().top);
        }
    },


    /**
     * 根据传入的模块域标识返回待处理的html模板
     * @param region 模块域
     * @returns {string} html模板
     */
    formatHtml: function(region) {
        var formatHtmlArr = [];
        switch (region) {
            case 'showTradeAll':
                formatHtmlArr.push('<li sid="{6}">');
                formatHtmlArr.push('    <div class="cont">');
                formatHtmlArr.push('        <div class="sd_summary">{0}</div>');
                formatHtmlArr.push('        <div class="sd_tit">');
                formatHtmlArr.push('            <span class="dep">晒单人：<a href="javascript:void(0);" class="sd_author" userId="{7}" avatar="{8}">{1}</a></span>');
                formatHtmlArr.push('        </div>');
                formatHtmlArr.push('        <a href="{3}" data-rel="sd-img" data-title="{0}" data-lightbox="dialog-img">');
                formatHtmlArr.push('            <img src="{3}" alt="{0}" class="mCS_img_loaded"><i class="i-zoom"></i>');
                formatHtmlArr.push('        </a>');
                formatHtmlArr.push('        <p class="sd_p">{4}</p>');
                formatHtmlArr.push('        <div class="sd_bot">');
                formatHtmlArr.push('            <span class="sdtime">晒单时间: {2}</span>');
                formatHtmlArr.push('            <a href="javascript:void(0)" class="sd_cbtn" id="{6}"><i class="support"></i><span>{5}</span></a>');
                formatHtmlArr.push('            <a href="javascript:void(0)" class="sd_cbtn" id="{6}"><i class="comment"></i></a>');
                formatHtmlArr.push('        </div>');
                formatHtmlArr.push('    </div>');
                formatHtmlArr.push('</li>');
                break;
            case 'showTradeUser':
                formatHtmlArr.push('<li sid="{6}">');
                formatHtmlArr.push('    <div class="cont">');
                formatHtmlArr.push('        <div class="sd_summary">{0}</div>');
                formatHtmlArr.push('        <a href="{2}" data-rel="sd-img" data-title="{0}" data-lightbox="dialog-img">');
                formatHtmlArr.push('            <img src="{2}" alt="{0}" class="mCS_img_loaded"><i class="i-zoom"></i>');
                formatHtmlArr.push('        </a>');
                formatHtmlArr.push('        <p class="sd_p">{3}</p>');
                formatHtmlArr.push('        <div class="sd_bot">');
                formatHtmlArr.push('            <span class="sdtime">晒单时间: {1}</span>');
                formatHtmlArr.push('            <a href="javascript:void(0)" class="sd_cbtn" id="{5}"><i class="support"></i><span>{4}</span></a>');
                formatHtmlArr.push('        </div>');
                formatHtmlArr.push('    </div>');
                formatHtmlArr.push('</li>');
                break;
                break;
            case 'getPoint':
                formatHtmlArr.push('<tr>');
                formatHtmlArr.push('<td><span class="date">{0}</span></td>');
                formatHtmlArr.push('<td>{1}获得<b>{2}</b>积分</td>');
                formatHtmlArr.push('</tr>');
                break;
            case 'pointConsume':
                formatHtmlArr.push('<tr>');
                formatHtmlArr.push('<td><span class="date">{0}</span></td>');
                formatHtmlArr.push('<td>{1}消费<b>{2}</b>积分</td>');
                formatHtmlArr.push('</tr>');
                break;
            case 'pushShowTradeInfo':
                formatHtmlArr.push('<div class="info_push">');
                formatHtmlArr.push('    <div class="pushcont">系统：{0}</div>');
                formatHtmlArr.push('    <a href="javascript:void(0);" class="detailbtn showtrade" _id="{1}" onclick="_gaq.push([\'_trackEvent\', \'pmchat_studio\', \'right_lts_QuKankan\', \'content_right\', 1, true]);">去看看</a>');
                formatHtmlArr.push('    <a href="javascript:void(0);" class="pushclose"><i></i></a>');
                formatHtmlArr.push('</div>');
                break;
        }
        return formatHtmlArr.join('');
    }
};