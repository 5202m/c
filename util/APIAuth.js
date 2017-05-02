const Deferred = require("../util/common").Deferred;
const request = require('request-promise-native');
const config = require('../resources/config'); // 引入config
const logger = require('../resources/logConf').getLogger("apiAuth");
const apiUrl = config.apiUrl;

const constants = {
    millisecondsPerHour: 3600 * 1000,
    expiredGap: 10000
};

let getOptions = (url, method, data) => {
    let options = {
        url: url,
        json: true
    };
    if (method) {
        options.method = method;
        options.body = data;
    }
    return options;
};
let isLocalTokenValid = (apiToken) => {
    let currentTime = new Date().getTime();
    let expiredTime = apiToken.beginTime - 0 + apiToken.expires * constants.millisecondsPerHour;
    let isValid = (currentTime + constants.expiredGap) <= expiredTime;
    if (!isValid) {
        logger.info("local token invalid, currentTime:", currentTime, " expiredTime: ", expiredTime);
        logger.debug(JSON.stringify(apiToken), "currentTime:", new Date(currentTime).toLocaleString(), " expiredTime: ", new Date(expiredTime).toLocaleString());
    }

    return isValid;
};

let verifyTokenFromAPI = (apiToken, appSecret) => {
    let deferred = new Deferred();
    let currentToken = apiToken.token;
    let url = `${apiUrl}/token/verifyToken`;
    let data = { token: currentToken, appSecret: appSecret };
    logger.info("Verifing token from API: ", url);
    logger.debug("Posting token: ", data);
    request(getOptions(url, 'POST', data))
        .then(res => {
            deferred.resolve(res.isOK);
        }).catch(e => {
            deferred.reject(e);
        });
    return deferred.promise;
};

class APIAuth {
    constructor(appId, appSecret) {
        this.apiToken = null;
        this.appId = appId;
        this.appSecret = appSecret;
    }
    verifyToken() {
        let deferred = new Deferred();
        if (!this.apiToken) {
            deferred.resolve(false);
            return deferred.promise;
        }
        if (isLocalTokenValid(this.apiToken)) { //Token 离过期至少还有一段的时间，因此不需要发请求去api验证token。
            deferred.resolve(true);
        } else {
            deferred.resolve(false);
        }

        return deferred.promise;
    }
    getNewToken() {
        let deferred = new Deferred();
        let _this = this;
        let url = `${apiUrl}/token/getToken`;
        let data = {
            appId: _this.appId,
            appSecret: _this.appSecret
        };
        logger.info("Fetching new token from ", url);
        request(getOptions(url, 'POST', data)).then(res => {
            _this.apiToken = res;
            logger.info("New token fetched ", JSON.stringify(res));
            deferred.resolve(res);
        }).catch(e => {
            deferred.reject(e);
        });
        return deferred.promise;
    }
    getToken() {
        let deferred = new Deferred();
        let _this = this;
        _this.verifyToken().then(isOK => {
            if (isOK) {
                deferred.resolve(_this.apiToken.token);
            } else {
                _this.getNewToken().then(newToken => {
                    deferred.resolve(newToken.token);
                }).catch(e => {
                    deferred.reject(e);
                });
            }
        }).catch(e => {
            deferred.reject(e);
        });
        return deferred.promise;
    }
};

module.exports = APIAuth;