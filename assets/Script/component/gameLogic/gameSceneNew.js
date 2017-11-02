var gameData = require("gameData");
var confige = require("confige");
var FKLogic = require("FengKuangLogic");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onDestory:function(){
        console.log("gameScene onDestory!!!!!!")
        if(confige.curUsePlatform == 1)
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "gameScene onDestory!!!!!!");
    },

    onLoad: function () {
        this.resNode = this.node.getChildByName("resNode");
        confige.h5RoomID = "0";
        this.oldPlayer = this.node.getChildByName("oldPlayer");
        this.oldPlayer.getChildByName("name").getComponent("cc.Label").string = confige.userInfo.nickname;
        this.oldPlayer.getChildByName("score").getComponent("cc.Label").string = "";

        cc.loader.onProgress = function(){};
        confige.loadNode.hideNode();

        if(cc.sys.platform == cc.sys.IPAD)
            cc.view.setDesignResolutionSize(1280,720,cc.ResolutionPolicy.EXACT_FIT);
        if(cc.sys.platform == cc.sys.MOBILE_BROWSER)
            cc.view.setDesignResolutionSize(1280,790,cc.ResolutionPolicy.EXACT_FIT);
        this.gameBGNode = this.node.getChildByName("gameBGNode").getComponent("gameBGNode");
        this.gameBGNode.onInit();

        this.playerNode = this.node.getChildByName("playerNode");
        this.infoNode = this.node.getChildByName("infoNode");
        this.playerLoadOK = false;
        this.infoLoadOK = false;
        this.doLaterLoad = false;
        var self = this;
        cc.loader.loadRes("prefabs/game/gameInfoNode", cc.Prefab, function (err, prefabs) {
            console.log("gameInfoNode load!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            var newLayer = cc.instantiate(prefabs);
            self.infoNode.addChild(newLayer);
            self.gameInfoNode = newLayer.getComponent("gameInfoNode");
            self.gameInfoNode.onInit();
            self.infoLoadOK = true;
            if(self.playerLoadOK == true && self.infoLoadOK == true)
            {
                if(self.doLaterLoad == false)
                {
                    self.doLaterLoad = true;
                    self.loadRes1();
                    // self.loadLater();
                    // self.startLater();
                    // self.loadRes2();
                }
            }
        });
        var playerNodeStr = "";
        if(confige.playerMax == 6)
            playerNodeStr = "gamePlayerNode";
        else
            playerNodeStr = "gamePlayerNode9";
        cc.loader.loadRes("prefabs/game/"+playerNodeStr, cc.Prefab, function (err, prefabs) {
            console.log("gamePlayerNode load!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            var newLayer = cc.instantiate(prefabs);
            self.playerNode.addChild(newLayer);
            self.gamePlayerNode = newLayer.getComponent("gamePlayerNode");
            self.gamePlayerNode.onInit();
            self.playerLoadOK = true;
            if(self.playerLoadOK == true && self.infoLoadOK == true)
            {
                if(self.doLaterLoad == false)
                {
                    self.doLaterLoad = true;
                    self.loadRes1();
                    // self.loadLater();
                    // self.startLater();
                    // self.loadRes2();
                }
            }
            self.oldPlayer.active = false;
        });
        // this.gameInfoNode = this.node.getChildByName("gameInfoNode").getComponent("gameInfoNode");
        // this.gameInfoNode.onInit();
        // this.gamePlayerNode = this.node.getChildByName("gamePlayerNode").getComponent("gamePlayerNode");
        // this.gamePlayerNode.onInit();
        console.log("gameScene Load!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    },

    start: function () {

    },
    
    loadLater:function(){
        console.log("loadLater!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        pomelo.clientScene = this;
        confige.curGameScene = this;
        gameData.gameMainScene = this;
        this.sceneLoadOver = false;
        this.timeCallFunc = -1;
        this.waitForSettle = false;

        this.cardMode = confige.roomData.cardMode;
        this.gameMode = confige.roomData.gameMode;
        this.bankerMode = confige.roomData.bankerMode;
        this.time_rob = Math.ceil(confige.roomData.TID_ROB_TIME/1000);
        this.time_betting = Math.ceil(confige.roomData.TID_BETTING/1000);
        this.time_settlement = Math.ceil(confige.roomData.TID_SETTLEMENT/1000);
        
        this.meChair = 0;
        this.curBankerChair = -1;

        this.isZhajinniu = false;
        this.isMingCardQZ = false;
        this.isFengKuang = false;
        if(confige.roomData.roomType == "zhajinniu")
        {
            this.isZhajinniu = true;
            this.zhajinniuRoundTime = confige.roomData.TID_ZHAJINNIU/1000;
            console.log("this.zhajinniuRoundTime +++" + this.zhajinniuRoundTime);
        }
        if(confige.roomData.roomType == "mingpaiqz")
        {
            this.isMingCardQZ = true;
            this.mingcardqzBasicType = confige.roomData.basicType;
            this.initMingCardQZ();
        }
        if(confige.roomData.roomType == "fengkuang")
        {
            this.isFengKuang = true;
        }

        this.joinState = confige.roomData.state;
        this.gameBegin = false;     //本房间游戏开始
        this.gameStart = false;     //当前局游戏开始
        this.joinLate = false;
        

        this.timerItem = this.node.getChildByName("timerItem").getComponent("timerItem");
        this.timerItem.onInit();


        this.allBetNum = 0;
        this.myBetNum = 0;
        
        this.pushBanker = this.node.getChildByName("btn_pushBanker");
        this.unpushBanker = this.node.getChildByName("btn_unPushBanker");
        this.popBanker = this.gameInfoNode.node.getChildByName("btn_popBanker");
        this.readyBtn = this.node.getChildByName("btn_ready");
        this.showCardBtn = this.node.getChildByName("btn_showMyCard");
        this.betBtnBox = this.node.getChildByName("betBtnBox");
        if(this.isFengKuang)
        {
            this.betBtnBox.getChildByName("bet4").active = false;
            this.betBtnBox.getChildByName("bet1").x = -130;
            this.betBtnBox.getChildByName("bet2").x = 0;
            this.betBtnBox.getChildByName("bet2").getChildByName("Label").getComponent("cc.Label").string = 2;
            this.betBtnBox.getChildByName("bet3").x = 130;
            this.betBtnBox.getChildByName("bet3").getChildByName("Label").getComponent("cc.Label").string = 3;
        }
        this.betNumMax = 20;
        this.niuniuBetType = 1;
        if(confige.roomData.roomType == "niuniu")
        {
            
            if(confige.roomData.basicType == 0)
            {
                this.betBtnBox.getChildByName("bet1").getChildByName("Label").getComponent("cc.Label").string = 1;
                this.betBtnBox.getChildByName("bet2").getChildByName("Label").getComponent("cc.Label").string = 2;
                this.betBtnBox.getChildByName("bet3").getChildByName("Label").getComponent("cc.Label").string = 3;
                this.betBtnBox.getChildByName("bet4").getChildByName("Label").getComponent("cc.Label").string = 5;
                this.betNumMax = 5;
                this.niuniuBetType = 0;
            }else if(confige.roomData.basicType == 1){
                this.betBtnBox.getChildByName("bet1").getChildByName("Label").getComponent("cc.Label").string = 1;
                this.betBtnBox.getChildByName("bet2").getChildByName("Label").getComponent("cc.Label").string = 5;
                this.betBtnBox.getChildByName("bet3").getChildByName("Label").getComponent("cc.Label").string = 10;
                this.betBtnBox.getChildByName("bet4").getChildByName("Label").getComponent("cc.Label").string = 20;
                this.betNumMax = 20;
                this.niuniuBetType = 1;
            }
        }

        this.gameStatus = this.node.getChildByName("gameStatus");
        this.gameStatusList = {};
        for(var i=1;i<=5;i++)
        {
            this.gameStatusList[i] = this.gameStatus.getChildByName("tips" + i);
        }

        this.btnCanSend = true;

        this.openCardBox = this.node.getChildByName("openCardBox");
        this.openCardBtn1 = this.openCardBox.getChildByName("btn1");
        this.openCardBtn2 = this.openCardBox.getChildByName("btn2");
        this.openCardImg1 = this.openCardBox.getChildByName("btnImg1");
        this.openCardImg2 = this.openCardBox.getChildByName("btnImg2");

        this.betBtnBoxS = this.node.getChildByName("betBtnBoxS");
        this.betSlider = this.betBtnBoxS.getChildByName("slider").getComponent("cc.Slider");
        this.betSliderLight = this.betBtnBoxS.getChildByName("slider").getChildByName("light").getComponent("cc.Sprite");

        this.betSliderNumList = {};

        this.betSliderNumList[0] = this.betBtnBoxS.getChildByName("numList").getChildByName("curNum1").getComponent("cc.Label");
        this.betSliderNumList[1] = this.betBtnBoxS.getChildByName("numList").getChildByName("curNum2").getComponent("cc.Label");
        this.betSliderNumList[2] = this.betBtnBoxS.getChildByName("numList").getChildByName("curNum3").getComponent("cc.Label");
        this.betSliderNumList[3] = this.betBtnBoxS.getChildByName("numList").getChildByName("curNum4").getComponent("cc.Label");
        this.betSliderNumList[4] = this.betBtnBoxS.getChildByName("numList").getChildByName("curNum5").getComponent("cc.Label");
        this.betSliderNumList[5] = this.betBtnBoxS.getChildByName("numList").getChildByName("curNum6").getComponent("cc.Label");

        this.curSliderNum = 0;
        this.curSliderNumLabel = this.betBtnBoxS.getChildByName("slider").getChildByName("handle").getChildByName("curNum").getComponent("cc.Label");
        this.curSliderNumMin = 0;
        this.curSliderNumMax = 0;
    },

    startLater: function () {
        this.gamePlayerNode.onStart();
        
        if(this.isZhajinniu == true)
        {
            this.initZhajinniuLayer();
        }

        if(confige.curReconnectData == -1)  //是否属于重连状态
        {
            if(this.joinState == 1005)
            {
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {
                        this.gamePlayerNode.cardItemList.activePlayer(confige.getCurChair(i));
                    }
                }
            }
            if(this.joinState != 1001)   //本局游戏已经开始才加入
            {
                this.gameBegin = true;
                this.gameInfoNode.btn_inviteFriend.active = false;
                // this.gameInfoNode.btn_close.interactable = false;
                console.log("本局游戏已经开始才加入,进入观战模式");
                console.log("当前参与游戏的人数===" + this.gamePlayerNode.playerCount);
                var watchPlayer = 0;
                // for(var i=0;i<this.playerCount;i++)
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == false)
                    {
                        watchPlayer ++;
                        console.log("有一个观战的玩家");
                    }
                    if(confige.roomPlayer[i].isBanker == true)
                    {
                        this.curBankerChair = i;
                        this.gamePlayerNode.playerList[confige.getCurChair(this.curBankerChair)].getChildByName("banker").active = true;
                        this.gamePlayerNode.lightBgList[confige.getCurChair(this.curBankerChair)].active = true;
                    }
                }
                this.gamePlayerNode.playerCount -= watchPlayer;
                this.readyBtn.active = false;
                this.gameStart = true;
                this.joinLate = true;
                if(this.cardMode == 2)
                {   
                    if(this.joinState == 1002)
                    {
                        for(var i in confige.roomPlayer)
                        {
                            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                            {   
                                var curChair = confige.getCurChair(i);
                                if(curChair != 0)
                                    this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithCount(3);

                                if(confige.roomPlayer[i].isBanker == true)
                                {
                                    this.curBankerChair = i;
                                }
                            }
                        }
                    }
                }

                if(this.joinState == 1003)
                {
                    for(var i in confige.roomPlayer)
                    {
                        if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                        {   
                            this.gamePlayerNode.playerCardList[i] = confige.roomData.player[i].handCard;
                            this.gamePlayerNode.playerHandCardList[confige.getCurChair(i)].initCardWithBack();
                            var curChair = confige.getCurChair(i);
                            if(curChair != 0 && confige.roomPlayer[i].isShowCard == true)
                                this.gamePlayerNode.showOneCard(i);
                            this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithCount(5);
                        }
                    }
                }

                if(this.joinState != 1005)      //非抢庄阶段，显示分数和庄家
                {
                    var curBetCount = 0;
                    for(var i in confige.roomPlayer)
                    {
                        if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                        {  
                            var curChair = confige.getCurChair(i);
                            if(confige.roomData.betList[i] == null)
                                confige.roomData.betList[i] = 0;
                            curBetCount += confige.roomData.betList[i];
                            this.gamePlayerNode.curBetNumList[curChair] = confige.roomData.betList[i];
                            
                            // this.playerScoreList[parseInt(i)] -= confige.roomData.betList[i];
                            // this.playerInfoList[curChair].setScore(this.playerScoreList[parseInt(i)]);
                            console.log(this.gamePlayerNode.betNumLabelList);
                            this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair] + "分";
                            if(confige.roomPlayer[i].isBanker == false)
                                this.gamePlayerNode.betNumNodeList[curChair].active = true;
                        }
                    }
                    this.allBetNum = curBetCount;
                    this.showScorePool(this.allBetNum);
                    this.gameBGNode.betItemListAddBet(confige.getCurChair(this.curBankerChair),this.allBetNum);
                }

                if(this.isZhajinniu == true)
                {
                    var curCardNum = 0;
                    if(confige.roomData.curRound == 0)
                    {   
                        curCardNum = 3;
                    }else if(confige.roomData.curRound == 1){
                        curCardNum = 4;
                    }else if(confige.roomData.curRound == 2){
                        curCardNum = 5;
                    }else if(confige.roomData.curRound == 3){
                        curCardNum = 5;
                    }
                    this.curRound = confige.roomData.curRound;
                    this.setRoundTime(confige.roomData.curRound + 1);
                    var curBetCount = 0;
                    console.log("curCardNum=====" + curCardNum);
                    for(var i in confige.roomPlayer)
                    {
                        if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                        {   
                            var curChair = confige.getCurChair(i);

                            this.gamePlayerNode.playerHandCardList[curChair].resetCard();
                            for(var j=0;j<curCardNum;j++)
                                this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(j);
                            if(this.cardMode == 2)
                            {
                                var curCardData = confige.roomData.player[i].handCard;
                                for(var k in curCardData)
                                {
                                    var index = parseInt(k);
                                    this.gamePlayerNode.playerHandCardList[curChair].setCardWithIndex(index, curCardData[index].num, curCardData[index].type);
                                }
                            }

                            if(confige.roomData.player[i].isShowCard == true)
                            {
                                this.lookCardList[curChair] = true;
                                this.gamePlayerNode.watchCardImgList[curChair].active = true;
                            }

                            if(confige.roomData.player[i].isNoGiveUp == false)
                            {
                                this.loseList[curChair] = true;
                                this.loseNodeList[curChair].active = true;
                                this.giveUpList[curChair] = true;
                                this.gamePlayerNode.discardImgList[curChair].active = true;
                                this.gamePlayerNode.watchCardImgList[curChair].active = false;
                            }

                            curBetCount += confige.roomData.betList[i];
                            this.gamePlayerNode.curBetNumList[curChair] = confige.roomData.betList[i];
                            this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair] + "分";
                            this.gamePlayerNode.betNumNodeList[curChair].active = true;
                        }
                    }
                    this.allBetNum = curBetCount;
                    this.showScorePool(this.allBetNum);
                    var curPlayerChair = confige.getCurChair(confige.roomData.curPlayer);
                    this.changeArrow(curPlayerChair);
                }
                if(this.isMingCardQZ)
                {
                    if(this.joinState == 1005 || this.joinState == 1002)
                    {
                        for(var i in confige.roomPlayer)
                        {
                            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                            {
                                this.gamePlayerNode.cardItemList.activePlayer(confige.getCurChair(i));
                            }
                        }
                        // this.onReConnect = true;
                        // this.newDisCard(4);
                        var cardsCount = 0;
                        for(var i in confige.roomPlayer)
                        {
                            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                            {
                                var curChair = confige.getCurChair(i);
                                this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithCount(4);
                                console.log("重连直接显示玩家盖着的牌" + i);
                                if(confige.roomPlayer[i].handCard)
                                {
                                    var callFunc = function(){
                                        for(var i in callFunc.cards)
                                        {
                                            this.gamePlayerNode.playerHandCardList[callFunc.curChair].setCardWithIndex(i, callFunc.cards[i].num, callFunc.cards[i].type);
                                        }
                                    };
                                    callFunc.cards = confige.roomPlayer[i].handCard;
                                    callFunc.curChair = curChair;
                                    this.scheduleOnce(callFunc,0.2);
                                }
                            }
                        }
                    }   
                    if(this.joinState != 1005 && this.joinState != 1001)
                    {
                        var robStateList = confige.roomData.robState;
                        for(var i in robStateList)
                        {
                            if(robStateList[i] != -1)
                            {
                                if(robStateList[i] > this.curRobMaxNum)
                                    this.curRobMaxNum = robStateList[i];
                            }
                        }
                        if(this.curRobMaxNum == 0)
                            this.curRobMaxNum = 1;
                        this.robMaxNumNode.active = true;
                        this.robMaxNumLabel.string = this.curRobMaxNum + ";<";
                    }
                    if(this.joinState == 1002)
                    {
                        var betList = confige.roomData.betList;
                        // for(var i in betList)
                        // {
                        //     if(i == this.meChair && i != this.curBankerChair && betList[i] == 0)
                        //     {
                        //         if(confige.roomData.lastScore[this.meChair] > 0)
                        //             this.robBetAllInBtn.interactable = true;

                        //         this.robBetAllInBtn.active = true;
                        //         this.betBtnBox.active = false;
                        //     }
                        // }   
                    }else{
                        var robStateList = confige.roomData.robState;
                        for(var i in robStateList)
                        {
                            this.gamePlayerNode.playerList[i].getChildByName("banker").active = false;
                            if(robStateList[i] != -1)
                            {
                                var curChair = confige.getCurChair(i);
                                if(robStateList[i] > this.curRobMaxNum)
                                    this.curRobMaxNum = robStateList[i];
                                if(robStateList[i] == 0)
                                    this.gamePlayerNode.noRobImgList[curChair].active = true;
                                else{
                                    this.gamePlayerNode.robNumLabelList[curChair].string = ">?;"+robStateList[i];
                                    this.gamePlayerNode.robNumNodeList[curChair].active = true;
                                }
                            }
                        }
                        this.statusChange(2);
                    }
                }                      
            }
        }else{
            this.recoverGame();
            confige.curReconnectData = -1;
        }
        console.log("roomId + meChair === " + (confige.roomData.roomId*10 + this.meChair));
        

        this.sceneLoadOver = true;
        
        //处理缓存的服务器消息
        confige.gameSceneLoadOver = true;
        confige.curSceneIndex = 2;
        var infoCount = confige.gameSceneLoadData.length;
        console.log(confige.gameSceneLoadData);
        for(var i=0;i<infoCount;i++)
        {
            console.log("deal once!!!!!!!!");
            var curInfo = confige.gameSceneLoadData.shift();
            pomelo.dealWithOnMessage(curInfo);
            console.log(curInfo);
        }
        confige.gameSceneLoadData = [];
        console.log(confige.gameSceneLoadData);
    },

    setBanker:function(chair){
        this.curBankerChair = chair;
    },

    showScorePool:function(score,type,bankerScore,change){
        console.log("show fuck score pool!!!!!!");
        if(this.isMingCardQZ)
        {
            this.robBetNumLabel.string = score;
            return;
        }
        this.gameBGNode.scorePool.active = true;
        this.gameBGNode.scorePoolLabel.string = score + ";<";
        this.gameBGNode.scorePoolNum = parseInt(score);

        if(bankerScore)
        {
            console.log("curChair === " + this.curBankerChair + "newChiar===" + confige.getCurChair(this.curBankerChair));
            this.gamePlayerNode.playerScoreList[this.curBankerChair] = bankerScore;
            this.gamePlayerNode.playerInfoList[confige.getCurChair(this.curBankerChair)].setScore(this.gamePlayerNode.playerScoreList[this.curBankerChair]);
        }
        if(change === true)
        {
            // this.gameBGNode.betItemRemoveToBanker(confige.getCurChair(this.curBankerChair));
            var callFunc = function(){
                this.gameBGNode.betItemListClean();
                console.log("fuck you scorePool 丢钱出去！！！！！！！！！！！！！！")
                this.gameBGNode.betItemListAddBet(confige.getCurChair(this.curBankerChair),callFunc.score);
            };
            callFunc.score = score;
            this.scheduleOnce(callFunc,1);
        }
    },

    showGameStatus:function(index){
        this.gameStatus.active = true;
        for(var i=1;i<=5;i++)
            this.gameStatusList[i].active = false;
        if(index == 2)
        {
            this.gameStatus.active = false;
        }else{
            this.gameStatusList[index].active = true;
        }
    },

    hideGameStatus:function(){
        this.gameStatus.active = false;
    },

    addBet:function(betNum, chair){
        this.gameBGNode.betItemListAddBet(chair,betNum);
        if(this.isZhajinniu)
        {
            this.allBetNum += betNum;
            this.gamePlayerNode.curBetNumList[chair] += betNum;
            this.gamePlayerNode.betNumLabelList[chair].string = this.gamePlayerNode.curBetNumList[chair].toString() + "分";
            this.showScorePool(this.allBetNum,1);
            return;
        }
        this.allBetNum = this.allBetNum + betNum;
        if(chair == 0)
            this.myBetNum = this.myBetNum + betNum;
        if(this.gameMode != 3)
            this.showScorePool(this.allBetNum,1);
        this.gamePlayerNode.curBetNumList[chair] += betNum;
        this.gamePlayerNode.betNumLabelList[chair].string = this.gamePlayerNode.curBetNumList[chair].toString() + "分";
        if(confige.soundEnable == true)
            confige.playSoundByName("sendBet");
    },

    onBtnReadyClicked:function(){
        if(this.btnCanSend)
        {
            this.btnCanSend = false;
            pomelo.request("connector.entryHandler.sendData", {"code" : "ready"}, function(data) {
                console.log("flag is : "+ data.flag);
                if(data.flag == true)
                {
                    if(this.isZhajinniu)
                    {
                        this.readyBtn.active = false;
                        for(var i=0;i<confige.playerMax;i++)
                        {
                            this.lookCardList[i] = false;
                            this.giveUpList[i] = false;
                            this.loseList[i] = false;
                            this.loseNodeList[i].active = false;
                            this.gamePlayerNode.watchCardImgList[i].active = false;
                            this.gamePlayerNode.failureImgList[i].active = false;
                            this.gamePlayerNode.discardImgList[i].active = false;
                            // this.isTurnImgList[i].active = false;
                        }
                    }else{
                        console.log("fuck onBtnReadyClicked !!!!!!!!!");
                        this.readyBtn.active = false;
                    }
                }
                this.btnCanSend = true;
            }.bind(this));
            
        }
    },
    
    onBtnBetClicked:function(event, customEventData){
        //pomelo.clientSend("bet",{"bet":1});
        var betType = parseInt(customEventData);
        var curBetNum = 1;
        if(betType == 0)
            curBetNum = 1;
        else if(betType == 1)
        {
            if(this.isFengKuang)
                curBetNum = 2;
            else{
                curBetNum = 2;
                // if(this.niuniuBetType == 1)
                //     curBetNum = 5;
                // if(this.niuniuBetType == 0)
                //     curBetNum = 2;
            }
        }
        else if(betType == 2){
            if(this.isFengKuang)
                curBetNum = 3;
            else{
                curBetNum = 3;
                // if(this.niuniuBetType == 1)
                //     curBetNum = 10;
                // if(this.niuniuBetType == 0)
                //     curBetNum = 3;
            }
        }
        else if(betType == 3)
        {
            if(this.gameMode == 3)          //斗公牛模式特殊处理
            {
                curBetNum = Math.min(Math.floor(this.gameBGNode.scorePoolNum/(this.gamePlayerNode.playerCount-1)), 40) - this.myBetNum;
                console.log("new curBetNum ===== " + curBetNum);
            }else{
                curBetNum = 4;
                // curBetNum = this.betNumMax - this.myBetNum;
            }
        }
        if(betType == 100)
        {
            curBetNum = this.curSliderNum;
        }
        var self = this;
        pomelo.clientSend("bet",{"bet": curBetNum},function(){
            self.betBtnBoxS.active = false;
            self.betBtnBox.active = false;
        });

    },
    
    onBtnPushBankerClicked:function(event,customEventData){
        var clickIndex = parseInt(customEventData);
        this.pushBanker.active = false;
        this.unpushBanker.active = false;
        if(clickIndex == 1)
        {
            this.showGameStatus(3);
            pomelo.clientSend("robBanker",{"flag" : true});
        }else if(clickIndex == 2){
            this.showGameStatus(3);
            pomelo.clientSend("robBanker",{"flag" : false});
        }
    },
    
    onBtnPopBankerClicked:function(){
        pomelo.clientSend("downBanker");
    },

    downBanker:function(data){
        this.popBanker.active = false;
        if(this.gameMode == 3)
            this.gameBGNode.betItemRemoveToBanker(confige.getCurChair(data.chair));
        else
            this.showScorePool(data.bonusPool,0);
            // this.showScorePool(data.bonusPool,0,false,true);
        this.gamePlayerNode.playerList[confige.getCurChair(data.chair)].getChildByName("banker").active = false;
        this.gamePlayerNode.lightBgList[confige.getCurChair(data.chair)].active = false;
        this.gamePlayerNode.playerList[confige.getCurChair(data.banker)].getChildByName("banker").active = true;
        this.gamePlayerNode.lightBgList[confige.getCurChair(data.banker)].active = true;
        // if(this.gameMode == 3)
        // {
        //     this.gameBGNode.betItemRemoveToBanker(confige.getCurChair(data.chair));
        // } 
        if(data.oldBankerScore)
        {
            this.gamePlayerNode.playerScoreList[data.chair] = data.oldBankerScore;
            this.gamePlayerNode.playerInfoList[confige.getCurChair(data.chair)].setScore(this.gamePlayerNode.playerScoreList[data.chair]);
        }
        if(data.bankerScore)
        {
            this.curBankerChair = data.banker;
            this.gamePlayerNode.playerScoreList[this.curBankerChair] = data.bankerScore;
            this.gamePlayerNode.playerInfoList[confige.getCurChair(this.curBankerChair)].setScore(this.gamePlayerNode.playerScoreList[this.curBankerChair]);
        }
    },
    
    onServerRobBanker:function(){
        this.timerItem.setTime(this.time_rob);
        if(this.isMingCardQZ)
            this.showGameStatus(2);
        else
            this.showGameStatus(1);
        if(this.joinLate == false)
        {
            if(this.isMingCardQZ)
            {
                this.robBtnBox.active = true;
            }else{
                this.pushBanker.active = true;
                this.unpushBanker.active = true;
            }
        }
        console.log("fuck rob banker");
    },
    
    onServerRobBankerReturn:function(data){
        var curChair = confige.getCurChair(data.chair);
        
        if(this.isMingCardQZ)
        {
            if(data.num > this.curRobMaxNum)
                this.curRobMaxNum = data.num;
            if(data.num == 0)
                this.gamePlayerNode.noRobImgList[curChair].active = true;
            else{
                this.gamePlayerNode.robNumLabelList[curChair].string = ">?;"+data.num;
                this.gamePlayerNode.robNumNodeList[curChair].active = true;
            }
        }else{
            if(data.flag == 1)
            {
                this.gamePlayerNode.isRobImgList[curChair].active = true;
            }else if(data.flag == 2){
                this.gamePlayerNode.noRobImgList[curChair].active = true;
            } 
        }
    },

    statusChange:function(index){
        if(this.isZhajinniu)
        {
            return;
        }
        else if(index === 1)
        {
            this.timerItem.setTime(this.time_betting);
        }
        else if(index === 2)
        {
            this.timerItem.setTime(this.time_settlement);
        }
    },
    
    onServerReady:function(chair){
        confige.roomPlayer[confige.getOriChair(chair)].isReady = true;
        console.log(confige.getOriChair(chair) + "号玩家准备");
        this.onReConnect = false;
        this.gamePlayerNode.playerList[chair].getChildByName("isReady").active = true;
        this.gamePlayerNode.failureImgList[chair].active = false;
        this.gamePlayerNode.watchCardImgList[chair].active = false;
        this.gamePlayerNode.discardImgList[chair].active = false;
        if(this.isMingCardQZ)
        {
            this.robMaxNumNode.active = false;
            this.curRobMaxNum = 0;
        }
        if(chair == 0)      //当前玩家自己
        {
            this.showCardBtn.active = false;
            this.joinLate = false;
            if(this.gameMode != 3)
                this.gameBGNode.betItemListClean();
            this.showGameStatus(5);
            if(confige.roomData.gameMode != 3)
                this.gameBGNode.scorePool.active = false;
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true)
                {   
                    var curChair = confige.getCurChair(i);
                    this.gamePlayerNode.playerHandCardList[curChair].resetCard();
                    this.gamePlayerNode.niuTypeBoxList[curChair].active = false;
                    this.gamePlayerNode.playerList[curChair].getChildByName("banker").active = false;
                    this.gamePlayerNode.betNumNodeList[curChair].active = false;
                    this.gamePlayerNode.betNumLabelList[curChair].string = "0" + "分";
                    this.gamePlayerNode.curBetNumList[curChair] = 0;
                    this.gamePlayerNode.lightBgList[curChair].active = false;
                    this.gamePlayerNode.isRobImgList[curChair].active = false;
                    this.gamePlayerNode.noRobImgList[curChair].active = false;
                    this.gamePlayerNode.robNumNodeList[curChair].active = false;
                }
            }
        }
    },
    
    onServerBeginBetting:function(data){
        var bankerChair = data.banker;
        this.popBanker.active = false;
        this.allBetNum = 0;
        this.myBetNum = 0;

        console.log("fuck joinLate =====!!!!!!!!!" + this.joinLate);
        this.statusChange(1);
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
            {
                var curIndex = confige.getCurChair(i);
                this.gamePlayerNode.isRobImgList[curIndex].active = false;
                this.gamePlayerNode.noRobImgList[curIndex].active = false;
                if(i != bankerChair)     //庄家不显示分数框
                {
                    this.gamePlayerNode.betNumNodeList[curIndex].active = true;
                }
                if(this.isZhajinniu == false)
                {
                    if(i != bankerChair)
                    {
                        this.gamePlayerNode.betNumLabelList[curIndex].string = "0" + "分";
                        this.gamePlayerNode.curBetNumList[curIndex] = 0;
                    }
                }
            }
        }
        console.log("onServerBeginBetting111111");
        this.curBankerChair = bankerChair;
        if(bankerChair == this.meChair)
            this.showGameStatus(4);
        else
            this.showGameStatus(2);
      
        if(confige.roomData.gameMode != 3)
            this.showScorePool(this.allBetNum);

        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true)
            {   
                this.gamePlayerNode.playerList[confige.getCurChair(i)].getChildByName("banker").active = false;
                this.gamePlayerNode.lightBgList[confige.getCurChair(i)].active = false;
            }
        }
        console.log("onServerBeginBetting222222");
        if(bankerChair != -1)
        {
            this.gamePlayerNode.playerList[confige.getCurChair(bankerChair)].getChildByName("banker").active = true;
            this.gamePlayerNode.lightBgList[confige.getCurChair(bankerChair)].active = true;
            // this.curBankerChair = confige.getCurChair(bankerChair);
        }
        if(this.isMingCardQZ)
        {
            this.robBtnBox.active = false;
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true)
                {
                    var curChair = confige.getCurChair(i);
                    this.gamePlayerNode.robNumNodeList[curChair].active = false;
                }
            }
            if(this.curRobMaxNum == 0)
            {
                this.robMaxNumLabel.string = "1;<";
            }else{
                this.robMaxNumLabel.string = this.curRobMaxNum + ";<";
            }
            
            this.robMaxNumNode.active = true;
            if(data.lastScore[this.meChair] > 0 && this.isAllowAllin)
                this.robBetAllInBtn.interactable = true;
        }
        console.log("onServerBeginBetting333333");
        if(this.joinLate == false)
        {
            this.pushBanker.active = false;
            this.unpushBanker.active = false;
            if(this.curBankerChair != this.meChair)
            {   
                if(this.gameMode == 3)
                {
                    console.log("this.scorePoolNum==="+this.gameBGNode.scorePoolNum);
                    console.log("this.playerCount==="+this.gamePlayerNode.playerCount);
                    var curMin = Math.max(Math.floor(this.gameBGNode.scorePoolNum / this.gamePlayerNode.playerCount / 5), 1);// - this.myBetNum;
                    if(curMin > 40)
                        curMin = 40;
                    var curMax = Math.min(Math.floor(this.gameBGNode.scorePoolNum/(this.gamePlayerNode.playerCount-1)), 40); - this.myBetNum;
                    console.log("curMax ===== " + curMax);
                    this.showSlider(curMin,curMax);
                }
                else if(this.isMingCardQZ)
                {
                    this.robBetBtnBox.active = true;
                }else{
                    this.betBtnBox.active = true;
                }
            }
        }else{
            if(this.joinState == 1005 &&  this.cardMode == 2)
            {
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {
                        var curChair = confige.getCurChair(i);
                        if(curChair != 0)
                            this.playerHandCardList[curChair].showCardBackWithCount(3);
                    }
                }
            }
        }
        console.log("onServerBeginBetting444444");
    },

    onServerDealCard:function(handCards){
        this.hideGameStatus();
        for(var i in handCards)
        {
            if(handCards.hasOwnProperty(i))
            {
                this.gamePlayerNode.playerCardList[i] = handCards[i];
            }
        }
        this.statusChange(2);
        if(this.cardMode == 2 && this.joinLate == false)
        {
            console.log("onServerDealCard11111222");
                this.newDisCard(1);
                var callFunc = function(){
                    if(this.gameStart == true)
                        this.showOpenCard(2);
                };
                this.scheduleOnce(callFunc,0.3);
        }else if(this.isMingCardQZ){
            console.log("onServerDealCard22222");
            if(this.onReConnect == false)
            {
                this.newDisCard(1);
                if(this.joinLate == false)
                {
                    var callFunc = function(){
                        if(this.gameStart == true)
                        {
                            if(this.joinLate == false)
                                this.showOpenCard(2);
                        }
                    };
                    this.scheduleOnce(callFunc,0.5);
                }
            }
        }else{
            console.log("onServerDealCard333333");
            this.newDisCard(5);
             if(this.joinLate == false)
            {
                var curChair = confige.getCurChair(this.meChair);
                var curCardData = this.gamePlayerNode.playerCardList[this.meChair];
                var callFunc = function(){
                    console.log("显示玩家明牌");
                    for(var j=0;j<3;j++)
                    {
                        var index = parseInt(j);
                        this.gamePlayerNode.playerHandCardList[callFunc.curChair].setCardWithIndex(index, callFunc.curCardData[index].num, callFunc.curCardData[index].type);
                    }
                    if(this.gameStart == true)
                    {
                        this.showOpenCard(1);
                        this.showOpenCard(2);
                    }
                };
                callFunc.curCardData = curCardData;
                callFunc.curChair = curChair;
                this.scheduleOnce(callFunc,0.5);
            }
        }
        if(this.onReConnect)
        {
            if(this.isMingCardQZ)
            {
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {  
                        var curChair = confige.getCurChair(i);
                        this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(4);
                        if(this.joinLate == false)
                            this.showOpenCard(2);
                        console.log("onServerDealCard5555555555");
                    }
                }
            }
        }
        console.log("onServerDealCard44444");
        
        if(this.joinLate == false)
        {
            var callFunc2 = function(){
                this.showCardBtn.active = true;
            };
            this.scheduleOnce(callFunc2,0.5);
            this.betBtnBox.active = false;
            this.betBtnBoxS.active = false;
            if(this.isMingCardQZ)
            {
                this.robBetBtnBox.active = false;
                this.robBetAllInBtn.interactable = false;
            }
        }
    },

    btn_showMyCard:function(){
        pomelo.clientSend("showCard");
        this.showCardBtn.active = false;

        var handCard = this.gamePlayerNode.playerCardList[this.meChair];
        var curNiuType = 0;
        if(this.isFengKuang){
            curNiuType = FKLogic.getType(handCard);
            console.log("this.isFengKuang+++++"+curNiuType);
            console.log(handCard);
        }
        else
            curNiuType = confige.getNiuType(handCard);
        this.gamePlayerNode.showNiuType(0, curNiuType.type);
    },
    
    showMingCard:function(cards){
        var cardsCount = 0;
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
            {
                var curChair = confige.getCurChair(i);
            }
        }
        for(var i in cards)
        {
            cardsCount ++;
        }
        
        this.newDisCard(cardsCount);

        var callFunc = function(){
            for(var i in callFunc.cards)
            {
                this.gamePlayerNode.playerHandCardList[0].setCardWithIndex(i, callFunc.cards[i].num, callFunc.cards[i].type);
            }
        };
        callFunc.cards = cards;
        this.scheduleOnce(callFunc,0.5);
    },

    onServerSettlement:function(data){
        this.hideOpenCard(1);
        this.hideOpenCard(2);
        this.hideGameStatus();
        // if(this.gameMode != 3)      //
        //     this.betItemListClean();
        console.log("onServerSettlement 1111111");
        if(this.isZhajinniu)
        {  
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer.hasOwnProperty(i))
                {
                    if(confige.roomPlayer[i] && confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {
                        this.gamePlayerNode.playerCardList[i] = data.player[i].handCard;
                    }                   
                }
            }
            this.hideDoBtnLayer();
            this.hideArrow();
            this.btnWatchCard.active = false;
            this.setRoundTime(0);
        }
        this.statusChange(0);

        for(var i in confige.roomPlayer)
        {            
            if(confige.roomPlayer[i].isActive == true)            
            {
                confige.roomPlayer[i].isReady = false;
            }
            this.gamePlayerNode.isTurnImgList[i].active = false;
        }

        console.log("onServerSettlement 222222222");
        //第一步显示玩家手牌
        for(var i in data.result)
        {
            if(data.result.hasOwnProperty(i))
            {
                if(this.isZhajinniu)
                {
                    if(data.player[i])
                    {
                        this.gamePlayerNode.showOneCard(i);
                    }
                }else{
                    this.gamePlayerNode.showOneCard(i);
                }
            }
        }
        console.log("onServerSettlement 33333333");
        this.waitForSettle = true;
        this.showCardBtn.active = false;
        this.gameStart = false;
        this.joinLate = false;
        this.gameInfoNode.btn_close.interactable = true;
        this.timerItem.hideTimer();

        //分割筹码
        console.log("分割筹码");
        console.log(data.curScores);
        if(this.gameMode == 4 || this.isZhajinniu == true)  //开船或者炸金牛
        {
            for(var i in data.curScores)
            {
                if(data.curScores[i] > 0){
                    this.gameBGNode.betItemRemove(confige.getCurChair(i),data.curScores[i] + this.gamePlayerNode.curBetNumList[confige.getCurChair(i)]);
                    if(confige.soundEnable == true)
                        confige.playSoundByName("getBet");
                }
            }
            for(var i=0;i<this.gameBGNode.betItemCount;i++)
                this.gameBGNode.betItemListAll[i].opacity = 0;
        }
        
        if(this.gameMode == 1 || this.isMingCardQZ)
        {
            console.log("this.curBankerChair111==="+this.curBankerChair);
            console.log("this.curBankerChair222==="+confige.getCurChair(this.curBankerChair));
            this.gameBGNode.betItemRemoveToBanker(confige.getCurChair(this.curBankerChair));
            if(confige.soundEnable == true)
                confige.playSoundByName("getBet");
            var sendBetFunc = function(){
                this.gameBGNode.betItemSendFromBanker(data.curScores,confige.getCurChair(this.curBankerChair));
                if(confige.soundEnable == true)
                    confige.playSoundByName("getBet");
            };

            this.scheduleOnce(sendBetFunc,0.25);
        }

        if(this.gameMode == 3)
        {
            var newScoreNum = this.gameBGNode.scorePoolNum;
            this.gameBGNode.betItemCreate2(newScoreNum);

            for(var i in data.curScores)
            {
                if(data.curScores[i] >= 0)
                {
                    if(parseInt(i) != this.curBankerChair)
                    {
                        var  newAddCount = data.curScores[i] + this.gamePlayerNode.curBetNumList[confige.getCurChair(i)];
                        if(newAddCount > 20)
                            newAddCount = 20;
                        this.gameBGNode.betItemCreate(newAddCount);
                        // var sendBetFunc3 = function(){
                        //     console.log("confige.getCurChair(i)="+sendBetFunc3.chair+"data.curScores[i]"+sendBetFunc3.score);
                        //     this.gameBGNode.betItemCreate(sendBetFunc3.score);
                        // };
                        // sendBetFunc3.chair = confige.getCurChair(i);
                        // sendBetFunc3.score = data.curScores[i] + this.gamePlayerNode.curBetNumList[confige.getCurChair(i)];
                        // if(sendBetFunc3.score > 30)
                        //     sendBetFunc3.score = 30;
                        // this.scheduleOnce(sendBetFunc3,0.4);
                    }
                }
            }
            for(var i in data.curScores)
            {
                if(data.curScores[i] >= 0)
                {
                    if(parseInt(i) != this.curBankerChair)
                    {
                        var sendBetFunc3 = function(){
                            console.log("confige.getCurChair(i)="+sendBetFunc3.chair+"data.curScores[i]"+sendBetFunc3.score);
                            this.gameBGNode.betItemRemove(sendBetFunc3.chair,sendBetFunc3.score);
                            if(confige.soundEnable == true)
                                confige.playSoundByName("getBet");
                        };
                        sendBetFunc3.chair = confige.getCurChair(i);
                        sendBetFunc3.score = data.curScores[i] + this.gamePlayerNode.curBetNumList[confige.getCurChair(i)];
                        if(sendBetFunc3.score > 20)
                            sendBetFunc3.score = 20;
                        this.scheduleOnce(sendBetFunc3,0.5);
                    }
                }
                // }else if(data.curScores[i] < 0){
                //     var award = data.result[i];
                //     var addNum = (-data.curScores[i]) - this.gamePlayerNode.curBetNumList[confige.getCurChair(i)];
                //     console.log("parseInt(i)="+parseInt(i)+"this.curBankerChair"+this.curBankerChair+"parseInt(i) != this.curBankerChair"+(parseInt(i) != this.curBankerChair));
                //     if(addNum != 0 && (parseInt(i) != this.curBankerChair))
                //     {
                //         console.log("fuck you 丟錢出來!!!!!!!!");
                //         this.gameBGNode.betItemListAddBet(confige.getCurChair(i), addNum);
                //     }
                // }
            }
        }
        console.log("onServerSettlement 4444444");
        //第二步延迟显示结算界面
        var self = this;
        var showSettleFunc1 = function(){
            self.gameInfoNode.settleLayer.show(data.curScores[self.meChair]);
            for(var i in data.result)
            {
                if(data.result.hasOwnProperty(i))
                {
                    var niuType = data.result[i].type;
                    if(self.isZhajinniu)
                    {
                        if(data.player[i])// && data.player[i].isNoGiveUp == false)
                        {
                            var handCardCount = 0;
                            for(var z in data.player[i].handCard)
                            {
                                if(data.player[i].handCard.hasOwnProperty(z) && data.player[i].handCard[z])
                                    handCardCount ++;
                            }
                            if(handCardCount < 5)
                            {
                                console.log(i + "号玩家弃牌了");
                                niuType = 100;
                            }
                        }
                    }
                    if(self.isFengKuang)
                        self.gameInfoNode.settleLayer.addOneSettle(confige.roomData.player[i].playerInfo.nickname, niuType, data.curScores[i],1,data.player[i].handCard,i);
                    else
                        self.gameInfoNode.settleLayer.addOneSettle(confige.roomData.player[i].playerInfo.nickname, niuType, data.curScores[i],0,data.player[i].handCard,i);
                    self.gamePlayerNode.playerScoreList[i] = data.realScores[i];
                    self.gamePlayerNode.playerInfoList[confige.getCurChair(i)].setScore(self.gamePlayerNode.playerScoreList[i]);
                }
            }
            
            console.log("onServerSettlement 55555555");
            // if(self.gameInfoNode.roomCurTime < self.gameInfoNode.roomMaxTime)
                // self.gameInfoNode.roomCurTime ++;
            // self.gameInfoNode.roomTime.string = "第" + self.gameInfoNode.roomCurTime + "/" + self.gameInfoNode.roomMaxTime + "局";
            
            // for(var i in confige.roomPlayer)
            // {            
            //     if(confige.roomPlayer[i].isActive == true)            
            //     {
            //         confige.roomPlayer[i].isReady = false;
            //     }
            //     self.gamePlayerNode.isTurnImgList[i].active = false;
            // }
            if(self.curBankerChair == self.meChair && self.gameMode == 3)        //本局庄家是自己的话
            {
                if(data.bankerTime >= 3 && (self.gameInfoNode.roomCurTime != self.gameInfoNode.roomMaxTime)) 
                {
                    self.popBanker.active = true;
                }
            }
            self.waitForSettle = false;
        };
        
        var showSettleFunc2 = function(){
            if(this.gameInfoNode.settleLayer == -1){
                var newLayerStr = ""
                if(confige.playerMax == 6)
                    newLayerStr = "settleLayer";
                else
                    newLayerStr = "settleLayer9";
                cc.loader.loadRes("prefabs/game/"+newLayerStr, cc.Prefab, function (err, prefabs) {
                    var newLayer = cc.instantiate(prefabs);
                    self.gameInfoNode.layerNode1.addChild(newLayer,10);
                    self.gameInfoNode.settleLayer = newLayer.getComponent("settleLayer");
                    self.gameInfoNode.settleLayer.showLayer();
                    self.gameInfoNode.settleLayer.parent = self;
                    showSettleFunc1();
                });
            }else{
                self.gameInfoNode.settleLayer.showLayer();
                showSettleFunc1();
            }
        };
        if(this.isZhajinniu)
            this.scheduleOnce(showSettleFunc2,2.5);
        else
            this.scheduleOnce(showSettleFunc2,1.5);
    },

    resetScene:function(){
        this.pushBanker.active = false;
        this.unpushBanker.active = false;
        this.popBanker.active = false;
        this.readyBtn.active = true;
        this.showCardBtn.active = false;
        this.betBtnBox.active = false;
        this.betBtnBoxS.active = false;
        this.timerItem.active = false;
    },

    //根据重连数据重现游戏状态
    recoverGame:function(){
        this.onReConnect = true;
        console.log("处理重连数据");
        console.log("当前参与游戏的人数===" + this.gamePlayerNode.playerCount);
        var watchPlayer = 0;
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == false)
            {   
                watchPlayer ++;
                if(i == this.meChair)
                    this.joinLate = true;
                console.log("有一个观战的玩家");
            }
        }
        this.gamePlayerNode.playerCount -= watchPlayer;

        if(confige.curReconnectData.freeState && confige.curReconnectData.freeState != false)
            this.gameInfoNode.onServerShowFinish(confige.curReconnectData.freeState);
        console.log("on recoverGame() !!!!!!!!!!!!!");
        this.gameInfoNode.roomMaxTime = confige.curReconnectData.roomInfo.maxGameNumber;
        //重置场景
        this.resetScene();
        console.log(confige.roomPlayer);
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true)
            {
                if(confige.roomPlayer[i].isReady == true)
                    this.gamePlayerNode.cardItemList.activePlayer(confige.getCurChair(i));

                if(confige.roomPlayer[i].isOnline == false)
                    this.gamePlayerNode.leaveNodeList[confige.getCurChair(i)].active = true;
                else
                    this.gamePlayerNode.leaveNodeList[confige.getCurChair(i)].active = false;
            }
        }
        //重现当前玩家分数和显示庄家
        // console.log(confige.roomPlayer);
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true)
            {
                if(this.gamePlayerNode.playerActiveList[confige.getCurChair(i)] == false)
                {
                    console.log("this.playerActiveList === addone");
                    this.gamePlayerNode.addOnePlayer(confige.roomPlayer[i]);
                }
                if(confige.curReconnectData.betList[i] == null)
                    confige.curReconnectData.betList[i] = 0;
                this.gamePlayerNode.playerScoreList[i] = confige.curReconnectData.roomInfo.player[i].score - confige.curReconnectData.betList[i];
                // if(this.isZhajinniu)
                    // this.playerScoreList[i] -= this.zhajinniuBasic;
                this.gamePlayerNode.playerInfoList[confige.getCurChair(i)].setScore(this.gamePlayerNode.playerScoreList[i]);
                if(confige.curReconnectData.roomInfo.player[i].isBanker == true)
                {
                    this.gamePlayerNode.playerList[confige.getCurChair(i)].getChildByName("banker").active = true;
                    this.gamePlayerNode.lightBgList[confige.getCurChair(i)].active = true;
                    this.curBankerChair = i;//confige.getCurChair(i);
                    console.log("重连时庄家==="+this.curBankerChair);
                    if(this.curBankerChair == this.meChair && this.gameMode == 3)        //本局庄家是自己的话
                    {
                        if(confige.curReconnectData.roomInfo.bankerTime >= 3)
                        {
                            this.popBanker.active = true;
                        }
                    }
                }
            }
        }
        this.gameInfoNode.roomCurTime = confige.curReconnectData.roomInfo.gameNumber;
        this.gameInfoNode.roomTime.string = "第" + this.gameInfoNode.roomCurTime + "/" + this.gameInfoNode.roomMaxTime + "局";
        //重现下注金额
        if(confige.curReconnectData.state != 1001)
        {
            var curBetCount = 0;
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                {
                    var curChair = confige.getCurChair(i);
                    if(curChair == 0)
                    {
                        this.myBetNum = confige.curReconnectData.betList[i];
                    }
                    curBetCount += confige.curReconnectData.betList[i];
                    this.gamePlayerNode.curBetNumList[curChair] = confige.curReconnectData.betList[i];
                    this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair] + "分";
                    if(confige.roomPlayer[i].isBanker == false)
                        this.gamePlayerNode.betNumNodeList[curChair].active = true;
                }
            }
            this.allBetNum = curBetCount;
            this.showScorePool(this.allBetNum);
            this.gameBGNode.betItemListAddBet(confige.getCurChair(this.curBankerChair),this.allBetNum);
            this.readyBtn.active = false;

            //重现当前局数显示
            // this.gameInfoNode.roomCurTime = confige.curReconnectData.roomInfo.gameNumber;
            // this.gameInfoNode.roomTime.string = "第" + this.gameInfoNode.roomCurTime + "/" + this.gameInfoNode.roomMaxTime + "局";
            console.log("重连"+ this.gameInfoNode.roomTime.string);
            this.gameBegin = true;
            // this.gameInfoNode.btn_close.interactable = false;
            this.gameInfoNode.btn_inviteFriend.active = false;
        }else{
            //重现当前局数显示
            // this.gameInfoNode.roomCurTime = confige.curReconnectData.roomInfo.gameNumber + 1;
            // this.gameInfoNode.roomTime.string = "第" + this.gameInfoNode.roomCurTime + "/" + this.gameInfoNode.roomMaxTime + "局";
            console.log("重连"+ this.gameInfoNode.roomTime.string);
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                {
                    this.gamePlayerNode.playerList[confige.getCurChair(i)].getChildByName("isReady").active = true;
                    if(i == this.meChair)
                        this.readyBtn.active = false;
                }
            }
        }

        switch(confige.curReconnectData.state){
            case 1001:      //空闲阶段
                // this.statusChange(0);
                if(this.curBankerChair != -1){
                    this.gamePlayerNode.playerList[this.curBankerChair].getChildByName("banker").active = false;
                    this.gamePlayerNode.lightBgList[this.curBankerChair].active = false;
                }
                break;
            case 1002:      //下注阶段
                // this.statusChange(1);
                if(this.curBankerChair != this.meChair && this.joinLate == false)
                {
                    if(!this.isMingCardQZ)
                    {
                        if(this.gameMode == 3)
                        {
                            var curMin = Math.max(Math.floor(confige.curReconnectData.bonusPool / this.gamePlayerNode.playerCount / 5), 1);// - this.myBetNum;
                            if(curMin > 40)
                                curMin = 40;
                            var curMax = Math.min(Math.floor(confige.curReconnectData.bonusPool/(this.gamePlayerNode.playerCount-1)), 40); - this.myBetNum;
                            console.log("curMax ===== " + curMax);
                            this.showSlider(curMin,curMax);
                        }else{
                            this.betBtnBox.active = true;
                        }
                    }
                }
                break;
            case 1003:      //发牌阶段
                // this.statusChange(2);
                console.log("case 1003:!!!!!!!!");
                // console.log(confige.roomPlayer);
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {
                        this.gamePlayerNode.playerCardList[i] = confige.curReconnectData.roomInfo.player[i].handCard;
                        console.log("取出玩家的牌数据" + i)
                        console.log(this.gamePlayerNode.playerCardList[i]);
                        this.gamePlayerNode.playerHandCardList[confige.getCurChair(i)].initCardWithBack();
                        if(confige.roomPlayer[i].isShowCard == true)
                            this.gamePlayerNode.showOneCard(i);
                    }
                }
                if(this.joinLate == false)
                {
                    this.gamePlayerNode.showOneCard(this.meChair,-1);
                    this.btn_showMyCard();
                }
                //this.showCardBtn.active = true;
                break;
            case 1004:      //结算阶段
                // this.statusChange(0);
                break;
            case 1005:      //抢庄阶段
                // this.statusChange(1);
                //this.pushBanker.active = true;
                if(this.gameMode == 1 && this.joinLate == false)
                    this.onServerRobBanker();
                break;
            case 1006:
                break;
        }

        if(this.cardMode == 2)          //明牌处理
        {
            if(confige.curReconnectData.state == 1002 && this.joinLate == false)
            {
                if(this.isMingCardQZ != true)
                    this.showMingCard(confige.curReconnectData.roomInfo.player[this.meChair].handCard);
            }
        }

        if(this.gameMode == 3)          //斗公牛模式
        {
            if(this.onReConnect == true)
                this.showScorePool(confige.curReconnectData.bonusPool,0,false,true);
            else
                this.showScorePool(confige.curReconnectData.bonusPool,0);

        }else if(this.gameMode == 4){   //开船模式
            var dfsdfsdfsd = 0;
        }

        if(this.gameInfoNode.roomCurTime != 0)
        {
            this.gameInfoNode.btn_inviteFriend.active = false;
            this.gameBegin = true;
        }else{
            console.log("fuck roomCurTime === " + this.roomCurTime);
        }

        console.log("this.gameBegin======??????" + this.gameBegin);

        if(this.isZhajinniu)
        {
            if(confige.curReconnectData.state == 1001)
            {
                confige.curReconnectData = -1;
                return;
            }
            console.log("特殊处理炸金牛的重连");
            console.log("this.playerCount ===== " + this.gamePlayerNode.playerCount);
            if(this.isZhajinniu == true)
            {
                this.hideDoBtnLayer();
                this.curRound = confige.curReconnectData.roomInfo.curRound;
                var curCardNum = 0;
                if(this.curRound == 0)
                {   
                    curCardNum = 3;
                }else if(this.curRound == 1){
                    curCardNum = 4;
                }else if(this.curRound == 2){
                    curCardNum = 5;
                }else if(this.curRound == 3){
                    curCardNum = 5;
                }
                this.setRoundTime(this.curRound + 1);
                console.log("curCardNum=====" + curCardNum);
                var curBetCount = 0;
                var meGiveUp = false;
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {
                        var curChair = confige.getCurChair(i);
                        this.gamePlayerNode.playerHandCardList[curChair].resetCard();
                        for(var j=0;j<curCardNum;j++)
                            this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(j);
                        if(this.cardMode == 2)
                        {
                            var curCardData = confige.curReconnectData.roomInfo.player[i].handCard;
                            for(var k in curCardData)
                            {
                                var index = parseInt(k);
                                this.gamePlayerNode.playerHandCardList[curChair].setCardWithIndex(index, curCardData[index].num, curCardData[index].type);
                            }
                        }

                        if(confige.curReconnectData.roomInfo.player[i].isShowCard == true)
                        {
                            this.lookCardList[curChair] = true;
                            this.gamePlayerNode.watchCardImgList[curChair].active = true;
                            if(curChair == 0)
                                this.isWatchCard = true;
                        }
                        if(confige.curReconnectData.roomInfo.player[i].isNoGiveUp == false)
                        {
                            this.loseList[curChair] = true;
                            this.loseNodeList[curChair].active = true;
                            this.giveUpList[curChair] = true;
                            this.gamePlayerNode.discardImgList[curChair].active = true;
                            this.gamePlayerNode.watchCardImgList[curChair].active = false;
                            if(curChair == 0 && this.joinLate == false)
                                meGiveUp = true;
                        }
                        curBetCount += confige.curReconnectData.betList[i];
                        this.gamePlayerNode.curBetNumList[curChair] = confige.curReconnectData.betList[i];
                        this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair] + "分";
                    }
                }

                if(this.cardMode == 2 || this.isWatchCard == true)
                {
                    this.btnWatchCard.active = false;
                }else{
                    if(meGiveUp == true)
                    {
                        this.btnWatchCard.active = false;
                        // console.log("this.btnWatchCard.active = false;")
                    }
                    else{
                        this.btnWatchCard.active = true;
                        // console.log("this.btnWatchCard.active = true;")
                    }
                }

                this.allBetNum = curBetCount;
                this.showScorePool(this.allBetNum);
                this.gameBGNode.betItemListAddBet(confige.getCurChair(this.curBankerChair),this.allBetNum);

                var curPlayerChair = confige.getCurChair(confige.curReconnectData.roomInfo.curPlayer);
                this.changeArrow(curPlayerChair);
                if(this.isWatchCard == true)
                {
                    var curCardData = confige.curReconnectData.roomInfo.player[this.meChair].handCard;
                    for(var k in curCardData)
                    {
                        var index = parseInt(k);
                        this.gamePlayerNode.playerHandCardList[0].setCardWithIndex(index, curCardData[index].num, curCardData[index].type);
                    }
                }
                if(this.cardMode == 1 && this.isWatchCard == true)
                    this.changeBetNum(1);
                if(curPlayerChair == 0)
                {
                    this.showDoBtnLayer(confige.curReconnectData.roomInfo.curBet);
                    if(this.curRound != 2)
                        this.hideBtnCompare();
                }else{
                    this.hideDoBtnLayer();
                }
            }
        }
        if(this.isMingCardQZ)
        {
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                {
                    this.gamePlayerNode.cardItemList.activePlayer(confige.getCurChair(i));
                }
            }
            var curState = confige.curReconnectData.state;
            if(curState != 1005 && curState != 1001)
            {
                var robStateList = confige.curReconnectData.roomInfo.robState;
                for(var i in robStateList)
                {
                    if(robStateList[i] != -1)
                    {
                        if(robStateList[i] > this.curRobMaxNum)
                            this.curRobMaxNum = robStateList[i];
                    }
                }
                if(this.curRobMaxNum == 0)
                    this.curRobMaxNum = 1;
                this.robMaxNumNode.active = true;
                this.robMaxNumLabel.string = this.curRobMaxNum + ";<";
            }
            if(curState == 1005 || curState == 1002)
            {
                // this.newDisCard(4);
                var cardsCount = 0;
                for(var i in confige.curReconnectData.roomInfo.player)
                {
                    var curPlayerData = confige.curReconnectData.roomInfo.player[i]
                    if(curPlayerData.isActive == true && curPlayerData.isReady == true)
                    {
                        var curChair = confige.getCurChair(i);
                        this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithCount(4);
                        console.log("重连直接显示玩家盖着的牌" + i);
                        if(curPlayerData.handCard)
                        {
                            var callFunc = function(){
                                for(var i in callFunc.cards)
                                {
                                    this.gamePlayerNode.playerHandCardList[callFunc.curChair].setCardWithIndex(i, callFunc.cards[i].num, callFunc.cards[i].type);
                                }
                            };
                            callFunc.cards = curPlayerData.handCard;
                            callFunc.curChair = curChair;
                            this.scheduleOnce(callFunc,0.2);
                        }
                    }
                }
                if(curState == 1002)
                {
                    var betList = confige.curReconnectData.betList;
                    for(var i in betList)
                    {
                        if(i == this.meChair && i != this.curBankerChair && betList[i] == 0 && this.joinLate == false)
                        {
                            if(confige.curReconnectData.roomInfo.lastScore[this.meChair] > 0 && this.isAllowAllin)
                                this.robBetAllInBtn.interactable = true;

                            this.robBetBtnBox.active = true;
                            this.betBtnBox.active = false;
                        }
                    }   
                }else{
                    var robStateList = confige.curReconnectData.roomInfo.robState;
                    for(var i in robStateList)
                    {
                        this.gamePlayerNode.playerList[i].getChildByName("banker").active = false;
                        if(robStateList[i] != -1)
                        {
                            var curChair = confige.getCurChair(i);
                            if(robStateList[i] > this.curRobMaxNum)
                                this.curRobMaxNum = robStateList[i];
                            if(robStateList[i] == 0)
                                this.gamePlayerNode.noRobImgList[curChair].active = true;
                            else{
                                this.gamePlayerNode.robNumLabelList[curChair].string = ">?;"+robStateList[i];
                                this.gamePlayerNode.robNumNodeList[curChair].active = true;
                            }
                        }else{
                            if(parseInt(i) == this.meChair && this.joinLate == false)
                                this.robBtnBox.active = true;
                        }
                    }
                    // this.statusChange(2);
                }
            }   
        }

        confige.curReconnectData = -1;
    },

    connectCallBack:function(){

    },

        //炸金牛模式的处理
    initZhajinniuLayer:function(){
        console.log("炸金牛模式的处理 ！！！！！！！！！！！");
        this.zhajinniuLayer = this.node.getChildByName("zhajinniuLayer");

        this.doBtnLayer = this.zhajinniuLayer.getChildByName("doBtnLayer");
        this.zhaBetBtnBox = this.doBtnLayer.getChildByName("betBtnBox");
        this.btnAbandonCard = this.doBtnLayer.getChildByName("abandonCard");
        this.btnCompareCard = this.doBtnLayer.getChildByName("compareCard");
        this.btnWatchCard = this.zhajinniuLayer.getChildByName("watchCard");
        this.compareBtnBox = this.zhajinniuLayer.getChildByName("compareBtnBox");

        this.zhaBetList = {};
        this.zhaBetList[1] = this.zhaBetBtnBox.getChildByName("bet1");
        this.zhaBetList[2] = this.zhaBetBtnBox.getChildByName("bet2");
        this.zhaBetList[3] = this.zhaBetBtnBox.getChildByName("bet3");
        this.zhaBetList[4] = this.zhaBetBtnBox.getChildByName("bet4");
        this.zhaBetList[5] = this.zhaBetBtnBox.getChildByName("bet5");

        this.zhajinniuLayer.active = true;
        this.curRound = 0;
        this.isWatchCard = false;
        this.meGiveUp = false;

        this.lookCardList = {};
        this.giveUpList = {};
        this.loseList = {};
        for(var i=0;i<confige.playerMax;i++)
        {
            this.lookCardList[i] = false;
            this.giveUpList[i] = false;
            this.loseList[i] = false;
        }

        this.compareBtnList = {};
        this.compareBtnList[1] = this.compareBtnBox.getChildByName("compare1");
        this.compareBtnList[2] = this.compareBtnBox.getChildByName("compare2");
        this.compareBtnList[3] = this.compareBtnBox.getChildByName("compare3");
        this.compareBtnList[4] = this.compareBtnBox.getChildByName("compare4");
        this.compareBtnList[5] = this.compareBtnBox.getChildByName("compare5");

        this.loseNodeList = {};
        this.loseNodeList[0] = this.zhajinniuLayer.getChildByName("lose0");
        this.loseNodeList[1] = this.zhajinniuLayer.getChildByName("lose1");
        this.loseNodeList[2] = this.zhajinniuLayer.getChildByName("lose2");
        this.loseNodeList[3] = this.zhajinniuLayer.getChildByName("lose3");
        this.loseNodeList[4] = this.zhajinniuLayer.getChildByName("lose4");
        this.loseNodeList[5] = this.zhajinniuLayer.getChildByName("lose5");

        this.zhajinniuBasic = confige.roomData.basic;
        console.log("fuck 炸金牛基础分数"+this.zhajinniuBasic);
        this.gameInfoNode.roomTimeNode.active = false;
        this.roundTime = this.gameInfoNode.roomInfo.getChildByName("nowRound").getComponent("cc.Label");

        this.pkLayer = this.zhajinniuLayer.getChildByName("pkLayer");
        this.pk1 = this.pkLayer.getChildByName("pk1");
        this.pk2 = this.pkLayer.getChildByName("pk2");
        this.pk1Head = this.pk1.getChildByName("head").getComponent("cc.Sprite");
        this.pk1Name = this.pk1.getChildByName("name").getComponent("cc.Label");
        this.pk1Win = this.pk1.getChildByName("pkWin");
        this.pk1Lose = this.pk1.getChildByName("pkLose");
        this.pk2Head = this.pk2.getChildByName("head").getComponent("cc.Sprite");
        this.pk2Name = this.pk2.getChildByName("name").getComponent("cc.Label");
        this.pk2Win = this.pk2.getChildByName("pkWin");
        this.pk2Lose = this.pk2.getChildByName("pkLose");
        this.pkImg = this.pkLayer.getChildByName("pkImg");
    },

    setRoundTime:function(number){
        if(number == 0)
        {
            this.roundTime.string = "";
        }else{
            switch(number){
                case 1:
                this.roundTime.string = "第一轮";
                break;
                case 2:
                this.roundTime.string = "第二轮";
                break;
                case 3:
                this.roundTime.string = "第三轮";
                break;
                case 4:
                this.roundTime.string = "第四轮";
                break;
            };
        }
    },

    changeArrow:function(index){
        this.hideArrow();
        this.gamePlayerNode.isTurnImgList[index].active = true;
        this.gamePlayerNode.isTurnImgList[index].opacity = 255;
        this.gamePlayerNode.isTurnImgList[index].runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.3,100),cc.fadeTo(0.3,255))));
    },

    hideArrow:function(){
        for(var i=0;i<confige.playerMax;i++)
        {
            this.gamePlayerNode.isTurnImgList[i].stopAllActions();
            this.gamePlayerNode.isTurnImgList[i].active = false;
        }
    },

    showDoBtnLayer:function(curBet){
        this.doBtnLayer.active = true;
        for(var i=1;i<curBet;i++)
        {
            this.zhaBetList[i].getComponent("cc.Button").interactable = false;
        }
    },

    hideDoBtnLayer:function(){
        this.doBtnLayer.active = false;
        this.btnCompareCard.active = true;
        for(var i=1;i<=5;i++)
        {
            this.zhaBetList[i].getComponent("cc.Button").interactable = true;
        }
    },

    hideBtnCompare:function(){
        this.btnCompareCard.active = false;
    },

    showCompareLayer:function(){
        console.log("showCompareLayer begin");
        this.compareBtnBox.active = true;
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer.hasOwnProperty(i)){
                if(confige.roomPlayer[i] && confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                {
                    var curIndex = confige.getCurChair(i);
                    if(curIndex != 0 &&
                       this.giveUpList[curIndex] == false &&
                       this.loseList[curIndex] == false)
                    {
                        console.log("showCompareLayer" + i);
                        this.compareBtnList[curIndex].active = true;
                        this.gamePlayerNode.lightBgList[curIndex].active = true;
                        this.gamePlayerNode.lightBgList[curIndex].runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.5,100),cc.fadeTo(0.5,255))));
                    }
                }               
            }
        }
    },
    hideCompareLayer:function(){
        this.compareBtnBox.active = false;
        for(var i=1;i<confige.playerMax;i++)
        {
            this.compareBtnList[i].active = false;
            this.gamePlayerNode.lightBgList[i].stopAllActions();
            this.gamePlayerNode.lightBgList[i].active = false;
        }
    },
    changeBetNum:function(type){
        if(type == 0)
        {
            this.zhaBetList[1].getChildByName("Label").getComponent("cc.Label").string = 1;
            this.zhaBetList[2].getChildByName("Label").getComponent("cc.Label").string = 2;
            this.zhaBetList[3].getChildByName("Label").getComponent("cc.Label").string = 3;
            this.zhaBetList[4].getChildByName("Label").getComponent("cc.Label").string = 4;
            this.zhaBetList[5].getChildByName("Label").getComponent("cc.Label").string = 5;
        }else if(type == 1){
            this.zhaBetList[1].getChildByName("Label").getComponent("cc.Label").string = 2;
            this.zhaBetList[2].getChildByName("Label").getComponent("cc.Label").string = 4;
            this.zhaBetList[3].getChildByName("Label").getComponent("cc.Label").string = 6;
            this.zhaBetList[4].getChildByName("Label").getComponent("cc.Label").string = 8;
            this.zhaBetList[5].getChildByName("Label").getComponent("cc.Label").string = 10;
        }
    },

    onBtnClickZhaLayer:function(event, customEventData){
        console.log("clickIndex" + customEventData);
        var clickIndex = parseInt(customEventData);
        switch(clickIndex){
            //下注按钮
            case 1:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 1});
                this.hideDoBtnLayer();
                break;
            case 2:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 2});
                this.hideDoBtnLayer();
                break;
            case 3:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 3});
                this.hideDoBtnLayer();
                break;
            case 4:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 4});
                this.hideDoBtnLayer();
                break;
            case 5:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 5});
                this.hideDoBtnLayer();
                break;
            //下注之外的操作
            case 11:    //弃牌
                pomelo.clientSend("useCmd",{"cmd" : "giveUp"});
                this.hideDoBtnLayer();
                break;
            case 12:    //比牌
                this.showCompareLayer();
                break;
            case 13:    //看牌
                pomelo.clientSend("useCmd",{"cmd" : "look"});
                break;  
            //比牌选择座位按钮
            case 21:
                console.log("compare with chair ===== " + confige.getOriChair(1));
                pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(1)});
                this.hideCompareLayer();
                this.hideDoBtnLayer();
                break;
            case 22:
                console.log("compare with chair ===== " + confige.getOriChair(2));
                pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(2)});
                this.hideCompareLayer();
                this.hideDoBtnLayer();
                break;
            case 23:
                console.log("compare with chair ===== " + confige.getOriChair(3));
                pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(3)});
                this.hideCompareLayer();
                this.hideDoBtnLayer();
                break;
            case 24:
                console.log("compare with chair ===== " + confige.getOriChair(4));
                pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(4)});
                this.hideCompareLayer();
                this.hideDoBtnLayer();
                break;
            case 25:
                console.log("compare with chair ===== " + confige.getOriChair(5));
                pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(5)});
                this.hideCompareLayer();
                this.hideDoBtnLayer();
                break;
        }
    },

    onServerZhaCall:function(data){
        switch(data.cmd){
            case "curRound":
                console.log("当前进行到第" + data.curRound + "轮");
                this.curRound = data.curRound;
                this.setRoundTime((this.curRound+1));
                //this.hideArrow();
                this.hideDoBtnLayer();
                switch(this.curRound){
                    case 0:
                        if(this.joinLate == false)
                            this.newDisCard(3);
                        for(var i in confige.roomPlayer)
                        {
                            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                            {
                                console.log("显示玩家暗牌");
                                var curChair = confige.getCurChair(i);
                                
                                if(this.cardMode == 2)
                                {
                                    this.gamePlayerNode.playerCardList[this.meChair] = data.cards;
                                    var curCardData = data.cards[i];
                                    var callFunc = function(){
                                        console.log("显示玩家明牌");
                                        for(var j in callFunc.curCardData)
                                        {
                                            var index = parseInt(j);
                                            this.gamePlayerNode.playerHandCardList[callFunc.curChair].setCardWithIndex(index, callFunc.curCardData[index].num, callFunc.curCardData[index].type);
                                        }
                                    };
                                    callFunc.curCardData = curCardData;
                                    callFunc.curChair = curChair;
                                    this.scheduleOnce(callFunc,0.5);
                                }
                            }
                        }
                        break;
                    case 1:
                        if(this.joinLate == false)
                            this.newDisCard(1);
                        for(var i in confige.roomPlayer)
                        {
                            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                            {
                                var curChair = confige.getCurChair(i);
                                if(this.giveUpList[curChair] == false && (this.joinLate == true || this.onReConnect == true))
                                    this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(3);
                            }
                        }
                        console.log("this.lookCardList[this.meChair]===" + this.lookCardList[this.meChair]);
                        if(this.cardMode == 2 && this.meGiveUp == false)
                        {
                            console.log(this.gamePlayerNode.playerCardList[this.meChair]);
                            if(data.card)
                            {
                                this.gamePlayerNode.playerCardList[this.meChair][3] = data.card;
                                var callFunc2 = function(){
                                    this.showOpenCard(1);
                                };
                                this.scheduleOnce(callFunc2,0.3);
                            }
                        }
                        if(this.lookCardList[this.meChair])
                        {
                            if(data.card)
                            {
                                var callFunc = function(){
                                    this.gamePlayerNode.playerHandCardList[confige.getCurChair(this.meChair)].setCardWithIndex(3, callFunc.data.card.num, callFunc.data.card.type);
                                }
                                callFunc.data = data;
                                this.scheduleOnce(callFunc,0.5);
                            }
                        }
                        break;
                    case 2:
                        if(this.joinLate == false)
                            this.newDisCard(1);
                        for(var i in confige.roomPlayer)
                        {
                            if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                            {
                                var curChair = confige.getCurChair(i);
                                if(this.giveUpList[curChair] == false && (this.joinLate == true || this.onReConnect == true))
                                    this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(4);
                           }
                        }
                        console.log("this.lookCardList[this.meChair]===" + this.lookCardList[this.meChair]);
                        
                        if(this.cardMode == 2 && this.meGiveUp == false)
                        {
                            console.log(this.gamePlayerNode.playerCardList[this.meChair]);
                            if(data.card)
                            {
                                this.gamePlayerNode.playerCardList[this.meChair][4] = data.card;
                                var callFunc2 = function(){
                                    if(this.joinLate == false)
                                        this.showOpenCard(2);
                                };
                                this.scheduleOnce(callFunc2,0.3);
                            }
                        }
                        if(this.lookCardList[this.meChair])
                        {
                            if(data.card)
                            {
                                var callFunc = function(){
                                    this.gamePlayerNode.playerHandCardList[confige.getCurChair(this.meChair)].setCardWithIndex(4, callFunc.data.card.num, callFunc.data.card.type);
                                }
                                callFunc.data = data;
                                this.scheduleOnce(callFunc,0.5);
                            }
                        }
                        break;
                    case 3:
                        break;
                }
                break;
            case "nextPlayer":
                console.log("当前进行操作的玩家座位是" + data.chair);
                var curChair = confige.getCurChair(data.chair);
                this.changeArrow(curChair);                
                if(curChair == 0)
                {
                    if(this.zhajinniuRoundTime > 10)
                    {
                        var self = this;
                        self.timeCallFunc = function(){
                            console.log("nextPlayer.timeCallFunc!!!!!!!!!!!!!!");
                            self.timerItem.setTime(10);
                        };
                        this.scheduleOnce(self.timeCallFunc, (this.zhajinniuRoundTime-10));
                        console.log("this.timerItem.scheduleOnce");   
                    }else{
                        this.timerItem.setTime(this.zhajinniuRoundTime);
                    }
                    
                    this.showGameStatus(2);
                    this.showDoBtnLayer(data.curBet);
                    
                    if(this.curRound != 2)
                        this.hideBtnCompare();
                }else{
                    if(this.timeCallFunc != -1)
                    {
                        this.timerItem.hideTimer();
                        this.unschedule(this.timeCallFunc);
                    }
                    this.showGameStatus(4);
                    this.hideDoBtnLayer();
                }
                break; 
            case "lookCard":
                var curChair = confige.getCurChair(data.chair);
                this.gamePlayerNode.watchCardImgList[curChair].active = true;
                if(data.handCard)
                {
                    if(curChair == 0)
                    {
                        this.lookCardList[this.meChair] = true;
                        this.isWatchCard = true;
                        this.changeBetNum(1);
                        this.btnWatchCard.active = false;
                        this.hideOpenCard(1);
                        this.hideOpenCard(2);
                    }
                    for(var l in data.handCard)
                    {
                        var index = parseInt(l);
                        this.gamePlayerNode.playerHandCardList[curChair].setCardWithIndex(index, data.handCard[index].num, data.handCard[index].type);
                    }

                }
                break;
            case "compare":
                var fromChair = confige.getCurChair(data.chair);
                var targetChair = confige.getCurChair(data.target);
                var curWinChair = confige.getCurChair(data.winPlayer);
                var curLoseChair = (fromChair == curWinChair) ? targetChair : fromChair;

                this.showPK(data.chair,data.target,data.winPlayer);
                if(curLoseChair == 0)
                {
                    this.meGiveUp = true;
                    this.hideOpenCard(1);
                    this.hideOpenCard(2);
                }
                this.loseList[curLoseChair] = true;
                this.loseNodeList[curLoseChair].active = true;
                this.gamePlayerNode.watchCardImgList[curLoseChair].active = false;
                this.gamePlayerNode.failureImgList[curLoseChair].active = true;
                this.gamePlayerNode.cardItemList.deActivePlayer(curLoseChair);
                if(data.handCard)
                {
                    this.gamePlayerNode.playerCardList[this.meChair] = data.handCard;
                    this.gamePlayerNode.showOneCard(this.meChair);
                    this.btnWatchCard.active = false;
                }
                break;
            case "giveUp":
                var curChair = confige.getCurChair(data.chair);
                this.giveUpList[curChair] = true;
                this.loseNodeList[curChair].active = true;
                this.gamePlayerNode.watchCardImgList[curChair].active = false;
                this.gamePlayerNode.discardImgList[curChair].active = true;
                this.gamePlayerNode.cardItemList.deActivePlayer(curChair);
                if(curChair == 0)
                {
                    this.btnWatchCard.active = false;
                    this.timerItem.hideTimer();
                    this.meGiveUp = true;
                    this.hideOpenCard(1);
                    this.hideOpenCard(2);
                }
                for(var g in data.handCard)
                {
                    var index = parseInt(g);
                    if(data.handCard[g])
                        this.gamePlayerNode.playerHandCardList[0].setCardWithIndex(index, data.handCard[index].num, data.handCard[index].type);
                }
                break;
            }   
    },

    onNewGameStart:function(){
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true)
            {
                if(confige.roomPlayer[i].isReady == true)
                {
                    console.log("激活"+i+"号玩家发牌器");
                    this.gamePlayerNode.cardItemList.activePlayer(confige.getCurChair(i));
                }
                this.gamePlayerNode.playerList[confige.getCurChair(i)].getChildByName("banker").active = false;
            }
        }
        this.gameBegin = true;
        this.gameStart = true;
        this.meGiveUp = false;
        this.newResetCard();
        console.log("onNewGameStart");
        this.gameInfoNode.roomCurTime ++;
        this.gameInfoNode.roomTime.string = "第" + this.gameInfoNode.roomCurTime + "/" + this.gameInfoNode.roomMaxTime + "局";
        for(var i=0;i<confige.playerMax;i++)
        {
            this.gamePlayerNode.playerList[i].getChildByName("isReady").active = false;
        }
        this.gameInfoNode.btn_inviteFriend.active = false;
        // this.gameInfoNode.btn_close.interactable = false;
        this.gamePlayerNode.playerCount = this.gamePlayerNode.newPlayerCount;
        this.gamePlayerNode.noShowCardCount = this.gamePlayerNode.playerCount;
        if(confige.roomData.gameMode != 3)
            this.showScorePool(0);
    },

    onNewGameBegin:function(data){
        this.gameStart = true;
        this.gamePlayerNode.playerCount = this.gamePlayerNode.newPlayerCount;
        console.log("onNewGameBegin" + this.gamePlayerNode.playerCount);
        this.allBetNum = 0;
        if(this.isZhajinniu)
        {
            this.changeBetNum(0);
            this.isWatchCard = false;
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true)
                {
                    var curChair = confige.getCurChair(i);
                    console.log("onNewGameBegin" + curChair + "score===" + data.betList[i]);

                    this.gamePlayerNode.playerList[curChair].getChildByName("isReady").active = false;
                    this.gamePlayerNode.betNumNodeList[curChair].active = true;
                    this.gamePlayerNode.curBetNumList[curChair] = data.betList[i];
                    this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair].toString() + "分";
                    this.allBetNum += data.betList[i];

                    // this.playerScoreList[i] -= this.zhajinniuBasic;
                    // this.playerInfoList[confige.getCurChair(i)].setScore(this.playerScoreList[i]);
                }
            }
            if(this.cardMode == 1)
            {
                this.btnWatchCard.active = true;
            }
        }
        if(this.isMingCardQZ)
        {
            this.newDisCard(4);
            var cardsCount = 0;
            for(var i in data.player)
            {
                if(data.player[i].isActive == true && data.player[i].isReady == true && data.player[i].handCard)
                {
                    var curChair = confige.getCurChair(i);
                    var callFunc = function(){
                        for(var i in callFunc.cards)
                        {
                            this.gamePlayerNode.playerHandCardList[callFunc.curChair].setCardWithIndex(i, callFunc.cards[i].num, callFunc.cards[i].type);
                        }
                    };
                    callFunc.cards = data.player[i].handCard;
                    callFunc.curChair = curChair;
                    this.scheduleOnce(callFunc,0.5);
                }
            }
        }
        this.showScorePool(this.allBetNum);
    },

    update: function (dt) {
        confige.CallGVoicePoll();
    },

    newDisCard:function(times){
        if(times == 1)
            this.gamePlayerNode.cardItemList.disCardOneRound();
        else
            this.gamePlayerNode.cardItemList.disCardWithRoundTime(times);
    },

    newResetCard:function(){
        this.gamePlayerNode.cardItemList.resetCardList();
        for(var i in confige.roomPlayer)
        {
            if(confige.roomPlayer[i].isActive == true)
            {
                if(confige.roomPlayer[i].isReady == true)
                    this.gamePlayerNode.cardItemList.activePlayer(confige.getCurChair(i));
            }
        }
    },

    showPK:function(player1,player2,win){
        this.pkLayer.active = true;
        this.pk1.x = -700;
        this.pk2.x = 700;
        this.pk1.opacity = 255;
        this.pk2.opacity = 255;
        this.pkLayer.opacity = 255;
        this.pkImg.opacity = 255;
        this.pk1Win.opacity = 255;
        this.pk2Win.opacity = 255;
        this.pk1Win.active = false;
        this.pk2Win.active = false;
        this.pk1Lose.active = false;
        this.pk2Lose.active = false;

        this.pk1Name.string = confige.roomPlayer[player1].playerInfo.nickname;
        this.pk2Name.string = confige.roomPlayer[player2].playerInfo.nickname;
        this.pk1Head.spriteFrame = confige.WXHeadFrameList[confige.getCurChair(player1)+1];
        this.pk2Head.spriteFrame = confige.WXHeadFrameList[confige.getCurChair(player2)+1];

        var action1 = cc.moveTo(0.3,cc.p(0,0));
        var action2 = cc.fadeOut(0.3);

        var hideCallBack = function(){
            this.hidePK();
        };

        if(player1 == win)
        {
            // this.pk1Win.active = true;
            // this.pk2Lose.active = true;
            this.pk1.runAction(cc.sequence(cc.moveTo(0.3,cc.p(-250,0)),cc.delayTime(1),action1));
            this.pk2.runAction(cc.sequence(cc.moveTo(0.3,cc.p(250,0)),cc.delayTime(1),action2));
        }else{
            // this.pk2Win.active = true;
            // this.pk1Lose.active = true;
            this.pk1.runAction(cc.sequence(cc.moveTo(0.3,cc.p(-250,0)),cc.delayTime(1),action2));
            this.pk2.runAction(cc.sequence(cc.moveTo(0.3,cc.p(250,0)),cc.delayTime(1),action1));
        }

        this.scheduleOnce(hideCallBack,2);

        var hidePkImg = function(){
            this.pkImg.runAction(cc.fadeOut(0.5));
            if(player1 == win)
            {
                this.pk1Win.active = true;
            }else{
                this.pk2Win.active = true;
            }
        };
        this.scheduleOnce(hidePkImg,1);
    },

    hidePK:function(){
        var hideCallBack = cc.callFunc(function () {
            this.pkLayer.active = false;
        }, this);
        this.pkLayer.runAction(cc.sequence(cc.fadeOut(0.5),hideCallBack));
    },

    showOpenCard:function(index){
        this.openCardBox.active = true;
        var moveAction = cc.repeatForever(cc.sequence(cc.moveBy(0.5,cc.p(0,20)),cc.moveBy(0.5,cc.p(0,-20))));
        if(index == 1)
        {
            this.openCardBtn1.active = true;
            this.openCardImg1.active = true;
            this.openCardImg1.y = -280;
            this.openCardImg1.runAction(moveAction);
        }else if(index == 2){
            this.openCardBtn2.active = true;
            this.openCardImg2.active = true;
            this.openCardImg2.y = -280;
            this.openCardImg2.runAction(moveAction);
        }
    },

    hideOpenCard:function(index){
        this.openCardBox.active = true;
        if(index == 1)
        {
            this.openCardBtn1.active = false;
            this.openCardImg1.active = false;            
            this.openCardImg1.stopAllActions();
        }else if(index == 2){
            this.openCardBtn2.active = false;
            this.openCardImg2.active = false;            
            this.openCardImg2.stopAllActions();
        }
    },

    btnOpenCard:function(event,customEventData){
        var index = parseInt(customEventData);
        if(index == 1)
        {
            this.hideOpenCard(1);
            this.gamePlayerNode.playerHandCardList[confige.getCurChair(this.meChair)].setCardWithIndex(3, this.gamePlayerNode.playerCardList[this.meChair][3].num, this.gamePlayerNode.playerCardList[this.meChair][3].type);
        }else if(index == 2){
            this.hideOpenCard(2);
            this.gamePlayerNode.playerHandCardList[confige.getCurChair(this.meChair)].setCardWithIndex(4, this.gamePlayerNode.playerCardList[this.meChair][4].num, this.gamePlayerNode.playerCardList[this.meChair][4].type);
        }
    },

    openShare:function(){
        if(confige.curOverLayer != -1)
            confige.curOverLayer.openShare();
    },

    WXCancle:function(){
        if(confige.curOverLayer != -1)
            confige.curOverLayer.openShare();
    },

    onSliderMove:function(slider, customEventData){
        var curPercent = this.betSlider.progress;
        this.betSliderLight.fillRange = curPercent;

        this.curSliderNum = Math.floor(this.curSliderNumMin + (this.curSliderNumMax-this.curSliderNumMin)*curPercent);
        this.curSliderNumLabel.string = this.curSliderNum;
    },

    showSlider:function(min,max){
        var sub = max - min;        
        for(var i=0;i<6;i++)
            this.betSliderNumList[i].string = (min + sub*0.2*i).toFixed(1);

        this.curSliderNumMin = min;
        this.curSliderNumMax = max;
        this.curSliderNum = min;
        this.curSliderNumLabel.string = this.curSliderNum;
        this.betSlider.progress = 0;
        this.betSliderLight.fillRange = 0;
        this.betBtnBoxS.active = true;
    },

    initMingCardQZ:function(){
        this.isAllowAllin = true;
        this.isAllowAllin = confige.roomData.allowAllin;

        this.isMingCardQZ = true;
        this.mingcardqzLayer = this.node.getChildByName("mingcardqzLayer");
        this.mingcardqzLayer.active = true;
        this.robBtnBox = this.mingcardqzLayer.getChildByName("robBtnBox");
        this.robBetBtnBox = this.mingcardqzLayer.getChildByName("betBtnBox");
        this.mpqzBetNum1 = 0;
        this.mpqzBetNum2 = 0;
        this.mpqzBetNum2 = 0;
        switch(this.mingcardqzBasicType)
        {
            case 1:
                this.mpqzBetNum1 = 1;
                this.mpqzBetNum2 = 2;
                break;
            case 2:
                this.mpqzBetNum1 = 2;
                this.mpqzBetNum2 = 4;
                break;
            case 3:
                this.mpqzBetNum1 = 4;
                this.mpqzBetNum2 = 8;
                break;
            case 4:
                this.mpqzBetNum1 = 1;
                this.mpqzBetNum2 = 3;
                this.mpqzBetNum3 = 5;
                this.robBetBtnBox.getChildByName("bet3").active = true;
                this.robBetBtnBox.getChildByName("bet1").x = -225;
                this.robBetBtnBox.getChildByName("bet2").x = -75;
                this.robBetBtnBox.getChildByName("bet3").x = 75;
                this.robBetBtnBox.getChildByName("bet4").x = 225;
                break;
            case 5:
                this.mpqzBetNum1 = 2;
                this.mpqzBetNum2 = 4;
                this.mpqzBetNum3 = 6;
                this.robBetBtnBox.getChildByName("bet3").active = true;
                this.robBetBtnBox.getChildByName("bet1").x = -225;
                this.robBetBtnBox.getChildByName("bet2").x = -75;
                this.robBetBtnBox.getChildByName("bet3").x = 75;
                this.robBetBtnBox.getChildByName("bet4").x = 225;
                break;
        }
        this.robBetBtnBox.getChildByName("bet1").getChildByName("Label").getComponent("cc.Label").string = this.mpqzBetNum1;
        this.robBetBtnBox.getChildByName("bet2").getChildByName("Label").getComponent("cc.Label").string = this.mpqzBetNum2;
        this.robBetBtnBox.getChildByName("bet3").getChildByName("Label").getComponent("cc.Label").string = this.mpqzBetNum3;
        this.curRobMaxNum = 0;
        this.robBetAllInBtn = this.robBetBtnBox.getChildByName("bet4").getComponent("cc.Button");
        this.robMaxNumNode = this.gameBGNode.mainBg.getChildByName("curRobNum");
        this.robMaxNumLabel = this.robMaxNumNode.getChildByName("robMaxNum").getComponent("cc.Label");

        this.robBetNumNode = this.robMaxNumNode.getChildByName("curBet");
        this.robBetNumLabel = this.robBetNumNode.getChildByName("robBetNum").getComponent("cc.Label");
        if(this.isAllowAllin == false)
        {
            this.robBetBtnBox.getChildByName("bet4").active = false;
            console.log("不允许推注！！！！！！");
        }
    },

    btnClickRobBox:function(event,customEventData){
        var index = parseInt(customEventData);
        switch(index){
            case 1:
                pomelo.clientSend("useCmd",{"cmd" : "robBanker","num" : 1});
                break;
            case 2:
                pomelo.clientSend("useCmd",{"cmd" : "robBanker","num" : 2});
                break;
            case 3:
                pomelo.clientSend("useCmd",{"cmd" : "robBanker","num" : 3});
                break;
            case 4:
                pomelo.clientSend("useCmd",{"cmd" : "robBanker","num" : 4});
                break;
            case 0:
                pomelo.clientSend("useCmd",{"cmd" : "robBanker","num" : 0});
                break;
            case 11:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : this.mpqzBetNum1});
                break;
            case 12:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : this.mpqzBetNum2});
                break;
            case 13:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : this.mpqzBetNum3});
            case 14:
                pomelo.clientSend("useCmd",{"cmd" : "allIn"});
                break;
        }
        this.robBtnBox.active = false;
        this.robBetBtnBox.active = false;
        this.robBetAllInBtn.interactable = false;
    },

    showReConnect:function(){
        gameData.gameInfoNode.showReConnect();
        console.log("showReConnect!!!!!!!!!");
    },

    hideReConnect:function(){
        gameData.gameInfoNode.hideReConnect();
        console.log("hideReConnect!!!!!!!!!");
    },

    sayWithID:function(voiceID){
        pomelo.clientSend("say",{"msg": {"sayType":255, "id": voiceID, "time": this.gameInfoNode.sayTime}});
    },

    loadRes1:function(){
        var self = this;
        var onLoadNext = false;
        var loadCard = false;
        var loadNiutype = false;
        //cardFrame
        cc.loader.loadRes("prefabs/game/cardNode", cc.Prefab, function (err, prefabs) {
            var newNode = cc.instantiate(prefabs);
            self.resNode.addChild(newNode);
            confige.cardFrameMap[0] = newNode.getChildByName("card_00").getComponent("cc.Sprite").spriteFrame;
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
                    confige.cardFrameMap[index] = newNode.getChildByName("card_"+j+t).getComponent("cc.Sprite").spriteFrame;
                }
            }
            loadCard = true;
            if(loadCard == true && loadNiutype == true)
            {
                if(onLoadNext == false)
                {
                    onLoadNext = true;
                    self.loadLater();
                    self.startLater();
                    self.loadRes2();
                }
            }
        });
        
        
        //niutypeFrame
        cc.loader.loadRes("prefabs/game/niutypeNode", cc.Prefab, function (err, prefabs) {
            var newNode = cc.instantiate(prefabs);
            self.resNode.addChild(newNode);
            for(var i=0;i<=18;i++)
            {
                var spriteFrame = newNode.getChildByName("niu_"+i).getComponent("cc.Sprite").spriteFrame;
                confige.niuTypeFrameMap[i] = spriteFrame;
                if(i <= 10){
                    confige.niuTypeFrameMapFK[i] = spriteFrame;
                }else{
                    switch(i){
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
            loadNiutype = true;
            if(loadCard == true && loadNiutype == true)
            {
                if(onLoadNext == false)
                {
                    onLoadNext = true;
                    self.loadLater();
                    self.startLater();
                    self.loadRes2();
                }
            }
        });
    },

    loadRes2:function(){
        var self = this;
        //faceFrame
        cc.loader.loadRes("prefabs/game/faceNode", cc.Prefab, function (err, prefabs) {
            var newNode = cc.instantiate(prefabs);
            self.resNode.addChild(newNode);
            for(var i=1;i<=12;i++)
            {
                confige.faceFrameMap[i-1] = newNode.getChildByName(""+i).getComponent("cc.Sprite").spriteFrame;
            }
            confige.loadFaceFrame = true;
        });
        //faceAni
        cc.loader.loadRes("prefabs/game/faceAniNode", cc.Prefab, function (err, prefabs) {
            var newNode = cc.instantiate(prefabs);
            self.resNode.addChild(newNode);
            for(var i=1;i<=6;i++)
                confige.faceAniMap[i] = newNode.getChildByName("faceAni"+i);
            confige.loadFaceAni = true;
        });

        this.initAudio();
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

        cc.loader.loadRes("sound/new/sendBet",function(err, audio){
                confige.audioList["sendBet"] = audio;
        });
        cc.loader.loadRes("sound/new/getBet",function(err, audio){
                confige.audioList["getBet"] = audio;
        });
    },
});