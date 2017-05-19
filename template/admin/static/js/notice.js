/**
 * api财经日历推送通知操作类
 * Created by Jade.zhu on 2016/11/21.
 */
var noticeJS = {
  socket: null,
  intervalObj: null,
  init: function() {
    this.setSocket();
    this.setEvent();
  },
  /**
   * 连接socket
   */
  setSocket: function() {
    this.socket = io.connect(room.socketUrl.apiSocket);
    //建立连接
    this.socket.on('connect', function() {
      console.log('connected to server!');
    });
    //出现异常
    this.socket.on("error", function(e) {
      console.error('e:' + e);
    });
    //断开连接
    this.socket.on('disconnect', function(e) {
      console.log('disconnect');
    });
    //通知信息 5星等级数据 及 点评数据
    this.socket.on('financeData', function(result) {
      if (!result && !result.finance && result.review) { //非4 5星 非评论数据不显示
        return;
      }
      var finance = result.finance;
      var dataHtml = '',
          reviewHtml = '',
          dataFormatHtml = noticeJS.formatHtml('financeData');
      var starHtml = noticeJS.getStar(finance.importanceLevel);
      var goodFlats = finance.description.split('_');
      var profitHtml = noticeJS.getProfit(goodFlats[3]);
      var predictValue = common.isValid(finance.predictValue) && $.isNumeric(finance.predictValue) ? Number(finance.predictValue.toString().match(/^\d+(?:\.\d{0,2})?/)) : finance.predictValue;
      var lastValue = common.isValid(finance.lastValue) && $.isNumeric(finance.lastValue) ? Number(finance.lastValue.toString().match(/^\d+(?:\.\d{0,2})?/)) : finance.lastValue;
      var value = common.isValid(finance.value) && $.isNumeric(finance.value) ? Number(finance.value.toString().match(/^\d+(?:\.\d{0,2})?/)) : finance.value;
      dataHtml = dataFormatHtml.formatStr(finance.name, predictValue, lastValue, value, starHtml, profitHtml, finance.basicIndexId, finance.date);
      if($('#push_top_id .push-ss-tk-info[dname="'+finance.name+'"][bid="'+finance.basicIndexId+'"][date="'+finance.date+'"]').size() == 0) {
        $('#push_top_id').prepend(dataHtml);
      }
      noticeJS.blinkTip();
    });
  },
  /**
   * 设置事件
   */
  setEvent: function(){
    /**
     * 点评
     */
    $('#push_top_id').on('click', '.push-ss-tk-info div button', function(){
      var params = {userId:room.userInfo.userId, userName:room.userInfo.nickname, avatar:room.userInfo.avatar};
      params.bid = $(this).attr('bid');
      params.name = $(this).attr('dname');
      params.date = $(this).attr('date');
      params.comment = $(this).prev().val();
      noticeJS.setReview(params);
    });
  },
  /**
   * 提交点评
   * @param params
   */
  setReview: function(params){
    if(common.isBlank(params.comment)){
      room.showTipBox("点评内容为空！");
    }else{
      common.getJson('/admin/saveFinanceDataReview', {data:JSON.stringify(params)}, function(data){
        if(data.isOK){
          room.showTipBox("点评成功！");
          $('#push_top_id .push-ss-tk-info[dname="'+params.name+'"][bid="'+params.bid+'"][date="'+params.date+'"]').remove()
          noticeJS.clearTip();
        }else{
          room.showTipBox(data.msg);
        }
      });
    }
  },
  /**
   * 返回对应区域类型的html
   * @param region
   * @returns {string}
   */
  formatHtml: function(region) {
    var html = [];
    switch (region) {
      case 'financeData':
        html.push('<section class="push-ss-tk-info clearfix" dname="{0}" bid="{6}" date="{7}">');
        html.push('    <div style="text-align:justify;">');
        html.push('    {0}');
        html.push('    </div>');
        html.push('    <div style="text-align:justify;">');
        html.push('    前值：{1} 预期值：{2} 实际值：{3}');
        html.push('    </div>');
        html.push('    <div style="text-align:justify;">');
        html.push('    {4}');
        html.push('       <div class="clear"></div>');
        html.push('    </div>');
        html.push('    <div style="text-align:justify;">');
        html.push('    {5}');
        html.push('    </div>');
        html.push('    <div>');
        html.push('       <span>点评：</span><input type="text" name="comment" style="width:90%;line-height:20px;" />');
        html.push('       <button type="button" dname="{0}" bid="{6}" date="{7}">提交</button>');
        html.push('    </div>');
        html.push('</section>');
        break;
      case 'financeReview':
        html.push('<div class="ca_cont">');
        html.push('    <div class="himgline">');
        html.push('        <div class="himg"><img src="{0}" class="mCS_img_loaded"></div>'); //分析师头像
        html.push('        <table class="ca_table" cellspacing="0" cellpadding="0" width="100%" border="0">');
        html.push('            <tbody><tr>');
        html.push('                <td rowspan="2">');
        html.push('                    <div class="ctbox">');
        html.push('                        <div class="country"><img src="{1}" width="100%" alt="{2}" class="mCS_img_loaded"></div>'); //国旗，国家名
        html.push('                        <span class="zbname">{3}</span>'); //标题
        html.push('                    </div>');
        html.push('                </td>');
        html.push('                <td>');
        html.push('                    <div class="star">');
        html.push('                        {4}'); //重要指数
        html.push('                    </div>');
        html.push('                    <div class="yx">');
        html.push('                        <b>{5}</b>'); //国家英文缩写
        html.push('                        {6}'); //利多/空/平
        html.push('                    </div>');
        html.push('                </td>');
        html.push('            </tr>');
        html.push('            <tr>');
        html.push('                <td>');
        html.push('                    <span class="ca_value">前值：<b>{7}</b></span>');
        html.push('                    <span class="ca_value">预期值：<b>{8}</b></span>');
        html.push('                    <span class="ca_value">实际值：<b>{9}</b></span>');
        html.push('                </td>');
        html.push('            </tr>');
        html.push('        </tbody></table>');
        html.push('    </div>');
        html.push('    <div class="commentline">');
        html.push('        <span class="ctit">点评：</span>');
        html.push('        <div class="comtext">{10}</div>');
        html.push('    </div>');
        html.push('</div>');
        break;
    }
    return html.join('');
  },
  /**
   * 返回数据等级
   * @param star
   */
  getStar: function(star) {
    var html = [];
    html.push('<em class="on">');
    for (var i = 0; i < star; i++) {
      html.push('★');
    }
    html.push('</em>');
    html.push('<em>');
    for (var i = star; i < 5; i++) {
      html.push('★');
    }
    html.push('</em>');
    return html.join('');
  },
  /**
   * 返回利多/空/平html
   * @param value
   * @returns {string}
   */
  getProfit: function(value) {
    var html = [];
    switch (value) {
      case 'GOOD':
        html.push('<span class="cz">利多</span>');
        break;
      case 'BAD':
        html.push('<span class="cz c2">利空</span>');
        break;
      case 'FLAT':
        html.push('<span class="cz c3">持平</span>');
        break;
    }
    return html.join('');
  },
  /**
   * 根据国家名获取国旗名称
   * @param currencyType
   * @returns {*}
   */
  getNationalFlag: function(currencyType) {
    if ("新西兰" == currencyType) {
      return "NZD";
    } else if ("韩国" == currencyType) {
      return "SK";
    } else if ("澳大利亚" == currencyType) {
      return "AUD";
    } else if ("日本" == currencyType) {
      return "JPY";
    } else if ("德国" == currencyType) {
      return "Germany"; //EUR
    } else if ("瑞士" == currencyType) {
      return "CHF";
    } else if ("香港" == currencyType) {
      return "HKD";
    } else if ("西班牙" == currencyType) {
      return "Spain";
    } else if ("英国" == currencyType) {
      return "GBP";
    } else if ("意大利" == currencyType) {
      return "Italy";
    } else if ("加拿大" == currencyType) {
      return "CAD";
    } else if ("美国" == currencyType) {
      return "USD";
    } else if ("中国" == currencyType) {
      return "CNY";
    } else if ("台湾" == currencyType) {
      return "Taiwan";
    } else if ("印度" == currencyType) {
      return "INR";
    } else if ("法国" == currencyType) {
      return "France"; //EUR
    } else if ("欧元区" == currencyType) {
      return "EUR";
    } else if ("新加坡" == currencyType) {
      return "Singapore";
    } else if ("OECD" == currencyType) {
      return "none";
    } else {
      return "none";
    }
  },
  /**
   * 闪烁提示
   */
  blinkTip : function(){
    var step=0, _title = $('#pushNotice').text();
    if(!noticeJS.intervalObj) {
      noticeJS.intervalObj = setInterval(function () {
        step++;
        if (step == 3) {
          step = 1
        }
        if (step == 1) {
          $('#pushNotice').text(_title + '【　　　】');
        }
        if (step == 2) {
          $('#pushNotice').text(_title + '【新消息】');
        }
      }, 500);
    }
  },
  /**
   * 清除提示
   */
  clearTip : function(){
    if($('#push_top_id .push-ss-tk-info').size() == 0) {
      $('#pushNotice').text('公布值提醒');
      $(".push-top-box").addClass('dn');
      clearInterval(noticeJS.intervalObj);
    }
  }
};