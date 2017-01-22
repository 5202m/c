var fs = require('fs');
var cleanCSS = require('clean-css');
var ujs=require("uglify-js");
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
   zipCss:function(flieInArr,fileOut){
       var styles="",origCode='',obj=this.formatCurrPath(flieInArr);
       flieInArr=obj.filePath;
       for(var i=0; i<flieInArr.length; i++) {
           origCode = fs.readFileSync(flieInArr[i], 'utf8');
           styles+=new cleanCSS().minify(origCode).styles;
       }
        var fileOutArr=[];
        fileOutArr.push(fileOut);
        try{
            fs.writeFileSync(this.formatCurrPath(fileOutArr).filePath[0], styles, 'utf8');
        }catch (e){
            console.log("zipCss【"+fileOut+"】 fail,no file!");
            return;
        }
       console.log("zipCss【"+obj.fileName.join(",")+"】 success!");
   },
    /**
     * 压缩js
     * @param flieInArr
     * @param fileOut
     */
    zipJs:function(flieInArr,fileOut,isMarge){
        var obj=this.formatCurrPath(flieInArr);
        flieInArr=obj.filePath;
        var fileOutArr=[];
        fileOutArr.push(fileOut);
        try{
            if(isMarge){
                var pfList=[];
                for(var i in flieInArr){
                    pfList.push("/* "+obj.fileName[i]+" */\n"+fs.readFileSync(flieInArr[i], 'utf8'));
                }
                fs.writeFileSync(this.formatCurrPath(fileOutArr).filePath[0],pfList.join("\n"), 'utf8');
            }else{
                fs.writeFileSync(this.formatCurrPath(fileOutArr).filePath[0], ujs.minify(flieInArr).code, 'utf8');
            }
        }catch (e){
            console.log("zipJs【"+fileOut+"】 fail,no file!");
            return;
        }
        console.log("zipJs【"+obj.fileName.join(",")+"】 success!");
    },
    /**
     * 格式路径
     * @param filePath
     */
    formatCurrPath:function(filePathArr){
        var newPathArr=[],fileName=[],sysPath=process.cwd().replace("util",""),currPath='';
        for(var i in filePathArr){
            currPath=filePathArr[i];
            fileName.push(currPath.substring(currPath.lastIndexOf("\\")+1,currPath.length));
            newPathArr.push((sysPath+filePathArr[i]).replace(/\\/g,"\\\\"));
        }
        return {filePath:newPathArr,fileName:fileName};
    }
};

