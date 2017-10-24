require("pomeloClient")
var confige = require("confige");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        var loadNode = cc.find('loadNode').getComponent('loadNode'); //this.node.getChildByName("loadNode").getComponent("loadNode");
        loadNode.onInit();
        loadNode.hideNode();
        // cc.loader.onProgress = function(completedCount, totalCount, item) {
        //     cc.log('step 1----------');
        //     var progress = (completedCount / totalCount).toFixed(2);
        //     cc.log(progress + '%' + completedCount + "///" + totalCount);
        //     var numString = "" + completedCount + "/" + totalCount;
        //     confige.loadNode.showNode();
        //     confige.loadNode.setProgress(progress,numString);
        // };
        // cc.loader.onComplete = function(errors, items){
        //     cc.log('loader.onComplete');
        //     confige.loadNode.hideNode();
        // }; 

        pomelo.clientScene = this;
        confige.curSceneIndex = 0;

        this.editBox = this.node.getChildByName("editBox");
        this.editBox.active = false;
        
        this.checkIco = this.node.getChildByName("check_mark");
        this.checkShow = true;
        
        this.btn_loginNode1 = this.node.getChildByName("btn_traveler");
        this.btn_loginNode2 = this.node.getChildByName("btn_weixin");
        this.btn_login1 = this.btn_loginNode1.getComponent("cc.Button");
        this.btn_login2 = this.btn_loginNode2.getComponent("cc.Button");
        
        this.loadingLayer = this.node.getChildByName("loadingLayer").getComponent("loadingLayer");
        this.loadingLayer.onInit();

        console.log("curUsePlatform === " + cc.sys.platform);
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER)
        {
            confige.curUsePlatform = 0;
            this.btn_loginNode2.active = false;
            this.btn_loginNode1.x = 0;
            console.log("cc.sys.platform == cc.sys.DESKTOP_BROWSER");
        }else if(cc.sys.platform == cc.sys.ANDROID){
            confige.shareTitle = "我爱牛牛,快来下载加入吧~";
            confige.shareDes = "我爱牛牛,一起来玩!";
            confige.curUsePlatform = 1;
            this.btn_loginNode1.active = false;
            this.btn_loginNode2.x = 0;
            console.log("cc.sys.platform == cc.sys.ANDROID");
        }else if(cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD){
            confige.shareTitle = "我爱牛牛,快来下载加入吧~";
            confige.shareDes = "我爱牛牛,一起来玩!";
            confige.curUsePlatform = 2;
            console.log("cc.sys.platform == cc.sys.IPHONE");
            this.btn_loginNode1.active = false;
            this.btn_loginNode2.x = 0;
            if(cc.sys.platform == cc.sys.IPAD)
                cc.view.setDesignResolutionSize(1280,720,cc.ResolutionPolicy.EXACT_FIT);
        }else if(cc.sys.platform == cc.sys.MOBILE_BROWSER){
            confige.shareTitle = "我爱牛牛,点击可玩,无需下载";
            confige.shareDes = "我爱牛牛H5,安全无挂,放心畅玩!";
            // cc.game.setFrameRate(40);
            // confige.curUsePlatform = 0;
            // this.btn_loginNode2.active = false;
            // this.btn_loginNode1.x = 0;
            confige.curUsePlatform = 3;
            this.h5LoginError = this.node.getChildByName("h5LoginError");
            console.log("cc.sys.platform == cc.sys.MOBILE_BROWSER");

            // if(cc.sys.platform == cc.sys.MOBILE_BROWSER){
                this.bgNode = this.node.getChildByName("loginBg");
                this.bgNode.height = 790;
                cc.view.setDesignResolutionSize(1280,790,cc.ResolutionPolicy.EXACT_FIT);
            // }
            
            this.btn_loginNode1.active = false;
            this.btn_loginNode2.active = false;
            // this.btn_loginNode1.x = 0;

            confige.loginType = 2;

            var RequestData = {};
            RequestData = this.GetRequest();
            console.log("打印url参数!!!!!");
            console.log(RequestData);
            if(RequestData.code)
            {

                // wx.config({
                //     debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                //     appId: RequestData.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
                //     timestamp: RequestData.timestamp, // 必填，生成签名的时间戳
                //     nonceStr: RequestData.noncestr, // 必填，生成签名的随机串
                //     signature: RequestData.signature,// 必填，签名，见附录1
                //     jsApiList: [    "onMenuShareTimeline",
                //                     "onMenuShareAppMessage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                // });
                if(RequestData.room_num)
                    confige.h5RoomID = RequestData.room_num;
                confige.curUseCode = RequestData.code;
                pomelo.clientLogin(-1,-1);
                this.showLoading();
            }
        }
        
        
        // if(cc.sys.platform != cc.sys.MOBILE_BROWSER)
        // {
            console.log("loadRes Native!!!!!!!!!!!!!!!!!!!")
            // this.initAudio();
            // this.initGameRes();
        // }else{
        //     console.log("loadRes H5!!!!!!!!!!!!!!!!!!!")
        //     this.H5ResNode = this.node.getChildByName("H5ResNode");
        //     this.initAudioH5();
        //     this.initGameResH5();
        // }
        
        this.initLocalData();
        
        cc.loader.loadRes("sound/game_bgm", function (err, audio) {
            confige.audioList["bgm"] = audio;
            if(confige.musicEnable == true)
                if(confige.audioBgId == null)
                    confige.audioBgId = cc.audioEngine.play(audio,true,confige.audioVolume);
        });

        this.versionError = this.node.getChildByName("versionError");
        this.versionNum = this.node.getChildByName("versionNum").getComponent("cc.Label");
        this.versionNum.string = confige.versionCheck.split("&")[0];

        cc.log("onLoad!!!!!!!!!!!!");

        cc.sys.localStorage.setItem('currentVersion',confige.curVersion);
        console.log("currentVersion === " + cc.sys.localStorage.getItem('currentVersion'));
        // //大版本更新的包里面要带上下列处理，把热更新目录清除
        // // 之前版本保存在 local Storage 中的版本号，如果没有认为是旧版本
        // var previousVersion = cc.sys.localStorage.getItem('currentVersion');
        // if(previousVersion == null)
        //     previousVersion = "1.1.0";
        // console.log("previousVersion111 === " + previousVersion);
        // // game.currentVersion 为该版本的常量
        // if(confige.curUsePlatform == 1 && confige.curUsePlatform == 2)
        // {
        //     if (previousVersion < confige.curVersion) {
        //         // 热更新的储存路径，如果旧版本中有多个，可能需要记录在列表中，全部清理
        //         var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        //         jsb.fileUtils.removeDirectory(storagePath);
        //         cc.sys.localStorage.setItem('currentVersion',confige.curVersion);
        //         cc.sys.localStorage.setItem('HotUpdateSearchPaths', null);
        //         cc.audioEngine.stopAll();
        //         cc.game.restart();
        //     }
        // }
        // console.log("previousVersion222 === " + previousVersion);

        this.updateLayer = this.node.getChildByName("updateLayer").getComponent("HotUpdate");
        this.updateLayer.onInit();

        if (cc.sys.isNative) {
            this.updateLayer.checkUpdate();
        }
    },
    
    start: function () {
        // this.initAudio();
        // this.initGameRes();
    },

    GetRequest:function(){
        confige.h5SignURL = location.href;
        console.log("完整路径11111====="+confige.h5SignURL);
        var url = location.search; //获取url中"?"符后的字串
        console.log(url);
        var theRequest = new Object();
        var strs = [];
        if (url.indexOf("?") != -1) {   
           var str = url.substr(1);   
           strs = str.split("&");   
           for(var i = 0; i < strs.length; i ++) {   
              theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);   
           }   
        }   
        return theRequest;
    },

    initLocalData:function(){
        if(cc.sys.localStorage.getItem('check_invite') == null)
        {
            cc.sys.localStorage.setItem('check_invite',false);
        }
        if(cc.sys.localStorage.getItem('firstOpen') == null)    //首次进入游戏
        {
            cc.sys.localStorage.setItem('firstOpen', false);
            
            var userSetting = {
                musicEnable : true,
                soundEnable : true
            };
            cc.sys.localStorage.setItem('userSetting', JSON.stringify(userSetting));
            confige.firstShowNotice = true;

            // var curDate = new Date();
            // var wxLoginData = {
            //     login : 0,
            //     openid : "",
            //     refresh_token : "",
            //     year : 0,
            //     dayCount : 0
            // };
            // cc.sys.localStorage.setItem('wxLoginData', JSON.stringify(wxLoginData));

        }else{
            // if(cc.sys.localStorage.getItem('wxLoginData') == null)
            // {
            //     var curDate = new Date();
            //     var wxLoginData = {
            //         login : 0,
            //         openid : "",
            //         refresh_token : "",
            //         year : 0,
            //         dayCount : 0
            //     };
            //     cc.sys.localStorage.setItem('wxLoginData', JSON.stringify(wxLoginData));
            // }

            var userSetting = JSON.parse(cc.sys.localStorage.getItem('userSetting'));
            console.log(userSetting);
            if(userSetting.musicEnable == true)
                confige.musicEnable = true;
            else if(userSetting.musicEnable == false)
                confige.musicEnable = false;

            if(userSetting.soundEnable == true)
                confige.soundEnable = true;
            else if(userSetting.soundEnable == false)
                confige.soundEnable = false;

            if(cc.sys.localStorage.getItem('lastLoginDate') != null)
            {
                var lastLoginDate = JSON.parse(cc.sys.localStorage.getItem('lastLoginDate'));
                var curDate = new Date();
                console.log(lastLoginDate);
                if( curDate.getFullYear() == lastLoginDate.year &&
                    curDate.getMonth()+1 == lastLoginDate.month &&
                    curDate.getDate() == lastLoginDate.day )
                {
                    //console.log("在同一天登陆");
                    confige.firstShowNotice = false;
                }else{
                    //console.log("不在同一天登陆");
                    confige.firstShowNotice = true;
                }    
            }
        }
    },

    initAudio:function(){
        for(var i=0;i<8;i++)
        {
            cc.loader.loadRes("sound/0/chat" + (i+1),function(index){
                return  function (err, audio) {
                    var curIndex = "female_" + "chat_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));

            cc.loader.loadRes("sound/1/chat" + (i+1),function(index){
                return  function (err, audio) {
                    var curIndex = "male_" + "chat_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));
        }

        for(var i=0;i<6;i++)
        {
            cc.loader.loadRes("sound/F_" + (i+1),function(index){
                return  function (err, audio) {
                    var curIndex = "female_" + "face_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i+1));

            cc.loader.loadRes("sound/M_" + (i+1),function(index){
                return  function (err, audio) {
                    var curIndex = "male_" + "face_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i+1));
        }
        for(var i=0;i<7;i++)
        {
            cc.loader.loadRes("sound/" + (i+1),function(index){
                return  function (err, audio) {
                    var curIndex = "face_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i+1));
        }

        for(var i=0;i<=18;i++)
        {
            cc.loader.loadRes("sound/0/type" + i,function(index){
                return  function (err, audio) {
                    var curIndex = "female_" + "type_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));

            cc.loader.loadRes("sound/1/type" + i,function(index){
                return  function (err, audio) {
                    var curIndex = "male_" + "type_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));
        }

        cc.loader.loadRes("sound/fapai", function (err, audio) {
            confige.audioList["fapai"] = audio;
        });
    },

    initGameRes:function(){
        cc.loader.loadRes("frame/card/card_00", cc.SpriteFrame, function (err, spriteFrame) {
                confige.cardFrameMap[0] = spriteFrame;
        });

        for(var j=0;j<4;j++)
        {
            for(var i=1;i<=13;i++)
            {
                var t = i;
                if(i == 10)
                    t = 'a';
                else if(i == 11)
                    t = 'b';
                else if(i == 12)
                    t = 'c';
                else if(i == 13)
                    t = 'd';
                var index = i + j*13;
                cc.loader.loadRes("frame/card/card_" + j + t, cc.SpriteFrame,function(index){
                    return  function (err, spriteFrame) {
                        confige.cardFrameMap[index] = spriteFrame;
                    }
                }(index));
            }
        }

        for(var i=0;i<=18;i++)
        {
            cc.loader.loadRes("frame/niutype/niu_" + i, cc.SpriteFrame,function(index){
                return  function (err, spriteFrame) {
                    confige.niuTypeFrameMap[index] = spriteFrame;
                    if(index <= 10){
                        confige.niuTypeFrameMapFK[index] = spriteFrame;
                    }else{
                        switch(index){
                            case 12:
                                confige.niuTypeFrameMapFK[15] = spriteFrame;
                                break;
                            case 13:
                                confige.niuTypeFrameMapFK[16] = spriteFrame;
                                break;
                            case 14:
                                confige.niuTypeFrameMapFK[14] = spriteFrame;
                                break;
                            case 15:
                                confige.niuTypeFrameMapFK[11] = spriteFrame;
                                break;
                            case 16:
                                confige.niuTypeFrameMapFK[12] = spriteFrame;
                                break;
                            case 17:
                                confige.niuTypeFrameMapFK[13] = spriteFrame;
                                break;
                            case 18:
                                confige.niuTypeFrameMapFK[17] = spriteFrame;
                                break;
                        }
                    }
                }
            }(i));
        }

        for(var i=1;i<=12;i++)
        {
            cc.loader.loadRes("frame/face/" + i, cc.SpriteFrame, function(index){
                return function (err, spriteFrame) {
                    confige.faceFrameMap[index-1] = spriteFrame;
                }
            }(i));
        }
    },

    initGameResH5:function(){
        this.frameNode = this.H5ResNode.getChildByName("frame");
        this.cardNode = this.frameNode.getChildByName("card");
        this.faceNode = this.frameNode.getChildByName("face");
        this.niutypeNode = this.frameNode.getChildByName("niutype");

        confige.cardFrameMap[0] = this.cardNode.getChildByName("card_00").getComponent("cc.Sprite").spriteFrame;
        for(var j=0;j<4;j++)
        {
            for(var i=1;i<=13;i++)
            {
                var t = i;
                if(i == 10)
                    t = 'a';
                else if(i == 11)
                    t = 'b';
                else if(i == 12)
                    t = 'c';
                else if(i == 13)
                    t = 'd';
                var index = i + j*13;
                confige.cardFrameMap[index] = this.cardNode.getChildByName("card_"+j+t).getComponent("cc.Sprite").spriteFrame;
            }
        }

        for(var i=0;i<=18;i++)
        {
            var spriteFrame = this.niutypeNode.getChildByName("niu_"+i).getComponent("cc.Sprite").spriteFrame;

                    confige.niuTypeFrameMap[index] = spriteFrame;
                    if(index <= 10){
                        confige.niuTypeFrameMapFK[index] = spriteFrame;
                    }else{
                        switch(index){
                            case 12:
                                confige.niuTypeFrameMapFK[15] = spriteFrame;
                                break;
                            case 13:
                                confige.niuTypeFrameMapFK[16] = spriteFrame;
                                break;
                            case 14:
                                confige.niuTypeFrameMapFK[14] = spriteFrame;
                                break;
                            case 15:
                                confige.niuTypeFrameMapFK[11] = spriteFrame;
                                break;
                            case 16:
                                confige.niuTypeFrameMapFK[12] = spriteFrame;
                                break;
                            case 17:
                                confige.niuTypeFrameMapFK[13] = spriteFrame;
                                break;
                            case 18:
                                confige.niuTypeFrameMapFK[17] = spriteFrame;
                                break;
                        }
                    }
        }

        for(var i=1;i<=12;i++)
        {
            var spriteFrame = this.faceNode.getChildByName(""+i).getComponent("cc.Sprite").spriteFrame;

                    confige.faceFrameMap[index-1] = spriteFrame;
        }
    },

    onBtnTravelerClicked:function(){
        console.log("fuck click travler");
        this.editBox.active = true;
        // html2canvas(document.body, {  
        //     allowTaint: true,  
        //     taintTest: false,  
        //     onrendered: function(canvas) {  
        //         canvas.id = "GameCanvas";  
        //         //document.body.appendChild(canvas);  
        //         //生成base64图片数据  
        //         var dataUrl = canvas.toDataURL();  
        //         var newImg = document.createElement("img");  
        //         newImg.src =  dataUrl;  
        //         // console.log("dataUrl === "+ dataUrl);
        //         // curDiv.appendChild(newImg);
        //         document.body.appendChild(newImg);
        //         // var newDiv= document.createElement('div');
        //         // // if(window.innerWidth)
        //         // // {
        //         // //     console.log("window.innerWidth==="+gameViewDiv.style.width);
        //         // //     newDiv.style.width= gameViewDiv.style.width*0.8 + "px";
        //         // // }
        //         // // if(window.innerWidth)
        //         // // {
        //         // //     console.log("window.innerWidth==="+window.innerWidth);
        //         // //     newDiv.style.width= window.innerWidth*0.8 + "px";
        //         // // }
                 
        //         // newDiv.style.height="550px";
        //         //  // ar L1 = oBox.offsetWidth;
        //         // // var H1 = oBox.offsetHeight;
        //         // // var Left = (document.documentElement.clientWidth-L1)/2;
        //         // // var top = (document.documentElement.clientHeight-H1)/2;
        //         // newDiv.style.left = "200px";
        //         // newDiv.style.top = "150px";
        //         // newDiv.style.position = "absolute";
        //         // document.body.appendChild(newDiv);  
        //         // newDiv.id = "newDiv";  
        //         // newImg.width = "1000";
        //         // newImg.height = "550";
        //         // newDiv.appendChild(newImg);      //为dom添加子元素img
        //     }
        // });
        // if (!cc.sys.isNative) return;
        // let dirpath = jsb.fileUtils.getWritablePath() + 'ScreenShoot/';
        // if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
        //     jsb.fileUtils.createDirectory(dirpath);
        // }
        
        // let name = 'ScreenShoot-' + (new Date()).valueOf() + '.png';
        // let size = cc.winSize;
        // let rt = cc.RenderTexture.create(size.width, size.height);
        // cc.director.getScene()._sgNode.addChild(rt);
        // rt.setVisible(false);
        // console.log("fuck click travler1111111");
        // rt.begin();
        // cc.director.getScene()._sgNode.visit();
        // rt.end();
        // console.log("fuck click travler2222222");
        // rt.saveToFile('ScreenShoot/' + name, cc.ImageFormat.PNG, true, function() {
        //     console.log("fuck click travler333333333333333");
        //     rt.removeFromParent();
        // });
        // console.log("fuck click travler44444444444");
    },
    
    onBtnUserKnowClicked:function(){
        if(this.checkShow == true)
        {
            this.checkIco.active = false;
            this.btn_login1.interactable = false;
            this.btn_login2.interactable = false;
            this.editBox.active = false;
            this.checkShow = false;
        }else{
            this.checkIco.active = true;
            this.btn_login1.interactable = true;
            this.btn_login2.interactable = true;
            this.checkShow = true;
        }
    },
    
    onBtnTestClicked:function(){
        console.log("test click test");
    },
    
    showLoading:function(){
        if(confige.curUsePlatform == 0)
            this.btn_loginNode1.active = false;
        else
            this.btn_loginNode2.active = false;
        this.loadingLayer.showLoading();
    },

    loadingFalse:function(){
        this.btn_loginNode2.active = true;
        this.loadingLayer.hideLoading();
    },

    btn_login_click:function(){
        confige.loginType = 0;
        var editString = this.editBox.getChildByName("IDEdit").getComponent("cc.EditBox").string;
        var id = parseInt(editString);
        // pomelo.clientConnect(function(){
            pomelo.clientLogin(id);
        // });

        this.showLoading();
    },

    connectCallBack:function(){
        pomelo.request("connector.entryHandler.getNotify",null, function(data) {
            confige.noticeData = data;
            var newNoticeData = JSON.stringify(data);
            var lastNoticeData = cc.sys.localStorage.getItem('lastNoticeData');
            console.log(newNoticeData);
            console.log(lastNoticeData);
            if(newNoticeData == lastNoticeData)
            {
                console.log("没有新的公告");
            }else{
                console.log("有新的公告");
                confige.firstShowNotice = true;
            }
            cc.sys.localStorage.setItem('lastNoticeData', JSON.stringify(data));
        });
    },

    onBtnWeixinClicked:function(){
        if(confige.curUsePlatform == 1 || confige.curUsePlatform == 2)
        {
            this.showLoading();
            confige.loginType = 1;
            var lastLoginCount = 99;
            if(cc.sys.localStorage.getItem("wxLastLoginDay") != null)
            {
                lastLoginCount = confige.getDayCount() - cc.sys.localStorage.getItem("wxLastLoginDay");
            }
            if(cc.sys.localStorage.getItem('wxRefreshToken') == null || lastLoginCount >= 20 || lastLoginCount < 0)
            {
                if(confige.curUsePlatform == 1)
                {
                    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "WXLogin", "()V");
                }else if(confige.curUsePlatform == 2){
                    jsb.reflection.callStaticMethod("JSCallOC", "WXLogin"); 
                }
            }else{
                confige.WX_REFRESH_TOKEN = cc.sys.localStorage.getItem('wxRefreshToken');
                var curRefreshToken = confige.WX_REFRESH_TOKEN;
                this.wxRefreshLogin();
            }
        }
    },

    wxLoginJavaCall:function(code){
        var self = this;
        var xmlHttp = this.createXMLHttpRequest();

        var httpCallback = function(){
            var loginJson = JSON.parse(xmlHttp.responseText);
            confige.WX_LOGIN_RETURN = loginJson;
            confige.WX_ACCESS_TOKEN = loginJson.access_token;
            confige.WX_OPEN_ID = loginJson.openid;
            confige.WX_UNIONID = loginJson.unionid;
            confige.WX_REFRESH_TOKEN = loginJson.refresh_token;
            pomelo.clientLogin(confige.WX_OPEN_ID, confige.WX_ACCESS_TOKEN);
            cc.sys.localStorage.setItem("wxRefreshToken",loginJson.refresh_token);
            cc.sys.localStorage.setItem("wxLastLoginDay",confige.getDayCount());
        };

        this.scheduleOnce(function() {
            confige.WX_CODE = code;
            var url = confige.access_token_url;
            url = url.replace("APPID", confige.APP_ID);
            url = url.replace("SECRET", confige.SECRET);
            url = url.replace("CODE", confige.WX_CODE);
            
            xmlHttp.onreadystatechange = httpCallback;
            xmlHttp.open("GET", url, true);// 异步处理返回   
            xmlHttp.setRequestHeader("Content-Type",  
                    "application/x-www-form-urlencoded;");  
            xmlHttp.send();
        }, 0.25);
    },

    wxRefreshLogin:function(){
        // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "微信刷新登陆111");
        var self = this;
        var xmlHttp = this.createXMLHttpRequest();

        var httpCallback = function(){
            var loginJson = JSON.parse(xmlHttp.responseText);
            confige.WX_LOGIN_RETURN = loginJson;
            confige.WX_ACCESS_TOKEN = loginJson.access_token;
            confige.WX_OPEN_ID = loginJson.openid;
            confige.WX_REFRESH_TOKEN = loginJson.refresh_token;
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "WX_REFRESH_TOKEN");
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", loginJson.refresh_token);
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "WX_OPEN_ID");
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", loginJson.openid);
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "WX_ACCESS_TOKEN");
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", loginJson.access_token);
            pomelo.clientLogin(confige.WX_OPEN_ID, confige.WX_ACCESS_TOKEN);
            cc.sys.localStorage.setItem("wxRefreshToken",loginJson.refresh_token);
        };

        this.scheduleOnce(function() {
            var url = confige.refresh_token_url;
            url = url.replace("APPID", confige.APP_ID);
            url = url.replace("REFRESH_TOKEN", confige.WX_REFRESH_TOKEN);
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "refresh_token_url");
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", url);
            xmlHttp.onreadystatechange = httpCallback;
            xmlHttp.open("GET", url, true);// 异步处理返回   
            xmlHttp.setRequestHeader("Content-Type",  
                    "application/x-www-form-urlencoded;");  
            xmlHttp.send();
        }, 0.25);
    },

    createXMLHttpRequest:function() {  
        var xmlHttp;  
        if (window.XMLHttpRequest) {  
            xmlHttp = new XMLHttpRequest();  
            if (xmlHttp.overrideMimeType)  
                xmlHttp.overrideMimeType('text/xml');  
        } else if (window.ActiveXObject) {  
            try {  
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");  
            } catch (e) {  
                try {  
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");  
                } catch (e) {  
                }  
            }  
        } 
        return xmlHttp;  
    },
    
    WXCancle:function(){
        // this.btn_loginNode1.active = true;
        this.btn_loginNode2.active = true;
        this.loadingLayer.hideLoading();
    },

    btnClickExit:function(){
        // cc.director.end();
        if(confige.curUsePlatform == 3){
            window.open(confige.h5LoginUrl);
            window.close();
        }
        else
            cc.sys.openURL(confige.shareURL);
    },

    showH5LoginError:function(){
        this.loadingLayer.active = false;
        this.h5LoginError.active = true;
    },

    showVersionError:function(){
        this.versionError.active = true;
        this.updateLayer.checkUpdate();
    },

    iosCallTest:function(string){
        cc.log("iosCallTest");
        if(typeof(string) == "string")
        {
            this.showVersionError();
        }
        this.btn_loginNode1.active = false;
        this.btn_loginNode1.active = false;
    },

    btnShootClick:function(){
        html2canvas(document.body, {  
            allowTaint: true,  
            taintTest: false,  
            onrendered: function(canvas) {  
                canvas.id = "Cocos2dGameContainer";//"GameCanvas";  
                //document.body.appendChild(canvas);  
                //生成base64图片数据  
                var dataUrl = canvas.toDataURL();  
                var newImg = document.createElement("img");  
                newImg.src =  dataUrl;
                console.log(dataUrl);

                // var curGameDiv = document.getElementById("GameDiv");
                // curGameDiv.appendChild(newImg);

                // document.body.appendChild(newImg);

                var newDiv = document.createElement('div');
                // if(window.innerWidth)
                // {
                //     console.log("window.innerWidth==="+gameViewDiv.style.width);
                //     newDiv.style.width= gameViewDiv.style.width*0.8 + "px";
                // }
                // if(window.innerWidth)
                // {
                //     console.log("window.innerWidth==="+window.innerWidth);
                //     newDiv.style.width= window.innerWidth*0.8 + "px";
                // }
                 
                 // ar L1 = oBox.offsetWidth;
                // var H1 = oBox.offsetHeight;
                console.log(document.documentElement.clientWidth);
                console.log(document.documentElement.clientHeight);
                var Left = (document.documentElement.clientWidth-300)/2;
                var top = (document.documentElement.clientHeight-600)/2;
                newDiv.style.left = Left+"px";
                newDiv.style.top = top+"px";
                console.log(Left+"px");
                console.log(top+"px");
                newDiv.style.position = "absolute";
                document.body.appendChild(newDiv);  
                newDiv.id = "newDiv";  
                newImg.width = "300";
                newImg.height = "600";
                newDiv.appendChild(newImg);      //为dom添加子元素img
            }
        });
    },
});
