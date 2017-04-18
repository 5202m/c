/**
 * 页面请求控制类
 * Created by Alan.wu on 2015/3/4.
 */
var router = require('express').Router();
var async = require('async'); //引入async
var request = require('request');
var constant = require('../../constant/constant'); //引入constant
var config = require('../../resources/config'); //引入config
var common = require('../../util/common'); //引入common
var versionUtil = require('../../util/versionUtil'); //引入versionUtil
var errorMessage = require('../../util/errorMessage');
var messageService = require('../../service/messageService'); //引入messageService
var userService = require('../../service/userService'); //引入userService
var baseApiService = require('../../service/baseApiService'); //引入baseApiService
var apiService = require('../../service/pmApiService'); //引入pmApiService
var syllabusService = require('../../service/syllabusService'); //引入syllabusService
var studioService = require('../../service/studioService'); //引入studioService
var chatService = require('../../service/chatService'); //引入chatService
var visitorService = require('../../service/visitorService'); //引入visitorService
var logger = require('../../resources/logConf').getLogger('base'); //引入log4js
var chatPraiseService = require('../../service/chatPraiseService'); //引入chatPraiseService
var showTradeService = require('../../service/showTradeService'); //引入chatPraiseService
var chatSubscribeTypeService = require(
    '../../service/chatSubscribeTypeService'); //引入chatSubscribeTypeService
var chatSubscribeService = require('../../service/chatSubscribeService'); //引入chatSubscribeService
var chatPointsService = require('../../service/chatPointsService'); //引入chatPointsService
var clientTrainService = require('../../service/clientTrainService'); //引入chatTeacherService
var zxFinanceService = require('../../service/zxFinanceService.js');
var activityService = require("../../service/activityService");
var cacheClient = require('../../cache/cacheClient');
var Geetest = require('geetest');
var geetest = {};
for (var i in config.geetest) {
    geetest[i] = {
        pc: new Geetest({
            geetest_id: config.geetest[i].pc.id,
            geetest_key: config.geetest[i].pc.key
        }),
        mobile: new Geetest({
            geetest_id: config.geetest[i].mobile.id,
            geetest_key: config.geetest[i].mobile.key
        })
    };
}


/**
 * 从基本路径提取groupType
 * 备注：route的基本路径配置的字符基本是与groupType保持一致的，所以可以直接从baseUrl中提取
 * @param baseUrl
 */
function getGroupType(req, isBase) {
    return "studio";
}


/**
 * 判断是否微盘
 * @param platform
 * @param req
 */
function isWetrade(platform, req) {
    return platform && platform.indexOf("wr_") != -1 &&
        constant.fromPlatform.hxstudio == getGroupType(req);
}

/**
 * 获取重定向URL参数
 * @param req
 */
function getRredirctUrl(req) {
    var paramArr = ["ko=1"];
    var argKeys = ["utm_source", "utm_medium", "utm_content", "utm_campaign"],
        argKey;
    for (var i = 0, lenI = argKeys.length; i < lenI; i++) {
        argKey = argKeys[i];
        if (req.query[argKey]) {
            paramArr.push(argKey + "=" + req.query[argKey]);
        }
    }
    return paramArr.length > 0 ? ("?" + paramArr.join("&")) : "";
}

function handleRoomIdinUrl(roomId, chatUser, res) {
    roomId = roomId || null;
    if (!chatUser) {
        return
    }
    if (common.isBlank(roomId)) {
        return;
    }
    chatUser.intentionalRoomId = roomId;
    if (chatUser.isLogin) {
        chatUser.toGroup = roomId || chatUser.toGroup;
    }
}
/**
 * 直播间页面入口
 */
router.get('/', function(req, res) {
    common.setCrossDomain(req, res);
    var options = null;
    var isKeepOptions = req.query["ko"] == 1;
    if (isKeepOptions) {
        options = req.session.studioOptions || {};
    } else {
        options = {
            platform: req.query["platform"] || "",
            theme: req.query["theme"] || "",
            timezone: req.query["tz"] || 8,
            preReg: req.query["pr"] == 1
        };
        req.session.studioOptions = options;
    }
    var chatUser = req.session.studioUserInfo,
        clientGroup = constant.clientGroup.visitor;
    var targetGType = getGroupType(req);
    var openId = req.query["userId"];
    let appToken = req.query['token'];
    if (openId) {
        studioService.login({ thirdId: openId, groupType: getGroupType(req) }, 3,
            function(loginRes) {
                if (loginRes.isOK) {
                    loginRes.userInfo.isLogin = true;
                    req.session.studioUserInfo = loginRes.userInfo;
                    req.session.studioUserInfo.firstLogin = true;
                } else {
                    req.session.studioUserInfo = {
                        isLogin: false,
                        clientGroup: constant.clientGroup.visitor,
                        userType: constant.roleUserType.visitor,
                        mobilePhone: null,
                        thirdId: openId
                    };
                }
                res.redirect(getGroupType(req, true) + getRredirctUrl(req));
            });
        return;
    } else if (appToken && options.platform && options.platform == 'app') {
        targetGType = getGroupType(req, false);
        let params = {
            clientId: config.appAutoLogin.clientId,
            token: appToken,
            remoteIp: common.getClientIp(req),
            timestamp: common.formatDate(new Date(), 'yyyyMMddHHmmssSSS')
        }
        params.sign = common.getMD5(
            'clientId=' + params.clientId + '&token=' + appToken + '&remoteIp=' +
            params.remoteIp + '&timestamp=' + params.timestamp + '&key=' +
            config.appAutoLogin.rgsKey);
        request.post({ url: config.appAutoLogin.rgsUrl, form: params },
            function(error, response, tmpData) {
                if (error) {
                    logger.error("rgs validate->error" + error);
                    res.redirect(getGroupType(req, true) + getRredirctUrl(req));
                }
                tmpData = typeof tmpData == 'string' ? JSON.parse(tmpData) : tmpData;
                if (tmpData && tmpData.code == 'success') {
                    try {
                        let account = tmpData.result;
                        studioService.checkClientGroup(null, account,
                            common.getTempPlatformKey(targetGType),
                            function(clientGroup, accountNo) {
                                var userInfo = {
                                    mobilePhone: accountNo,
                                    ip: params.remoteIp,
                                    groupType: 'studio',
                                    accountNo: account,
                                    clientGroup: clientGroup
                                };
                                studioService.checkMemberAndSave(userInfo,
                                    function(result) {
                                        studioService.login({ userId: result.userId, groupType: targetGType },
                                            2,
                                            function(loginRes) {
                                                if (loginRes.isOK) {
                                                    loginRes.userInfo.isLogin = true;
                                                    req.session.studioUserInfo = loginRes.userInfo;
                                                    req.session.studioUserInfo.clientGroup = clientGroup;
                                                    req.session.studioUserInfo.firstLogin = true;
                                                } else {
                                                    req.session.studioUserInfo = {
                                                        isLogin: false,
                                                        clientGroup: constant.clientGroup.visitor,
                                                        userType: constant.roleUserType.visitor,
                                                        mobilePhone: null,
                                                        userId: result.userId
                                                    };
                                                }
                                                res.redirect('/');
                                                return;
                                            });
                                    });
                            });
                    } catch (e) {
                        logger.error("rgs validate->error" + e);
                        res.redirect(getGroupType(req, true) + getRredirctUrl(req));
                    }
                } else {
                    res.redirect(getGroupType(req, true) + getRredirctUrl(req));
                }
            });
        return;
    } else if (chatUser && chatUser.isLogin) {
        clientGroup = chatUser.clientGroup;
    } else {
        if (!chatUser) {
            chatUser = {};
            chatUser.isLogin = false;
            chatUser.clientGroup = clientGroup;
            chatUser.userType = constant.roleUserType.visitor;
            req.session.studioUserInfo = chatUser;
        }
    }
    if (req.session.logoutToGroup) {
        chatUser.toGroup = req.session.logoutToGroup;
        req.session.logoutToGroup = null;
    }
    handleRoomIdinUrl(req.query["roomId"], chatUser);
    chatUser.groupType = targetGType;
    chatUser.userType = chatUser.userType || constant.roleUserType.member; //没有userType则默认为会员
    logger.info(
        "chatUser:" + JSON.stringify(chatUser) + ";ip:" + common.getClientIp(
            req));
    var isMobile = common.isMobile(req);
    var fromPlatform = options.platform;
    if (!isKeepOptions && fromPlatform && !chatUser.toGroup && !chatUser.groupId &&
        common.containSplitStr(config.studioThirdUsed.platfrom,
            fromPlatform)) {
        chatUser.groupId = config.studioThirdUsed.roomId[chatUser.groupType];
    } else if (fromPlatform == "wechat") {
        chatUser.groupId = null; //微信每次请求直接跳转到首页
    }
    var redirctUrl = getRredirctUrl(req);
    if (isMobile && !chatUser.toGroup && !chatUser.groupId) {
        chatUser.groupId = null;
        req.session.studioUserInfo.groupId = null;
        toStudioView(chatUser, options, null, clientGroup, isMobile, req, res);
        return;
    }
    studioService.getDefaultRoom(chatUser.groupType, clientGroup,
        function(groupId) {
            if (common.isBlank(groupId)) {
                req.session.studioUserInfo = null;
                logger.error(new Error("获取groupId失败导致默认房间设置有误，请检查！"));
                res.render("error", errorMessage.code_12);
            } else {
                var targetGroupId = chatUser.toGroup || chatUser.groupId || groupId;
                chatService.getRoomOnlineTotalNum(targetGroupId,
                    function(onlineNum) {
                        userService.checkRoomStatus(chatUser.userId, targetGroupId,
                            onlineNum,
                            function(isOK) {
                                if (isOK) {
                                    if (targetGroupId != chatUser.groupId) { //目标房间不是当前已登录房间==>追加到目标房间，后跳转
                                        studioService.joinNewGroup(chatUser.groupType,
                                            chatUser.mobilePhone, chatUser.userId,
                                            targetGroupId, chatUser.isLogin,
                                            function(resultTmp) {
                                                req.session.studioUserInfo.toGroup = null;
                                                req.session.studioUserInfo.groupId = targetGroupId;
                                                toStudioView(chatUser, options, targetGroupId,
                                                    clientGroup, isMobile, req, res);
                                            });
                                    } else { //目标房间是当前已登录房间==>直接跳转
                                        req.session.studioUserInfo.toGroup = null;
                                        req.session.studioUserInfo.groupId = targetGroupId;
                                        toStudioView(chatUser, options, targetGroupId,
                                            clientGroup, isMobile, req, res);
                                    }
                                } else if (targetGroupId == chatUser.toGroup) { //目标房间是跳转房间==>清空跳转，重新刷新
                                    req.session.studioUserInfo.toGroup = null;
                                    res.redirect(getGroupType(req, true) + redirctUrl);
                                } else if (targetGroupId == chatUser.groupId) { //目标房间是当前房间==>登出重新跳转
                                    req.session.studioUserInfo = null;
                                    res.redirect(getGroupType(req, true) + redirctUrl);
                                } else { //目标房间是默认房间(此时肯定未登录状态，否则会满足“目标房间是当前房间”)==>直接报错
                                    req.session.studioUserInfo = null;
                                    res.render("error", errorMessage.code_12);
                                }
                            });
                    });
            }
        });
});

