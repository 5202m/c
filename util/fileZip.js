var fs = require('fs');
var cleanCSS = require('clean-css');
var ujs = require("uglify-js");
/**
 * 文件压缩
 * create by alan.wu
 * 2015-5-8
 */
var fileZip = {
    /**
     * 压缩css
     * @param flieInArr
     * @param fileOut
     */
    zipCss: function(flieInArr, fileOut) {
        var styles = "",
            origCode = '',
            obj = this.formatCurrPath(flieInArr);
        flieInArr = obj.filePath;
        for (var i = 0; i < flieInArr.length; i++) {
            origCode = fs.readFileSync(flieInArr[i], 'utf8');
            styles += new cleanCSS({ compatibility: 'ie7' }).minify(origCode).styles;
        }
        var fileOutArr = [];
        fileOutArr.push(fileOut);
        try {
            fs.writeFileSync(this.formatCurrPath(fileOutArr).filePath[0], styles,
                'utf8');
        } catch (e) {
            console.log("zipCss【" + fileOut + "】 fail,no file!");
            return;
        }
        console.log("zipCss【" + obj.fileName.join(",") + "】 success!");
    },
    /**
     * 压缩js
     * @param flieInArr
     * @param fileOut
     */
    zipJs: function(flieInArr, fileOut, isMarge) {
        var obj = this.formatCurrPath(flieInArr);
        flieInArr = obj.filePath;
        var fileOutArr = [];
        fileOutArr.push(fileOut);
        try {
            if (isMarge) {
                var pfList = [];
                for (var i in flieInArr) {
                    pfList.push(
                        "/* " + obj.fileName[i] + " */\n" + fs.readFileSync(flieInArr[i],
                            'utf8'));
                }
                fs.writeFileSync(this.formatCurrPath(fileOutArr).filePath[0],
                    pfList.join("\n"), 'utf8');
            } else {
                fs.writeFileSync(this.formatCurrPath(fileOutArr).filePath[0],
                    ujs.minify(flieInArr).code, 'utf8');
            }
        } catch (e) {
            console.log("zipJs【" + fileOut + "】 fail,no file!");
            return;
        }
        console.log("zipJs【" + obj.fileName.join(",") + "】 success!");
    },
    /**
     * 格式路径
     * @param filePath
     */
    formatCurrPath: function(filePathArr) {
        var newPathArr = [],
            fileName = [],
            sysPath = process.cwd().replace("util", ""),
            currPath = '';
        for (var i in filePathArr) {
            currPath = filePathArr[i];
            fileName.push(
                currPath.substring(currPath.lastIndexOf("\\") + 1, currPath.length));
            newPathArr.push((sysPath + filePathArr[i]).replace(/\\/g, "\\\\"));
        }
        return { filePath: newPathArr, fileName: fileName };
    }
};

