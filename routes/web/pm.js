var Config = require("../../resources/config");
var Logger=require('../../resources/logConf').getLogger('pm');//引入log4js
var Request = require("request");
var Common = require("../../util/common");

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
module.exports = router;