//转到页面
function toStudioView(chatUser, options, groupId, clientGroup, isMobile, req,
    res) {
    studioService.getIndexLoadData(chatUser, groupId, true,
        (!isMobile || (isMobile && common.isValid(groupId))), chatUser.isLogin,
        function(data) {
            if (chatUser.isLogin) {
                //每次刷新，从后台数据库重新获取最新客户信息后更新session，应用于升级和修改昵称等
                for (var key in data.memberInfo) {
                    req.session.studioUserInfo[key] = data.memberInfo[key];
                    chatUser[key] = data.memberInfo[key];
                }
            }
            var ip = common.getClientIp(req);
            var newStudioList = [],
                rowTmp = null;
            var isVisitor = (constant.clientGroup.visitor == clientGroup);
            var viewDataObj = {
                apiUrl: common.formatHostUrl(req.hostname, config.apiUrl),
                filePath: common.formatHostUrl(req.hostname, config.filesDomain),
                web24kPath: config.web24kPath,
                mobile24kPath: config.mobile24kPath
            }; //输出参数
            chatUser.groupId = groupId;
            viewDataObj.theme = options.theme || "";
            viewDataObj.socketUrl = JSON.stringify(
                common.formatHostUrl(req.hostname, config.socketServerUrl));
            viewDataObj.userInfo = JSON.stringify({
                avatar: chatUser.avatar,
                groupType: chatUser.groupType,
                isLogin: chatUser.isLogin,
                groupId: chatUser.groupId,
                userId: chatUser.userId,
                clientGroup: chatUser.clientGroup,
                nickname: chatUser.nickname,
                userType: chatUser.userType,
                platform: options && options.platform,
                intentionalRoomId: chatUser.intentionalRoomId,
                sid: req.sessionID
            });
            chatUser.intentionalRoomId = null; //用完了就销毁这个值。
            viewDataObj.userSession = chatUser;
            viewDataObj.serverTime = new Date().getTime();
            viewDataObj.syllabusData = '';
            viewDataObj.currStudioAuth = false;
            viewDataObj.visitorSpeak = false;
            if (!data.studioList) {
                if (data.syllabusResult) {
                    var syResult = data.syllabusResult;
                    viewDataObj.syllabusData = JSON.stringify({
                        courseType: syResult.courseType,
                        studioLink: (common.isBlank(syResult.studioLink) ? "" :
                            JSON.parse(syResult.studioLink)),
                        courses: (common.isBlank(syResult.courses) ? "" :
                            syllabusService.removeContext(JSON.parse(syResult.courses)))
                    });
                }
            } else {
                viewDataObj.lgBoxTipInfo = "";
                viewDataObj.onlineNumValSet = '';
                data.studioList.forEach(function(row) {
                    rowTmp = {};
                    rowTmp.id = row._id;
                    rowTmp.name = row.name;
                    rowTmp.level = row.level;
                    rowTmp.isCurr = (row._id == groupId);
                    //聊天室规则
                    rowTmp.allowWhisper = common.containSplitStr(row.talkStyle, 1);
                    rowTmp.whisperRoles = row.whisperRoles;
                    rowTmp.disable = (!common.containSplitStr(row.clientGroup,
                        clientGroup));
                    rowTmp.allowVisitor = isVisitor ? (!rowTmp.disable) :
                        common.containSplitStr(row.clientGroup,
                            constant.clientGroup.visitor);
                    rowTmp.roomType = row.roomType;
                    rowTmp.status = row.status;
                    rowTmp.trainAuth = -1;
                    rowTmp.openDate = common.isValid(row.openDate) ? JSON.parse(
                        row.openDate) : {};
                    //rowTmp.traninClient = row.traninClient;
                    if (rowTmp.status == 2) {
                        if (row.traninClient) {
                            var length = row.traninClient.length;
                            for (var i = 0; i < length; i++) {
                                if (row.traninClient[i].clientId == chatUser.userId) {
                                    rowTmp.trainAuth = row.traninClient[i].isAuth;
                                    break;
                                }
                            }
                        }
                    }
                    var ruleArr = row.chatRules,
                        isPass = true,
                        ruleRow = null;
                    for (var i in ruleArr) {
                        ruleRow = ruleArr[i];
                        isPass = common.dateTimeWeekCheck(ruleRow.periodDate, true);
                        if (ruleRow.type == 'whisper_allowed') {
                            if (rowTmp.allowWhisper && !isPass) {
                                rowTmp.allowWhisper = false;
                                rowTmp.whisperRoles = null;
                            }
                        } else if (ruleRow.type == 'visitor_filter') {
                            if (rowTmp.isCurr && rowTmp.allowVisitor && isPass) {
                                viewDataObj.visitorSpeak = true;
                            }
                        } else if (ruleRow.type == 'login_time_set') {
                            if (rowTmp.isCurr) {
                                var periodDate = common.isBlank(ruleRow.periodDate) ? "" :
                                    JSON.parse(ruleRow.periodDate);
                                viewDataObj.lgBoxTipInfo = JSON.stringify({
                                    type: ruleRow.type,
                                    periodDate: periodDate,
                                    beforeRuleVal: ruleRow.beforeRuleVal,
                                    afterRuleTips: ruleRow.afterRuleTips
                                });
                            }
                            if (isPass) {
                                rowTmp.loginBoxTime = ruleRow.beforeRuleVal;
                                rowTmp.loginBoxTip = ruleRow.afterRuleTips;
                            }
                        } else if (ruleRow.type == 'speak_num_set' && isPass) {
                            rowTmp.speakNum = ruleRow.beforeRuleVal;
                            rowTmp.speakNumTip = ruleRow.afterRuleTips;
                        } else if (ruleRow.type == 'online_mem_set' && isPass) {
                            rowTmp.onlineNumValSet = ruleRow.beforeRuleVal;
                        }
                    }
                    rowTmp.remark = common.trim(row.remark);
                    rowTmp.clientGroup = common.trim(row.clientGroup);
                    rowTmp.isOpen = common.dateTimeWeekCheck(row.openDate, true);
                    if (rowTmp.isCurr) {
                        viewDataObj.currStudioAuth = !rowTmp.disable;
                        if (data.syllabusResult) {
                            var syResult = data.syllabusResult;
                            viewDataObj.syllabusData = JSON.stringify({
                                courseType: syResult.courseType,
                                studioLink: (common.isBlank(syResult.studioLink) ? "" :
                                    JSON.parse(syResult.studioLink)),
                                courses: (common.isBlank(syResult.courses) ? "" :
                                    syllabusService.removeContext(
                                        JSON.parse(syResult.courses)))
                            });
                        }
                        viewDataObj.defTemplate = row.defTemplate;
                    }
                    rowTmp.defTemplate = row.defTemplate;
                    rowTmp.defaultAnalyst = row.defaultAnalyst || {};
                    newStudioList.push(rowTmp);
                });
            }
            viewDataObj.studioList = newStudioList;
            viewDataObj.isDevTest = config.isDevTest;
            viewDataObj.redPacketLastPeriods = constant.periods.toString();
            //记录访客信息
            var fromPlatform = options.platform;
            var snUser = req.session.studioUserInfo;
            if (snUser.firstLogin && snUser.groupId) { //刷新页面不记录访客记录
                snUser.firstLogin = false;
                var courseName = req.body['title'] || '' + '_' + req.body['lecturer'] ||
                    '' + '_' + req.body['courseTypeName'] || '';
                var vrRow = {
                    cookieId: snUser.cookieId,
                    sessionId: req.sessionID,
                    userId: snUser.userId,
                    platform: fromPlatform || "",
                    userAgent: req.headers["user-agent"],
                    groupType: getGroupType(req),
                    roomName: '',
                    roomId: snUser.groupId,
                    nickname: snUser.nickname,
                    userName: snUser.userName,
                    email: snUser.email,
                    clientGroup: chatUser.clientGroup,
                    clientStoreId: snUser.clientStoreId,
                    mobile: snUser.mobilePhone,
                    ip: ip,
                    visitorId: snUser.visitorId,
                    nickName: snUser.nickname,
                    courseName: courseName,
                    courseId: req.body['courseId'],
                    teacherId: req.body['lecturerId'],
                    teacherName: req.body['lecturer'],
                    accountNo: snUser.accountNo
                };
                visitorService.saveVisitorRecord("login", vrRow);
            }
            if (snUser.groupId == config.cjTrainRoom) {
                viewDataObj.isRedPacket = config.isRedPacket;
            } else {
                viewDataObj.isRedPacket = false;
            }
            viewDataObj.options = JSON.stringify(options);
            viewDataObj.fromPlatform = options.platform;
            viewDataObj.version = versionUtil.getVersion();
            if (!isMobile && fromPlatform == config.studioThirdUsed.webui &&
                chatUser.groupType != constant.fromPlatform.studio) {
                res.render(
                    common.renderPath(req, constant.tempPlatform.webui, "room"),
                    viewDataObj);
                return;
            }
            var isThirdUsed = fromPlatform && common.containSplitStr(
                config.studioThirdUsed.platfrom, fromPlatform);
            if (isMobile) {
                /*if(groupId){
                 res.render(common.renderPath(req,constant.tempPlatform.mb,"room"),viewDataObj);
                 }else{*/
                res.render(common.renderPath(req, constant.tempPlatform.mb),
                    viewDataObj);
                //}
            } else {
                if (isThirdUsed && fromPlatform != config.studioThirdUsed.webui) {
                    res.render(common.renderPath(req, constant.tempPlatform.mini),
                        viewDataObj);
                } else {
                    var defTemplate = null;
                    try {
                        defTemplate = common.isValid(viewDataObj.defTemplate) ?
                            JSON.parse(viewDataObj.defTemplate).theme : null;
                    } catch (e) {

                    }
                    res.render(common.renderPath(req, constant.tempPlatform.pc, null,
                        defTemplate), viewDataObj);
                }
            }
        });
}

/**
 * 跳转到视频专属页面
 */
router.get('/gotoVideo', function(req, res) {
    var params = {
        playerType: req.query["playerType"] || "",
        studioType: req.query["studioType"] || "",
        videoType: req.query["videoType"] || "",
        url: req.query["url"] || "",
        title: req.query["title"] || ""
    };
    res.render(common.renderPath(req, constant.tempPlatform.webui, "video"),
        params);
});

/**
 * 提取手机验证码
 */
router.get('/getMobileVerifyCode', function(req, res) {
    var mobilePhone = req.query["mobilePhone"];
    var useType = req.query["useType"];
    var ip = common.getClientIp(req);
    if (common.isBlank(mobilePhone) || !common.isMobilePhone(mobilePhone)) {
        res.json(errorMessage.code_1003);
    } else if (common.isBlank(useType)) {
        res.json(errorMessage.code_1000);
    } else {
        baseApiService.getMobileVerifyCode(mobilePhone, useType, ip,
            function(result) {
                delete result["data"];
                res.json(result);
            });
    }
});
/**
 * 直播间登录
 * 1）手机号+验证码直接登陆，如果没有从API中检查用户类型并添加一条记录
 * 2）用户ID登陆
 */
