const baseRoute = require('./web/base');
const adminRoute = require('./web/admin');
var config = require('../resources/config');
const path = require('path');
const fs = require('fs');

class Index {
    constructor() {}
    _setStaticPath() {
        let _this = this;
        this._getThemePaths().forEach(themePath => {
            _this._app.use(`/${themePath}`, _this._express.static(path.join(__dirname, `../template/${themePath}/static`)));
        });
        _this._app.use('/base', _this._express.static(path.join(__dirname, `../template/base`)));
        _this._app.use('/admin', _this._express.static(path.join(__dirname, `../template/admin/static`)));
    }
    _setRouteEntrance() {
        this._app.use('/', baseRoute);
        this._app.use('/admin', adminRoute);
        this._app.use(`/${config.defaultGroupType}`, (req, res) => {
            let params = [];
            for (var key in req.query) {
                req.query[key] = encodeURIComponent(req.query[key]);
                params.push(`${key}=${req.query[key]}`);
            }
            let path = params.length == 0 ? '/' : `/?${params.join("&")}`;
            res.writeHead(302, { 'Location': path });
            res.end();
        });
    }
    _getThemePaths() {
        let folderNames = fs.readdirSync(path.join(__dirname, '../template'));
        return folderNames.filter(folderName => {
            if (folderName === 'base') {
                return false;
            }
            return folderName.indexOf(".") === -1;
        });
    }
    _setViews() {
        let viewPathes = this._getThemePaths().map(themePath => path.join(__dirname, `../template/${themePath}/view`));
        viewPathes.push(path.join(__dirname, '../template/error.html'));
        viewPathes.push(path.join(__dirname, 'template/admin/view')); //设置后台模板
        this._app.set('views', viewPathes);
        this._app.set('view engine', 'html');
        this._app.engine('.html', require('ejs').__express); //两个下划线
    }
    init(app, express) {
        this._app = app;
        this._express = express;
        this._setRouteEntrance();
        this._setViews();
        this._setStaticPath();
    }
}

module.exports = new Index();