/**
 * 直播间手机版容器类
 * author Dick.guo
 * @param options {{
 *      panel:*,
 *      url:String,
 *      [templateAttr]:String,
 *      [onBeforeLoad]:function,
 *      [onLoad]:function,
 *      [onShow]:function,
 *      [onUnload]:function,
 *      [onHide]:function
 *  }}
 */
var Container = function(options) {
    options = options || {};

    /** 状态 0未加载 1加载中 2未显示 3显示 */
    this.status = 0;

    /** 浏览历史标记 */
    this.flagHistory = true;

    /** 容器 */
    this.panel = options.panel;

    /** html URL */
    this.url = options.url || "";

    /** 页面HTML模板字符串 */
    this.templates = {};

    /** 模板字符串 */
    this.templateAttr = options.templateAttr || "temp";

    /**回调函数*/
    this.onBeforeLoad = options.onBeforeLoad || $.noop;
    this.onLoad = options.onLoad || $.noop;
    this.onUnload = options.onUnload || $.noop;
    this.onShow = options.onShow || $.noop;
    this.onHide = options.onHide || $.noop;
};

/**
 * 历史记录
 * @type {{list: Array, index: number}}
 */
Container.history = {
    list: [],
    index: -1,
    last: null
};

/**
 * 返回
 */
Container.back = function() {
    Container.go(-1);
};

/**
 * 跳转到指定页面
 * @param [param] {Number | Container}
 */
Container.go = function(param) {
    param = param || 0;
    var history = Container.history;
    var result;
    if (param instanceof Container) {
        history.index++;
        if (history.list.length > history.index) {
            history.list = history.list.slice(0, history.index);
        }
        history.list[history.index] = param;
        result = param;
    } else {
        history.index += param;
        result = history.list[history.index];
        if (param != 0) {
            if (!result) {
                history.list = [Rooms];
                history.index = 0;
                result = history.list[history.index];
            }
            result.flagHistory = false;
            result.load(); //前进、后退
        }
    }
    return result;
};

/**
 * 页面是否显示
 */
Container.prototype.isVisible = function() {
    return this.status == 3;
};

/**
 * 显示页面
 */
Container.prototype.show = function() {
    if (this.isVisible()) {
        return;
    }
    var currContainer = Container.history.last;
    if (currContainer) {
        currContainer.hide();
        currContainer.onHide();
    }
    if (this.flagHistory) {
        Container.go(this);
    }
    Container.history.last = this;
    this.flagHistory = true;
    this.status = 3;
    this.panel.show();
    $(window).scrollTop(0); //统一处理滚动条到顶部
    Util.setPageMinHeight(); //统一设置页面高度
    this.onShow();
};

/**
 * 隐藏页面
 */
Container.prototype.hide = function() {
    if (this.status == 3) {
        this.status = 2;
        this.panel.hide();
        return;
    }
};

/**
 * 加载页面
 */
Container.prototype.load = function() {
    if (this.status == 1 || this.status == 3) {
        return false;
    } else if (this.status == 2) {
        this.show();
        return false;
    }
    if (this.url) {
        this.status = 1;
        this.onBeforeLoad();
        var thiz = this;
        this.panel.empty().load(this.url, function() {
            thiz.init();
            thiz.onLoad();
            thiz.show();
        });
    }
    return true;
};

/**
 * load之后公共初始化
 */
Container.prototype.init = function() {
    var templates = this.templates;
    var templateAttr = this.templateAttr;
    this.panel.find("[" + templateAttr + "]").each(function() {
        var tempId = $(this).attr(templateAttr);
        $(this).removeAttr(templateAttr);
        templates[tempId] = this.outerHTML;
        $(this).remove();
    });
};

/**
 * 卸载页面
 */
Container.prototype.unload = function() {
    this.onUnload();
    this.panel.empty();
};

/**
 * 使用模板html格式化
 * @param tempId
 * @returns {*}
 */
Container.prototype.formatHtml = function(tempId) {
    if (!tempId || this.templates.hasOwnProperty(tempId) == false) {
        return "";
    }
    var args = [this.templates[tempId]].concat(Array.prototype.slice.call(arguments, 1));
    return Util.format.apply(Util, args);
};