router.post('/login', function(req, res) {
    var mobilePhone = req.body["mobilePhone"],
        verifyCode = req.body["verifyCode"],
        userId = req.body["userId"],
        password = req.body["password"],
        loginType = req.body["loginType"], //pwd、verify
        clientStoreId = req.body["clientStoreId"],
        cookieId = req.body['cookieId'],
        visitorId = req.body['visitorId'],
        roomName = req.body['roomName'],
        courseId = req.body['courseId'],
        courseName = req.body['courseName'],
        teacherId = req.body['teacherId'],
        teacherName = req.body['teacherName'];
    var result = { isOK: false, error: null };
    var isAutoLogin = !common.isBlank(userId) && common.isBlank(loginType);
    var userSession = req.session.studioUserInfo;
    if (!userSession || !userSession.groupType) {
        res.json(result);
        return;
    }
    if (!isAutoLogin) {
        if ("pwd" == loginType) {
            if (common.isBlank(mobilePhone) || common.isBlank(password)) {
                result.error = errorMessage.code_1005;
            }
        } else {
            if (common.isBlank(mobilePhone) || common.isBlank(verifyCode)) {
                result.error = errorMessage.code_1006;
            }
        }
        /*if(!common.isMobilePhone(mobilePhone)){
         result.error=errorMessage.code_1003;
         }*/
    }
    if (result.error) {
        res.json(result);
    } else if (!isAutoLogin) {
        var thirdId = (userSession && userSession.thirdId) || null;
        if (loginType == "pwd") {
            //账号密码登录
            studioService.login({
                mobilePhone: mobilePhone,
                password: password,
                groupType: userSession.groupType
            }, 4, function(loginRes) {
                if (loginRes.isOK && constant.clientGroup.real !=
                    loginRes.userInfo.clientGroup) {
                    //real 类型客户将拆分成A和N客户
                    loginRes.userInfo.isLogin = true;
                    req.session.studioUserInfo = loginRes.userInfo;
                    req.session.studioUserInfo.clientStoreId = clientStoreId;
                    req.session.studioUserInfo.firstLogin = true;
                    req.session.studioUserInfo.cookieId = cookieId;
                    req.session.studioUserInfo.visitorId = visitorId;
                    req.session.studioUserInfo.roomName = roomName;
                    //req.session.studioUserInfo.courseId = courseId;
                    //req.session.studioUserInfo.courseName = courseName;
                    var snUser = req.session.studioUserInfo;
                    var dasData = {
                        mobile: mobilePhone,
                        cookieId: cookieId,
                        clientGroup: snUser.clientGroup,
                        roomName: roomName,
                        roomId: snUser.groupId,
                        platform: '',
                        userAgent: req.headers['user-agent'],
                        sessionId: req.sessionID,
                        roomId: snUser.groupId,
                        clientStoreId: snUser.clientStoreId,
                        groupType: snUser.groupType,
                        userName: snUser.userName,
                        email: snUser.email,
                        ip: common.getClientIp(req),
                        visitorId: visitorId,
                        nickName: snUser.nickname,
                        courseName: courseName,
                        courseId: courseId,
                        teacherId: teacherId,
                        teacherName: teacherName,
                        accountNo: snUser.accountNo
                    };
                    visitorService.saveVisitorRecord("login", dasData);
                    if (loginRes.userInfo.clientGroup != constant.clientGroup.vip &&
                        loginRes.userInfo.clientGroup != constant.clientGroup.active) { //检查账号接口同步数据
                        studioService.checkClientGroup(loginRes.userInfo.mobilePhone, null,
                            common.getTempPlatformKey(userSession.groupType),
                            function(clientGroup, accountNo) {
                                if (constant.clientGroupSeq[clientGroup] <
                                    constant.clientGroupSeq[loginRes.userInfo.clientGroup]) {
                                    res.json({ isOK: true, userInfo: req.session.studioUserInfo });
                                } else {
                                    var userInfo = {
                                        mobilePhone: loginRes.userInfo.mobilePhone,
                                        ip: common.getClientIp(req),
                                        groupType: userSession.groupType,
                                        accountNo: accountNo,
                                        clientGroup: clientGroup
                                    };
                                    studioService.checkMemberAndSave(userInfo,
                                        function(result) {
                                            req.session.studioUserInfo.defGroupId = userInfo.defGroupId;
                                            req.session.studioUserInfo.clientGroup = userInfo.clientGroup;
                                            res.json({
                                                isOK: true,
                                                userInfo: req.session.studioUserInfo
                                            });
                                        });
                                }
                            });
                    } else {
                        res.json({ isOK: true, userInfo: req.session.studioUserInfo });
                    }
                } else if (loginRes.isOK) {
                    res.json({ isOK: true, userInfo: req.session.studioUserInfo });
                } else {
                    res.json(loginRes);
                }
            });
        } else {
            //手机号+验证码登陆
            baseApiService.checkMobileVerifyCode(mobilePhone,
                userSession.groupType + "_login", verifyCode,
                function(chkCodeRes) {
                    if (!chkCodeRes || chkCodeRes.result != 0 || !chkCodeRes.data) {
                        if (chkCodeRes.errcode === "1006" || chkCodeRes.errcode ===
                            "1007") {
                            result.error = {
                                'errcode': chkCodeRes.errcode,
                                'errmsg': chkCodeRes.errmsg
                            };
                            res.json(result);
                        } else {
                            result.error = errorMessage.code_1007;
                            res.json(result);
                        }
                    } else {
                        studioService.login({
                            mobilePhone: mobilePhone,
                            thirdId: thirdId,
                            groupType: userSession.groupType
                        }, 1, function(loginRes) {
                            if (loginRes.isOK) {
                                var snUser = req.session.studioUserInfo;
                                var dasData = {
                                    mobile: mobilePhone,
                                    cookieId: cookieId,
                                    clientGroup: snUser.clientGroup,
                                    roomName: snUser.roomName,
                                    roomId: snUser.groupId,
                                    platform: '',
                                    userAgent: req.headers['user-agent'],
                                    sessionId: req.sessionID,
                                    roomId: snUser.groupId,
                                    clientStoreId: clientStoreId,
                                    groupType: snUser.groupType,
                                    userName: snUser.userName,
                                    email: snUser.email,
                                    ip: common.getClientIp(req),
                                    visitorId: visitorId,
                                    nickName: snUser.nickname,
                                    courseName: snUser.courseName,
                                    accountNo: snUser.accountNo
                                };
                                visitorService.saveVisitorRecord("login", dasData);
                            }
                            if (!loginRes.isOK) {
                                studioService.checkClientGroup(mobilePhone, null,
                                    common.getTempPlatformKey(userSession.groupType),
                                    function(clientGroup, accountNo) {
                                        var userInfo = {
                                            mobilePhone: mobilePhone,
                                            ip: common.getClientIp(req),
                                            groupType: userSession.groupType,
                                            accountNo: accountNo,
                                            thirdId: null
                                        };
                                        studioService.studioRegister(userInfo, clientGroup,
                                            function(result) {
                                                if (result && result.isOK) {
                                                    req.session.studioUserInfo = {
                                                        cookieId: cookieId,
                                                        visitorId: visitorId,
                                                        roomName: roomName,
                                                        groupType: userSession.groupType,
                                                        clientStoreId: clientStoreId,
                                                        firstLogin: true,
                                                        isLogin: true,
                                                        mobilePhone: result.mobilePhone,
                                                        userId: result.userId,
                                                        groupId: result.groupId,
                                                        clientGroup: result.clientGroup,
                                                        nickname: result.nickname
                                                    };
                                                    result.userInfo = req.session.studioUserInfo;
                                                    delete result.groupId;
                                                    delete result.userId;
                                                }
                                                var snUser = req.session.studioUserInfo;
                                                var dasData = {
                                                    mobile: mobilePhone,
                                                    cookieId: cookieId,
                                                    clientGroup: 'register',
                                                    roomName: (common.isBlank(snUser.roomName) ? '' : snUser.roomName),
                                                    roomId: snUser.groupId,
                                                    platform: '',
                                                    userAgent: req.headers['user-agent'],
                                                    sessionId: req.sessionID,
                                                    roomId: snUser.groupId,
                                                    clientStoreId: clientStoreId,
                                                    groupType: snUser.groupType,
                                                    userName: snUser.userName,
                                                    email: snUser.email,
                                                    ip: common.getClientIp(req),
                                                    visitorId: visitorId,
                                                    nickName: snUser.nickname,
                                                    courseName: snUser.courseName,
                                                    accountNo: snUser.accountNo
                                                };
                                                visitorService.saveVisitorRecord("register",
                                                    dasData);
                                                res.json(result);
                                                return;
                                            });
                                    });
                                //res.json(loginRes);
                                //return;
                            } else if (constant.clientGroup.real !=
                                loginRes.userInfo.clientGroup) {
                                //real 类型客户将拆分成A和N客户
                                loginRes.userInfo.isLogin = true;
                                req.session.studioUserInfo = loginRes.userInfo;
                                req.session.studioUserInfo.clientStoreId = clientStoreId;
                                req.session.studioUserInfo.firstLogin = true;
                                req.session.studioUserInfo.cookieId = cookieId;
                                req.session.studioUserInfo.visitorId = visitorId;
                                req.session.studioUserInfo.roomName = roomName;
                                //req.session.studioUserInfo.courseId = courseId;
                                //req.session.studioUserInfo.courseName = courseName;
                                res.json({ isOK: true, userInfo: req.session.studioUserInfo });
                            } else {
                                studioService.checkClientGroup(mobilePhone, null,
                                    common.getTempPlatformKey(userSession.groupType),
                                    function(clientGroup, accountNo) {
                                        if (loginRes.isOK) {
                                            //已经有账户，按类别升级即可
                                            studioService.updateClientGroup(userSession.groupType,
                                                mobilePhone, clientGroup, accountNo,
                                                function(isOk) {
                                                    if (isOk) {
                                                        loginRes.userInfo.clientGroup = clientGroup;
                                                    }
                                                    loginRes.userInfo.isLogin = true;
                                                    req.session.studioUserInfo = loginRes.userInfo;
                                                    req.session.studioUserInfo.clientStoreId = clientStoreId;
                                                    req.session.studioUserInfo.firstLogin = true;
                                                    req.session.studioUserInfo.cookieId = cookieId;
                                                    req.session.studioUserInfo.visitorId = visitorId;
                                                    req.session.studioUserInfo.roomName = roomName;
                                                    //req.session.studioUserInfo.courseId = courseId;
                                                    //req.session.studioUserInfo.courseName = courseName;
                                                    res.json({
                                                        isOK: true,
                                                        userInfo: req.session.studioUserInfo
                                                    }); //即使修改账户级别失败也登录成功
                                                });
                                        } else {
                                            var userInfo = {
                                                mobilePhone: mobilePhone,
                                                ip: common.getClientIp(req),
                                                groupType: userSession.groupType,
                                                accountNo: accountNo,
                                                thirdId: thirdId
                                            };
                                            studioService.studioRegister(userInfo, clientGroup,
                                                function(result) {
                                                    if (result.isOK) {
                                                        req.session.studioUserInfo = {
                                                            cookieId: cookieId,
                                                            visitorId: visitorId,
                                                            roomName: roomName,
                                                            groupType: userSession.groupType,
                                                            clientStoreId: clientStoreId,
                                                            firstLogin: true,
                                                            isLogin: true,
                                                            mobilePhone: userInfo.mobilePhone,
                                                            userId: userInfo.userId,
                                                            defGroupId: userInfo.defGroupId,
                                                            clientGroup: userInfo.clientGroup,
                                                            nickname: userInfo.nickname
                                                        };
                                                        result.userInfo = req.session.studioUserInfo;
                                                    }
                                                    res.json(result);
                                                });
                                        }
                                    });
                            }
                        });
                    }
                });
        }
    } else {
        //userId自动登录
        studioService.login({ userId: userId, groupType: userSession.groupType }, 2,
            function(loginRes) {
                if (loginRes.isOK) {
                    loginRes.userInfo.isLogin = true;
                    req.session.studioUserInfo = loginRes.userInfo;
                    req.session.studioUserInfo.clientStoreId = clientStoreId;
                    req.session.studioUserInfo.firstLogin = true;
                    req.session.studioUserInfo.isLogin = true;
                    req.session.studioUserInfo.cookieId = cookieId;
                    req.session.studioUserInfo.visitorId = visitorId;
                    var snUser = req.session.studioUserInfo;
                    var dasData = {
                        mobile: snUser.mobilePhone,
                        cookieId: cookieId,
                        clientGroup: snUser.clientGroup,
                        platform: '',
                        userAgent: req.headers['user-agent'],
                        sessionId: req.sessionID,
                        roomId: snUser.groupId,
                        clientStoreId: snUser.clientStoreId,
                        groupType: snUser.groupType,
                        userName: snUser.userName,
                        email: snUser.email,
                        ip: common.getClientIp(req),
                        visitorId: visitorId,
                        nickName: snUser.nickname,
                        courseName: courseName,
                        courseId: courseId,
                        teacherId: teacherId,
                        teacherName: teacherName,
                        accountNo: snUser.accountNo
                    };
                    visitorService.saveVisitorRecord("login", dasData);
                    if (loginRes.userInfo.clientGroup != constant.clientGroup.vip &&
                        loginRes.userInfo.clientGroup !=
                        constant.clientGroup.active) { //检查账号接口同步数据
                        studioService.checkClientGroup(loginRes.userInfo.mobilePhone,
                            null, common.getTempPlatformKey(userSession.groupType),
                            function(clientGroup, accountNo) {
                                if (constant.clientGroupSeq[clientGroup] <
                                    constant.clientGroupSeq[loginRes.userInfo.clientGroup]) {
                                    res.json({ isOK: true, userInfo: req.session.studioUserInfo });
                                } else {
                                    var userInfo = {
                                        mobilePhone: loginRes.userInfo.mobilePhone,
                                        ip: common.getClientIp(req),
                                        groupType: userSession.groupType,
                                        accountNo: accountNo,
                                        clientGroup: clientGroup
                                    };
                                    studioService.checkMemberAndSave(userInfo,
                                        function(result) {
                                            req.session.studioUserInfo.defGroupId = userInfo.defGroupId;
                                            req.session.studioUserInfo.clientGroup = userInfo.clientGroup;
                                            res.json({
                                                isOK: true,
                                                userInfo: req.session.studioUserInfo
                                            });
                                        });
                                }
                            });
                    } else {
                        res.json({ isOK: true, userInfo: req.session.studioUserInfo });
                    }
                } else {
                    res.json(loginRes);
                }
            });
    }
});

/**
 * 登出
 */
router.get('/logout', function(req, res) {
    var snUser = req.session.studioUserInfo;
    if (!snUser) {
        res.redirect('/');
        return;
    }
    var options = req.session.studioOptions;
    var platform = (options && options.platform) || req.query['platform'];
    var cookieId = req.query['cookieId'];
    var roomName = req.query['roomName'],
        courseId = req.body['courseId'],
        courseName = req.body['courseName'],
        teacherId = req.body['teacherId'],
        teacherName = req.body['teacherName'];
    var dasData = {
        mobile: snUser.mobilePhone,
        cookieId: cookieId,
        clientGroup: snUser.clientGroup,
        roomName: snUser.roomName || roomName,
        platform: platform,
        userAgent: req.headers['user-agent'],
        sessionId: req.sessionID,
        roomId: snUser.groupId,
        clientStoreId: snUser.clientStoreId,
        groupType: snUser.groupType,
        userName: snUser.userName,
        email: snUser.email,
        ip: common.getClientIp(req),
        visitorId: snUser.visitorId,
        nickName: snUser.nickname,
        courseName: courseName,
        courseId: courseId,
        teacherId: teacherId,
        teacherName: teacherName,
        accountNo: snUser.accountNo
    };
    visitorService.saveVisitorRecord("logout", dasData);
    req.session.studioUserInfo = null;
    //注销之后检查当前房间是否给游客授权，若授权则以游客身份再次进入当前房间
    studioService.checkGroupAuth(null, snUser.groupId,
        constant.clientGroup.visitor, null,
        function(groupInfo) {
            if (groupInfo) {
                req.session.logoutToGroup = groupInfo._id;
            }
            var target = getGroupType(req, true);
            res.redirect("/?ko=1");
        });
});

/**
 * 跳转直播间主页
 */
router.get('/home', function(req, res) {
    if (req.session.studioUserInfo) {
        req.session.studioUserInfo.groupId = null;
    }
    res.redirect(getGroupType(req, true) + "?ko=1");
});

/**
 * 提取文档信息
 *
 */
