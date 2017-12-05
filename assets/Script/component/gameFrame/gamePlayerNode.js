var gameData = require("gameData");
var confige = require("confige");
var FKLogic = require("FengKuangLogic");
var sanKungLogic = require("sanKungLogic");
var ZhaJinHuaLogic = require("ZhaJinHuaLogic");
var SpecialLogic = require("SpecialNiuNiuLogic");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
    },
    
    onInit:function(){
        gameData.gamePlayerNode = this;
        this.meChair = 0;
        this.noShowCardCount = 0;       //当前有多少人开牌
        this.playerCount = 0;           //当前参与游戏的人数,加入新玩家时该数字不会变,等新的一局开始时才会改变
        this.newPlayerCount = 0;
        this.playerList = {};
        // this.playerList[0] = this.node.getChildByName("GamePlayer1");
        // this.playerList[1] = this.node.getChildByName("GamePlayer2");
        // this.playerList[2] = this.node.getChildByName("GamePlayer3");
        // this.playerList[3] = this.node.getChildByName("GamePlayer4");
        // this.playerList[4] = this.node.getChildByName("GamePlayer5");
        // this.playerList[5] = this.node.getChildByName("GamePlayer6");
        for(var i=0;i<confige.playerMax;i++)
            this.playerList[i] = this.node.getChildByName("GamePlayer"+(i+1));
        
        this.playerActiveList = {};
        this.playerCardList = {};
        this.playerHandCardList = {};
        this.playerInfoList = {};
        
        this.playerScoreList = {};
        this.niuTypeBoxList = {};
        for(var i=0;i<confige.playerMax;i++)
        {
            this.playerActiveList[i] = false;
            this.playerScoreList[i] = 0;
            this.playerHandCardList[i] = this.playerList[i].getChildByName("HandCards").getComponent("handCards");
            this.playerHandCardList[i].onInit();    
            this.playerInfoList[i] = this.playerList[i].getChildByName("Player").getComponent("playerInfo");
            this.playerInfoList[i].onInit();
            this.niuTypeBoxList[i] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox"+(i+1));
        }
        console.log(this.playerInfoList);
        this.playerInfoList[0].setName(confige.userInfo.nickname);
        this.playerInfoList[0].setScore("");

        
        // this.niuTypeBoxList[0] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox1");
        // this.niuTypeBoxList[1] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox2");
        // this.niuTypeBoxList[2] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox3");
        // this.niuTypeBoxList[3] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox4");
        // this.niuTypeBoxList[4] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox5");
        // this.niuTypeBoxList[5] = this.node.getChildByName("niuTypeList").getChildByName("niuTypeBox6");

        this.betNumNodeList = {};
        this.betNumLabelList = {};
        this.curBetNumList = {};
        this.isRobImgList = {};
        this.noRobImgList = {};
        this.lightBgList = {};
        this.watchCardImgList = {};
        this.failureImgList = {};
        this.discardImgList = {};
        this.isTurnImgList = {};
        this.leaveNodeList = {};
        this.robNumNodeList = {};
        this.robNumLabelList = {};
        
        for(var i=0;i<confige.playerMax;i++)
        {
            this.betNumNodeList[i] = this.playerList[i].getChildByName("betNode");
            this.betNumLabelList[i] = this.betNumNodeList[i].getChildByName("betNum").getComponent("cc.Label");
            this.curBetNumList[i] = 0;
            this.isRobImgList[i] = this.playerList[i].getChildByName("isRob");
            this.noRobImgList[i] = this.playerList[i].getChildByName("noRob");
            this.lightBgList[i] = this.playerList[i].getChildByName("lightBg");
            this.watchCardImgList[i] = this.playerList[i].getChildByName("watchCard");
            this.failureImgList[i] = this.playerList[i].getChildByName("failure");
            this.discardImgList[i] = this.playerList[i].getChildByName("discard");
            this.isTurnImgList[i] = this.playerList[i].getChildByName("isTurn");
            this.leaveNodeList[i] = this.playerList[i].getChildByName("leaveNode");
            this.robNumNodeList[i] = this.playerList[i].getChildByName("headRobNumBg");
            this.robNumLabelList[i] = this.robNumNodeList[i].getChildByName("robNum").getComponent("cc.Label");
        }

        this.cardItemList = this.node.getChildByName("cardList").getComponent("cardList");
        this.cardItemList.onInit();
        // if(confige.roomData.roomType == "sanKung")
        // {
        //     this.cardItemList.onInit("sanKung");
        // }else if(confige.roomData.roomType == "zhajinhua"){
        //     this.cardItemList.onInit("jinHua");
        // }else{
        //     this.cardItemList.onInit("niuniu");
        // }

        this.userInfoBtnList = this.node.getChildByName("userInfoBtnList");
        this.selectHead = -1;

        this.sayBoxList = {};
        this.sayBoxLabelNodeList = {};
        this.sayBoxLabelList = {};
        this.sayNode = this.node.getChildByName("sayList");
        for(var i=0;i<confige.playerMax;i++)
        {
            this.sayBoxList[i] = this.sayNode.getChildByName("sayBox"+(i+1));
        }
        
        for(var i=0;i<confige.playerMax;i++)
        {
            this.sayBoxLabelNodeList[i] = this.sayBoxList[i].getChildByName("text");
            this.sayBoxLabelList[i] = this.sayBoxLabelNodeList[i].getComponent("cc.Label");
        }
        if(confige.playerMax == 6)  //对右边的玩家聊天框进行镜像翻转
        {
            this.sayBoxList[1].rotationY = 180;
            this.sayBoxLabelNodeList[1].rotationY = 180;
        }else{
            this.sayBoxList[1].rotationY = 180;
            this.sayBoxLabelNodeList[1].rotationY = 180;
            this.sayBoxList[2].rotationY = 180;
            this.sayBoxLabelNodeList[2].rotationY = 180;
        }
        

        this.faceList = {};
        for(var i=0;i<confige.playerMax;i++)
        {
            this.faceList[i] = this.sayNode.getChildByName("face"+(i+1));
        }

        this.sayAniNode = this.node.getChildByName("sayAniNode");
        this.sayPosList = {};

        // this.sayPosList[0] = cc.v2(187,167);
        // this.sayPosList[1] = cc.v2(1190,444);
        // this.sayPosList[2] = cc.v2(1090,650);
        // this.sayPosList[3] = cc.v2(755,650);
        // this.sayPosList[4] = cc.v2(425,650);
        // this.sayPosList[5] = cc.v2(126,444);

        this.faceBeginPosList = {};
        for(var i=0;i<confige.playerMax;i++)
        {
            var curHeadNode = this.playerList[i].getChildByName("Player").getChildByName("head");
            var newVec1 = this.playerList[i].getChildByName("Player").convertToWorldSpaceAR(cc.v2(curHeadNode.x,curHeadNode.y));
            var newVec2 = this.node.convertToNodeSpaceAR(cc.v2(newVec1.x,newVec1.y));
            this.faceBeginPosList[i] = {x:newVec2.x,y:newVec2.y};
            this.sayPosList[i] = {x:newVec2.x,y:newVec2.y};
            gameData.gameBGNode.betBeginPosList[i] = {x:newVec2.x,y:newVec2.y};
            // console.log(this.faceBeginPosList[i]);
        }

        // this.faceBeginPosList[0] = cc.v2(116,83);
        // this.faceBeginPosList[1] = cc.v2(1226,362);
        // this.faceBeginPosList[2] = cc.v2(970,650);
        // this.faceBeginPosList[3] = cc.v2(640,650);
        // this.faceBeginPosList[4] = cc.v2(305,650);
        // this.faceBeginPosList[5] = cc.v2(58,360);
    },

    onStart:function(){
        console.log("gameScene Start!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        for(var i=0;i<confige.playerMax;i++)
            this.playerList[i].active = false;
        
        //console.log(confige.roomPlayer);
        if(confige.roomPlayer != -1)
        {
            for(var i in confige.roomPlayer)
            {
                var newPlayerInfo = confige.roomPlayer[i];
                if(newPlayerInfo.uid == confige.userInfo.uid)
                {
                    this.meChair = parseInt(i);
                    gameData.gameMainScene.meChair = this.meChair;
                    confige.meChair = this.meChair;
                }
                confige.curPlayerMax ++;
            }
            for(var k in confige.roomPlayer)
            {
                if(confige.roomPlayer.hasOwnProperty(k))
                {
                    var curIndex = confige.getCurChair(parseInt(k));
                    var newPlayerInfo = confige.roomPlayer[k];
                    confige.curPlayerData[curIndex] = newPlayerInfo;
                    if(newPlayerInfo.isActive == true)
                    {
                        this.addOnePlayer(newPlayerInfo);
                        this.playerCount ++;
                        if(newPlayerInfo.isOnline == false)
                            this.leaveNodeList[confige.getCurChair(k)].active = true;
                    }
                }
            }
        }
        
        if(this.playerCount == confige.playerMax)
            gameData.gameMainScene.gameInfoNode.btn_inviteFriend.active = false;

        this.newPlayerCount = this.playerCount;
    },

    addOnePlayer:function(playerData){
        var curIndex = confige.getCurChair(playerData.chair);
        console.log("addOnePlayer!!!!!chair ===== " + curIndex);
        console.log(playerData);
        this.playerInfoList[curIndex].setName(playerData.playerInfo.nickname);
        this.playerInfoList[curIndex].setScore(playerData.score);
        //
        var self = this;
        if(playerData.playerInfo.head != "")
        {
            var newCallBack = function(index){
                self.playerInfoList[index].setHeadSpriteFrame(confige.WXHeadFrameList[index+1]);
            };
            confige.getWXHearFrame(playerData.playerInfo.head, curIndex+1, function(curIndex){
                return function(){
                    newCallBack(curIndex)
                } 
            }(curIndex) );
        }
        if(playerData.score)
            this.playerScoreList[parseInt(playerData.chair)] = playerData.score;

        if(playerData.isReady == true && confige.roomData.state == 1001)// confige.curReconnectData == -1 && )
        {
            this.playerList[curIndex].getChildByName("isReady").active = true;
            console.log("isReady.active = true");
        }else{
            console.log("isReady.active = false");
        }
        this.playerList[curIndex].active = true;
        confige.roomPlayer[playerData.chair] = playerData;
        confige.curPlayerData[curIndex] = playerData;
        this.newPlayerCount ++;
        console.log("addOnePlayer() this.newPlayerCount ==== " + this.newPlayerCount);
        confige.curPlayerCount ++;

        if(this.newPlayerCount == confige.playerMax)
            gameData.gameMainScene.gameInfoNode.btn_inviteFriend.active = false;
        this.playerActiveList[curIndex] = true;

        // this.faceAniList = {};
        this.faceAniNode = this.node.getChildByName("faceAniNode");
        // for(var i=1;i<=6;i++)
        //     this.faceAniList[i] = this.faceAniNode.getChildByName("faceAni"+i);
    },

    playerQuit:function(chair){
        console.log("playerQuit -------------------" + chair);
        var curIndex = confige.getCurChair(chair);
        this.playerList[curIndex].active = false;

        confige.roomPlayer[chair].isActive = false;
        confige.roomData.player[chair].isActive = false;
        confige.curPlayerData[curIndex] = confige.roomPlayer[chair];
        
        this.newPlayerCount --;
        confige.curPlayerCount --;
        if(this.newPlayerCount < confige.playerMax)
            gameData.gameMainScene.gameInfoNode.btn_inviteFriend.active = true;
        this.playerActiveList[curIndex] = false;
    },

    showNiuType:function(chair, type){
        if(this.niuTypeBoxList[chair].active == true)
            return;
        this.niuTypeBoxList[chair].active = true;
        this.niuTypeBoxList[chair].opacity = 0;
        if(gameData.gameMainScene.isSpecial)
            this.niuTypeBoxList[chair].getChildByName("niuImg").getComponent("cc.Sprite").spriteFrame = confige.niuTypeFrameMapSpecial[type];
        else if(gameData.gameMainScene.isSanKung)
            this.niuTypeBoxList[chair].getChildByName("niuImg").getComponent("cc.Sprite").spriteFrame = confige.sanKungTypeFrameMap[type];
        else if(gameData.gameMainScene.isJinHua)
            this.niuTypeBoxList[chair].getChildByName("niuImg").getComponent("cc.Sprite").spriteFrame = confige.jinHuaTypeFrameMap[type];
        else
            this.niuTypeBoxList[chair].getChildByName("niuImg").getComponent("cc.Sprite").spriteFrame = confige.niuTypeFrameMap[type];

        if(gameData.gameMainScene.isSanKung)
        {
            if(chair == 0)
            {
                this.niuTypeBoxList[chair].getChildByName("niuImg").scale = 1.2;
            }else{
                this.niuTypeBoxList[chair].getChildByName("niuImg").scale = 1;
            }
            if(type == 12)
                this.niuTypeBoxList[chair].getChildByName("niuImg").scale = 0.5;
        }
        this.niuTypeBoxList[chair].runAction(cc.fadeIn(1));
        console.log("male_type_111" + type);
        console.log(confige.roomPlayer[chair]);
        var curSex = 0;
        if(confige.roomPlayer[confige.getOriChair(chair)].playerInfo)
            curSex = parseInt(confige.roomPlayer[confige.getOriChair(chair)].playerInfo.sex);

        if(gameData.gameMainScene.isSanKung || gameData.gameMainScene.isJinHua){
            if(gameData.gameMainScene.isSanKung)
            {
                if(confige.soundEnable == true)
                {
                    if(curSex == 2)
                    {
                        confige.playSoundByName("female_sankuang_type_"+type);
                    }else{
                        confige.playSoundByName("male_sankuang_type_"+type);
                    }
                }
            }
            return;
        }
        
        if(confige.soundEnable == true)
        {
            if(gameData.gameMainScene.isSpecial)
            {
                var curType = 0;
                if(type >= 0 && type <= 10)
                    curType = type;
                else{
                    switch(type){
                        case 11:
                            curType = 11;
                            break;
                        case 12:
                            curType = 12;
                            break;
                        case 13:
                            curType = 15;
                            break;
                        case 14:
                            curType = 16;
                            break;
                        case 15:
                            curType = 17;
                            break;
                        case 16:
                            curType = 13;
                            break;
                        case 17:
                            curType = 14;
                            break;
                        case 18:
                            curType = 18;
                            break;
                    }
                }
                if(curSex == 2)
                {
                    confige.playSoundByName("female_type_"+curType);
                }else{
                    confige.playSoundByName("male_type_"+curType);
                }
                console.log("curType====!!!!!" + curType);
            }else{
                if(curSex == 2)
                {
                    confige.playSoundByName("female_type_"+type);
                }else{
                    confige.playSoundByName("male_type_"+type);
                }
            }
        }
    },

    showOneCard:function(chair,callType){
        var curChair = confige.getCurChair(chair);
        if(curChair == 0)
        {
            gameData.gameMainScene.hideOpenCard(1);
            gameData.gameMainScene.hideOpenCard(2);
        }
        if(gameData.gameMainScene.joinLate == true && curChair == 0)
            return;

        var handCard = this.playerCardList[chair];
        console.log("chair@@@@@"+curChair+"handCard ====");
        console.log(handCard);
        // for(var i=0;i<5;i++)
        var curCardNum = 0;
        for(var i in handCard)
        {
            if(handCard[i])
            {
                curCardNum ++;
                this.playerHandCardList[curChair].setCardWithIndex(i, handCard[i].num, handCard[i].type);
            }
        }

        if(callType == -1)
            return;
        if(curCardNum == 5)
        {
            var curNiuType = 0;
            if(gameData.gameMainScene.isSpecial)
                curNiuType = SpecialLogic.getType(handCard);
            else
                curNiuType = confige.getNiuType(handCard);
            this.showNiuType(curChair, curNiuType.type);
        }

        if(confige.roomData.roomType == "sanKung")
        {
            this.showNiuType(curChair,sanKungLogic.getType(handCard).type);
            console.log("sanKung type@@@@===",sanKungLogic.getType(handCard).type)
        }
        if(confige.roomData.roomType == "zhajinhua")
        {
            this.showNiuType(curChair,ZhaJinHuaLogic.getType(handCard).type);
            console.log("zhajinhua type@@@@===",ZhaJinHuaLogic.getType(handCard).type)
        }
    },

    userDisconne:function(chair){
        this.leaveNodeList[chair].active = true;
    },

    userReconnection:function(chair){
        this.leaveNodeList[chair].active = false;
    },

    showHeadFace:function(chairBegin,chairEnd,index,sex){
        if(confige.loadFaceAni == false) return;
        console.log("showHeadFace  chairBegin=" + chairBegin + "chairEnd=" + chairEnd + "index=" + index);
        var newFaceAni = cc.instantiate(confige.faceAniMap[index]);
        newFaceAni.scale = 0.7;
        newFaceAni.x = this.faceBeginPosList[confige.getCurChair(chairBegin)].x;
        newFaceAni.y = this.faceBeginPosList[confige.getCurChair(chairBegin)].y;
        if(confige.soundEnable == true)
        {
            if(sex == 2)
            {
                confige.playSoundByName("female_face_"+index);
            }else{
                confige.playSoundByName("male_face_"+index);
            }
        }
        console.log("newFaceAni.x===" + newFaceAni.x);
        console.log("newFaceAni.y===" + newFaceAni.y);
        this.faceAniNode.addChild(newFaceAni);
        var action1 = cc.moveTo(0.3, cc.p(this.faceBeginPosList[confige.getCurChair(chairEnd)].x, this.faceBeginPosList[confige.getCurChair(chairEnd)].y));
        var action2 = cc.callFunc(function () {
            if(confige.soundEnable == true)
            {
                if(index == 3)
                {
                    if(sex == 2)
                        confige.playSoundByName("face_3");
                    else
                        confige.playSoundByName("face_7");
                }else{
                    confige.playSoundByName("face_"+index);
                }
            }
            newFaceAni.getComponent("cc.Animation").play("faceAni"+index);
        }, this);
        var action3 = cc.delayTime(1);
        var action4 = cc.fadeOut(0.3);
        var action5 = cc.callFunc(function () {
            newFaceAni.destroy();
        }, this);
        var betMoveAction = cc.sequence(action1,action2,action3,action4,action5);

        newFaceAni.runAction(betMoveAction);
    },

    updateScoreByChair:function(chair,score){
        this.playerScoreList[parseInt(chair)] = score;
        this.playerInfoList[confige.getCurChair(chair)].setScore(score);
    },

    btn_showUserInfo:function(event,customEventData){
        console.log("btn_showUserInfo CLICK@@@@@@@@@@@@@")
        var clickIndex = parseInt(customEventData);
        var oriChair = confige.getOriChair(clickIndex);
        if(confige.roomPlayer[oriChair].isActive == true)
        {
            var newCallBack = function(){
                gameData.gameInfoNode.userInfoLayer.userInfoNick.string = confige.roomPlayer[oriChair].playerInfo.nickname;
                gameData.gameInfoNode.userInfoLayer.userInfoID.string = "ID:" + confige.roomPlayer[oriChair].playerInfo.uid;
                var ipString = confige.roomPlayer[oriChair].ip;
                ipString = ipString.substring(7, ipString.length);
                gameData.gameInfoNode.userInfoLayer.userInfoIP.string = "IP:" + ipString;
                gameData.gameInfoNode.userInfoLayer.selectHead = oriChair;
            };
            gameData.gameInfoNode.onBtnShowLayer(-1,2,newCallBack);
        }
    },
});