//直播间前端js/css压缩
var fileList = [
    // PM-theme1
    {"out":"template\\pm\\theme1\\static\\css\\index.min.css",                  "in":["template\\pm\\theme1\\static\\css\\index.css"]},
    {"out":"template\\pm\\theme1\\static\\css\\darkblue.min.css",               "in":["template\\pm\\theme1\\static\\css\\darkblue.css"]},
    {"out":"template\\pm\\theme1\\static\\css\\train.min.css",                  "in":["template\\pm\\theme1\\static\\css\\train.css"]},
    {"out":"template\\pm\\theme1\\static\\js\\lib.min.js",       "marge":true,  "in":["template\\base\\lib\\jquery-1.7.min.js","template\\base\\lib\\socket.io.js","template\\base\\lib\\mScroll\\jquery.mCustomScrollbar.concat.min.js","template\\base\\lib\\swipe\\swiper.min.js","template\\base\\lib\\lightbox\\lightbox.min.js","template\\base\\lib\\jqueryUI\\jquery-ui.min.js","template\\base\\lib\\jquery.xdomainrequest.min.js","template\\base\\lib\\jquery.superslide.2.1.1.js","template\\base\\lib\\websocket.min.js","template\\base\\lib\\newquote.min.js","template\\base\\lib\\obsplayer\\obsplayer.min.js","template\\base\\lib\\sewise\\sewise.player.min.js","template\\base\\lib\\paste.min.js","template\\base\\lib\\jquery.face.min.js"]},
    {"out":"template\\pm\\theme1\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\common.js","template\\base\\util\\chatAnalyze.js","template\\pm\\theme1\\static\\js\\index.js","template\\pm\\theme1\\static\\js\\index_box.js","template\\pm\\theme1\\static\\js\\index_video.js","template\\pm\\theme1\\static\\js\\index_video_live.js","template\\pm\\theme1\\static\\js\\index_video_teach.js","template\\pm\\theme1\\static\\js\\index_video_subscribe.js","template\\pm\\theme1\\static\\js\\index_video_train.js","template\\pm\\theme1\\static\\js\\index_chat_pride.js","template\\pm\\theme1\\static\\js\\index_chat.js","template\\pm\\theme1\\static\\js\\index_chat_teacher.js","template\\pm\\theme1\\static\\js\\index_chat_showtrade.js","template\\pm\\theme1\\static\\js\\index_notice.js","template\\pm\\theme1\\static\\js\\index_tool.js"]},
    {"out":"template\\pm\\theme1\\static\\js\\lg.min.js",        "marge":false, "in":["template\\pm\\theme1\\static\\js\\loginAuto.js"]},

    // PM-theme2
    {"out":"template\\pm\\theme2\\static\\css\\index.min.css",                  "in":["template\\pm\\theme2\\static\\css\\index.css"]},
    {"out":"template\\pm\\theme2\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\chatAnalyze.js","template\\base\\util\\common.js","template\\pm\\theme2\\static\\js\\tool.js","template\\pm\\theme2\\static\\js\\index.js"]},
    {"out":"template\\pm\\theme2\\static\\js\\room.min.js",      "marge":false, "in":["template\\base\\util\\chatAnalyze.js","template\\base\\util\\common.js","template\\pm\\theme2\\static\\js\\tool.js","template\\pm\\theme2\\static\\js\\room.js"]},
    {"out":"template\\pm\\theme2\\static\\js\\pop.min.js",       "marge":false, "in":["template\\pm\\theme2\\static\\js\\pop.js"]},
    {"out":"template\\pm\\theme2\\static\\js\\lg.min.js",        "marge":false, "in":["template\\pm\\theme2\\static\\js\\loginAuto.js"]},

    // PM-theme3
    {"out":"template\\pm\\theme3\\static\\css\\index.min.css",                  "in":["template\\pm\\theme3\\static\\css\\index.css"]},
    {"out":"template\\pm\\theme3\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\common.js","template\\base\\lib\\obsplayer\\obsplayer.min.js","template\\pm\\theme3\\static\\js\\index.js"]},

    // PM-theme4
    {"out":"template\\pm\\theme4\\static\\css\\index.min.css",                  "in":["template\\pm\\theme4\\static\\css\\index.css"]},
    {"out":"template\\pm\\theme4\\static\\css\\index-dark.min.css",             "in":["template\\pm\\theme4\\static\\css\\index-dark.css"]},
    {"out":"template\\pm\\theme4\\static\\js\\room.min.js",      "marge":false, "in":["template\\base\\util\\chatAnalyze.js","template\\base\\util\\common.js","template\\pm\\theme4\\static\\js\\room.js"]},
    {"out":"template\\pm\\theme4\\static\\js\\pop.min.js",       "marge":false, "in":["template\\pm\\theme4\\static\\js\\pop.js"]},
    {"out":"template\\pm\\theme4\\static\\js\\lg.min.js",        "marge":false, "in":["template\\pm\\theme4\\static\\js\\loginAuto.js"]},

    // FX-theme1
    {"out":"template\\fx\\theme1\\static\\css\\index.min.css",                  "in":["template\\fx\\theme1\\static\\css\\index.css"]},
    {"out":"template\\fx\\theme1\\static\\css\\train.min.css",                  "in":["template\\fx\\theme1\\static\\css\\train.css"]},
    {"out":"template\\fx\\theme1\\static\\js\\lib.min.js",       "marge":true,  "in":["template\\base\\lib\\jquery-1.7.min.js","template\\base\\lib\\socket.io.js","template\\base\\lib\\mScroll\\jquery.mCustomScrollbar.concat.min.js","template\\base\\lib\\swipe\\swiper.min.js","template\\base\\lib\\lightbox\\lightbox.min.js","template\\base\\lib\\jqueryUI\\jquery-ui.min.js","template\\base\\lib\\jquery.xdomainrequest.min.js","template\\base\\lib\\jquery.superslide.2.1.1.js","template\\base\\lib\\websocket.min.js","template\\base\\lib\\newquote.min.js","template\\base\\lib\\obsplayer\\obsplayer.min.js","template\\base\\lib\\sewise\\sewise.player.min.js","template\\base\\lib\\paste.min.js","template\\base\\lib\\jquery.face.min.js"]},
    {"out":"template\\fx\\theme1\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\common.js","template\\base\\util\\chatAnalyze.js","template\\fx\\theme1\\static\\js\\index.js","template\\fx\\theme1\\static\\js\\index_tool.js","template\\fx\\theme1\\static\\js\\index_box.js","template\\fx\\theme1\\static\\js\\index_video.js","template\\fx\\theme1\\static\\js\\index_video_live.js","template\\fx\\theme1\\static\\js\\index_video_teach.js","template\\fx\\theme1\\static\\js\\index_video_subscribe.js","template\\fx\\theme1\\static\\js\\index_video_train.js","template\\fx\\theme1\\static\\js\\index_chat_pride.js","template\\fx\\theme1\\static\\js\\index_chat.js","template\\fx\\theme1\\static\\js\\index_chat_teacher.js","template\\fx\\theme1\\static\\js\\index_chat_showtrade.js","template\\fx\\theme1\\static\\js\\index_notice.js"]},
    {"out":"template\\fx\\theme1\\static\\js\\lg.min.js",        "marge":false, "in":["template\\fx\\theme1\\static\\js\\loginAuto.js"]},

    // FX-theme2
    {"out":"template\\fx\\theme2\\static\\css\\index.min.css",                  "in":["template\\fx\\theme2\\static\\css\\index.css"]},
    {"out":"template\\fx\\theme2\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\chatAnalyze.js","template\\base\\util\\common.js","template\\fx\\theme2\\static\\js\\index.js"]},
    {"out":"template\\fx\\theme2\\static\\js\\room.min.js",      "marge":false, "in":["template\\base\\util\\chatAnalyze.js","template\\base\\util\\common.js","template\\fx\\theme2\\static\\js\\room.js"]},
    {"out":"template\\fx\\theme2\\static\\js\\pop.min.js",       "marge":false, "in":["template\\fx\\theme2\\static\\js\\pop.js"]},
    {"out":"template\\fx\\theme2\\static\\js\\lg.min.js",        "marge":false, "in":["template\\fx\\theme2\\static\\js\\loginAuto.js"]},

    // FX-theme4
    {"out":"template\\fx\\theme4\\static\\css\\index.min.css",                  "in":["template\\fx\\theme4\\static\\css\\index.css"]},
    {"out":"template\\fx\\theme4\\static\\css\\index-dark.min.css",             "in":["template\\fx\\theme4\\static\\css\\index-dark.css"]},
    {"out":"template\\fx\\theme4\\static\\js\\room.min.js",      "marge":false, "in":["template\\base\\util\\chatAnalyze.js","template\\base\\util\\common.js","template\\fx\\theme4\\static\\js\\room.js"]},
    {"out":"template\\fx\\theme4\\static\\js\\pop.min.js",       "marge":false, "in":["template\\fx\\theme4\\static\\js\\pop.js"]},
    {"out":"template\\fx\\theme4\\static\\js\\lg.min.js",        "marge":false, "in":["template\\fx\\theme4\\static\\js\\loginAuto.js"]},

    // HX-theme1
    {"out":"template\\hx\\theme1\\static\\css\\index.min.css",                  "in":["template\\hx\\theme1\\static\\css\\index.css"]},
    {"out":"template\\hx\\theme1\\static\\css\\dark.min.css",                   "in":["template\\hx\\theme1\\static\\css\\dark.css"]},
    {"out":"template\\hx\\theme1\\static\\css\\light.min.css",                  "in":["template\\hx\\theme1\\static\\css\\light.css"]},
    {"out":"template\\hx\\theme1\\static\\css\\gold.min.css",                   "in":["template\\hx\\theme1\\static\\css\\gold.css"]},
    {"out":"template\\hx\\theme1\\static\\css\\darkblue.min.css",               "in":["template\\hx\\theme1\\static\\css\\darkblue.css"]},
    {"out":"template\\hx\\theme1\\static\\css\\orange.min.css",                 "in":["template\\hx\\theme1\\static\\css\\orange.css"]},
    {"out":"template\\hx\\theme1\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\common.js","template\\base\\lib\\newquote.js","template\\base\\lib\\jquery.face.js","template\\hx\\theme1\\static\\js\\index.js","template\\hx\\theme1\\static\\js\\index_video.js","template\\hx\\theme1\\static\\js\\index_chat.js","template\\hx\\theme1\\static\\js\\index_box.js","template\\hx\\theme1\\static\\js\\index_tool.js"]},
    {"out":"template\\hx\\theme1\\static\\js\\lg.min.js",        "marge":false, "in":["template\\hx\\theme1\\static\\js\\loginAuto.js"]},

    // HX-theme2
    {"out":"template\\hx\\theme2\\static\\css\\index.min.css",                  "in":["template\\hx\\theme2\\static\\css\\index.css"]},
    {"out":"template\\hx\\theme2\\static\\js\\index.min.js",     "marge":false, "in":["template\\base\\util\\common.js","template\\hx\\theme2\\static\\js\\index.js"]},
    {"out":"template\\hx\\theme2\\static\\js\\room.min.js",      "marge":false, "in":["template\\base\\util\\common.js","template\\hx\\theme2\\static\\js\\room.js"]},
    {"out":"template\\hx\\theme2\\static\\js\\pop.min.js",       "marge":false, "in":["template\\hx\\theme2\\static\\js\\pop.js"]},
    {"out":"template\\hx\\theme2\\static\\js\\lg.min.js",        "marge":false, "in":["template\\hx\\theme2\\static\\js\\loginAuto.js"]},

    // HX-theme4
    {"out":"template\\hx\\theme4\\static\\css\\index.min.css",                  "in":["template\\hx\\theme4\\static\\css\\index.css"]},
    {"out":"template\\hx\\theme4\\static\\css\\index-dark.min.css",             "in":["template\\hx\\theme4\\static\\css\\index-dark.css"]},
    {"out":"template\\hx\\theme4\\static\\js\\room.min.js",      "marge":false, "in":["template\\base\\util\\common.js","template\\hx\\theme4\\static\\js\\room.js"]},
    {"out":"template\\hx\\theme4\\static\\js\\pop.min.js",       "marge":false, "in":["template\\hx\\theme4\\static\\js\\pop.js"]},
    {"out":"template\\hx\\theme4\\static\\js\\lg.min.js",        "marge":false, "in":["template\\hx\\theme4\\static\\js\\loginAuto.js"]},

    // ADMIN
    {"out":"template\\admin\\static\\css\\index.min.css",                       "in":["template\\admin\\static\\css\\index.css"]},
    {"out":"template\\admin\\static\\css\\room.min.css",                        "in":["template\\admin\\static\\css\\room.css"]},
    {"out":"template\\admin\\static\\js\\index.min.js",          "marge":false, "in":["template\\admin\\static\\js\\index.js"]},
    {"out":"template\\admin\\static\\js\\room.min.js",           "marge":false, "in":["template\\admin\\static\\js\\room.js","template\\base\\util\\chatAnalyze.js"]},

    // COMMON
    {"out":"template\\base\\util\\common.min.js",                "marge":false, "in":["template\\base\\util\\common.js"]}
];

for(var i = 0, lenI = fileList.length; i < lenI; i++){
    var fileTmp = fileList[i];
    if(fileTmp.hasOwnProperty("marge")){
        fileZip.zipJs(fileTmp.in, fileTmp.out, fileTmp.marge);
    }else{
        fileZip.zipCss(fileTmp.in, fileTmp.out);
    }
}
//导出类
module.exports = fileZip;