router.get('/getArticleList', function(req, res) {
    var params = {},
        userInfo = req.session.studioUserInfo;
    params.code = req.query["code"];
    params.platform = req.query["platform"];
    params.pageNo = req.query["pageNo"];
    params.isAll = req.query["isAll"] || "";
    params.pageKey = req.query["pageKey"] || "";
    params.pageLess = req.query["pageLess"] || "";
    params.authorId = req.query["authorId"];
    params.pageSize = req.query["pageSize"];
    params.hasContent = req.query["hasContent"];
    params.orderByStr = req.query["orderByStr"];
    params.pageNo = common.isBlank(params.pageNo) ? 1 : params.pageNo;
    params.pageSize = common.isBlank(params.pageSize) ? 15 : params.pageSize;
    params.orderByStr = common.isBlank(params.orderByStr) ? "" : params.orderByStr;
    var ids = req.query['ids'] || '';
    var callTradeIsNotAuth = 0,
        strategyIsNotAuth = 0;
    if (params.code == 'class_note') {
        callTradeIsNotAuth = req.query['callTradeIsNotAuth'] || 0;
        strategyIsNotAuth = req.query['strategyIsNotAuth'] || 0;
    }
    baseApiService.getArticleList(params, function(data) {
        if (data) {
            data = JSON.parse(data);
            if (params.code == 'class_note') {
                var dataList = data.data,
                    row = null;
                for (var i in dataList) {
                    row = dataList[i];
                    var detailInfo = row.detailList && row.detailList[0];
                    if (!common.containSplitStr(ids, row._id)) {
                        if ((detailInfo.tag == 'shout_single' || detailInfo.tag ==
                                'trading_strategy' || detailInfo.tag == 'resting_order')) {
                            var remark = JSON.parse(detailInfo.remark),
                                remarkRow = null;
                            for (var j in remark) {
                                remarkRow = remark[j];
                                if (strategyIsNotAuth == 1) {
                                    remarkRow.open = '****';
                                    remarkRow.profit = '****';
                                    remarkRow.loss = '****';
                                    remarkRow.description = '****';
                                }
                                /*if (detailInfo.tag == 'trading_strategy' && strategyIsNotAuth == 1) {
                                 remarkRow.support_level = '****';
                                 remarkRow.drag_level = '****';
                                 } else if ((detailInfo.tag == 'shout_single' || detailInfo.tag == 'resting_order') && callTradeIsNotAuth == 1) {
                                 remarkRow.point = '****';
                                 remarkRow.profit = '****';
                                 remarkRow.loss = '****';
                                 }*/
                                remark[j] = remarkRow;
                            }
                            detailInfo.remark = JSON.stringify(remark);
                        }
                        row.detailList[0] = detailInfo;
                        dataList[i] = row;
                    }
                }
                data.data = dataList;
            }
            res.json(data);
        } else {
            res.json(null);
        }
    });
});

/**
 * 提取文档信息
 */
router.get('/getArticleInfo', function(req, res) {
    var params = {};
    params.id = req.query["id"];
    baseApiService.getArticleInfo(params, function(data) {
        res.json(data ? JSON.parse(data) : null);
    });
});

/**
 * 提取客户组信息
 */
router.get('/getClientGroupList', function(req, res) {
    studioService.getClientGroupList(getGroupType(req), function(data) {
        res.json(data);
    });
});

/**
 * 提取课程安排
 */
router.get('/getSyllabus', function(req, res) {
    var groupType = req.query["groupType"];
    var groupId = req.query["groupId"];
    syllabusService.getSyllabus(groupType, groupId, function(data) {
        res.json({ data: data, serverTime: new Date().getTime() });
    });
});

/**
 * 提取课程安排（历史记录）
 */
router.get('/getSyllabusHis', function(req, res) {
    var groupType = req.query["groupType"];
    var groupId = req.query["groupId"];
    var date = req.query["date"];
    syllabusService.getSyllabusHis(groupType, groupId, date, function(datas) {
        res.json(datas);
    });
});

/**
 * 检查聊天组权限
 */
router.post('/checkGroupAuth', function(req, res) {
    var groupId = req.body["groupId"],
        roomType = req.body["roomType"],
        result = null,
        chatUser = req.session.studioUserInfo;

    if (common.isBlank(groupId) || !chatUser) {
        result = errorMessage.code_1000;
    }
    if (!result) {
        studioService.checkGroupAuth(roomType, groupId, chatUser.clientGroup,
            chatUser.userId,
            function(groupInfo) {
                if (groupInfo) {
                    req.session.studioUserInfo.toGroup = groupInfo._id;
                }
                res.json(groupInfo);
            });
    } else {
        res.json(result);
    }
});

/**
 * 升级客户组权限
 */
router.post('/upgrade', function(req, res) {
    var result = { isOK: false, error: null },
        chatUser = req.session.studioUserInfo;
    var clientGroup = req.body["clientGroup"];
    if (clientGroup === constant.clientGroup.register) {
        result.error = errorMessage.code_1011;
        res.json(result);
    } else if (clientGroup == chatUser.clientGroup) {
        result.error = errorMessage.code_1010;
        res.json(result);
    } else {
        studioService.upgradeClientGroup(chatUser.groupType, chatUser.mobilePhone,
            clientGroup,
            function(isOk, clientGroupRes) {
                if (isOk) {
                    result.isOK = true;
                    result.clientGroup = clientGroupRes;
                }
                res.json(result);
            });
    }
});

/**
 * 通过用户昵称提取访客记录
 */
router.get('/getVistiorByName', function(req, res) {
    var nickname = req.query["nickname"],
        groupType = req.query["groupType"],
        roomId = req.query["groupId"];
    if (common.isBlank(nickname) || common.isBlank(groupType)) {
        res.json(null);
    } else {
        visitorService.getVistiorByName(groupType, roomId, nickname,
            function(data) {
                res.json(data);
            });
    }
});

/**
 * 提取客户经理
 */
router.get('/getCS', function(req, res) {
    var groupId = req.query["groupId"];
    if (!req.session.studioUserInfo || common.isBlank(groupId)) {
        res.json(null);
    } else {
        userService.getRoomCsUserList(groupId, function(data) {
            res.json(data);
        });
    }
});

/**
 * 提取红包连接地址
 */
router.post('/getAcLink', function(req, res) {
    if (!req.session.studioUserInfo) {
        res.end();
    } else {
        request(config.packetAcUrl, function(err, response, data) {
            if (!err && response.statusCode == 200) {
                try {
                    res.json(JSON.parse(data));
                } catch (e) {
                    logger.error("getAcLink>>>error:" + e);
                    res.json(null);
                }
            } else {
                logger.error("getAcLink>>>error:" + err);
                res.json(null);
            }
        });
    }
});

/**
 * 修改昵称
 */
router.post('/modifyName', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        nickname = req.body["nickname"];
    if (!userInfo || common.isBlank(userInfo.mobilePhone)) {
        res.json({ isOK: false, msg: '请重新登录后再修改！' });
    } else if (common.isBlank(nickname)) {
        res.json({ isOK: false, msg: '昵称不能为空！' });
    } else {
        userService.modifyNickname(userInfo.mobilePhone, getGroupType(req),
                nickname)
            .then(result => {
                if (result.isOK) {
                    req.session.studioUserInfo.nickname = nickname;
                    result.nickname = nickname;
                }
                res.json(result);
            })
            .catch(e => {
                res.json({ isOK: false, msg: '系统错误，请稍后再试！' });
            });
    }
});

/**
 * 注册
 */
router.post('/reg', function(req, res) {
    var userSession = req.session.studioUserInfo;
    var params = {
        mobilePhone: req.body["mobilePhone"],
        verifyCode: req.body["verifyCode"],
        password: req.body["password"],
        password1: req.body["password1"],
        item: req.body['item'],
        cookieId: req.body['cookieId'],
        visitorId: req.body['visitorId'],
        clientStoreId: req.body['clientStoreId'],
        courseId: req.body['courseId'],
        courseName: req.body['courseName'],
        teacherId: req.body['teacherId'],
        teacherName: req.body['teacherName'],
        nickname: req.body['nickname'],
        platform: req.query['platform']
    };
    if (!userSession || common.isBlank(userSession.groupType)) {
        res.json({ isOK: false, msg: '注册失败，请刷新后重试！' });
    } else if (common.isBlank(params.mobilePhone)) {
        res.json({ isOK: false, msg: '手机号不能为空！' });
    } else if (common.isBlank(params.verifyCode)) {
        res.json({ isOK: false, msg: '手机验证码不能为空！' });
    } else if (common.isBlank(params.password) || common.isBlank(
            params.password1)) {
        res.json({ isOK: false, msg: '密码不能为空！' });
    } else if (params.password != params.password1) {
        res.json({ isOK: false, msg: '两次密码输入不一致！' });
    } else {
        //手机号+验证码登陆
        baseApiService.checkMobileVerifyCode(params.mobilePhone,
            userSession.groupType + "_reg", params.verifyCode,
            function(chkCodeRes) {
                if (!chkCodeRes || chkCodeRes.result != 0 || !chkCodeRes.data) {
                    if (chkCodeRes.errcode === "1006" || chkCodeRes.errcode ===
                        "1007") {
                        res.json({ isOK: false, msg: chkCodeRes.errmsg });
                    } else {
                        res.json({ isOK: false, msg: errorMessage.code_1007.errmsg });
                    }
                    return;
                } else {
                    //验证码通过校验
                    studioService.checkClientGroup(params.mobilePhone, null,
                        common.getTempPlatformKey(userSession.groupType),
                        function(clientGroup, accountNo) {
                            var thirdId = userSession.thirdId || null;
                            var userInfo = {
                                mobilePhone: params.mobilePhone,
                                ip: common.getClientIp(req),
                                groupType: userSession.groupType,
                                accountNo: accountNo,
                                thirdId: thirdId,
                                pwd: common.getMD5(constant.pwdKey + params.password),
                                item: params.item,
                                userId: userSession.userId
                            };
                            studioService.studioRegister(userInfo, clientGroup,
                                function(result) {
                                    if (result.isOK) {
                                        var userSessionInfo = {
                                            cookieId: params.cookieId,
                                            groupType: userSession.groupType,
                                            clientStoreId: params.clientStoreId,
                                            firstLogin: true,
                                            isLogin: true,
                                            mobilePhone: userInfo.mobilePhone,
                                            userId: userInfo.userId,
                                            defGroupId: userInfo.defGroupId,
                                            clientGroup: userInfo.clientGroup,
                                            nickname: userInfo.nickname,
                                            ip: userInfo.ip,
                                            visitorId: params.visitorId
                                        };
                                        req.session.studioUserInfo = userSessionInfo;
                                        result.userId = userInfo.userId;
                                        delete userInfo["pwd"];
                                        var dasData = {
                                            mobile: userSessionInfo.mobilePhone,
                                            userName: '',
                                            cookieId: params.cookieId,
                                            clientStoreId: params.clientStoreId,
                                            clientGroup: userInfo.clientGroup,
                                            ip: userInfo.ip,
                                            nickname: (userSessionInfo.nickname ||
                                                params.nickname),
                                            platform: params.platform || '',
                                            userAgent: req.headers["user-agent"],
                                            groupType: userInfo.groupType,
                                            visitorId: params.visitorId,
                                            roomId: userInfo.groupId,
                                            operationType: 3,
                                            sessionId: req.sessionID,
                                            courseId: params.courseId,
                                            courseName: params.courseName,
                                            teacherId: params.teacherId,
                                            teacherName: params.teacherName,
                                            accountNo: userInfo.accountNo
                                        };
                                        visitorService.saveVisitorRecord('register', dasData);
                                    }
                                    if (result.error) {
                                        result.msg = result.error.errmsg;
                                        delete result["error"];
                                    }
                                    res.json(result);
                                });
                        });
                }
            });
    }
});

/**
 * 重置密码
 */
