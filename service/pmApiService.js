var request = require('request');
var util = require('util');
var common = require('../util/common'); //引入公共的js
var config = require('../resources/config'); //引入config
var logger = require('../resources/logConf').getLogger('pmApiService');
var constant = require('../constant/constant');

var getValidPhoneNumber = function(num) {
    var phone = num;
    phone = phone.match(/[0-9]{6,11}$/);
    phone = phone ? phone[0] : null;
    return phone;
};
/**
 * pmApi服务类
 * @type {{}}
 * create by alan.wu
 */
var pmApiService = {
    /**
     * 提取PM GTS2接口的签名
     * @param data
     */
    getApiSignature: function(data) {
        var invokerVal = '';
        if (data["_principal_"]) {
            var pl = data["_principal_"];
            if (typeof pl != "object") {
                pl = JSON.parse(pl);
            }
            if (!pl.invoker || !constant.gwApiInvoker.hasOwnProperty(pl.invoker)) {
                return null;
            }
            invokerVal = constant.gwApiInvoker[pl.invoker].value;
        }
        var names = [];
        for (var name in data) {
            if (name == '_signature_') {
                continue;
            } else {
                names.push(name);
            }
        }
        names.sort();
        var str = '',
            value = '';
        for (var i = 0; i < names.length; i++) {
            value = data[names[i]];
            value = (value == null) ? "" : (typeof value == "object" ? JSON.stringify(value) : value);
            str += value + '&';
        }
        str += invokerVal;
        return common.getMD5(str);
    },

    /**
     * 黄金接口
     * 通过账号与手机号检查用户是否A客户
     * 备注：目前只是微信组聊天室客户发言时需检测，只针对goldApi
     * @param params
     * @param callback
     */
    checkAClient: function(params, callback) {
        var flagResult = { flag: 0 }; //客户记录标志:0（记录不存在）、1（未绑定微信）、2（未入金激活）、3（绑定微信并且已经入金激活）
        if (params.isCheckByMobile) {
            request.post({
                url: (config.goldApiUrl + '/account/getCustomerInfoByMobileNo'),
                form: { mobileNo: '86-' + params.mobilePhone }
            }, function(error, response, tmpData) {
                //logger.info("checkContactInfo->error:"+error+";tmpData:"+tmpData);
                if (error) {
                    logger.error("getCustomerInfoByMobileNo->error" + error);
                }
                try {
                    if (!error && common.isValid(tmpData)) {
                        var allData = JSON.parse(tmpData);
                        var result = allData.result;
                        if (allData.code == 'SUCCESS' && result && result.length > 0) {
                            flagResult.flag = 2; //未入金激活
                            var acc = null;
                            for (var i = 0, lenI = result ? result.length : 0; i < lenI; i++) {
                                acc = result[i];
                                flagResult.accountNo = acc.accountNo;
                                if (acc.accountStatus == "A") {
                                    flagResult.flag = 3;
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    logger.error("getCustomerInfoByMobileNo->error" + e);
                }
                callback(flagResult);
            });
        } else {
            request.post({
                url: (config.goldApiUrl + '/account/getCustomerInfo'),
                form: { loginname: params.accountNo }
            }, function(error, response, tmpData) {
                if (!error && common.isValid(tmpData)) {
                    try {
                        var allData = JSON.parse(tmpData);
                        var result = allData.result;
                        if (allData.code == 'SUCCESS' && result != null) {
                            if (common.isValid(params.mobilePhone) &&
                                result.mobilePhone.indexOf(params.mobilePhone) == -1) {
                                flagResult.flag = 0; //没有对应记录
                            } else if (result.accountStatus != 'A') {
                                flagResult.flag = 2; //未入金激活
                            } else if (result.accountStatus == 'A') {
                                flagResult.flag = 3; //入金激活
                            } else if (result.isBindWeichat != 1) {
                                flagResult.flag = 1; //未绑定微信
                            } else {
                                flagResult.flag = 3; //绑定微信并且已经入金激活
                            }
                            let index = result.mobilePhone.search(/1[3-9]\d{9}/);
                            if (index >= 0) {
                                flagResult.accountNo = result.mobilePhone.substr(index, 11);
                            } else {
                                flagResult.accountNo = result.mobilePhone;
                            }
                        } else {
                            flagResult.flag = 0; //没有对应记录
                        }
                    } catch (e) {
                        logger.error("getCustomerInfo->error" + e);
                    }
                }
                callback(flagResult);
            });
        }
    },
    /**
     * 通过手机号检查模拟账户
     * @param mobilePhone
     * @param callback
     */
    checkSmClient: function(mobilePhone, callback) {
        var isTrue = false;
        request.post({
            url: (config.simulateApiUrl + '/account/demo/checkEmailMobile'),
            form: { args: '["","86-' + mobilePhone + '"]' }
        }, function(error, response, data) {
            logger.info(
                "checkEmailMobile[" + mobilePhone + "]->error:" + error + ";tmpData:" +
                data);
            if (!error && common.isValid(data)) {
                try {
                    var allData = JSON.parse(data),
                        result = allData.result;
                    isTrue = (allData.code == 'SUCCESS' && result != null && result.code ==
                    '1044');
                } catch (e) {
                    isTrue = false;
                    logger.error(
                        "checkSimulateClient by GTSApi[" + mobilePhone + "]->error:" + e);
                }
            }
            callback(isTrue);
        });
    },

    /**
     * 发送邮件
     * @param params
     * @param templateCode
     * @param emails
     * @param groupType
     * @param callback ({{isOK : boolean, msg : String}})
     */
    sendEmailByUTM: function(params, templateCode, emails, groupType, callback) {
        if (!emails || !templateCode || !groupType || !config.utm.hasOwnProperty(
                groupType)) {
            callback({ isOK: false, msg: "参数错误！" });
            return;
        }
        var utmConfig = config.utm[groupType];
        var emailData = {
            timestamp: common.formatDate(new Date(), "yyyyMMddHHmmss"),
            accountSid: utmConfig.sid,
            sign: "",
            emails: emails,
            templateCode: templateCode,
            templateParam: JSON.stringify(params)
        };
        emailData.sign = common.getMD5(
            emailData.accountSid + utmConfig.token + emailData.timestamp);

        logger.info("<<sendEmailByUTM:发送邮件：content=[%s]",
            JSON.stringify(emailData));
        request.post(config.utm.emailUrl, function(error, response, data) {
            if (error || response.statusCode != 200 || !data) {
                logger.error("<<sendEmailByUTM:发送邮件异常，errMessage:", error);
                callback({ isOK: false, msg: "发送邮件错误！" });
            } else {
                try {
                    data = JSON.parse(data);
                    if (data.respCode != "Success") {
                        logger.error("<<sendEmailByUTM:发送邮件失败，[errMessage:%s]",
                            data.respMsg);
                        callback({ isOK: false, msg: "发送邮件错误:" + data.respMsg + "!" });
                    } else {
                        callback({ isOK: true, msg: "" });
                    }
                } catch (e) {
                    logger.error("<<sendEmailByUTM:发送邮件出错，[response:%s]", data);
                    callback({ isOK: false, msg: "发送邮件错误！" });
                }
            }
        }).form(emailData);
    },
    /**
     *  根据交易账号密码登录(先验证gts2 登录报错再验证gts)
     * @param params
     * @param callback
     */
    checkAccountLogin:function (params, callback) {
        var isTrue = false;
        var platform = 'GTS2';
        var submitInfo = {
            customerNumber: params.loginname,
            password: params.password,
            platform: platform,
            args: '[]',
            _principal_: { loginName: params.loginname, remoteIpAddress: params.ip, invoker: constant.gwApiInvoker.pm_website.key, companyId: constant.companyId.pm }
        };
        var sg = this.getApiSignature(submitInfo);
        if (!sg) {
            callback(isTrue);
            return;
        }
        submitInfo["_signature_"] = sg;
        submitInfo['_principal_'] = JSON.stringify(submitInfo['_principal_']);
        console.log(submitInfo);
        request.post({
                url: (config.gwfxGTS2ApiUrl + '/account/liveChatVerify'),
                form: submitInfo
            },
            function(error, response, data) {
                logger.info("tmpData:" + data);
                var callData = null;
                if (!error && common.isValid(data)) {
                    var allData = null;
                    try {
                        allData = JSON.parse(data);
                    } catch (e) {
                        logger.error("checkAccountLogin by GTS2Api[" + params.loginname + "]->error:" + e);
                        callback(null);
                        return;
                    }
                    var result = allData.result,
                        row = null;
                    if (allData && allData.code == 'SUCCESS' &&
                        result != null && result.code == 'OK' &&
                        (row = result.result) != null) {
                        var phoneNumber = getValidPhoneNumber(result.context.MOBILE_PHONE_NO);

                        callData = phoneNumber ? {
                            mobilePhone: phoneNumber,
                            clientGroup: result.context.ACCOUNT_STATUS
                        } : null;
                    } else {
                        callData = null;
                    }
                } else {
                    logger.error("checkAccountLogin by GTS2Api[" + params.loginname + "]->error:" + error);
                    pmApiService.gTSAccountLogin(params,callback);
                }
                callback(callData);
            });
    },

    /**
     * 根据gts交易账号密码登录
     * @param params
     * @param callback
     */
    gTSAccountLogin: function(params, callback) {
        var submitInfo = {
            loginname: params.loginname,
            password: params.password,
            ip: params.ip
        };
        var keys = ["GW", "MT4", "MT5", "ONESTOP"];
        request.post({ url: (config.goldApiUrl + '/account/login'), form: submitInfo },
            function(error, response, data) {
                // logger.info("tmpData:" + data);
                var callData = null;
                if (!error && common.isValid(data)) {
                    try {
                        data = JSON.parse(data);
                        if (data.code == 'SUCCESS' && data.result && data.result.code ==
                            'OK' && data.result.returnObj &&
                            data.result.returnObj[0]) {
                            for (var i = 0; i < keys.length; i++) {
                                var result = data.result.returnObj[0][keys[i]];
                                //不存在对应系统 或者 对应系统的账号不是当前登录的账号 则不是此系统 跳出
                                if (!result || result.accountNo != params.loginname) {
                                    continue;
                                }
                                var phone = result.mobilePhone;
                                logger.info("checkAccountLogin phone:" + phone);
                                if (phone) {
                                    //var index = phone.search(/1[3-9]\d{9}/);
                                    phone = getValidPhoneNumber(phone);
                                    if (phone) {
                                        //只获取手机号码
                                        callData = {
                                            mobilePhone: phone,
                                            clientGroup: result.accountStatus,
                                            joinDate: result.createDate ? new Date(result.createDate.time) : ''
                                        };
                                    }
                                }
                                break;
                            }
                        } else {
                            callData = null;
                        }
                    } catch (e) {
                        logger.error(
                            "checkAccountLogin by goldoffice_api[" + params.loginname +
                            "]->error:" + e);
                    }
                } else {
                    logger.error(
                        "checkAccountLogin by goldoffice_api[" + params.loginname +
                        "]->error:" + error);
                }
                callback(callData);
            });
    },
    /**
     * 获取客户激活时间
     */
    getUserActiveTime: function(mobile) {
        let deferred = new common.Deferred();
        request.post({
            url: (config.goldApiUrl + '/account/getCustomerInfoByMobileNo'),
            form: { mobileNo: '86-' + mobile }

        }, function(error, response, tmpData) {
            //logger.info("getUserActiveTime->error:"+error+";tmpData:"+tmpData);
            var callData = null;
            if (error) {
                logger.error("getUserActiveTime->error" + error);
            }
            var allData = null;
            if (!error && common.isValid(tmpData)) {
                try {
                    allData = JSON.parse(tmpData);
                    logger.info("getUserActiveTime" + allData);
                } catch (e) {
                    logger.error("getUserActiveTime[" +
                        mobile + "]->error:" + e);
                    deferred.reject(e);
                    return;
                }
                var result = allData.result,
                    row = null,
                    activeTimeArr = [];

                if (allData && allData.code == 'SUCCESS' &&
                    result != null) {
                    for (var i = 0, lenI = result ? result.length : 0; i < lenI; i++) {
                        if (result[i].accountStatus == 'A') {
                            activeTimeArr.push(result[i].activateTime.time);
                        }
                    }
                    if (activeTimeArr.length > 0) {
                        activeTimeArr = activeTimeArr.sort(function(a, b) { return b - a });
                    }
                } else {
                    callData = null;
                }
            } else {
                logger.error("getUserActiveTime[" +
                    mobile + "]->error:" + error);
                deferred.reject(error);
            }
            deferred.resolve(callData);
        });
        return deferred.promise;
    },

    /**
     * 获取app客户资料
     */
    getUserMobile: function(params, account) {
        let deferred = new common.Deferred();
        var submitInfo = {
            gts2CustomerId: account,
            args: '[]',
            _principal_: { loginName: account, remoteIpAddress: params.remoteIp, invoker: constant.gwApiInvoker.pm_website.key, companyId: constant.companyId.pm }
        };
        var sg = pmApiService.getApiSignature(submitInfo);
        submitInfo["_signature_"] = sg;
        submitInfo['_principal_'] = JSON.stringify(submitInfo['_principal_']);
        request.post({
                url: (config.gwfxGTS2ApiUrl + '/account/getCustomerByCustomerId'),
                form: submitInfo
            },
            function(error, response, data) {
                var callData = null;
                if (!error && common.isValid(data)) {
                    var allData = null;
                    try {
                        allData = JSON.parse(data);
                    } catch (e) {
                        logger.error("get getUserInfo[" +
                            params.account + "]->error:" + e);
                        deferred.reject(e);
                        return;
                    }
                    var result = allData.result,
                        row = null;
                    if (allData && allData.code == 'SUCCESS' &&
                        result != null) {
                        callData =result;
                    } else {
                        callData = null;
                    }
                } else {
                    logger.error("getUserInfo[" +
                        params.account + "]->error:" + error);
                    deferred.reject(error);
                }
                deferred.resolve(callData);
            });
        return deferred.promise;
    }

};

//导出服务类
module.exports = pmApiService;