//直播间前端js/css压缩
var fileList = [
    // PM-theme1
    {
        "out": "\\template\\theme1\\static\\css\\index.min.css",
        "in": ["\\template\\theme1\\static\\css\\index.css"]
    },
    {
        "out": "\\template\\theme1\\static\\css\\darkblue.min.css",
        "in": ["\\template\\theme1\\static\\css\\darkblue.css"]
    },
    {
        "out": "\\template\\theme1\\static\\css\\train.min.css",
        "in": ["\\template\\theme1\\static\\css\\train.css"]
    },
    {
        "out": "\\template\\theme1\\static\\js\\lib.min.js",
        "marge": true,
        "in": ["\\template\\base\\lib\\jquery-1.7.min.js",
            "\\template\\base\\lib\\socket.io.js",
            "\\template\\base\\lib\\mScroll\\jquery.mCustomScrollbar.concat.min.js",
            "\\template\\base\\lib\\swipe\\swiper.min.js",
            "\\template\\base\\lib\\lightbox\\lightbox.min.js",
            "\\template\\base\\lib\\jqueryUI\\jquery-ui.min.js",
            "\\template\\base\\lib\\jquery.xdomainrequest.min.js",
            "\\template\\base\\lib\\jquery.superslide.2.1.1.js",
            "\\template\\base\\lib\\websocket.min.js",
            "\\template\\base\\lib\\newquote.min.js",
            "\\template\\base\\lib\\obsplayer\\obsplayer.min.js",
            "\\template\\base\\lib\\sewise\\sewise.player.min.js",
            "\\template\\base\\lib\\paste.min.js",
            "\\template\\base\\lib\\jquery.face.min.js",
            "\\template\\base\\lib\\jQueryRotate.2.2.js"

        ]
    },
    {
        "out": "\\template\\theme1\\static\\js\\index.min.js",
        "marge": false,
        "in": ["\\template\\base\\util\\common.js",
            "\\template\\base\\util\\chatAnalyze.js",
            "\\template\\theme1\\static\\js\\index.js",
            "\\template\\theme1\\static\\js\\index_box.js",
            "\\template\\theme1\\static\\js\\index_video.js",
            "\\template\\theme1\\static\\js\\index_video_live.js",
            "\\template\\theme1\\static\\js\\index_video_teach.js",
            "\\template\\theme1\\static\\js\\index_video_subscribe.js",
            "\\template\\theme1\\static\\js\\index_video_train.js",
            "\\template\\theme1\\static\\js\\index_chat_pride.js",
            "\\template\\theme1\\static\\js\\index_chat.js",
            "\\template\\theme1\\static\\js\\index_chat_teacher.js",
            "\\template\\theme1\\static\\js\\index_chat_showtrade.js",
            "\\template\\theme1\\static\\js\\index_notice.js",
            "\\template\\theme1\\static\\js\\index_tool.js"
        ]
    },
    {
        "out": "\\template\\theme1\\static\\js\\lg.min.js",
        "marge": false,
        "in": ["\\template\\theme1\\static\\js\\loginAuto.js"]
    },

    // PM-theme2
    {
        "out": "template\\theme2\\static\\css\\index.min.css",
        "in": [
            "\\template\\theme2\\static\\css\\index.css",
            "\\template\\theme2\\static\\css\\guide.css",
            "\\template\\base\\lib\\swipe\\swiper.min.css",
            "\\template\\base\\lib\\mScroll\\jquery.mCustomScrollbar.min.css"
        ]
    },
    {
        "out": "template\\theme2\\static\\js\\lg.min.js",
        "marge": false,
        "in": ["template\\theme2\\static\\js\\loginAuto.js"]
    },
    {
        "out": "template\\theme2\\static\\js\\lib.min.js",
        "marge": true,
        "in": ["template\\base\\lib\\jquery-1.7.min.js",
            "template\\base\\lib\\socket.io.js",
            "template\\base\\lib\\swipe\\swiper.min.js",
            "template\\base\\lib\\lightbox\\lightbox.min.js",
            "template\\base\\lib\\lazyload\\img.lazyload.js",
            "template\\base\\lib\\toucher.js",
            "template\\base\\lib\\websocket.min.js",
            "template\\base\\lib\\iphone-inline-video.browser.js",
            "template\\base\\lib\\mScroll\\jquery.mCustomScrollbar.concat.min.js",
            "template\\base\\lib\\jQueryRotate.2.2.js"
        ]
    },
    {
        "out": "template\\theme2\\static\\js\\top.min.js",
        "marge": true,
        "in": [
            "template\\base\\lib\\lazyload\\lazyload.min.js",
            "template\\base\\lib\\store.min.js",
            "template\\theme2\\static\\js\\store.js"
        ]
    },
    {
        "out": "template\\theme2\\static\\js\\index.min.js",
        "marge": false,
        "in": [
            "template\\base\\util\\common.js",
            "template\\base\\util\\chatAnalyze.js",
            "template\\theme2\\static\\js\\container.js",
            "template\\theme2\\static\\js\\pop.js",
            "template\\theme2\\static\\js\\login.js",
            "template\\theme2\\static\\js\\chat.js",
            "template\\theme2\\static\\js\\classNote.js",
            "template\\theme2\\static\\js\\data.js",
            "template\\theme2\\static\\js\\index.js",
            "template\\theme2\\static\\js\\player.js",
            "template\\theme2\\static\\js\\room.js",
            "template\\theme2\\static\\js\\rooms.js",
            "template\\theme2\\static\\js\\subscribe.js",
            "template\\theme2\\static\\js\\syllabus.js",
            "template\\theme2\\static\\js\\analyst.js",
            "template\\theme2\\static\\js\\showTrade.js",
            "template\\theme2\\static\\js\\userShowTrade.js",
            "template\\theme2\\static\\js\\showTradeAdd.js",
            "template\\theme2\\static\\js\\trains.js",
            "template\\theme2\\static\\js\\tool.js",
            "template\\theme2\\static\\js\\util.js",
            "template\\theme2\\static\\js\\novice.js",
            "template\\theme2\\static\\js\\teach.js",
            "template\\theme2\\static\\js\\noviceGuide.js",
            "template\\theme2\\static\\js\\privateChat.js",
            "template\\theme2\\static\\js\\videoPlayer.js",
            "template\\theme2\\static\\js\\yylive2.js",
            "template\\theme2\\static\\js\\accountEmail.js",
            "template\\theme2\\static\\js\\accountIndex.js",
            "template\\theme2\\static\\js\\accountInfo.js",
            "template\\theme2\\static\\js\\accountPoint.js",
            "template\\theme2\\static\\js\\accountSetAvatar.js",
            "template\\theme2\\static\\js\\accountSetName.js",
            "template\\theme2\\static\\js\\accountSetNickname.js",
            "template\\theme2\\static\\js\\accountSetPwd.js",
            "template\\theme2\\static\\js\\accountSubscribe.js",
            "template\\theme2\\static\\js\\accountSubscribeDetail.js"
        ]
    },
    // PM-theme3
    {
        "out": "\\template\\theme3\\static\\css\\index.min.css",
        "in": ["\\template\\theme3\\static\\css\\index.css"]
    },
    {
        "out": "\\template\\theme3\\static\\js\\index.min.js",
        "marge": false,
        "in": ["\\template\\base\\util\\common.js",
            "\\template\\base\\lib\\obsplayer\\obsplayer.min.js",
            "\\template\\theme3\\static\\js\\index.js"
        ]
    },

    // PM-theme4
    {
        "out": "\\template\\theme4\\static\\css\\index.min.css",
        "in": ["\\template\\theme4\\static\\css\\index.css"]
    },
    {
        "out": "\\template\\theme4\\static\\css\\index-dark.min.css",
        "in": ["\\template\\theme4\\static\\css\\index-dark.css"]
    },
    {
        "out": "\\template\\theme4\\static\\js\\room.min.js",
        "marge": false,
        "in": ["\\template\\base\\util\\chatAnalyze.js",
            "\\template\\base\\util\\common.js",
            "\\template\\theme4\\static\\js\\room.js"
        ]
    },
    {
        "out": "\\template\\theme4\\static\\js\\pop.min.js",
        "marge": false,
        "in": ["\\template\\theme4\\static\\js\\pop.js"]
    },
    {
        "out": "\\template\\theme4\\static\\js\\lg.min.js",
        "marge": false,
        "in": ["\\template\\theme4\\static\\js\\loginAuto.js"]
    },

    // ADMIN
    {
        "out": "\\template\\admin\\static\\css\\index.min.css",
        "in": ["\\template\\admin\\static\\css\\index.css"]
    },
    {
        "out": "\\template\\admin\\static\\css\\room.min.css",
        "in": ["\\template\\admin\\static\\css\\room.css"]
    },
    {
        "out": "\\template\\admin\\static\\js\\index.min.js",
        "marge": false,
        "in": ["\\template\\admin\\static\\js\\index.js"]
    },
    {
        "out": "\\template\\admin\\static\\js\\room.min.js",
        "marge": false,
        "in": ["\\template\\admin\\static\\js\\room.js",
            "\\template\\base\\util\\chatAnalyze.js",
            "\\template\\admin\\static\\js\\notice.js"
        ]
    },

    // COMMON
    {
        "out": "\\template\\base\\util\\common.min.js",
        "marge": false,
        "in": ["\\template\\base\\util\\common.js"]
    }
];

for (var i = 0, lenI = fileList.length; i < lenI; i++) {
    var fileTmp = fileList[i];
    if (fileTmp.hasOwnProperty("marge")) {
        fileZip.zipJs(fileTmp.in, fileTmp.out, fileTmp.marge);
    } else {
        fileZip.zipCss(fileTmp.in, fileTmp.out);
    }
}
//导出类
module.exports = fileZip;