router.post('/resetPwd', function(req, res) {
    var userSession = req.session.studioUserInfo;
    var params = {
        type: req.body["type"] || "",
        mobilePhone: req.body["mobilePhone"],
        verifyCode: req.body["verifyCode"],
        password0: req.body["password0"],
        password: req.body["password"],
        password1: req.body["password1"]
    };
    if (params.type == 1) { //修改密码
        if (!userSession && common.isBlank(userSession.mobilePhone)) {
            res.json({ isOK: false, msg: '修改密码失败，请刷新后重试！' });
        } else if (common.isBlank(params.password0)) {
            res.json({ isOK: false, msg: '原始密码不能为空！' });
        } else if (common.isBlank(params.password) || common.isBlank(
                params.password1)) {
            res.json({ isOK: false, msg: '密码不能为空！' });
        } else if (params.password != params.password1) {
            res.json({ isOK: false, msg: '两次密码输入不一致！' });
        } else {
            studioService.resetPwd(userSession.groupType, userSession.mobilePhone,
                params.password, params.password0,
                function(result) {
                    if (result.error) {
                        if (result.error.errcode == errorMessage.code_1008.errcode) {
                            result.msg = "原始密码错误，如果没有原始密码，请选择忘记密码！";
                        } else {
                            result.msg = result.error.errmsg;
                        }
                    }
                    res.json(result);
                });
        }
    } else if (params.type == 2) {
        if (!userSession || common.isBlank(userSession.groupType)) {
            res.json({ isOK: false, msg: '重置密码失败，请刷新后重试！' });
        } else if (common.isBlank(params.mobilePhone)) {
            res.json({ isOK: false, msg: '手机号不能为空！' });
        } else if (common.isBlank(params.verifyCode)) {
            res.json({ isOK: false, msg: '手机验证码不能为空！' });
        } else {
            baseApiService.checkMobileVerifyCode(params.mobilePhone,
                userSession.groupType + "_resetPWD", params.verifyCode,
                function(chkCodeRes) {
                    if (!chkCodeRes || chkCodeRes.result != 0 || !chkCodeRes.data) {
                        if (chkCodeRes.errcode === "1006" || chkCodeRes.errcode ===
                            "1007") {
                            res.json({ isOK: false, msg: chkCodeRes.errmsg });
                        } else {
                            res.json({ isOK: false, msg: errorMessage.code_1007.errmsg });
                        }
                    } else {
                        userSession.mobilePhoneChk = params.mobilePhone;
                        res.json({ isOK: true, msg: "", mobilePhone: params.mobilePhone });
                    }
                });
        }
    } else if (params.type == 3) {
        if (!userSession) {
            res.json({ isOK: false, msg: '重置密码失败，请刷新后重试！' });
        } else if (common.isBlank(params.mobilePhone)) {
            res.json({ isOK: false, msg: '手机号不能为空！' });
        } else if (params.mobilePhone != userSession.mobilePhoneChk) {
            res.json({ isOK: false, msg: '手机验证码校验失败！' });
        } else if (common.isBlank(params.password) || common.isBlank(
                params.password1)) {
            res.json({ isOK: false, msg: '密码不能为空！' });
        } else if (params.password != params.password1) {
            res.json({ isOK: false, msg: '两次密码输入不一致！' });
        } else {
            studioService.resetPwd(userSession.groupType, params.mobilePhone,
                params.password, null,
                function(result) {
                    if (result.isOK) {
                        delete userSession["mobilePhoneChk"];
                    }
                    if (result.error) {
                        result.msg = result.error.errmsg;
                    }
                    res.json(result);
                });
        }
    } else {
        res.json({ isOK: false, msg: '参数错误！' });
    }
});

/**
 * 加载大图数据
 */
router.get('/getBigImg', function(req, res) {
    var publishTime = req.query["publishTime"],
        userId = req.query["userId"];
    if (common.isBlank(publishTime)) {
        res.end("");
    } else {
        messageService.loadBigImg(userId, publishTime, function(bigImgData) {
            if (common.isBlank(bigImgData)) {
                res.end("");
            } else {
                res.writeHead(200, { "Content-Type": "image/jpeg" });
                res.end(new Buffer(bigImgData.replace(/^data:image.*base64,/,
                    ""), 'base64'));
            }
        });
    }
});
/**
 * 上传数据
 */
router.post('/uploadData', function(req, res) {
    var data = req.body;
    if (data != null && process.platform.indexOf("win") == -1) {
        //创建异常监控
        var domain = require('domain').create();
        domain.on('error', function(er) {
            logger.error("uploadImg fail,please check it", er);
            res.json({ success: false });
        });
        domain.run(function() {
            //执行进程监控
            process.nextTick(function() {
                var imgUtil = require('../../util/imgUtil'); //引入imgUtil
                var val = data.content.value,
                    needMax = data.content.needMax;
                if (data.content.msgType == "img" && common.isValid(val)) {
                    imgUtil.zipImg(val, 100, 60, function(minResult) {
                        if (minResult.isOK) {
                            data.content.value = minResult.data;
                            if (needMax == 1) {
                                imgUtil.zipImg(val, 0, 60, function(maxResult) {
                                    if (maxResult.isOK) {
                                        data.content.maxValue = maxResult.data;
                                        chatService.acceptMsg(data, null);
                                    }
                                    res.json({ success: maxResult.isOK });
                                });
                            } else {
                                chatService.acceptMsg(data, null);
                                res.json({ success: minResult.isOK });
                            }
                        } else {
                            res.json({ success: minResult.isOK });
                        }
                    });
                } else {
                    res.json({ success: false });
                }
            });
        });
    } else {
        logger.warn("warn:please upload img by linux server!");
        res.json({ success: false });
    }
});

/**
 * 提取课程数据
 */
router.get('/getCourseInfo', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    var day = req.query["day"],
        startTime = req.query["startTime"],
        endTime = req.query["endTime"],
        authorId = req.query["authorId"];
    if (!userInfo || common.isBlank(day)) {
        res.json({ remark: '', authors: [] });
    } else {
        syllabusService.getCourseInfo({
            groupType: userInfo.groupType,
            groupId: userInfo.groupId,
            day: day,
            startTime: startTime,
            endTime: endTime,
            authorId: authorId
        }, function(data) {
            res.json(data);
        });
    }
});

/**
 * 提取晒单数据
 */
router.get('/getShowTradeInfo', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    var userNo = req.query["userNo"];
    if (!userInfo || common.isBlank(userNo)) {
        res.json(null);
    } else {
        showTradeService.getShowTrade(userInfo.groupType, userNo, function(data) {
            res.json(data);
        });
    }
});

/**
 * 新增晒单评论
 */
router.post('/addShowTradeComment', function(req, res) {
    var reqParam = req.body['data'];
    try {
        reqParam = JSON.parse(reqParam);
    } catch (e) {
        res.json(null);
        return;
    }
    var params = {
        userInfo: (req.session.studioUserInfo && req.session.studioUserInfo.isLogin) ? req.session.studioUserInfo : {
            userId: reqParam.userId || "",
            nickname: reqParam.nickname || "",
            avatar: reqParam.avatar || ""
        },
        id: reqParam.id,
        refId: reqParam.refId,
        content: reqParam.content
    };
    if (!params.id || !params.content) {
        res.json({ 'isOK': false, 'msg': '参数错误！' });
    } else {
        showTradeService.addComments(params).then(result => {
            res.json(result);
        }).catch(e => {
            res.json({ isOK: false, msg: '系统错误，请稍后再试！' });
        });
    }
});
router.post('/setUserPraise', function(req, res) {
    var clientId = req.body.clientId,
        praiseId = req.body.praiseId;
    if (common.isBlank(clientId) || common.isBlank(praiseId)) {
        res.json({ isOK: false });
    } else {
        var fromPlatform = getGroupType(req);
        baseApiService.checkChatPraise(clientId, praiseId, fromPlatform,
            function(isOK) {
                if (isOK) {
                    chatPraiseService.setPraise(praiseId, constant.chatPraiseType.user,
                        fromPlatform,
                        function(result) {
                            if (result.isOK) {
                                var params = {};
                                var userInfo = req.session.studioUserInfo;
                                params.userId = userInfo.mobilePhone;
                                params.clientGroup = userInfo.clientGroup;
                                params.groupType = userInfo.groupType;
                                params.type = "daily";
                                params.item = "daily_praise";
                                params.tag = "trade_" + praiseId;
                                params.isGlobal = false;
                                params.opUser = userInfo.userId;
                                params.opIp = common.getClientIp(req);
                                params.remark = "每日点赞";
                                chatPointsService.add(params, function(result) {
                                    logger.debug("点赞添加积分成功!", result);
                                }).then(e => {
                                    logger.error("点赞添加积分失败!", e);
                                });
                            }
                        });
                }
                res.json({ isOK: isOK });
            });
    }
});

/**
 * 设置点赞
 */
router.post('/setUserPraise', function(req, res) {
    var clientId = req.body.clientId,
        praiseId = req.body.praiseId;
    if (common.isBlank(clientId) || common.isBlank(praiseId)) {
        res.json({ isOK: false });
    } else {
        var fromPlatform = getGroupType(req);
        baseApiService.checkChatPraise(clientId, praiseId, fromPlatform,
            function(isOK) {
                if (isOK) {
                    chatPraiseService.setPraise(praiseId, constant.chatPraiseType.user,
                        fromPlatform,
                        function(result) {
                            if (result.isOK) {
                                var params = {};
                                var userInfo = req.session.studioUserInfo;
                                params.userId = userInfo.mobilePhone;
                                params.clientGroup = userInfo.clientGroup;
                                params.groupType = userInfo.groupType;
                                params.type = "daily";
                                params.item = "daily_praise";
                                params.tag = "trade_" + praiseId;
                                params.isGlobal = false;
                                params.opUser = userInfo.userId;
                                params.opIp = common.getClientIp(req);
                                params.remark = "每日点赞";
                                chatPointsService.add(params, function(err, result) {
                                    if (err) {
                                        console.error("点赞添加积分失败!");
                                    }
                                });
                            }
                        });
                }
                res.json({ isOK: isOK });
            });
    }
});

/**
 * 房间对应的课程数据包括房间对应的在线人数
 */
router.get('/getRmCourseList', function(req, res) {
    var roomIds = req.query["roomIds"];
    var userInfo = req.session.studioUserInfo;
    var result = { isOK: false, data: {} };
    if (!userInfo || common.isBlank(roomIds)) {
        res.json(result);
    } else {
        syllabusService.getSyllabus(userInfo.groupType, roomIds, function(data) {
            result.isOK = true;
            if (data) {
                var row = null,
                    course = null;
                var currTime = new Date().getTime();
                var newData = [];
                if (data instanceof Array) {
                    newData = data;
                } else {
                    newData.push(data);
                }
                var backObj = {};
                for (var i in newData) {
                    row = newData[i];
                    course = common.getSyllabusPlan(row, currTime);
                    if (course) {
                        backObj = {
                            title: course.title,
                            day: course.day,
                            name: course.lecturer,
                            startTime: course.startTime,
                            endTime: course.endTime,
                            isNext: course.isNext
                        };
                    } else {
                        backObj = {
                            title: '',
                            day: '',
                            name: '',
                            startTime: '',
                            endTime: '',
                            isNext: false
                        };
                    }
                    result.data[row.groupId] = backObj;
                }
            }
            async.each(roomIds.split(","), function(rid, callbackTmp) {
                if (!result.data.hasOwnProperty(rid)) {
                    result.data[rid] = {
                        title: '',
                        day: '',
                        name: '',
                        startTime: '',
                        endTime: '',
                        isNext: false
                    };
                }
                chatService.getRoomOnlineTotalNum(rid, function(onlineNum) {
                    result.data[rid].onlineNum = onlineNum;
                    callbackTmp(null);
                });
            }, function(err) {
                res.json(result);
            });
        });
    }
});

/**
 * 房间对应的课程数据包括房间对应的在线人数
 */
router.get('/getSyllabusList', function(req, res) {
    var roomIds = req.query["roomIds"];
    var userInfo = req.session.studioUserInfo;
    var result = { isOK: false, syllabuses: {}, onlineNums: {} };
    if (!userInfo || common.isBlank(roomIds)) {
        res.json(result);
    } else {
        syllabusService.getSyllabus(userInfo.groupType, roomIds, function(data) {
            result.isOK = true;
            if (data) {
                var syllabuses = [],
                    syllabusTmp;
                if (data instanceof Array) {
                    syllabuses = data;
                } else {
                    syllabuses.push(data);
                }
                for (var i in syllabuses) {
                    syllabusTmp = syllabuses[i];
                    result.syllabuses[syllabusTmp.groupId] = syllabusTmp;
                }
            }
            async.each(roomIds, function(rid, callbackTmp) {
                chatService.getRoomOnlineTotalNum(rid, function(onlineNum) {
                    result.onlineNums[rid] = onlineNum;
                    callbackTmp(null);
                });
            }, function(err) {
                res.json(result);
            });
        });
    }
});

/**
 * 伦敦金/伦敦银 看涨看跌投票
 */
router.post('/highsLowsVote', function(req, res) {
    var params = {}; //extend(extend({}, req.query), req.body);
    params.symbol = req.body['symbol']; //产品名
    params.highslows = req.body['highslows']; //看涨或看跌
    if (common.isBlank(params.symbol)) {
        res.json({ isOK: false, msg: '产品不能为空！' });
    } else if (common.isBlank(params.highslows)) {
        res.json({ isOK: false, msg: '看跌或看涨不能为空！' });
    } else {
        studioService.highsLowsVote(params.symbol, params.highslows,
            function(result) {
                res.json(result);
            });
    }
});

/**
 * 获取伦敦金/伦敦银 看涨看跌投票数据
 */
router.get('/getHighsLowsVote', function(req, res) {
    var params = {}; //extend(extend({}, req.query), req.body);
    params.symbol = req.query['symbol']; //产品名
    params.highslows = req.query['highslows']; //看涨或看跌
    studioService.getHighsLowsVote(params.symbol, params.highslows,
        function(result) {
            res.json(result);
        });
});

/**
 * CFTC持仓比例数据
 */
router.get('/get24kCftc', function(req, res) {
    baseApiService.get24kCftc(function(result) {
        res.json(result);
    });
});

/**
 * 获取财经日历数据
 */
router.post('/getFinancData', function(req, res) {
    var releaseTime = req.body['releaseTime'];
    var dataTypeCon = req.body['dataTypeCon'] ? req.body['dataTypeCon'] : 1;
    if (common.isBlank(releaseTime)) {
        res.json({ "result": 1, "msg": '日期不能为空！' });
    } else if (common.isBlank(dataTypeCon)) {
        res.json({ "result": 1, "msg": '数据类型不能为空！' });
    } else {
        baseApiService.getZxFinanceDataList(releaseTime, dataTypeCon,
            function(result) {
                res.json(result);
            });
    }
});

