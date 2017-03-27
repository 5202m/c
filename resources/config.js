/**
 *
 * Created by Alan.wu on 2015/4/18.
 */
var config = {
    companyId: "pm",
    defaultGroupType: "studio",
    studioThirdUsed: { //第三方引用直播间默认房间
        platfrom: 'webui,app,pc,web24k',
        webui: 'webui', //直播间中studio.js中针对webui不跳转到mini版本
        web24k: 'web24k', //api中课程表信息，web24k只取一条课程记录
        roomId: {
            studio: 'studio_teach'
        }
    },
    defTemplate: {
        pm: { usedNum: 4, pc: 'theme1', mb: 'theme2', mini: 'theme3', webui: 'theme4', routeKey: '', host: 'pmchat.24k.hk' }
    }, //默认模板设置,//默认模板设置
    utm: {
        smsUrl: "http://testweboa.gwfx.com:8070/das_web/smsTemplate/send", //http://dmp.gwghk.com/smsTemplate/send
        emailUrl: "http://testweboa.gwfx.com:8070/das_web/emailTemplate/send", //http://dmp.gwghk.com/emailTemplate/send
        cstGroupUrl: "http://testweboa.gwfx.com:8070/das_web/customerGroup/updateCustomer", //http://dmp.gwghk.com/customerGroup/updateCustomer
        studio: {
            sid: "fa573c78eaa8402cb6c84dabfcce7159",
            token: "8867af2616da47d7927ff0df7ea60669"
        }
    }, //UTM系统信息
    isDevTest: true, //是否开发或测试环境
    sessionConfig: { key: 'connect.sid', secret: 'pm@chat' }, //session 对应key,secret
    redisUrlObj: { host: '192.168.35.81', port: 6379 }, //链接redis缓存客户端连接
    isAllowCopyHomeUrl: true, //是否允许copy链接（针对微信进入聊天室）
    pmApiUrl: 'http://192.168.35.81:3003/api', //pmApi地址
    //  pmApiUrl: 'http://localhost:3000/api', //pmApi地址
    goldApiUrl: 'http://192.168.35.160/goldoffice_api/RESTful', //gwapi地址
    gwfxGTS2ApiUrl: 'http://192.168.35.100:8083/Goldoffice_gateway_uat/RESTful', //外汇GTS2 Api地址
    gwfxGTS2SmApiUrl: 'http://192.168.35.99:8080/Goldoffice_demo_api/RESTful', //外汇GTS2 模拟场 Api地址  真实地址:http://gts2apidemo.gwfx.com/Goldoffice_api
    gwfxMT4ApiUrl: 'http://192.168.75.40:8081/GwfxApi/RESTful', //外汇MT4 Api地址
    gwfxMT4SmApiUrl: 'http://192.168.75.40:8081/GwfxApi/RESTful', //外汇MT4 Api地址
    simulateApiUrl: 'http://192.168.35.160/goldoffice_api_demo/RESTful', //模拟账户api地址  真实地址:http://gts2apidemo.24k.hk/Goldoffice_api/RESTful
    hxGTS2ApiUrl: 'http://192.168.35.100:8083/Goldoffice_gateway_uat/RESTful', //恒信GTS2 Api地址 真实地址http://gts2api.hx9999.com/Goldoffice_api/RESTful gts2api.hx9999.com -> 192.168.42.164
    hxGTS2SmApiUrl: 'http://192.168.35.99:8080/Goldoffice_demo_api/RESTful', //恒信GTS2 真实地址 http://gts2apidemo.hx9999.com/Goldoffice_api/RESTful
    hxMT4ApiUrl: 'http://hxapi.hx9999.com', //恒信MT4 Api地址 http://hxapi.hx9999.com
    hxApiLoginSid: { apiLogin: 'handan', apiPassword: 'abc123' },
    socketServerUrl: { webSocket: 'http://192.168.35.81:3007', socketIO: 'http://192.168.35.81:3007', apiSocket: 'http://192.168.35.81:3007/fxFinance' },
    chatSocketUrl: 'http://192.168.35.81:3007', //socket 服务api地址
    filesDomain: 'http://192.168.35.91:8090', //图片等文件访问域名
    web24kPath: 'http://testweb1.24k.hk:8090', //24k信息地址
    pmOAPath: 'http://testweb1.24k.hk:81', //https://oa.24k.hk
    packetAcUrl: 'http://testweb1.24k.hk/activity20160105/getActivityUrl', //红包活动连接
    mobile24kPath: 'http://testweb1.24k.hk:8092', //24k信息地址 http://m.24k.hk
    dasUrl: 'http://testweboa.gwfx.com:8088/GwUserTrackingManager_NEW/put/insertRoom', //das数据分析系统地址
    appAutoLogin: {
        rgsUrl: 'http://ot1.24k.hk:8080/rgs/validate',
        clientId: 'pmlivebroadcast',
        rgsKey: '4f924b48xa012x49eax95bbx7a74a3bc0035'
    }, //app端自动登录直播间
    geetest: {
        studio: {
            pc: {
                id: "62412aabcfcdeacd22f6c2e38c428bb6",
                key: "94fe6fb2fb2839d77e8d0caa6b2fb95d"
            },
            mobile: {
                id: "ce33aa4bb9dc8ee442c1f96ce6a81c27",
                key: "1fa5d6608f720a77a1b2f664327d62c7"
            }
        }
    }, //geetest图片验证码
    verifyCodeMaxCount: 3 //获取手机验证码最大次数 超过后需要配合验证码使用
};
//导出配置类
module.exports = config;