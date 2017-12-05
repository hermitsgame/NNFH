var gameData = require("gameData");
var confige = require("confige");
var sanKungLogic = require("sanKungLogic");
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
        this.isSanKung = true;
        
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
                }
            }
        });
        var playerNodeStr = "";
        if(confige.playerMax == 6)
            playerNodeStr = "sanKungPlayerNode";
        else
            playerNodeStr = "sanKungPlayerNode9";
        cc.loader.loadRes("prefabs/game/sanKung/"+playerNodeStr, cc.Prefab, function (err, prefabs) {
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
                }
            }
            self.oldPlayer.active = false;
        });
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
        
        this.betNumMax = 20;
        this.niuniuBetType = 1;
        if(confige.roomData.roomType == "sanKung")
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

    },

    startLater: function () {
        this.gamePlayerNode.onStart();

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
                            this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithCount(3);
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
                    console.log("fuck onBtnReadyClicked !!!!!!!!!");
                    this.readyBtn.active = false;
                }
                this.btnCanSend = true;
            }.bind(this));
            
        }
    },
    
    onBtnBetClicked:function(event, customEventData){
        //pomelo.clientSend("bet",{"bet":1});
        var betType = parseInt(customEventData);
        var curBetNum = 1;
        curBetNum = betType + 1;
        var self = this;
        pomelo.clientSend("bet",{"bet": curBetNum},function(){
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
        this.showGameStatus(1);
        if(this.joinLate == false)
        {
            this.pushBanker.active = true;
            this.unpushBanker.active = true;
        }
        console.log("fuck rob banker");
    },
    
    onServerRobBankerReturn:function(data){
        var curChair = confige.getCurChair(data.chair);
            if(data.flag == 1)
            {
                this.gamePlayerNode.isRobImgList[curChair].active = true;
            }else if(data.flag == 2){
                this.gamePlayerNode.noRobImgList[curChair].active = true;
            } 
    },

    statusChange:function(index){
        if(index === 1)
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
                if(i != bankerChair)
                {
                    this.gamePlayerNode.betNumLabelList[curIndex].string = "0" + "分";
                    this.gamePlayerNode.curBetNumList[curIndex] = 0;
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
        console.log("onServerBeginBetting333333");
        if(this.joinLate == false)
        {
            this.pushBanker.active = false;
            this.unpushBanker.active = false;
            if(this.curBankerChair != this.meChair)
            {   
                this.betBtnBox.active = true;
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
        }else{
            console.log("onServerDealCard333333");
            this.newDisCard(3);
             if(this.joinLate == false)
            {
                var curChair = confige.getCurChair(this.meChair);
                var curCardData = this.gamePlayerNode.playerCardList[this.meChair];
                var callFunc = function(){
                    console.log("显示玩家明牌");
                    for(var j=0;j<2;j++)
                    {
                        var index = parseInt(j);
                        this.gamePlayerNode.playerHandCardList[callFunc.curChair].setCardWithIndex(index, callFunc.curCardData[index].num, callFunc.curCardData[index].type);
                    }
                    if(this.gameStart == true)
                    {
                        this.showOpenCard(2);
                    }
                };
                callFunc.curCardData = curCardData;
                callFunc.curChair = curChair;
                this.scheduleOnce(callFunc,0.5);
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
        }
    },

    btn_showMyCard:function(){
        pomelo.clientSend("showCard");
        this.showCardBtn.active = false;

        var handCard = this.gamePlayerNode.playerCardList[this.meChair];
        var curNiuType = 0;
        curNiuType = sanKungLogic.getType(handCard);
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
        this.statusChange(0);

        console.log("onServerSettlement 222222222");
        //第一步显示玩家手牌
        for(var i in data.result)
        {
            if(data.result.hasOwnProperty(i))
            {
                this.gamePlayerNode.showOneCard(i);
            }
        }
        console.log("onServerSettlement 33333333");
        this.waitForSettle = true;
        this.showCardBtn.active = false;
        this.gameStart = false;
        this.joinLate = false;
        this.gameInfoNode.btn_close.interactable = true;
        this.timerItem.hideTimer();

        for(var i in confige.roomPlayer)
        {            
            if(confige.roomPlayer[i].isActive == true)            
            {
                confige.roomPlayer[i].isReady = false;
            }
            this.gamePlayerNode.isTurnImgList[i].active = false;
        }

        //分割筹码
        console.log("分割筹码");
        console.log(data.curScores);
        
        if(this.gameMode == 1)
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
                    
                    self.gameInfoNode.settleLayer.addOneSettle(confige.roomData.player[i].playerInfo.nickname, niuType, data.curScores[i],2,data.player[i].handCard,i);
                    // self.gameInfoNode.settleLayer.addOneSettle(confige.roomData.player[i].playerInfo.nickname, niuType, data.curScores[i],2);
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
        this.scheduleOnce(showSettleFunc2,1.5);
    },

    resetScene:function(){
        this.pushBanker.active = false;
        this.unpushBanker.active = false;
        this.popBanker.active = false;
        this.readyBtn.active = true;
        this.showCardBtn.active = false;
        this.betBtnBox.active = false;
        this.timerItem.active = false;
    },

    //根据重连数据重现游戏状态
    recoverGame:function(){
        this.onReConnect = true;
        if(confige.curReconnectData.state == 1100){
            gameData.gameInfoNode.btn_continue.active = true;
            this.readyBtn.active = false;
            this.gameInfoNode.btn_inviteFriend.active = false;
            return;
        }
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
                this.gamePlayerNode.playerScoreList[i] = confige.curReconnectData.roomInfo.player[i].score;
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
        //重现下注金额
        this.gameInfoNode.roomCurTime = confige.curReconnectData.roomInfo.gameNumber;
        this.gameInfoNode.roomTime.string = "第" + this.gameInfoNode.roomCurTime + "/" + this.gameInfoNode.roomMaxTime + "局";
        if(confige.curReconnectData.state != 1001)
        {
            if(confige.curReconnectData.state != 1005)
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
            }
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
                    this.betBtnBox.active = true;
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
                this.showMingCard(confige.curReconnectData.roomInfo.player[this.meChair].handCard);
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

        confige.curReconnectData = -1;
    },

    connectCallBack:function(){

    },

    onNewGameStart:function(){
        if(this.gameInfoNode.settleLayerLoad != -1 && this.gameInfoNode.settleLayer.onShow == true){
            this.gameInfoNode.settleLayer.hideNoClick();
            if(this.isZhajinniu)
            {
                for(var i=0;i<confige.playerMax;i++)
                {
                    this.lookCardList[i] = false;
                    this.giveUpList[i] = false;
                    this.loseList[i] = false;
                    this.loseNodeList[i].active = false;
                    this.gamePlayerNode.watchCardImgList[i].active = false;
                    this.gamePlayerNode.failureImgList[i].active = false;
                    this.gamePlayerNode.discardImgList[i].active = false;
                }
            }
            this.showCardBtn.active = false;
            if(this.gameMode != 3)
                this.gameBGNode.betItemListClean();
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
        if(confige.roomPlayer[this.meChair].isReady == false)
            this.joinLate = true;
        this.readyBtn.active = false;

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
            this.gamePlayerNode.playerHandCardList[confige.getCurChair(this.meChair)].setCardWithIndex(1, this.gamePlayerNode.playerCardList[this.meChair][1].num, this.gamePlayerNode.playerCardList[this.meChair][1].type);
        }else if(index == 2){
            this.hideOpenCard(2);
            this.gamePlayerNode.playerHandCardList[confige.getCurChair(this.meChair)].setCardWithIndex(2, this.gamePlayerNode.playerCardList[this.meChair][2].num, this.gamePlayerNode.playerCardList[this.meChair][2].type);
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

    readyBegin:function(time){
        this.timerItem.setTime(parseInt(time/1000)); 
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
        cc.loader.loadRes("prefabs/game/sanKung/sanKungTypeNode", cc.Prefab, function (err, prefabs) {
            var newNode = cc.instantiate(prefabs);
            self.resNode.addChild(newNode);
            for(var i=0;i<=12;i++)
            {
                var spriteFrame = newNode.getChildByName("niu_"+i).getComponent("cc.Sprite").spriteFrame;
                confige.sanKungTypeFrameMap[i] = spriteFrame;
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

        for(var i=0;i<=12;i++)
        {
            cc.loader.loadRes("sound/sankuang/f" + i,function(index){
                return  function (err, audio) {
                    var curIndex = "female_" + "sankuang_type_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));

            cc.loader.loadRes("sound/sankuang/m" + i,function(index){
                return  function (err, audio) {
                    var curIndex = "male_" + "sankuang_type_" + index;
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