/**
 * 更新用户头像
 */
router.post('/modifyAvatar', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        avatar = req.body["avatar"],
        params = req.body["params"] || '{}';
    /*if(common.isBlank(params)){
     res.json({isOK:false,msg:'参数错误'});
     return;
     }*/
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            /*res.json(null);
             return;*/
        }
    }
    params.ip = common.getClientIp(req);
    if (!userInfo || common.isBlank(userInfo.mobilePhone)) {
        res.json({ isOK: false, msg: '请重新登录后再修改！' });
    } else if (common.isBlank(avatar)) {
        res.json({ isOK: false, msg: '头像不能为空！' });
    } else {
        params.avatar = avatar;
        params.groupType = getGroupType(req);
        params.mobilePhone = userInfo.mobilePhone;
        params.userId = userInfo.userId;
        params.clientGroup = userInfo.clientGroup;
        userService.modifyAvatar(params, function(result) {
            if (result.isOK) {
                req.session.studioUserInfo.avatar = avatar;
                result.avatar = avatar;
            }
            res.json(result);
        });
    }
});

/**
 * 保存到桌面
 */
router.get('/getShortCut', function(req, res) {
    var type = getGroupType(req);
    var cbFn = function(err) {
        if (err) {
            logger.warn('getShortCut << download link error:' + err);
        }
    };
    if (/^fx.*/.test(type)) {
        res.download(global.rootdir + "/template/fx/fxstudio.url", "视频直播间-环球投资.url",
            cbFn);
    } else {
        res.download(global.rootdir + "/template/pm/studio.url", "视频直播间-金道贵金属.url",
            cbFn);
    }
});

/**
 * 专家咨询发送邮件
 */
router.post('/email', function(req, res) {
    var key = req.body['key'];
    var data = req.body['data'];
    data = JSON.parse(data);
    if (common.isBlank(data.email)) {
        res.json({ isOK: false, msg: '请输入发件人！' });
    } else if (common.isBlank(data.content)) {
        res.json({ isOK: false, msg: '请输入邮件内容！' });
    } else if (common.isBlank(data.code)) {
        res.json({ isOK: false, msg: '请输入验证码！' });
    } else if (req.session.emailVerifyCode && data.code.toLowerCase() !=
        req.session.emailVerifyCode) {
        res.json({ isOK: false, msg: '验证码错误，请重新输入！' });
    } else {
        baseApiService.sendEmail(key, data, function(result) {
            if (result.result == 0) {
                res.json({ isOK: true, msg: '邮件发送成功！' });
            } else {
                res.json({ isOK: false, msg: result.msg });
            }
        });
    }
});

/**
 * 提取验证码
 */
router.get('/getVerifyCode', function(req, res) {
    if (process.platform.indexOf("win") != -1 || !req.session.studioUserInfo) {
        res.end("");
    } else {
        var typeCode = req.query['code'];
        var verifyCodeObj = require("../../util/verifyCode").Generate(50, 25);
        if ('email' == typeCode) {
            req.session.emailVerifyCode = verifyCodeObj.code;
        } else if ('acLogin' == typeCode) {
            req.session.studioUserInfo.verMalCode = verifyCodeObj.code;
        } else {
            res.end("");
            return;
        }
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(new Buffer(verifyCodeObj.dataURL.replace(/^data:image.*base64,/,
            ""), 'base64'));
    }
});

/**
 * 获取晒单数据
 */
router.post('/getShowTrade', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body['data'];
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    params.pageSize = common.isBlank(params.pageSize) ? 100 : params.pageSize;
    if (isNaN(params.pageSize) || common.isBlank(params.groupType)) {
        res.json({ 'isOK': false, 'data': null, 'msg': '参数错误' });
    } else {
        if (common.isValid(params.userNo) && params.userNo != userInfo.userId) {
            params.status = 1;
        }
        showTradeService.getShowTradeList(params, function(page) {
            res.json({ 'isOK': true, 'data': page, 'msg': '' });
        });
    }
});

/**
 * 新增晒单
 */
router.post('/addShowTrade', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body['data'];
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    params.Ip = common.getClientIp(req);
    if (common.isBlank(params.title)) {
        res.json({ 'isOK': false, 'msg': '请输入晒单标题' });
    } else if (common.isBlank(params.tradeImg)) {
        res.json({ 'isOK': false, 'msg': '请上传晒单图片' });
    } else if (common.isBlank(params.userName)) {
        res.json({ 'isOK': false, 'msg': '请输入晒单人' });
    } else if (common.isBlank(params.groupType) || common.isBlank(params.userNo) ||
        common.isBlank(params.avatar) || common.isBlank(params.tradeType)) {
        res.json({ 'isOK': false, 'msg': '参数错误' });
    } else {
        params.groupId = common.isBlank(params.groupId) ? '' : params.groupId;
        params.telePhone = userInfo.mobilePhone;
        showTradeService.addShowTrade(params, function(result) {
            res.json(result);
        });
    }
});

/**
 * 设置晒单点赞
 */
router.post('/setTradePraise', function(req, res) {
    var params = req.body['data'];
    if (typeof params == 'string') {
        params = JSON.parse(params);
    }
    if (common.isBlank(params.clientId) || common.isBlank(params.praiseId)) {
        res.json({ isOK: false });
    } else {
        var fromPlatform = getGroupType(req);
        baseApiService.checkChatPraise(params.clientId, params.praiseId,
            fromPlatform,
            function(isOK) {
                if (isOK) {
                    showTradeService.setShowTradePraise(params, function(result) {
                        res.json(result);
                    });
                } else {
                    res.json({ isOK: isOK });
                }
            });
    }
});

/**
 * 获取未平仓品种比率
 */
router.get('/getSymbolOpenPositionRatios', function(req, res) {
    baseApiService.getSymbolOpenPositionRatios(function(result) {
        res.json(JSON.parse(result));
    });
});

/**
 * 修改用户名
 */
router.post('/modifyUName', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body["params"];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    params.ip = common.getClientIp(req);
    if (!userInfo || common.isBlank(userInfo.mobilePhone)) {
        res.json({ isOK: false, msg: '请重新登录后再修改！' });
    } else if (common.isBlank(params.userName)) {
        res.json({ isOK: false, msg: '用户名不能为空！' });
    } else {
        userService.modifyUserName(userInfo, params, function(result) {
            if (result.isOK) {
                req.session.studioUserInfo.userName = params.userName;
                result.userName = params.userName;
            }
            res.json(result);
        });
    }
});

/**
 * 修改邮箱，发送验证邮件
 */
router.post('/modifyEmail', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body["params"];
    if (common.isBlank(params) || !userInfo) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    //params.ip = common.getClientIp(req);
    if (!userInfo || common.isBlank(userInfo.mobilePhone)) {
        res.json({ isOK: false, msg: '请重新登录后再修改！' });
    } else if (common.isBlank(params.email)) {
        res.json({ isOK: false, msg: '邮箱地址不能为空！' });
    } else if (!common.isEmail(params.email)) {
        res.json({ isOK: false, msg: '邮箱地址有误！' });
    } else if (common.isBlank(userInfo.nickname)) {
        res.json({ isOK: false, msg: '请先设置一个好听的昵称吧！' });
    } else {
        //http:192.168.35.91:3006/studio/confirmMail?grouptype=<%= groupType %>&userid=<%= userId %>&email=<%= encodeURI(email) %>&key=<%= key %>
        var ref = req.headers.referer.indexOf('?') > -1 ?
            req.headers.referer.substring(0, req.headers.referer.indexOf('?')) :
            req.headers.referer;
        ref = ref.lastIndexOf('/') > -1 ? ref : ref + '/';
        var urls = [ref];
        urls.push("confirmMail?grouptype=");
        urls.push(userInfo.groupType);
        urls.push("&userid=");
        urls.push(userInfo.userId);
        urls.push("&email=");
        urls.push(encodeURI(params.email));
        urls.push("&key=");
        urls.push(
            common.getMD5(constant.emailKey + params.email + userInfo.userId));
        var emailParams = {
            time: common.formatDate(new Date(), "yyyy-MM-dd HH:mm:ss"),
            userName: userInfo.nickname,
            email: params.email,
            url: urls.join("")
        };
        apiService.sendEmailByUTM(emailParams, "VerityEmail", params.email,
            userInfo.groupType,
            function(result) {
                if (result.isOK) {
                    result.msg = "已发送验证邮件至" + params.email + "！";
                }
                res.json(result);
            });
    }
});

/**
 * 修改邮箱
 */
router.get('/confirmMail', function(req, res) {
    var params = {};
    params.groupType = req.query['grouptype'];
    params.userId = req.query['userid'];
    params.email = decodeURI(req.query['email']);
    params.key = req.query['key'];
    params.ip = common.getClientIp(req);
    params.item = 'register_email';
    if (common.isBlank(params.email)) {
        res.render("error", { error: '邮箱地址不能为空！' });
    } else if (!common.isEmail(params.email)) {
        res.render("error", { error: '邮箱地址有误！' });
    } else if (common.getMD5(constant.emailKey + params.email + params.userId) !=
        params.key) {
        res.render("error", { error: '校验码错误！' });
    } else {
        userService.modifyEmail(params, function(result) {
            if (result.isOK) {
                if (req.session.studioUserInfo) {
                    req.session.studioUserInfo.email = params.email;
                }
            }
            res.render("tip", { tip: result.isOK ? '邮箱验证通过！' : result.msg });
        });
    }
});

/**
 * 修改密码
 */
router.post('/modifyPwd', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body["params"];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }

    params.ip = common.getClientIp(req);
    if (!userInfo || common.isBlank(userInfo.mobilePhone)) {
        res.json({ isOK: false, msg: '请重新登录后再修改！' });
    } else if (common.isBlank(userInfo.password) && common.isBlank(
            params.password)) {
        res.json({ isOK: false, msg: '请输入原始密码！' });
    } else if (common.isBlank(params.newPwd)) {
        res.json({ isOK: false, msg: '请输入新密码！' });
    } else if (common.isBlank(params.newPwd1)) {
        res.json({ isOK: false, msg: '请输入确认新的密码！' });
    } else if (params.newPwd != params.newPwd1) {
        res.json({ isOK: false, msg: '新密码输入不一致，请重新输入！' });
    } else {
        userService.modifyPwd(userInfo, params, function(result) {
            if (result.isOK) {
                req.session.studioUserInfo.password = '已设置';
            }
            res.json(result);
        });
    }
});

/**
 * 获取可订阅服务类型列表
 */
router.post('/getSubscribeType', function(req, res) {
    var params = req.body['params'];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    if (common.isBlank(params.groupType)) {
        res.json({ isOK: false, msg: '参数错误' });
    } else {
        chatSubscribeTypeService.getSubscribeTypeList(params, function(result) {
            /*var row = null;
             for(var i in result){
             row = result[i];
             }*/
            res.json(result);
        });
    }
});

/**
 * 获取用户订阅列表
 */
router.post('/getSubscribe', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body['params'];
    if (common.isBlank(params) || !userInfo) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    if (common.isBlank(params.groupType)) {
        res.json({ isOK: false, msg: '参数错误' });
    } else {
        params.userId = userInfo.mobilePhone;
        if (common.isBlank(params.userId)) {
            res.json({ isOK: false, msg: '参数错误' });
        } else {
            chatSubscribeService.getSubscribeList(params, function(result) {
                res.json(result);
            });
        }
    }
});

/**
 * 保存/更新订阅数据
 */
router.post('/subscribe', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body['params'];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    params.Ip = common.getClientIp(req);
    params.userId = userInfo.mobilePhone;
    params.clientGroup = userInfo.clientGroup;
    params.pointsId = ''; //消费积分ID
    params.userName = userInfo.userName;
    params.startDate = new Date(); //common.DateAdd('d', 1, new Date());//开始时间默认从订阅第二天开始
    if (params.noticeCycle == 'week') {
        params.endDate = common.DateAdd('w', 1, new Date(params.startDate)); //结束时间，1周
    } else if (params.noticeCycle == 'month') {
        params.endDate = common.DateAdd('M', 1, new Date(params.startDate)); //结束时间，1月
    } else if (params.noticeCycle == 'year') {
        params.endDate = common.DateAdd('y', 1, new Date(params.startDate)); //结束时间，1年(暂时供手机版使用)
    }
    if (common.isBlank(params.groupType) || common.isBlank(params.userId) ||
        common.isBlank(params.type) || !common.isNumber(params.point)) {
        res.json({ 'isOK': false, 'msg': '参数错误' });
    } else if (common.isBlank(userInfo.email) && 'email'.indexOf(
            params.noticeType) > -1) {
        res.json({ 'isOK': false, 'msg': '请先绑定邮箱' });
    } else if (common.isBlank(params.id) && common.isBlank(params.analyst)) {
        res.json({ 'isOK': false, 'msg': '请选择订阅老师！' });
    } else if (common.isBlank(params.id) && common.isBlank(params.noticeType)) {
        res.json({ 'isOK': false, 'msg': '请选择订阅方式！' });
    } else if (common.isBlank(params.id) && common.isBlank(params.noticeCycle)) {
        res.json({ 'isOK': false, 'msg': '请选择订阅周期！' });
    } else {
        if (common.isBlank(params.id)) {
            chatSubscribeService.saveSubscribe(params, function(result) {
                res.json(result);
            });
        } else {
            chatSubscribeService.modifySubscribe(params, function(result) {
                res.json(result);
            });
        }
    }
});

