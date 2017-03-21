var Config = require("../../resources/config");
var Logger=require('../../resources/logConf').getLogger('pm');//引入log4js
var Request = require("request");
var Common = require("../../util/common");
var apiService = require('../../service/pmApiService');//引入ApiService
var studioService = require('../../service/studioService');//引入studioService
var errorMessage = require('../../util/errorMessage');
var visitorService = require('../../service/visitorService');//引入visitorService

/**
 * pm页面请求控制类
 * Created by Alan.wu on 2016/6/14.
 */
var router =  require('express').Router();

router.post('/rob', function(req, res) {
    //没有登录
    var userInfo = req.session.studioUserInfo;
    if(!userInfo || !userInfo.isLogin || !userInfo.mobilePhone){
        res.json({result:"-1", msg:"未登录用户，请登录后抢红包！"});
        return;
    }
    var clientTime = req.body['t'];
    var minutes = clientTime - new Date().getTime();
    if(Math.abs(minutes) >= 60000){
        res.json({result:"-1", msg:"红包已过期，请等待下一波红包！"});
        return;
    }
    var cacheClient = require('../../cache/cacheClient');
    var start = 30600000; //8:30
    var cycle = 300000;   //周期5分钟
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var time = now.getTime() - today;
    //确定期数
    var periods = time - ((time - start) % cycle);
    var robParams = {
        ac_periods : "20161202",
        phone : userInfo.mobilePhone,
        nper : Common.formatDate(new Date(today + periods), "yyyyMMddHHmmss")
    };
    cacheClient.get("redPacket_" + robParams.phone, function(err, result) {
        if (err) {
            Logger.error("redPacket get cache fail:" + err);
        }
        else if (result != true && result != periods) {
            cacheClient.set("redPacket_" + robParams.phone, periods);
            Request.post({url: (Config.pmOAPath + '/activity20161202/draw'),form: robParams}, function (error, response, data) {
                var result = {result: 0, money: 0, msg: ""};
                if (data) {
                    Logger.info("redPacket<<rob :", robParams.phone, robParams.nper, data);
                    try {
                        data = JSON.parse(data);
                        if (data.infoNo == 1 && data.infoGiftNumber) {
                            cacheClient.set("redPacket_" + robParams.phone, true);
                            result.result = 0;
                            result.money = data.infoGiftName;
                            res.json(result);
                            return;
                        }
                        result.msg = data.infoMsg;
                    } catch (e) {
                    }
                }
                res.json(result);
            });
        }else{
            res.json({result: 0, money: 0, msg: ""});
        }
    });
});

/**
 * 直播间交易账号密码登录
 */
router.post('/pmLogin',function(req, res){
    var verMalCode=req.body["verMalCode"],
        accountNo=req.body["accountNo"],
        pwd=req.body["pwd"],
        clientStoreId=req.body["clientStoreId"],
        cookieId=req.body['cookieId'],
        visitorId=req.body['visitorId'],
        roomId=req.body['roomId'],
        roomName=req.body['roomName'],
        courseId=req.body['courseId'],
        courseName=req.body['courseName'],
        teacherId=req.body['teacherId'],
        teacherName=req.body['teacherName'];
    var result={isOK:false,error:null};
    var userSession=req.session.studioUserInfo;
    if(!userSession || !userSession.groupType){
        res.json(result);
        return;
    }
    if(Common.isBlank(accountNo)||Common.isBlank(pwd)){
        result.error=errorMessage.code_1013;
    }else if(Common.isBlank(verMalCode)||(verMalCode.toLowerCase()!=userSession.verMalCode)){
        result.error=errorMessage.code_1002;
    }/*else if(!/^8[0-9]+$/g.test(accountNo)&&!/^(90|92|95)[0-9]+$/g.test(accountNo)){
     result.error=errorMessage.code_1014;
     }*/
    if(result.error){
        res.json(result);
    }else{
        apiService.checkAccountLogin({loginname:accountNo,password:pwd,ip:Common.getClientIp(req)},function(checkAResult){
            Logger.info("checkAccountLogin->flagResult:"+JSON.stringify(checkAResult));
            if(checkAResult!=null){
                var clientGroup = '';
                if(checkAResult.clientGroup != 'A' && checkAResult.clientGroup != 'N'){
                    result.error = errorMessage.code_1018;
                    res.json(result);
                }else {
                    if(checkAResult.clientGroup == 'A'){
                        clientGroup = 'active';
                    }else if(checkAResult.clientGroup == 'N'){
                        clientGroup = 'notActive';
                    }
                    saveLoginInfo(res, req, userSession, checkAResult.mobilePhone, accountNo, clientStoreId, clientGroup, function (saveResult) {
                        saveResult.isOK = true;
                        req.session.studioUserInfo.cookieId = cookieId;
                        req.session.studioUserInfo.visitorId = visitorId;
                        req.session.studioUserInfo.roomName = roomName;
                        var snUser = req.session.studioUserInfo;
                        var dasData = {mobile:snUser.mobilePhone,cookieId:cookieId,clientGroup:snUser.clientGroup,roomName:roomName,roomId:(snUser.groupId||roomId),platform:'',userAgent:req.headers['user-agent'],sessionId:req.sessionID,clientStoreId:snUser.clientStoreId,groupType:snUser.groupType,userName:(snUser.userName||''),email:(snUser.email||''),ip:Common.getClientIp(req),visitorId:visitorId,nickName:(snUser.nickname||''),courseName:courseName,courseId:courseId,teacherId:teacherId,teacherName:teacherName,accountNo:accountNo};
                        visitorService.saveVisitorRecord("login", dasData);
                        res.json(saveResult);
                    });
                }
            }else{
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
function saveLoginInfo(res,req,userSession,mobilePhone,accountNo,clientStoreId,clientGroup,callback){
    var userInfo = {
        mobilePhone: mobilePhone,
        ip: Common.getClientIp(req),
        groupType: userSession.groupType,
        accountNo: accountNo,
        thirdId: null,
        clientGroup:clientGroup
    };
    studioService.checkMemberAndSave(userInfo,function(result,isNew){
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
            avatar:userInfo.avatar,
            defTemplate:userInfo.defTemplate
        };
        let snUser = req.session.studioUserInfo;
        result.userInfo = {
            mobilePhone:snUser.mobilePhone,
            userId:snUser.userId,
            nickname:snUser.nickname,
            groupType:snUser.groupType,
            clientGroup:snUser.clientGroup,
            email:"",
            userName:"",
            password:"",
            isLogin:true,
            clientStoreId:snUser.clientStoreId,
            firstLogin:true,
            cookieId:snUser.cookieId,
            visitorId:snUser.visitorId,
            roomName:""
        };
        callback(result);
        if(isNew){
            //新注册
            userInfo.item = "register_reg";
            studioService.addRegisterPoint(userInfo,userInfo.clientGroup);
        }
    });
}

module.exports = router;
