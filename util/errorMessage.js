﻿/**
 * 摘要：错误码公共类
 * author：Gavin.guo
 * date:2015/4/8
 */
var errorMessage = {
    "code_10": { 'errcode': '10', 'errmsg': '操作失败，请联系客服!' },
    "code_11": { 'errcode': '11', 'errmsg': '没有登录系统，请登录后再操作!' },
    "code_12": { 'errcode': '12', 'errmsg': '默认房间设置有误，请检查！' },
    "code_1000": { 'errcode': '1000', 'errmsg': '没有指定参数!' },
    "code_1001": { 'errcode': '1001', 'errmsg': '请输入交易账号、手机号码、验证码!' },
    "code_1002": { 'errcode': '1002', 'errmsg': '验证码有误，请重新输入！' },
    "code_1003": { 'errcode': '1003', 'errmsg': '输入的手机号码有误！' },
    "code_1004": { 'errcode': '1004', 'errmsg': '该账号已被使用！' },
    "code_1005": { 'errcode': '1005', 'errmsg': '请输入手机号码、用户密码、验证码!' },
    "code_1006": { 'errcode': '1006', 'errmsg': '请输入用户名、手机号、邮箱、验证码!' },
    "code_1007": { 'errcode': '1007', 'errmsg': '手机验证码有误！' },
    "code_1008": { 'errcode': '1008', 'errmsg': '请输入正确的用户信息！' },
    "code_1010": { 'errcode': '1010', 'errmsg': '你已经是与该操作相同等级的用户，无需升级！' },
    "code_1011": { 'errcode': '1011', 'errmsg': '还未开通金道相关账户，请联系客服！' },
    "code_1012": { 'errcode': '1012', 'errmsg': '该昵称已被使用！' },
    "code_1013": { 'errcode': '1013', 'errmsg': '请输入账号、密码!' },
    "code_1014": { 'errcode': '1014', 'errmsg': '交易账号输入有误！' },
    "code_1015": { 'errcode': '1015', 'errmsg': '账号或密码输入有误！' },
    "code_1016": { 'errcode': '1016', 'errmsg': '密码错误次数太多,请联系客服！' },
    "code_1017": { 'errcode': '1017', 'errmsg': '请输入用户名、手机号、邮箱、密码!' },
    "code_1018": { 'errcode': '1018', 'errmsg': '账号状态异常，请联系客服!' },
    "code_3000": { 'errcode': "3000", 'errmsg': "积分配置信息不存在！" },
    "code_3001": { 'errcode': "3001", 'errmsg': "积分已达上限!" },
    "code_3002": { 'errcode': "3002", 'errmsg': "今天已经签到了!" },
    "code_3003": { 'errcode': "3003", 'errmsg': "您已成功报名，请等待审核!" },
    "code_3004": { 'errcode': "3004", 'errmsg': "有效积分不足!" },
    "code_3005": { 'errcode': "3005", 'errmsg': "您操作该培训班的权限受限，请联系客服!" },
    "code_3006": { 'errcode': "3006", 'errmsg': "该培训班已结束!" },
    "code_3007": {
        'errcode': "3007",
        'errmsg': "很遗憾，您未通过审核，请关注下期培训班！" /*"您的报名还在审批中....."*/
    },
    "code_3008": {
        'errcode': "3008",
        'errmsg': "报名已结束，请关注下期培训班！" /*"您没有访问该房间的权限，请联系客服！"*/
    },
    "code_3009": { 'errcode': "3009", 'errmsg': "培训班名单正在审批中，请稍后！" },
    "code_3010": { 'errcode': "3010", 'errmsg': "报名已结束，请关注下期培训班！" },
    "code_3011": { 'errcode': "3011", 'errmsg': "培训班开放时间{time}，请稍后再进！" },
    "code_4000": { 'errcode': "4000", 'errmsg': "房间不存在！" },
    "code_4001": { 'errcode': "4001", 'errmsg': "该房间已被禁用！" },
    "code_4002": { 'errcode': "4002", 'errmsg': "该房间暂未开放，请关注开课时间{time}！" },
    "code_4003": { 'errcode': "4003", 'errmsg': "您还没有访问该房间的权限！" },
    "code_4004": { 'errcode': "4004", 'errmsg': "该房间仅对新客户开放！" },
    "code_4005": { 'errcode': "4005", 'errmsg': "已有真实账户并激活的客户才可进入该房间，您还不满足条件！" },
    "code_4006": { 'errcode': "4006", 'errmsg': "该房间仅对VIP客户开放！" },
    "code_4007": { 'errcode': "4007", 'errmsg': "该房间仅对指定客户开放！" },
    "code_4008": { 'errcode': "4008", 'errmsg': "您的报名信息还在审核中，请耐心等待！" },
    "code_4009": { 'errcode': "4009", 'errmsg': "您的报名信息未通过审核！" },
    "code_4010": { 'errcode': "4010", 'errmsg': "该房间人数已达上限，请尝试进入其他房间！" },
    "code_4011": { 'errcode': "4011", 'errmsg': "查询培训报名数据失败，请稍后重试！" },
    "code_4012": { 'errcode': "4012", 'errmsg': "报名信息不存在，请刷新后重试！" },
    "code_4013": { 'errcode': "4013", 'errmsg': "您不符合报名条件！" },
    "code_4014": { 'errcode': "4014", 'errmsg': "您已报名，等待管理员审核！" },
    "code_4015": { 'errcode': "4015", 'errmsg': "您已报名，请关注开课时间{time}！" },
    "code_4016": { 'errcode': "4016", 'errmsg': "您已报名，请勿重复报名！" },
    "code_4017": { 'errcode': "4017", 'errmsg': "报名已结束，请关注下期培训班！" },
    "code_4018": { 'errcode': "4018", 'errmsg': "报名出错，请稍后再试！" },
    "code_4019": { 'errcode': "4019", 'errmsg': "报名成功，请关注开课时间{time}！" },
    "code_4020": { 'code': "4020", 'message': "报名出错，请检查昵称是否未设置！" },
};
//导出类
module.exports = errorMessage;