/**
 * 获取积分信息
 */
router.post('/getPointsInfo', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body['params'];
    if (common.isBlank(params) || !userInfo) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    if (common.isBlank(params.groupType)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    } else {
        chatPointsService.getPointsInfo(params.groupType, userInfo.mobilePhone,
            true,
            function(result) {
                res.json(result);
            });
    }
});

/**
 * 添加积分获得或消费记录
 * {groupType:String, userId:String, item:String, tag:String, val:Number, isGlobal:Boolean, remark:String, opUser:String, opIp:String}
 * params:{item:String, remark:String, val:Number, tag:String}
 */
router.post('/addPointsInfo', function(req, res) {
    var userInfo = req.session.studioUserInfo,
        params = req.body['params'];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    if (common.isBlank(params.item) || !userInfo) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    } else {
        params.userId = userInfo.mobilePhone;
        params.groupType = userInfo.groupType;
        params.clientGroup = userInfo.clientGroup;
        params.tag = params.tag || "";
        params.opUser = userInfo.userId;
        params.opIp = common.getClientIp(req);
        chatPointsService.add(params, function(err, result) {
            if (err && err.errcode != '3001') {
                res.json({ isOK: false, msg: err.errmsg });
            } else {
                res.json({ isOK: true, msg: result });
            }
        });
    }
});

/**
 * 获取培训班列表
 */
router.get('/getTrainRoomList', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    if (!userInfo) {
        res.json(null);
    } else {
        clientTrainService.getTrainList(userInfo.groupType, null, true,
            userInfo.userId,
            function(result) {
                res.json(result);
            });
    }
});

/**
 * 获取培训班条数
 */
router.get('/getTrainRoomNum', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    if (!userInfo) {
        res.json({ num: 0 });
    } else {
        clientTrainService.getTrainList(userInfo.groupType, null, true,
            function(result) {
                res.json({ num: result ? result.length : 0 });
            });
    }
});

/**
 * 添加报名培训
 */
router.post('/addClientTrain', function(req, res) {
    var params = {
        groupId: req.body['groupId'],
        noApprove: req.body['noApprove'] == 1
    };
    var userInfo = req.session.studioUserInfo;
    if (!userInfo || !params.groupId) {
        res.json(errorMessage.code_1000);
    } else {
        params.nickname = userInfo.nickname;
        clientTrainService.addClientTrain(params, userInfo, function(result) {
            res.json(result);
        });
    }
});

/**
 * 初始化直播老师
 */
router.post('/getShowTeacher', function(req, res) {
    var params = req.body['data'];
    var showTeacher = {};
    showTeacher["userInfo"] = null;
    showTeacher["tradeList"] = null;
    showTeacher["teacherList"] = null;
    showTeacher["trAndClNum"] = null;
    showTeacher["trainList"] = null;
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            logger.warn("[getShowTeacher] Illegal Parameters, ", params);
            res.json(showTeacher);
            return;
        }
        var chatUser = req.session.studioUserInfo;
        if (!chatUser) {
            logger.warn("[getShowTeacher] Illegal Session studioUserInfo, ",
                req.session.studioUserInfo);
            res.json(showTeacher);
            return;
        }
        params.groupType = chatUser.groupType;
        params.groupId = common.isBlank(params.groupId) ? chatUser.groupId :
            params.groupId;
        var authorId = params.authorId;
        if (common.isValid(authorId)) {
            params.authorId = authorId.split(",")[0];
            studioService.getShowTeacher(params, function(result) {
                res.json(result);
            });
        } else {
            res.json(showTeacher);
        }
    }
});

/**
 * 添加签到
 */
router.post('/addSignin', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    var clientip = common.getClientIp(req);
    clientTrainService.addSignin(userInfo, clientip, function(result) {
        res.json(result);
    });
});

/**
 * 查询签到
 */
router.post('/getSignin', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    if (!userInfo) {
        res.json(null);
        return;
    }
    clientTrainService.getSignin(userInfo, function(result) {
        res.json(result);
    });
});

/**
 * 根据groupId查询房间
 */
router.post('/getchatGroupByGroupId', function(req, res) {
    var groupId = req.body["groupId"];
    studioService.getStudioByGroupId(groupId, function(result) {
        res.json(result);
    });
});

/**
 * 更新session
 */
router.post('/updateSession', function(req, res) {
    var params = req.body['params'];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    req.session.studioUserInfo.toGroup = params.groupId;
    res.json({ isOK: true, msg: '更新成功' });
});
/**
 * 查询积分配置表
 */
router.post('/getChatPointsConfig', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    var params = req.body['data'];
    if (common.isBlank(params) || !userInfo) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    params.groupType = userInfo.groupType;
    chatPointsService.getChatPointsConfig(params, function(result) {
        res.json(result);
    });
});

/**
 * 提取培训班详情
 */
router.get('/getUserInfo', function(req, res) {
    if (!req.session.studioUserInfo) {
        res.json(null);
        return;
    }
    var userNo = req.query["uid"];
    studioService.getUserInfoByUserNo(req.session.studioUserInfo.groupType,
        userNo,
        function(result) {
            res.json(result);
        });
});

/**
 * 提取培训班详情
 */
router.get('/getTrDetail', function(req, res) {
    var userNo = req.query["uid"];
    studioService.getUserInfoByUserNo(req.session.studioUserInfo.groupType,
        userNo,
        function(ret) {
            if (ret.winRate) {
                ret.winRate = ret.winRate.replace("%", "");
            }
            if (ret.earningsM) {
                ret.earningsM = ret.earningsM.replace("%", "");
            }
            res.render(
                common.renderPath(req, constant.tempPlatform.pc, "vtrain/" + userNo,
                    "theme1"), ret);
        });
});

/**
 * 获取最后点评的数据
 */
router.get('/getLastReview', function(req, res) {
    zxFinanceService.getFinanceDataLastReview(function(data) {
        res.json(data);
    });
});

/**
 * 用户设置皮肤
 */
