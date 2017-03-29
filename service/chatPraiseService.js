const common = require('../util/common');// 引入common类
const constant = require('../constant/constant');// 引入constant
const liveRoomAPIService = require('./liveRoomAPIService');
/**
 * 聊天室点赞服务类 备注：处理聊天室点赞所有信息及其管理 author Alan.wu
 */
let chatPraiseService = {
  /**
   * 提取点赞内容
   */
  getPraiseNum: function (praiseId, type, platfrom, callback) {
    let defer = new common.Deferred();
    let path = "/chatPraise/getPraiseNum";
    path += "?praiseId=" + praiseId;
    path += "&type=" + type;
    path += "&platfrom=" + platfrom;
    liveRoomAPIService.get(path).then(data => {
      defer.resolve(data);
      if (callback) {
        callback(data);
      }
    }, err => {
      if (callback) {
        callback(err);
      }
      defer.resolve(err);
    });
    return defer.promise;
  },
  /**
   * 设置点赞
   *
   * @param praiseId
   * @param type
   */
  setPraise: function (praiseId, type, fromPlatform, callback) {
    let defer = new common.Deferred();
    let path = "/chatPraise/setPraise";
    path += "?praiseId=" + praiseId;
    path += "&type=" + type;
    path += "&fromPlatform=" + fromPlatform;

    liveRoomAPIService.get(path).then(data => {
      defer.resolve(data);
      if (callback) {
        callback(data);
      }
    }, err => {
      if (callback) {
        callback(err);
      }
      defer.resolve(err);
    });
    return defer.promise;
  }
};
// 导出服务类
module.exports = chatPraiseService;
