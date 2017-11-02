var gameData = require("gameData");
var confige = require("confige");
var ZhaJinHuaLogic = require("ZhaJinHuaLogic");
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

        this.time_rob = 10;
        this.time_betting = 10;
        this.time_settlement = 10;

        this.meChair = 0;
        this.curBankerChair = -1;
        
        this.isJinHua = true;
        this.curBet = confige.roomData.curBet;
        this.jinHuaMaxBet = confige.roomData.maxBet;
        this.jinHuaMaxRound = confige.roomData.maxRound;
        this.jinHuaStuffyRound = confige.roomData.stuffyRound;

        this.scorePoolNew = this.node.getChildByName("gameBGNode").getChildByName("mainNode").getChildByName("scorePoolNew");
        this.scoreRoundLabel = this.scorePoolNew.getChildByName("scoreRound").getComponent("cc.Label");
        this.scoreAllLabel = this.scorePoolNew.getChildByName("scoreAll").getComponent("cc.Label");
        this.roundLabel = this.scorePoolNew.getChildByName("round").getComponent("cc.Label");

        this.joinState = confige.roomData.state;
        this.gameBegin = false;     //本房间游戏开始
        this.gameStart = false;     //当前局游戏开始
        this.joinLate = false;
        

        this.timerItem = this.node.getChildByName("timerItem").getComponent("timerItem");
        this.timerItem.onInit();
        this.zhajinniuRoundTime = Math.ceil(confige.roomData.TID_ZHAJINHUA/1000);

        this.allBetNum = 0;
        this.myBetNum = 0;
        
        this.readyBtn = this.node.getChildByName("btn_ready");
        this.showCardBtn = this.node.getChildByName("btn_showMyCard");
        
        this.betNumMax = 20;
        this.niuniuBetType = 1;

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
        
        if(this.isJinHua == true)
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

                if(this.isJinHua == true)
                {
                    this.curBet = confige.roomData.curBet;
                    this.changeBetNum(this.curBet);
                    this.curRound = confige.roomData.curRound;
                    if(this.curRound > this.jinHuaStuffyRound)
                        this.btnWatchCard.getComponent("cc.Button").interactable = true;
                    this.setRoundTime(this.curRound);
                    this.scoreRoundLabel.string = this.curBet;
                    this.roundLabel.string = this.curRound;

                    var curBetCount = 0;
                    for(var i in confige.roomPlayer)
                    {
                        if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                        {   
                            var curChair = confige.getCurChair(i);

                            this.gamePlayerNode.playerHandCardList[curChair].resetCard();
                            for(var j=0;j<3;j++)
                                this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(j);

                            if(confige.roomData.player[i].isShowCard == true)
                            {
                                this.lookCardList[curChair] = true;
                                this.gamePlayerNode.watchCardImgList[curChair].active = true;
                            }

                            if(confige.roomData.player[i].state == 1)
                            {
                                this.loseList[curChair] = true;
                                this.loseNodeList[curChair].active = true;
                                this.giveUpList[curChair] = true;
                                this.gamePlayerNode.discardImgList[curChair].active = true;
                                this.gamePlayerNode.watchCardImgList[curChair].active = false;
                            }
                            if(confige.roomData.player[i].state == 2)
                            {
                                this.loseList[curChair] = true;
                                this.loseNodeList[curChair].active = true;
                                this.gamePlayerNode.watchCardImgList[curChair].active = false;
                                this.gamePlayerNode.failureImgList[curChair].active = true;
                                this.gamePlayerNode.cardItemList.deActivePlayer(curChair);
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
        this.scorePoolNew.active = true;
        this.scoreAllLabel.string = score;
        this.gameBGNode.scorePoolNum = parseInt(score);

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

    compareBet:function(betNum, chair){

        this.gameBGNode.betItemListAddBet(chair,betNum);
        if(this.isJinHua)
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

        this.showScorePool(this.allBetNum,1);
        this.gamePlayerNode.curBetNumList[chair] += betNum;
        this.gamePlayerNode.betNumLabelList[chair].string = this.gamePlayerNode.curBetNumList[chair].toString() + "分";
    },

    addBet:function(betNum, chair){
        if(confige.soundEnable == true)
        {
            var oriChair = confige.getOriChair(chair);
            var betNumNew = betNum;
            if(this.lookCardList[oriChair] == true)
                betNumNew = betNumNew/2;
            if(betNumNew <= this.curBet)
            {
                console.log("play@@@@@fffflooooowww!!!!!!")
                var curSex = 0;
                curSex = parseInt(confige.roomPlayer[oriChair].playerInfo.sex);
                var curMusicIndex = 1;
                if(this.curRound != 1)
                    curMusicIndex += parseInt(Math.random()*2);

                console.log("curMusicIndex===="+curMusicIndex);
                if(curSex == 2)
                    confige.playSoundByName("f_follow"+curMusicIndex);
                else
                    confige.playSoundByName("m_follow"+curMusicIndex);
            }else{
                console.log("play@@@@@addddddddd!!!!!!")
                var curSex = 0;
                curSex = parseInt(confige.roomPlayer[oriChair].playerInfo.sex);
                if(curSex == 2)
                    confige.playSoundByName("f_add");
                else
                    confige.playSoundByName("m_add");
            }
            confige.playSoundByName("sendBet");
        }

        this.gameBGNode.betItemListAddBet(chair,betNum);
        if(this.isJinHua)
        {
            this.allBetNum += betNum;
            this.gamePlayerNode.curBetNumList[chair] += betNum;
            this.gamePlayerNode.betNumLabelList[chair].string = this.gamePlayerNode.curBetNumList[chair].toString() + "分";
            this.showScorePool(this.allBetNum,1);
            return;
        }
        // this.allBetNum = this.allBetNum + betNum;
        // if(chair == 0)
        //     this.myBetNum = this.myBetNum + betNum;

        // this.showScorePool(this.allBetNum,1);
        // this.gamePlayerNode.curBetNumList[chair] += betNum;
        // this.gamePlayerNode.betNumLabelList[chair].string = this.gamePlayerNode.curBetNumList[chair].toString() + "分";
    },

    onBtnReadyClicked:function(){
        if(this.btnCanSend)
        {
            this.btnCanSend = false;
            pomelo.request("connector.entryHandler.sendData", {"code" : "ready"}, function(data) {
                console.log("flag is : "+ data.flag);
                if(data.flag == true)
                {
                    if(this.isJinHua)
                    {
                        this.scorePoolNew.active = false;
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
    },
    
    onBtnPushBankerClicked:function(event,customEventData){
       
    },
    
    onBtnPopBankerClicked:function(){
       
    },

    downBanker:function(data){
        
    },
    
    onServerRobBanker:function(){
        
    },
    
    onServerRobBankerReturn:function(data){
        
    },

    statusChange:function(index){
        if(this.isJinHua)
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
        
        if(chair == 0)      //当前玩家自己
        {
            console.log("000000000号玩家准备");
            this.showCardBtn.active = false;
            this.joinLate = false;

            this.gameBGNode.betItemListClean();
            this.showGameStatus(5);
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
                if(this.isJinHua == false)
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
    },

    onServerDealCard:function(handCards){
    },

    btn_showMyCard:function(){
    },
    
    showMingCard:function(cards){
    },

    onServerSettlement:function(data){
        if(this.timeCallFunc != -1)
        {
            this.timerItem.hideTimer();
            this.unschedule(this.timeCallFunc);
        }
        this.hideOpenCard(1);
        this.hideOpenCard(2);
        this.hideGameStatus();
        console.log("onServerSettlement 1111111");
        if(this.isJinHua)
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
        if(this.isJinHua)
        {
            this.gamePlayerNode.showOneCard(this.meChair);
            if(data.compareList[this.meChair] != null)
            {
                console.log("compareList 存在队列@@@@@");
                for(var p in data.compareList[this.meChair])
                    this.gamePlayerNode.showOneCard(data.compareList[this.meChair][p]);
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
        if(this.isJinHua == true)
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

        console.log("onServerSettlement 4444444");
        //第二步延迟显示结算界面
        var self = this;
        var showSettleFunc1 = function(){
            self.gameInfoNode.settleLayer.show(data.curScores[self.meChair]);
            for(var i in data.result)
            {
                if(data.result.hasOwnProperty(i))
                {
                    var isDiscard = false;
                    var isFailure = false;
                    var isShow = false;
                    var niuType = 100;
                    if(self.isJinHua)
                    {
                        if(data.player[i])
                        {
                            if(data.player[i].state == 1)
                            {
                                console.log(i + "号玩家弃牌了");
                                niuType = 100;
                                isDiscard = true;
                            }
                            if(data.player[i].state == 2)
                            {
                                console.log(i + "号玩家比牌失败");
                                niuType = 100;
                                isFailure = true;
                            }
                        }
                        if(data.compareList[self.meChair] != null)
                        {
                            console.log("compareList 存在队列@@@@@");
                            for(var p in data.compareList[self.meChair]){
                                if(data.compareList[self.meChair][p] == i)
                                {
                                    isShow = true;
                                    niuType = data.result[i].type;
                                }
                            }
                        }
                        if(i == self.meChair)
                        {
                            isShow = true;
                            niuType = data.result[i].type;
                        }
                    }

                    self.gameInfoNode.settleLayer.addOneSettleJinHua(confige.roomData.player[i].playerInfo.nickname, niuType, data.curScores[i],data.player[i].handCard,isDiscard,isFailure,isShow,i);
                    self.gamePlayerNode.playerScoreList[i] = data.realScores[i];
                    self.gamePlayerNode.playerInfoList[confige.getCurChair(i)].setScore(self.gamePlayerNode.playerScoreList[i]);
                }
            }
            
            console.log("onServerSettlement 55555555");
            // if(self.gameInfoNode.roomCurTime < self.gameInfoNode.roomMaxTime)
                // self.gameInfoNode.roomCurTime ++;
            // self.gameInfoNode.roomTime.string = "第" + self.gameInfoNode.roomCurTime + "/" + self.gameInfoNode.roomMaxTime + "局";
            
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
        if(this.isJinHua)
            this.scheduleOnce(showSettleFunc2,2.5);
    },

    resetScene:function(){
        this.readyBtn.active = true;
        this.showCardBtn.active = false;
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

        this.curBet = confige.curReconnectData.roomInfo.curBet;
        this.changeBetNum(this.curBet);
        this.curRound = confige.curReconnectData.roomInfo.curRound;
        if(this.curRound > this.jinHuaStuffyRound)
            this.btnWatchCard.getComponent("cc.Button").interactable = true;
        this.setRoundTime(this.curRound);
        this.scoreRoundLabel.string = this.curBet;
        this.roundLabel.string = this.curRound;
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
                this.gamePlayerNode.playerScoreList[i] = confige.curReconnectData.roomInfo.player[i].score;// - confige.curReconnectData.betList[i];
                // if(this.isJinHua)
                    // this.playerScoreList[i] -= this.zhajinniuBasic;
                this.gamePlayerNode.playerInfoList[confige.getCurChair(i)].setScore(this.gamePlayerNode.playerScoreList[i]);
                if(confige.curReconnectData.roomInfo.player[i].isBanker == true)
                {
                    this.gamePlayerNode.playerList[confige.getCurChair(i)].getChildByName("banker").active = true;
                    this.gamePlayerNode.lightBgList[confige.getCurChair(i)].active = true;
                    this.curBankerChair = i;//confige.getCurChair(i);
                    console.log("重连时庄家==="+this.curBankerChair);

                }
            }
        }
        //重现下注金额
        this.gameInfoNode.roomCurTime = confige.curReconnectData.roomInfo.gameNumber;
        this.gameInfoNode.roomTime.string = "第" + this.gameInfoNode.roomCurTime + "/" + this.gameInfoNode.roomMaxTime + "局";
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
                break;
            case 1006:
                break;
        }

        if(this.gameInfoNode.roomCurTime != 0)
        {
            this.gameInfoNode.btn_inviteFriend.active = false;
            this.gameBegin = true;
        }else{
            console.log("fuck roomCurTime === " + this.roomCurTime);
        }

        console.log("this.gameBegin======??????" + this.gameBegin);

        if(this.isJinHua)
        {
            if(confige.curReconnectData.state == 1001)
            {
                confige.curReconnectData = -1;
                return;
            }
            console.log("特殊处理炸金牛的重连");
            console.log("this.playerCount ===== " + this.gamePlayerNode.playerCount);
            if(this.isJinHua == true)
            {
                this.hideDoBtnLayer();
                this.curRound = confige.curReconnectData.roomInfo.curRound;
                this.setRoundTime(this.curRound);
                var curBetCount = 0;
                var meGiveUp = false;
                for(var i in confige.roomPlayer)
                {
                    if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                    {
                        var curChair = confige.getCurChair(i);
                        this.gamePlayerNode.playerHandCardList[curChair].resetCard();
                        for(var j=0;j<3;j++)
                            this.gamePlayerNode.playerHandCardList[curChair].showCardBackWithIndex(j);

                        if(confige.curReconnectData.roomInfo.player[i].isShowCard == true)
                        {
                            this.lookCardList[curChair] = true;
                            this.gamePlayerNode.watchCardImgList[curChair].active = true;
                            if(curChair == 0){
                                this.isWatchCard = true;
                            }
                        }
                        if(confige.curReconnectData.roomInfo.player[i].state == 1)
                        {
                            this.loseList[curChair] = true;
                            this.loseNodeList[curChair].active = true;
                            this.giveUpList[curChair] = true;
                            this.gamePlayerNode.discardImgList[curChair].active = true;
                            this.gamePlayerNode.watchCardImgList[curChair].active = false;
                            if(curChair == 0 && this.joinLate == false)
                                meGiveUp = true;
                        }
                        if(confige.curReconnectData.roomInfo.player[i].state == 2)
                        {
                            this.loseList[curChair] = true;
                            this.loseNodeList[curChair].active = true;
                            this.gamePlayerNode.watchCardImgList[curChair].active = false;
                            this.gamePlayerNode.failureImgList[curChair].active = true;
                            this.gamePlayerNode.cardItemList.deActivePlayer(curChair);
                        }
                        if(confige.curReconnectData.roomInfo.player[i].state == 1 || confige.curReconnectData.roomInfo.player[i].state == 2)
                        {
                            if(i == this.meChair && this.joinLate == false)
                            {
                                if(confige.curReconnectData.roomInfo.player[i].handCard)
                                {
                                    this.gamePlayerNode.playerCardList[this.meChair] = confige.curReconnectData.roomInfo.player[i].handCard;
                                    this.gamePlayerNode.showOneCard(this.meChair);
                                }
                            }
                        }
                        curBetCount += confige.curReconnectData.betList[i];
                        this.gamePlayerNode.curBetNumList[curChair] = confige.curReconnectData.betList[i];
                        this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair] + "分";
                    }
                }

                if(this.isWatchCard == true)
                {
                    this.btnWatchCard.active = false;
                }else{
                    if(confige.roomPlayer[this.meChair].isActive == true && confige.roomPlayer[this.meChair].isReady == true)
                    {
                        if(meGiveUp == true)
                        {
                            this.btnWatchCard.active = false;
                        }
                        else{
                            this.btnWatchCard.active = true;
                        }
                    }else{
                        this.btnWatchCard.active = false;
                    }
                }

                this.allBetNum = curBetCount;
                this.showScorePool(this.allBetNum);
                this.gameBGNode.betItemListAddBet(confige.getCurChair(this.curBankerChair),this.allBetNum);

                var curPlayerChair = confige.getCurChair(confige.curReconnectData.roomInfo.curPlayer);
                this.changeArrow(curPlayerChair);

                if(this.curRound > this.jinHuaStuffyRound)
                    this.btnWatchCard.getComponent("cc.Button").interactable = true;
                else
                    this.btnWatchCard.getComponent("cc.Button").interactable = false;
                if(this.isWatchCard == true)
                {
                    this.changeBetNum(this.curBet);
                    var curCardData = confige.curReconnectData.roomInfo.player[this.meChair].handCard;
                    for(var k in curCardData)
                    {
                        var index = parseInt(k);
                        this.gamePlayerNode.playerHandCardList[0].setCardWithIndex(index, curCardData[index].num, curCardData[index].type);
                    }
                }

                if(curPlayerChair == 0)
                {
                    if(this.curRound == this.jinHuaMaxRound)
                        this.showDoBtnLayer(0,true);
                    else
                        this.showDoBtnLayer();
                    if(this.curRound < 3)
                        this.hideBtnCompare();
                }else{
                    this.hideDoBtnLayer();
                    this.showGameStatus(4);
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
        if(confige.playerMax == 6)
        {
            this.compareBtnBox = this.zhajinniuLayer.getChildByName("compareBtnBox");
            this.loseNode = this.zhajinniuLayer.getChildByName("loseNode");
        }else{
            this.compareBtnBox = this.zhajinniuLayer.getChildByName("compareBtnBox9");
            this.loseNode = this.zhajinniuLayer.getChildByName("loseNode9");
        }

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
        for(var i=1;i<confige.playerMax;i++)
            this.compareBtnList[i] = this.compareBtnBox.getChildByName("compare"+i);

        this.loseNodeList = {};
        for(var i=0;i<confige.playerMax;i++)
            this.loseNodeList[i] = this.loseNode.getChildByName("lose"+i);

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
            this.roundTime.string = "第"+number+"轮";
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

    showDoBtnLayer:function(curBet,hideBet){
        this.doBtnLayer.active = true;
        if(hideBet == true){
            for(var i=1;i<=3;i++)
                this.zhaBetList[i].getComponent("cc.Button").interactable = false;
        }
        return;
    },

    hideDoBtnLayer:function(){
        this.doBtnLayer.active = false;
        this.btnCompareCard.active = true;
        for(var i=1;i<=3;i++)
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
        var compareCount = 0;
        var compareChair = {};
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
                        compareChair = curIndex;
                        compareCount ++;
                        console.log("compare +++++++++@@@@@@@@@ =====")
                    }
                }
            }
        }
        if(compareCount == 1)
        {
            console.log("compare with chair 123123123123===== " + confige.getOriChair(compareChair));
            pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(compareChair)});
            this.hideCompareLayer();
            this.hideDoBtnLayer();
        }else{
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

    changeBetNum:function(basicScore){
        this.zhaBetList[2].getChildByName("Label").getComponent("cc.Label").string = (basicScore+1);
        this.zhaBetList[3].getChildByName("Label").getComponent("cc.Label").string = (basicScore+2);
        if(this.isWatchCard == true)
        {
            this.zhaBetList[1].getChildByName("double").active = true;
            this.zhaBetList[2].getChildByName("double").active = true;
            this.zhaBetList[3].getChildByName("double").active = true;
        }else{
            this.zhaBetList[1].getChildByName("double").active = false;
            this.zhaBetList[2].getChildByName("double").active = false;
            this.zhaBetList[3].getChildByName("double").active = false;
        }

        if((basicScore+1) > this.jinHuaMaxBet)
            this.zhaBetList[2].active = false;
        else
            this.zhaBetList[2].active = true;
        if((basicScore+2) > this.jinHuaMaxBet)
            this.zhaBetList[3].active = false;
        else
            this.zhaBetList[3].active = true;
        // if(type == 0)
        // {
        //     this.zhaBetList[1].getChildByName("Label").getComponent("cc.Label").string = 1;
        //     this.zhaBetList[2].getChildByName("Label").getComponent("cc.Label").string = 2;
        //     this.zhaBetList[3].getChildByName("Label").getComponent("cc.Label").string = 3;
        //     this.zhaBetList[4].getChildByName("Label").getComponent("cc.Label").string = 4;
        //     this.zhaBetList[5].getChildByName("Label").getComponent("cc.Label").string = 5;
        // }else if(type == 1){
        //     this.zhaBetList[1].getChildByName("Label").getComponent("cc.Label").string = 2;
        //     this.zhaBetList[2].getChildByName("Label").getComponent("cc.Label").string = 4;
        //     this.zhaBetList[3].getChildByName("Label").getComponent("cc.Label").string = 6;
        //     this.zhaBetList[4].getChildByName("Label").getComponent("cc.Label").string = 8;
        //     this.zhaBetList[5].getChildByName("Label").getComponent("cc.Label").string = 10;
        // }
    },

    onBtnClickZhaLayer:function(event, customEventData){
        console.log("clickIndex@@@@Zha" + customEventData);
        var self = this;
        var clickIndex = parseInt(customEventData);
        switch(clickIndex){
            //下注按钮
            case 1:
                pomelo.clientSend("useCmd",{"cmd" : "gen"},function(){
                    self.hideDoBtnLayer();
                });
                break;
            case 2:
                pomelo.clientSend("useCmd",{"cmd" : "addOne"},function(){
                    self.hideDoBtnLayer();
                });
                break;
            case 3:
                pomelo.clientSend("useCmd",{"cmd" : "addTwo"},function(){
                    self.hideDoBtnLayer();
                });
                break;
            case 4:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 4},function(){
                    self.hideDoBtnLayer();
                });
                break;
            case 5:
                pomelo.clientSend("useCmd",{"cmd" : "bet","bet" : 5},function(){
                    self.hideDoBtnLayer();
                });
                break;
            //下注之外的操作
            case 11:    //弃牌
                pomelo.clientSend("useCmd",{"cmd" : "giveUp"},function(){
                    self.hideDoBtnLayer();
                });
                break;
            case 12:    //比牌
                this.showCompareLayer();
                break;
            case 13:    //看牌
                pomelo.clientSend("useCmd",{"cmd" : "look"});
                break;  
            // //比牌选择座位按钮
            // case 21:
            //     console.log("compare with chair ===== " + confige.getOriChair(1));
            //     pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(1)},function(){
            //         self.hideDoBtnLayer();
            //         self.hideCompareLayer();
            //     });
            //     break;
            // case 22:
            //     console.log("compare with chair ===== " + confige.getOriChair(2));
            //     pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(2)},function(){
            //         self.hideDoBtnLayer();
            //         self.hideCompareLayer();
            //     });
            //     break;
            // case 23:
            //     console.log("compare with chair ===== " + confige.getOriChair(3));
            //     pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(3)},function(){
            //         self.hideDoBtnLayer();
            //         self.hideCompareLayer();
            //     });
            //     break;
            // case 24:
            //     console.log("compare with chair ===== " + confige.getOriChair(4));
            //     pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(4)},function(){
            //         self.hideDoBtnLayer();
            //         self.hideCompareLayer();
            //     });
            //     break;
            // case 25:
            //     console.log("compare with chair ===== " + confige.getOriChair(5));
            //     pomelo.clientSend("useCmd",{"cmd" : "compare","target" : confige.getOriChair(5)},function(){
            //         self.hideDoBtnLayer();
            //         self.hideCompareLayer();
            //     });
            //     break;
        }
        if(clickIndex > 20 && clickIndex < 30)
        {
            var curChair = confige.getOriChair(clickIndex-20);
            console.log("compare with chair ===== " + curChair);
            pomelo.clientSend("useCmd",{"cmd" : "compare","target" : curChair},function(){
                self.hideDoBtnLayer();
                self.hideCompareLayer();
            });
        }

    },

    onServerZhaCall:function(data){
        switch(data.cmd){
            case "curRound":
                console.log("当前进行到第" + data.curRound + "轮");
                this.curRound = data.curRound;
                this.setRoundTime(this.curRound);
                //this.hideArrow();
                this.hideDoBtnLayer();
                switch(this.curRound){
                    case 0:
                        if(this.joinLate == false)
                            this.newDisCard(3);
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
                        if(this.meGiveUp == false)
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
                        
                        if(this.meGiveUp == false)
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
                this.timerItem.hideTimer();
                if(confige.soundEnable == true)
                {
                    confige.playSoundByName("soundNext");
                }
                this.curRound = data.curRound;
                this.curBet = data.curBet;
                this.scoreRoundLabel.string = this.curBet;
                this.roundLabel.string = this.curRound;

                if(this.curRound > this.jinHuaStuffyRound)
                    this.btnWatchCard.getComponent("cc.Button").interactable = true;
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
                            if(confige.soundEnable == true)
                            {
                                confige.playSoundByName("soundTimeOut");
                            }
                        };
                        this.scheduleOnce(self.timeCallFunc, (this.zhajinniuRoundTime-10));
                        console.log("this.timerItem.scheduleOnce");   
                    }else{
                        this.timerItem.setTime(this.zhajinniuRoundTime);
                    }
                    
                    this.showGameStatus(2);
                    this.changeBetNum(this.curBet);
                    if(this.curRound == this.jinHuaMaxRound)
                        this.showDoBtnLayer(0,true);
                    else
                        this.showDoBtnLayer();
                    
                    if(this.curRound < 3)
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
                this.setRoundTime(data.curRound);
                break; 
            case "lookCard":
                var curChair = confige.getCurChair(data.chair);
                this.gamePlayerNode.watchCardImgList[curChair].active = true;
                this.lookCardList[data.chair] = true;
                if(confige.soundEnable == true)
                {
                    var curSex = 0;
                    curSex = parseInt(confige.roomPlayer[data.chair].playerInfo.sex);
                    var curMusicIndex = 1;
                    curMusicIndex += parseInt(Math.random()*2);
                    if(curSex == 2)
                        confige.playSoundByName("f_watch"+curMusicIndex);
                    else
                        confige.playSoundByName("m_watch"+curMusicIndex);  
                }

                if(data.handCard)
                {
                    if(curChair == 0)
                    {
                        this.isWatchCard = true;
                        this.changeBetNum(this.curBet);
                        this.btnWatchCard.active = false;
                        this.hideOpenCard(1);
                        this.hideOpenCard(2);
                    }
                    for(var l in data.handCard)
                    {
                        var index = parseInt(l);
                        this.gamePlayerNode.playerHandCardList[curChair].setCardWithIndex(index, data.handCard[index].num, data.handCard[index].type);
                    }

                    if(confige.soundEnable == true)
                    {
                        var callFunc = function(){
                            var curSex = 0;
                            if(confige.roomPlayer[data.chair].playerInfo)
                                curSex = parseInt(confige.roomPlayer[data.chair].playerInfo.sex);
                            var type = ZhaJinHuaLogic.getType(data.handCard).type;
                            console.log("zhajinhua 123123123123 type@@@@===",ZhaJinHuaLogic.getType(data.handCard).type)
                            console.log(confige.audioList);
                            if(gameData.gameMainScene.isJinHua)
                            {
                                console.log("3123123123");
                                console.log("type ====== "+ type);
                                if(curSex == 2)
                                {
                                    confige.playSoundByName("female_jinhua_type_"+type);
                                }else{
                                    confige.playSoundByName("male_jinhua_type_"+type);
                                }
                            }
                        }
                        this.scheduleOnce(callFunc,0.75);
                    }
                }
                    
                break;
            case "compare":
                var fromChair = confige.getCurChair(data.chair);
                var targetChair = confige.getCurChair(data.target);
                var curWinChair = confige.getCurChair(data.winPlayer);
                console.log("fromChair === "+fromChair);
                console.log("targetChair === "+targetChair);
                console.log("curWinChair === "+curWinChair);
                var curLoseChair = (fromChair == curWinChair) ? targetChair : fromChair;

                if(confige.soundEnable == true)
                {
                    var curSex = 0;
                    curSex = parseInt(confige.roomPlayer[data.chair].playerInfo.sex);
                    if(curSex == 2)
                        confige.playSoundByName("f_bipai");
                    else
                        confige.playSoundByName("m_bipai");  
                }

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

                if(confige.soundEnable == true)
                {
                    var curSex = 0;
                    curSex = parseInt(confige.roomPlayer[data.chair].playerInfo.sex);
                    var curMusicIndex = 1 + parseInt(Math.random()*3);
                    if(curSex == 2)
                        confige.playSoundByName("f_giveup"+curMusicIndex);
                    else
                        confige.playSoundByName("m_giveup"+curMusicIndex);
                }

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
                    this.gamePlayerNode.playerCardList[this.meChair] = data.handCard;
                    this.gamePlayerNode.showOneCard(this.meChair);
                    // var index = parseInt(g);
                    // if(data.handCard[g])
                        // this.gamePlayerNode.playerHandCardList[0].setCardWithIndex(index, data.handCard[index].num, data.handCard[index].type);
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
        
        this.showScorePool(0);

        this.allBetNum = 0;
        if(this.isJinHua)
        {
            // this.changeBetNum(0);
            this.isWatchCard = false;
            for(var i in confige.roomPlayer)
            {
                if(confige.roomPlayer[i].isActive == true && confige.roomPlayer[i].isReady == true)
                {
                    var curChair = confige.getCurChair(i);
                    console.log("onNewGameBegin" + curChair + "score===" + this.zhajinniuBasic);

                    this.gamePlayerNode.playerList[curChair].getChildByName("isReady").active = false;
                    this.gamePlayerNode.betNumNodeList[curChair].active = true;
                    this.gamePlayerNode.curBetNumList[curChair] = this.zhajinniuBasic;
                    this.gamePlayerNode.betNumLabelList[curChair].string = this.gamePlayerNode.curBetNumList[curChair].toString() + "分";
                    this.allBetNum += this.zhajinniuBasic;
                }
            }
            this.btnWatchCard.active = true;
            this.btnWatchCard.getComponent("cc.Button").interactable = false;
            this.showScorePool(this.allBetNum);
            this.newDisCard(3);
        }
    },

    onNewGameBegin:function(data){
        this.gameStart = true;
        this.gamePlayerNode.playerCount = this.gamePlayerNode.newPlayerCount;
        console.log("onNewGameBegin" + this.gamePlayerNode.playerCount);
    },

    update: function (dt) {
        confige.CallGVoicePoll();
    },

    newDisCard:function(times){
        if(confige.soundEnable == true)
        {
            confige.playSoundByName("fapai");
        }
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
        cc.loader.loadRes("prefabs/game/jinHua/jinHuaTypeNode", cc.Prefab, function (err, prefabs) {
            var newNode = cc.instantiate(prefabs);
            self.resNode.addChild(newNode);
            for(var i=0;i<=5;i++)
            {
                var spriteFrame = newNode.getChildByName("niu_W"+i).getComponent("cc.Sprite").spriteFrame;
                var spriteFrame2 = newNode.getChildByName("niu_L"+i).getComponent("cc.Sprite").spriteFrame;
                confige.jinHuaTypeFrameMap[i] = spriteFrame;
                confige.jinHuaTypeFrameMap[i+10] = spriteFrame2;
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

        for(var i=0;i<=5;i++)
        {
            cc.loader.loadRes("sound/jinhua/f" + i,function(index){
                return  function (err, audio) {
                    var curIndex = "female_" + "jinhua_type_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));

            cc.loader.loadRes("sound/jinhua/m" + i,function(index){
                return  function (err, audio) {
                    var curIndex = "male_" + "jinhua_type_" + index;
                    confige.audioList[curIndex] = audio;
                }
            }(i));
        }

        cc.loader.loadRes("sound/fapai", function (err, audio) {
            confige.audioList["fapai"] = audio;
        });

        cc.loader.loadRes("sound/new/f_add",function(err, audio){
                confige.audioList["f_add"] = audio;
        });
        cc.loader.loadRes("sound/new/m_add",function(err, audio){
                confige.audioList["m_add"] = audio;
        });
        cc.loader.loadRes("sound/new/f_follow1",function(err, audio){
                confige.audioList["f_follow1"] = audio;
        });
        cc.loader.loadRes("sound/new/m_follow1",function(err, audio){
                confige.audioList["m_follow1"] = audio;
        });
        cc.loader.loadRes("sound/new/f_follow2",function(err, audio){
                confige.audioList["f_follow2"] = audio;
        });
        cc.loader.loadRes("sound/new/m_follow2",function(err, audio){
                confige.audioList["m_follow2"] = audio;
        });
        cc.loader.loadRes("sound/new/f_giveup1",function(err, audio){
                confige.audioList["f_giveup1"] = audio;
        });
        cc.loader.loadRes("sound/new/m_giveup1",function(err, audio){
                confige.audioList["m_giveup1"] = audio;
        });
        cc.loader.loadRes("sound/new/f_giveup2",function(err, audio){
                confige.audioList["f_giveup2"] = audio;
        });
        cc.loader.loadRes("sound/new/m_giveup2",function(err, audio){
                confige.audioList["m_giveup2"] = audio;
        });
        cc.loader.loadRes("sound/new/f_giveup3",function(err, audio){
                confige.audioList["f_giveup3"] = audio;
        });
        cc.loader.loadRes("sound/new/m_giveup3",function(err, audio){
                confige.audioList["m_giveup3"] = audio;
        });
        cc.loader.loadRes("sound/new/f_watch1",function(err, audio){
                confige.audioList["f_watch1"] = audio;
        });
        cc.loader.loadRes("sound/new/m_watch1",function(err, audio){
                confige.audioList["m_watch1"] = audio;
        });
        cc.loader.loadRes("sound/new/f_watch2",function(err, audio){
                confige.audioList["f_watch2"] = audio;
        });
        cc.loader.loadRes("sound/new/m_watch2",function(err, audio){
                confige.audioList["m_watch2"] = audio;
        });
        cc.loader.loadRes("sound/new/f_bipai",function(err, audio){
                confige.audioList["f_bipai"] = audio;
        });
        cc.loader.loadRes("sound/new/m_bipai",function(err, audio){
                confige.audioList["m_bipai"] = audio;
        });

        cc.loader.loadRes("sound/new/sendBet",function(err, audio){
                confige.audioList["sendBet"] = audio;
        });
        cc.loader.loadRes("sound/new/getBet",function(err, audio){
                confige.audioList["getBet"] = audio;
        });
        cc.loader.loadRes("sound/new/soundNext",function(err, audio){
                confige.audioList["soundNext"] = audio;
        });
        cc.loader.loadRes("sound/new/soundTimeOut",function(err, audio){
                confige.audioList["soundTimeOut"] = audio;
        });
    },
});