router.post('/setThemeStyle', function(req, res) {
    var params = req.body['data'];
    if (common.isBlank(params) || !req.session.studioUserInfo) {
        res.json(null);
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    if (common.isBlank(params.defTemplate)) {
        res.json({ isOK: false, msg: '参数错误' });
    } else {
        studioService.setUserGroupThemeStyle(req.session.studioUserInfo, params,
            function(result) {
                if (result) {
                    req.session.studioUserInfo.defTemplate = params.defTemplate;
                    res.json({ isOK: true, msg: '' });
                } else {
                    res.json({ isOK: false, msg: '' });
                }
            });
    }
});

/**
 * 获取多头与空头比例
 */
router.get('/getSymbolLongShortRatios', function(req, res) {
    baseApiService.getSymbolLongShortRatios(function(result) {
        try {
            if (typeof result == 'string') {
                result = JSON.parse(result);
            }
        } catch (e) {
            result = { code: 'FAIL', result: [] };
        }
        res.json(result);
    });
});

/**
 * 获取未平仓品种比率
 */
router.get('/findSymbolOpenPositionRatios', function(req, res) {
    baseApiService.findSymbolOpenPositionRatios(function(result) {
        try {
            if (typeof result == 'string') {
                result = JSON.parse(result);
            }
        } catch (e) {
            result = { code: 'FAIL', result: [] };
        }
        res.json(result);
    });
});

router.post('/getRoomList', function(req, res) {
    let chatUser = req.session.studioUserInfo,
        isMobile = common.isMobile(req),
        clientGroup = chatUser && chatUser.isLogin ? chatUser.clientGroup :
        constant.clientGroup.visitor,
        isVisitor = (constant.clientGroup.visitor == clientGroup);
    let viewDataObj = {},
        newStudioList = [],
        rowTmp = null;
    if (!chatUser) {
        res.json(viewDataObj);
        return;
    }
    studioService.getIndexLoadData(chatUser, null, true,
        (!isMobile || (isMobile && common.isValid(null))), chatUser.isLogin,
        function(data) {
            if (!data.studioList) {
                if (data.syllabusResult) {
                    var syResult = data.syllabusResult;
                    viewDataObj.syllabusData = JSON.stringify({
                        courseType: syResult.courseType,
                        studioLink: (common.isBlank(syResult.studioLink) ?
                            "" :
                            JSON.parse(syResult.studioLink)),
                        courses: (common.isBlank(syResult.courses) ? "" :
                            syllabusService.removeContext(
                                JSON.parse(syResult.courses)))
                    });
                }
            } else {
                viewDataObj.lgBoxTipInfo = "";
                viewDataObj.onlineNumValSet = '';
                data.studioList.forEach(function(row) {
                    rowTmp = {};
                    rowTmp.id = row._id;
                    rowTmp.name = row.name;
                    rowTmp.level = row.level;
                    rowTmp.isCurr = (row._id == null);
                    //聊天室规则
                    rowTmp.allowWhisper = common.containSplitStr(
                        row.talkStyle, 1);
                    rowTmp.whisperRoles = row.whisperRoles;
                    rowTmp.disable = (!common.containSplitStr(
                        row.clientGroup,
                        clientGroup));
                    rowTmp.allowVisitor = isVisitor ? (!rowTmp.disable) :
                        common.containSplitStr(row.clientGroup,
                            constant.clientGroup.visitor);
                    rowTmp.roomType = row.roomType;
                    rowTmp.status = row.status;
                    rowTmp.trainAuth = -1;
                    rowTmp.openDate = common.isValid(row.openDate) ?
                        JSON.parse(
                            row.openDate) : {};
                    //rowTmp.traninClient = row.traninClient;
                    if (rowTmp.status == 2) {
                        if (row.traninClient) {
                            var length = row.traninClient.length;
                            for (var i = 0; i < length; i++) {
                                if (row.traninClient[i].clientId ==
                                    chatUser.userId) {
                                    rowTmp.trainAuth = row.traninClient[i].isAuth;
                                    break;
                                }
                            }
                        }
                    }
                    var ruleArr = row.chatRules,
                        isPass = true,
                        ruleRow = null;
                    for (var i in ruleArr) {
                        ruleRow = ruleArr[i];
                        isPass = common.dateTimeWeekCheck(
                            ruleRow.periodDate, true);
                        if (ruleRow.type == 'whisper_allowed') {
                            if (rowTmp.allowWhisper && !isPass) {
                                rowTmp.allowWhisper = false;
                                rowTmp.whisperRoles = null;
                            }
                        } else if (ruleRow.type == 'visitor_filter') {
                            if (rowTmp.isCurr && rowTmp.allowVisitor &&
                                isPass) {
                                viewDataObj.visitorSpeak = true;
                            }
                        } else if (ruleRow.type == 'login_time_set') {
                            if (rowTmp.isCurr) {
                                var periodDate = common.isBlank(
                                        ruleRow.periodDate) ? "" :
                                    JSON.parse(ruleRow.periodDate);
                                viewDataObj.lgBoxTipInfo = JSON.stringify({
                                    type: ruleRow.type,
                                    periodDate: periodDate,
                                    beforeRuleVal: ruleRow.beforeRuleVal,
                                    afterRuleTips: ruleRow.afterRuleTips
                                });
                            }
                            if (isPass) {
                                rowTmp.loginBoxTime = ruleRow.beforeRuleVal;
                                rowTmp.loginBoxTip = ruleRow.afterRuleTips;
                            }
                        } else if (ruleRow.type == 'speak_num_set' &&
                            isPass) {
                            rowTmp.speakNum = ruleRow.beforeRuleVal;
                            rowTmp.speakNumTip = ruleRow.afterRuleTips;
                        } else if (ruleRow.type == 'online_mem_set' &&
                            isPass) {
                            rowTmp.onlineNumValSet = ruleRow.beforeRuleVal;
                        }
                    }
                    rowTmp.remark = common.trim(row.remark);
                    rowTmp.clientGroup = common.trim(row.clientGroup);
                    rowTmp.isOpen = common.dateTimeWeekCheck(row.openDate,
                        true);
                    if (rowTmp.isCurr) {
                        viewDataObj.currStudioAuth = !rowTmp.disable;
                        if (data.syllabusResult) {
                            var syResult = data.syllabusResult;
                            viewDataObj.syllabusData = JSON.stringify({
                                courseType: syResult.courseType,
                                studioLink: (common.isBlank(
                                        syResult.studioLink) ? "" :
                                    JSON.parse(syResult.studioLink)),
                                courses: (common.isBlank(syResult.courses) ?
                                    "" :
                                    syllabusService.removeContext(
                                        JSON.parse(syResult.courses)))
                            });
                        }
                        viewDataObj.defTemplate = row.defTemplate;
                    }
                    rowTmp.defTemplate = row.defTemplate;
                    rowTmp.defaultAnalyst = row.defaultAnalyst || {};
                    rowTmp.defaultCS = row.defaultCS;
                    newStudioList.push(rowTmp);
                });
            }
            viewDataObj.studioList = newStudioList;
            res.json(viewDataObj);
        });
});

/**
 * 根据systemCategory获取分析师列表
 */
router.get('/getAnalystList', function(req, res) {
    let systemCategory = req.query['systemCategory'];
    let platform = req.query['platform'];
    if (common.isValid(systemCategory) && common.isValid(platform)) {
        async.parallel({
                analysts: function(callback) {
                    userService.getAnalystList({ systemCategory: systemCategory },
                        function(result) {
                            callback(null, result);
                        });
                },
                praise: function(callback) {
                    chatPraiseService.getPraiseNum('', 'user', platform, function(result) {
                        callback(null, result);
                    });
                }
            },
            function(error, result) {
                res.json(result);
            });
    } else {
        res.json(null);
    }
});

/**
 * 根据groupId获取授权分析师和订阅数
 */
router.get('/getAuthUsersByGroupId', function(req, res) {
    let groupId = req.query['groupId'],
        result = [];
    if (common.isValid(groupId)) {
        userService.getAuthUsersByGroupId(groupId, function(data) {
            let dataLen = data.length;
            for (var i = 0; i < dataLen; i++) {
                let userNo = data[i];
                let key = "analyst_subscribe_" + userNo;
                cacheClient.get(key, function(err, cacheData) {
                    if (err || !cacheData) {
                        let num = Math.floor(200 * common.randomN2M(0.8, 1));
                        cacheClient.set(key, num);
                        result.push({ userNo: userNo, subscribe: num });
                    } else {
                        result.push({ userNo: userNo, subscribe: cacheData });
                    }
                    if (dataLen == result.length) {
                        res.json(result);
                    }
                });
            }
        });
    } else {
        res.json(null);
    }
});

/**
 * 查询当天是否签到
 */
router.post('/checkTodaySignin', function(req, res) {
    var userInfo = req.session.studioUserInfo;
    var clientip = common.getClientIp(req);
    clientTrainService.checkTodaySignin(userInfo, clientip, function(result) {
        res.json(result);
    });
});

/**
 * 获取打赏排行
 */
router.get('/activity/getRewardMoneyInfo', function(req, res) {
    var phoneNo = req.query["phoneNo"];
    var page = req.query["page"];
    activityService.getRewardMoneyInfo(phoneNo, page, function(result) {
        res.json(result);
    });
});

/**
 * 获取奖池总金额
 */
router.get('/activity/getTotalMoneyInfo', function(req, res) {
    var periods = req.query["periods"];
    activityService.getTotalMoneyInfo(periods, function(result) {
        res.json(result);
    });
});

/**
 * 获取抢红包金额
 */
router.get('/activity/getLotteryInfo', function(req, res) {
    var phoneNo = req.query["phoneNo"];
    var periods = req.query["periods"];
    activityService.getLotteryInfo(phoneNo, periods, function(result) {
        res.json(result);
    });
});
/**
 * 直播间交易账号密码登录
 */
router.post('/pmLogin', function(req, res) {
    var verMalCode = req.body["verMalCode"],
        accountNo = req.body["accountNo"],
        pwd = req.body["pwd"],
        clientStoreId = req.body["clientStoreId"],
        cookieId = req.body['cookieId'],
        visitorId = req.body['visitorId'],
        roomId = req.body['roomId'],
        roomName = req.body['roomName'],
        courseId = req.body['courseId'],
        courseName = req.body['courseName'],
        teacherId = req.body['teacherId'],
        teacherName = req.body['teacherName'];
    var result = { isOK: false, error: null };
    var userSession = req.session.studioUserInfo;
    if (!userSession || !userSession.groupType) {
        res.json(result);
        return;
    }
    if (common.isBlank(accountNo) || common.isBlank(pwd)) {
        result.error = errorMessage.code_1013;
    } else if (common.isBlank(verMalCode) || (verMalCode.toLowerCase() !=
            userSession.verMalCode)) {
        result.error = errorMessage.code_1002;
    }
    /*else if(!/^8[0-9]+$/g.test(accountNo)&&!/^(90|92|95)[0-9]+$/g.test(accountNo)){
     result.error=errorMessage.code_1014;
     }*/
    if (result.error) {
        res.json(result);
    } else {
        apiService.checkAccountLogin({ loginname: accountNo, password: pwd, ip: common.getClientIp(req) },
            function(checkAResult) {
                logger.info(
                    "checkAccountLogin->flagResult:" + JSON.stringify(checkAResult));
                if (checkAResult != null) {
                    var clientGroup = '';
                    if (checkAResult.clientGroup != 'A' && checkAResult.clientGroup !=
                        'N') {
                        result.error = errorMessage.code_1018;
                        res.json(result);
                    } else {
                        if (checkAResult.clientGroup == 'A') {
                            clientGroup = 'active';
                        } else if (checkAResult.clientGroup == 'N') {
                            clientGroup = 'notActive';
                        }
                        saveLoginInfo(res, req, userSession, checkAResult.mobilePhone,
                            accountNo, clientStoreId, clientGroup,
                            function(saveResult) {
                                saveResult.isOK = true;
                                req.session.studioUserInfo.cookieId = cookieId;
                                req.session.studioUserInfo.visitorId = visitorId;
                                req.session.studioUserInfo.roomName = roomName;
                                var snUser = req.session.studioUserInfo;
                                var dasData = {
                                    mobile: snUser.mobilePhone,
                                    cookieId: cookieId,
                                    clientGroup: snUser.clientGroup,
                                    roomName: roomName,
                                    roomId: (snUser.groupId || roomId),
                                    platform: '',
                                    userAgent: req.headers['user-agent'],
                                    sessionId: req.sessionID,
                                    clientStoreId: snUser.clientStoreId,
                                    groupType: snUser.groupType,
                                    userName: (snUser.userName || ''),
                                    email: (snUser.email || ''),
                                    ip: common.getClientIp(req),
                                    visitorId: visitorId,
                                    nickName: (snUser.nickname || ''),
                                    courseName: courseName,
                                    courseId: courseId,
                                    teacherId: teacherId,
                                    teacherName: teacherName,
                                    accountNo: accountNo
                                };
                                visitorService.saveVisitorRecord("login", dasData);
                                res.json(saveResult);
                            });
                    }
                } else {
                    result.error = errorMessage.code_1015;
                    res.json(result);
                }
            });
    }
});

/**
 * 保存登录信息
 * @param res
 * @param req
 * @param userSession
 * @param mobilePhone
 * @param accountNo
 * @param thirdId
 * @param clientStoreId
 */
function saveLoginInfo(res, req, userSession, mobilePhone, accountNo,
    clientStoreId, clientGroup, callback) {
    var userInfo = {
        mobilePhone: mobilePhone,
        ip: common.getClientIp(req),
        groupType: userSession.groupType,
        accountNo: accountNo,
        thirdId: null,
        clientGroup: clientGroup
    };
    studioService.checkMemberAndSave(userInfo, function(result, isNew) {
        req.session.studioUserInfo = {
            groupType: userSession.groupType,
            clientStoreId: clientStoreId,
            firstLogin: true,
            isLogin: true,
            mobilePhone: userInfo.mobilePhone,
            userId: userInfo.userId || result.userId,
            defGroupId: userInfo.defGroupId,
            clientGroup: userInfo.clientGroup || result.userInfo.clientGroup,
            nickname: userInfo.nickname || result.userInfo.nickname,
            avatar: userInfo.avatar,
            defTemplate: userInfo.defTemplate
        };
        let snUser = req.session.studioUserInfo;
        result.userInfo = {
            mobilePhone: snUser.mobilePhone,
            userId: snUser.userId,
            nickname: snUser.nickname,
            groupType: snUser.groupType,
            clientGroup: snUser.clientGroup,
            email: "",
            userName: "",
            password: "",
            isLogin: true,
            clientStoreId: snUser.clientStoreId,
            firstLogin: true,
            cookieId: snUser.cookieId,
            visitorId: snUser.visitorId,
            roomName: ""
        };
        callback(result);
        if (isNew) {
            //新注册
            userInfo.item = "register_reg";
            studioService.addRegisterPoint(userInfo, userInfo.clientGroup);
        }
    });
}

var geetest = {};
for (var name in config.geetest) {
    geetest[name] = {
        pc: new Geetest({
            geetest_id: config.geetest[name].pc.id,
            geetest_key: config.geetest[name].pc.key
        }),
        mobile: new Geetest({
            geetest_id: config.geetest[name].mobile.id,
            geetest_key: config.geetest[name].mobile.key
        })
    };
}

function getGeet(req) {
    var groupType = req.query["group"];
    var g = geetest[groupType];
    var geet = g.pc;
    if (common.isMobile(req)) {
        geet = g.mobile;
    }
    return geet;
}
//geetest 验证码注册
router.get("/geetest/register", function(req, res) {
    // 向极验申请每次验证所需的challenge
    getGeet(req).register(function(err, data) {
        if (err) {
            res.send(data);
        } else {
            res.send(data);
        }
    });
});

router.post('/rob', function(req, res) {
    //没有登录
    var userInfo = req.session.studioUserInfo;
    if (!userInfo || !userInfo.isLogin || !userInfo.mobilePhone) {
        res.json({ result: "-1", msg: "未登录用户，请登录后抢红包！" });
        return;
    }
    var clientTime = req.body['t'];
    var minutes = clientTime - new Date().getTime();
    if (Math.abs(minutes) >= 60000) {
        res.json({ result: "-1", msg: "红包已过期，请等待下一波红包！" });
        return;
    }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var curHours = now.getHours();
    var curMinutes = now.getMinutes();
    if (curHours < 10) {
        curHours = '0' + curHours;
    }
    if (curMinutes < 10) {
        curMinutes = '0' + curMinutes;
    }
    var curHMDate = curHours + ":" + curMinutes;
    var pariods = constant.periods;
    var currentPariod = 1; //默认从第一期开始
    for (var i = 0; i < pariods.length; i++) {
        if (curHMDate < pariods[i]) {
            currentPariod = i + 1;
            break;
        }
    }

    var robParams = {
        ac_periods: "20170401",
        phone: userInfo.mobilePhone.replace("86-", ""),
        nper: currentPariod
    };

    /*如果期数小于0,直接返回*/
    if (currentPariod < 0) {
        res.json({ result: 0, money: 0, msg: "" });
        return;
    }

    /*如果真实客户,直接返回*/
    if (userInfo.clientGroup == "active") {
        res.json({ result: 0, money: 0, msg: "" });
        return;
    }

    cacheClient.get("redPacket_" + robParams.phone, function(err, result) {
        if (err) {
            logger.error("redPacket get cache fail:" + err);
        } else if (result != true && 0 == currentPariod) {
            res.json({ result: 0, money: 0, msg: "" });
        } else if (common.isBlank(result) || result != currentPariod) {
            var cacheTime = Math.floor((today + 86400000 - now.getTime()) / 1000);
            cacheClient.set("redPacket_" + robParams.phone, currentPariod);
            cacheClient.expire("redPacket_" + robParams.phone, cacheTime);
            request.post({ url: (config.pmOAPath + '/lottery/activity20170401/draw'), form: robParams }, function(error, response, data) {
                var result = { result: 0, money: 0, msg: "" };
                if (data) {
                    logger.info("redPacket<<rob :", robParams.phone, robParams.nper, data);
                    try {
                        data = JSON.parse(data);
                        if (data.infoNo == 1) {
                            cacheClient.set("redPacket_" + robParams.nper, true);
                            cacheClient.expire("redPacket_" + robParams.nper, cacheTime);
                            result.result = 0;
                            result.money = data.infoGiftName;
                            res.json(result);
                            return;
                        }
                        result.msg = data.infoMsg;
                    } catch (e) {}
                }
                res.json(result);
            });
        } else {
            res.json({ result: 0, money: 0, msg: "" });
        }
    });
});

/**
 * 获取老师订阅数
 */
router.get('/getAnalystSubscribeNum', function(req, res) {
    let params = req.query['data'];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    let userNo = params.userNo;
    let key = "analyst_subscribe_" + userNo;
    cacheClient.get(key, function(err, result) {
        if (err || !result) {
            let num = Math.floor(200 * common.randomN2M(0.8, 1));
            cacheClient.set(key, num);
            res.json({ num: num });
        } else {
            res.json({ num: result });
        }
    });
});

/**
 * 设置老师订阅数
 */
router.post('/setAnalystSubscribeNum', function(req, res) {
    let params = req.body['data'];
    if (common.isBlank(params)) {
        res.json({ isOK: false, msg: '参数错误' });
        return;
    }
    if (typeof params == 'string') {
        try {
            params = JSON.parse(params);
        } catch (e) {
            res.json(null);
            return;
        }
    }
    let userNo = params.userNo;
    let key = "analyst_subscribe_" + userNo;
    cacheClient.get(key, function(err, result) {
        if (err || !result) {
            let num = Math.floor(200 * common.randomN2M(0.8, 1));
            num = num + 1;
            cacheClient.set(key, num);
            res.json({ num: num });
        } else {
            result = parseInt(result) + 1;
            cacheClient.set(key, result);
            res.json({ num: result });
        }
    });
});

module.exports = router;