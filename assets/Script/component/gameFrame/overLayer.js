var confige = require("confige");
var gameData = require("gameData");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        headOri:{
            default:null,
            type:cc.SpriteFrame
        },
        overData_perfab:{
            default:null,
            type:cc.Prefab
        },
        isInit:false,
        shareTitle:"",
        shareDes:"",
    },

    // use this for initialization
    onLoad: function () {
        
    }, 
    
    onInit:function(){
        this.oriPosx = -525;
        this.oriPosy = 190;
        this.posxOffset = 210;
        
        this.overDataCount = 0;
        this.shareBtn = this.node.getChildByName("btn_other").getComponent("cc.Button");
        confige.curOverLayer = this;
        if(cc.sys.platform == cc.sys.MOBILE_BROWSER)
        {
            this.node.height = 790;
            this.bgNode = this.node.getChildByName("gameOverBg");
            this.bgNode.height = 790;
            this.h5ShareNode = this.node.getChildByName("h5Share");
            this.h5ShareNode.opacity = 0;
            this.h5ShareNode.active = false;
            // this.shareBtnNode = this.node.getChildByName("btn_other");
            // this.shareBtnNode.active = false;
        }

        if(confige.playerMax == 9)
            this.initOverLayer9();

        this.isInit = true;
        this.itemNode = this.node.getChildByName("itemNode");
    },
    
    addOneOverData:function(playerData,master,cardHistory){
        //console.log(playerData);
        var newOverData = cc.instantiate(this.overData_perfab);
        this.itemNode.addChild(newOverData);
        
        var newOverDataS = newOverData.getComponent("overDataOnce");
        newOverDataS.onInit();
        
        var niuTypeCount1=0,niuTypeCount2=0,niuTypeCount3=0,niuTypeCount4=0,niuTypeCount5=0,niuTypeCount6=0;

        if(gameData.gameMainScene.isSanKung){
            for(var i in cardHistory)
            {
                var newType = cardHistory[i].type;                    
                if(newType == 9)
                    niuTypeCount1 = niuTypeCount1 + 1;
                else if(newType == 10)
                    niuTypeCount2 = niuTypeCount2 + 1;
                else if(newType == 11)
                    niuTypeCount3 = niuTypeCount3 + 1;
                else if(newType == 12)
                    niuTypeCount4 = niuTypeCount4 + 1;
            }
            newOverDataS.node.getChildByName("sanKungNode").getChildByName("num0").getComponent("cc.Label").string = playerData.bankerCount;
            newOverDataS.node.getChildByName("sanKungNode").getChildByName("num1").getComponent("cc.Label").string = niuTypeCount1;
            newOverDataS.node.getChildByName("sanKungNode").getChildByName("num2").getComponent("cc.Label").string = niuTypeCount2;
            newOverDataS.node.getChildByName("sanKungNode").getChildByName("num3").getComponent("cc.Label").string = niuTypeCount3;
            newOverDataS.node.getChildByName("sanKungNode").getChildByName("num4").getComponent("cc.Label").string = niuTypeCount4;
            newOverDataS.node.getChildByName("sanKungNode").active = true;
        }
        else if(gameData.gameMainScene.isJinHua){
            for(var i in cardHistory)
            {
                var newType = cardHistory[i].type;                    
                if(newType == 0)
                    niuTypeCount1 = niuTypeCount1 + 1;
                else if(newType == 1)
                    niuTypeCount2 = niuTypeCount2 + 1;
                else if(newType == 2)
                    niuTypeCount3 = niuTypeCount3 + 1;
                else if(newType == 3)
                    niuTypeCount4 = niuTypeCount4 + 1;
                else if(newType == 4)
                    niuTypeCount5 = niuTypeCount5 + 1;
                else if(newType == 5)
                    niuTypeCount6 = niuTypeCount6 + 1;
            }
            newOverDataS.node.getChildByName("jinHuaNode").getChildByName("num1").getComponent("cc.Label").string = niuTypeCount1;
            newOverDataS.node.getChildByName("jinHuaNode").getChildByName("num2").getComponent("cc.Label").string = niuTypeCount2;
            newOverDataS.node.getChildByName("jinHuaNode").getChildByName("num3").getComponent("cc.Label").string = niuTypeCount3;
            newOverDataS.node.getChildByName("jinHuaNode").getChildByName("num4").getComponent("cc.Label").string = niuTypeCount4;
            newOverDataS.node.getChildByName("jinHuaNode").getChildByName("num5").getComponent("cc.Label").string = niuTypeCount5;
            newOverDataS.node.getChildByName("jinHuaNode").getChildByName("num6").getComponent("cc.Label").string = niuTypeCount6;
            newOverDataS.node.getChildByName("jinHuaNode").active = true;
        }
        else{
            for(var i in cardHistory)
            {
                var newType = cardHistory[i].type;
                if(newType === 0)//无牛
                {
                    niuTypeCount6 = niuTypeCount6 + 1;
                }else{//有牛 
                    niuTypeCount5 = niuTypeCount5 + 1;
                    
                    if(newType == 14)//小
                        niuTypeCount1 = niuTypeCount1 + 1;
                    else if(newType == 11 || newType == 12)//花
                        niuTypeCount2 = niuTypeCount2 + 1;
                    else if(newType == 13)//炸弹
                        niuTypeCount3 = niuTypeCount3 + 1;
                    else if(newType == 10)//牛牛
                        niuTypeCount4 = niuTypeCount4 + 1;
                }
            }
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num0").getComponent("cc.Label").string = playerData.bankerCount;
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num1").getComponent("cc.Label").string = niuTypeCount1;
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num2").getComponent("cc.Label").string = niuTypeCount2;
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num3").getComponent("cc.Label").string = niuTypeCount3;
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num4").getComponent("cc.Label").string = niuTypeCount4;
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num5").getComponent("cc.Label").string = niuTypeCount5;
            newOverDataS.node.getChildByName("niuTypeNode").getChildByName("num6").getComponent("cc.Label").string = niuTypeCount6;
            newOverDataS.node.getChildByName("niuTypeNode").active = true;
        }
        
        var oriChair = confige.getCurChair(playerData.chair);
        if(confige.WXHeadFrameList[oriChair+1])
            newOverDataS.head.spriteFrame = confige.WXHeadFrameList[oriChair+1];
        newOverDataS.nameL.string = playerData.playerInfo.nickname;
        newOverDataS.IDL.string = playerData.uid;

        
        newOverDataS.setScore(playerData.score);
        if(master == true)
            newOverDataS.showMaster();

        
        this.newOverDataList[playerData.chair] = newOverDataS;
        // if(playerData.score < 0)
        //     newOverDataS.loseIco.active = true;
        // else
        //     newOverDataS.winIco.active = true;
        newOverData.setPosition(this.oriPosx + this.posxOffset*this.overDataCount,this.oriPosy);
        this.overDataCount = this.overDataCount + 1;
    },

    addOneOverData9:function(playerData,master,cardHistory){
        //console.log(playerData);
        var newOverData = this.infoList.getChildByName("infoNode"+playerData.chair);
        newOverData.active = true;
        var newOverDataS = newOverData.getComponent("overDataOnce");
        newOverDataS.onInit();
        
        var oriChair = confige.getCurChair(playerData.chair);
        if(confige.WXHeadFrameList[oriChair+1])
            newOverDataS.head.spriteFrame = confige.WXHeadFrameList[oriChair+1];
        newOverDataS.nameL.string = playerData.playerInfo.nickname;
        newOverDataS.IDL.string = playerData.uid;

        if(playerData.bankerCount)
            newOverData.getChildByName("bankerCount").getComponent("cc.Label").string = playerData.bankerCount;

        newOverDataS.setScore(playerData.score);
        if(master == true)
            newOverDataS.showMaster();
        
        this.newOverDataList[playerData.chair] = newOverDataS;

        this.overDataCount = this.overDataCount + 1;
    },
    
    showOverWithData:function(overData){
        this.lastSelectIndex = confige.meChair;
        console.log("overData@@@@@====");
        console.log(overData);
        this.curOverData = overData;

        this.newOverDataList = {};
        this.maxScore = 0;
        this.maxChair = -1;
        for(var i in overData.player)
        {
            this.newOverDataList[i] = {};
            var newPlayerData = overData.player[i];
            var newCardHistory = overData.cardHistory[i];
            if(newPlayerData.isActive == true)
            {
                var master = false;
                if(i === 0)
                    master = true;
                if(confige.playerMax == 6)
                {
                    this.addOneOverData(newPlayerData,master,newCardHistory);
                }else{
                    this.addOneOverData9(newPlayerData,master,newCardHistory);
                }
                
                if(newPlayerData.score > this.maxScore)
                {
                    this.maxScore = newPlayerData.score;
                    this.maxChair = newPlayerData.chair;
                }
            }
        }

        if(confige.playerMax == 9)
        {
            this.overLayer9.active = true;
            this.updateSelectData(-1,confige.meChair);
        }

        for(var i in overData.player)
        {
            var newPlayerData = overData.player[i];
            if(newPlayerData.isActive == true && newPlayerData.chair != this.maxChair)
            {
                this.shareDes += "【"+newPlayerData.playerInfo.nickname+"】:"+newPlayerData.score+";";
            }
        }
        
        if(this.maxChair != -1)
        {
            this.newOverDataList[this.maxChair].winIco.active = true;
            this.shareTitle = "★大赢家【"+overData.player[this.maxChair].playerInfo.nickname+"】 : "+overData.player[this.maxChair].score;
        }

        if(cc.sys.platform == cc.sys.MOBILE_BROWSER){
            var self = this;
            console.log("H5分享给好友");
            var curShareURL = confige.h5ShareUrlNew.replace('ROOMNUM', '0');
            if(confige.h5InviteCode != "0")
            {
                curShareURL += "&invite_code=" + confige.h5InviteCode;
            }
            wx.onMenuShareAppMessage({
                title: self.shareTitle,
                desc: self.shareDes,
                link: curShareURL,
                imgUrl: confige.h5ShareIco,
                trigger: function(res) {},
                success: function(res) {},
                cancel: function(res) {},
                fail: function(res) {}
            });
            console.log("H5分享到朋友圈2222222");
            wx.onMenuShareTimeline({
                title: self.shareTitle,
                desc: self.shareDes,
                link: curShareURL,
                imgUrl: confige.h5ShareIco,
                trigger: function(res) {},
                success: function(res) {},
                cancel: function(res) {},
                fail: function(res) {}
            });
        }
    },

    onBtnStartGameClick:function(){
        confige.curOverLayer = -1;
        cc.loader.onProgress = function(completedCount, totalCount, item) {
            // cc.log('step 1----------');
            var progress = (completedCount / totalCount).toFixed(2);
            // cc.log(progress + '%' + completedCount + "///" + totalCount);
            var numString = "" + completedCount + "/" + totalCount;
            if(totalCount > 10){
                confige.loadNode.showNode();
                confige.loadNode.setProgress(progress,numString);
            }
        };
        cc.director.loadScene('NewHallScene');
        if(confige.curGameScene.yuyinTimeOut != -1)
            clearTimeout(confige.curGameScene.yuyinTimeOut);
        confige.curGameScene.destroy();
        confige.resetGameData();
        if(confige.curUsePlatform == 1)
        {
            confige.GVoiceCall.quitRoom(confige.GVoiceRoomID);
            confige.GVoiceCall.closeListen();
        }
    },
    
    onBtnOtherClick:function(){
        if(cc.sys.platform == cc.sys.MOBILE_BROWSER){
            var self = this;
            console.log("H5分享给好友");
            var curShareURL = confige.h5ShareUrlNew.replace('ROOMNUM', '0');
            if(confige.h5InviteCode != "0")
            {
                curShareURL += "&invite_code=" + confige.h5InviteCode;
            }
            wx.onMenuShareAppMessage({
                title: self.shareTitle,
                desc: self.shareDes,
                link: curShareURL,
                imgUrl: confige.h5ShareIco,
                trigger: function(res) {},
                success: function(res) {},
                cancel: function(res) {},
                fail: function(res) {}
            });
            console.log("H5分享到朋友圈2222222");
            wx.onMenuShareTimeline({
                title: self.shareTitle,
                desc: self.shareDes,
                link: curShareURL,
                imgUrl: confige.h5ShareIco,
                trigger: function(res) {},
                success: function(res) {},
                cancel: function(res) {},
                fail: function(res) {}
            });

            this.h5ShareNode.active = true;
            this.h5ShareNode.stopAllActions();
            this.h5ShareNode.opacity = 255;
            var deactiveCall = cc.callFunc(function () {
                this.h5ShareNode.active = false;
            },this);
            this.h5ShareNode.runAction(cc.sequence(cc.delayTime(2),cc.fadeOut(1),deactiveCall));
        }
        if (!cc.sys.isNative) return;
        let dirpath = jsb.fileUtils.getWritablePath() + 'ScreenShoot/';
        if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
            jsb.fileUtils.createDirectory(dirpath);
        }
        let name = 'ScreenShoot-' + (new Date()).valueOf() + '.png';
        let filepath = dirpath + name;
        let size = cc.winSize;
        let rt = cc.RenderTexture.create(size.width, size.height);
        cc.director.getScene()._sgNode.addChild(rt);
        rt.setVisible(false);
        rt.begin();
        cc.director.getScene()._sgNode.visit();
        rt.end();
        rt.saveToFile('ScreenShoot/' + name, cc.ImageFormat.PNG, true, function() {
            cc.log('save succ');
            rt.removeFromParent();
            if(confige.curUsePlatform == 1)
            {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "filepath222==="+filepath);
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "WXShareScreenPath", "(Ljava/lang/String;)V", filepath);
            }else if(confige.curUsePlatform == 2){
                jsb.reflection.callStaticMethod("JSCallOC","WXShareScreenWithPath:",filepath);
            }
        });

        this.shareBtn.interactable = false;
    },

    openShare:function(){
        this.shareBtn.interactable = true;
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.selectHead = -1;
    },

    hideH5ShareNode:function(){
        this.h5ShareNode.stopAllActions();
        this.h5ShareNode.opacity = 0;
        this.h5ShareNode.active = false;
    },

    initOverLayer9:function(){
        console.log("initOverLayer9@@@@@@@@@@@@")
        this.curOverData = {};
        this.overLayer9 = this.node.getChildByName("overLayer9");
        this.infoList = this.overLayer9.getChildByName("infoList");
        this.selectInfo = this.overLayer9.getChildByName("selectInfo");
        this.selectInfoS = this.selectInfo.getComponent("overDataOnce");
        this.selectInfoS.onInit();
    },

    updateSelectData:function(event, customEventData){
        var index = parseInt(customEventData);
        this.newOverDataList[this.lastSelectIndex].node.getChildByName("bgSelect").active = false;
        this.lastSelectIndex = index;
        this.newOverDataList[this.lastSelectIndex].node.getChildByName("bgSelect").active = true;
        var playerData = this.curOverData.player[index];
        var cardHistory = this.curOverData.cardHistory[index];
        console.log(playerData);
        console.log(cardHistory);
        console.log(this.curOverData);

        var niuTypeCount1=0,niuTypeCount2=0,niuTypeCount3=0,niuTypeCount4=0,niuTypeCount5=0,niuTypeCount6=0;

        if(gameData.gameMainScene.isSanKung){
            for(var i in cardHistory)
            {
                var newType = cardHistory[i].type;                    
                if(newType == 9)
                    niuTypeCount1 = niuTypeCount1 + 1;
                else if(newType == 10)
                    niuTypeCount2 = niuTypeCount2 + 1;
                else if(newType == 11)
                    niuTypeCount3 = niuTypeCount3 + 1;
                else if(newType == 12)
                    niuTypeCount4 = niuTypeCount4 + 1;
            }
            this.selectInfo.getChildByName("sanKungNode").getChildByName("num1").getComponent("cc.Label").string = niuTypeCount1;
            this.selectInfo.getChildByName("sanKungNode").getChildByName("num2").getComponent("cc.Label").string = niuTypeCount2;
            this.selectInfo.getChildByName("sanKungNode").getChildByName("num3").getComponent("cc.Label").string = niuTypeCount3;
            this.selectInfo.getChildByName("sanKungNode").getChildByName("num4").getComponent("cc.Label").string = niuTypeCount4;
            this.selectInfo.getChildByName("sanKungNode").active = true;
        }
        else if(gameData.gameMainScene.isJinHua){
            for(var i in cardHistory)
            {
                var newType = cardHistory[i].type;                    
                if(newType == 0)
                    niuTypeCount1 = niuTypeCount1 + 1;
                else if(newType == 1)
                    niuTypeCount2 = niuTypeCount2 + 1;
                else if(newType == 2)
                    niuTypeCount3 = niuTypeCount3 + 1;
                else if(newType == 3)
                    niuTypeCount4 = niuTypeCount4 + 1;
                else if(newType == 4)
                    niuTypeCount5 = niuTypeCount5 + 1;
                else if(newType == 5)
                    niuTypeCount6 = niuTypeCount6 + 1;
            }
            this.selectInfo.getChildByName("jinHuaNode").getChildByName("num1").getComponent("cc.Label").string = niuTypeCount1;
            this.selectInfo.getChildByName("jinHuaNode").getChildByName("num2").getComponent("cc.Label").string = niuTypeCount2;
            this.selectInfo.getChildByName("jinHuaNode").getChildByName("num3").getComponent("cc.Label").string = niuTypeCount3;
            this.selectInfo.getChildByName("jinHuaNode").getChildByName("num4").getComponent("cc.Label").string = niuTypeCount4;
            this.selectInfo.getChildByName("jinHuaNode").getChildByName("num5").getComponent("cc.Label").string = niuTypeCount5;
            this.selectInfo.getChildByName("jinHuaNode").getChildByName("num6").getComponent("cc.Label").string = niuTypeCount6;
            this.selectInfo.getChildByName("jinHuaNode").active = true;
        }
        else{
            for(var i in cardHistory)
            {
                var newType = cardHistory[i].type;
                if(newType === 0)//无牛
                {
                    niuTypeCount6 = niuTypeCount6 + 1;
                }else{//有牛 
                    niuTypeCount5 = niuTypeCount5 + 1;
                    
                    if(newType == 14)//小
                        niuTypeCount1 = niuTypeCount1 + 1;
                    else if(newType == 11 || newType == 12)//花
                        niuTypeCount2 = niuTypeCount2 + 1;
                    else if(newType == 13)//炸弹
                        niuTypeCount3 = niuTypeCount3 + 1;
                    else if(newType == 10)//牛牛
                        niuTypeCount4 = niuTypeCount4 + 1;
                }
            }
            this.selectInfo.getChildByName("niuTypeNode").getChildByName("num1").getComponent("cc.Label").string = niuTypeCount1;
            this.selectInfo.getChildByName("niuTypeNode").getChildByName("num2").getComponent("cc.Label").string = niuTypeCount2;
            this.selectInfo.getChildByName("niuTypeNode").getChildByName("num3").getComponent("cc.Label").string = niuTypeCount3;
            this.selectInfo.getChildByName("niuTypeNode").getChildByName("num4").getComponent("cc.Label").string = niuTypeCount4;
            this.selectInfo.getChildByName("niuTypeNode").getChildByName("num5").getComponent("cc.Label").string = niuTypeCount5;
            this.selectInfo.getChildByName("niuTypeNode").getChildByName("num6").getComponent("cc.Label").string = niuTypeCount6;
            this.selectInfo.getChildByName("niuTypeNode").active = true;
        }
        
        var oriChair = confige.getCurChair(playerData.chair);
        if(confige.WXHeadFrameList[oriChair+1])
            this.selectInfoS.head.spriteFrame = confige.WXHeadFrameList[oriChair+1];
        else
            this.selectInfoS.head.spriteFrame = this.headOri;
        this.selectInfoS.nameL.string = playerData.playerInfo.nickname;
        this.selectInfoS.IDL.string = playerData.uid;

        
        this.selectInfoS.setScore(playerData.score);
        if(this.maxChair == index)
            this.selectInfoS.winIco.active = true;
        else
            this.selectInfoS.winIco.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
