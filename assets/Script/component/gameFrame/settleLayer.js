var confige = require("confige");
var gameData = require("gameData");
cc.Class({
    extends: cc.Component,

    properties: {
        parent:{
            default:null,
            type:cc.Node
        },

        settle_perfab:{
            default:null,
            type:cc.Prefab
        },

        settle_perfab9:{
            default:null,
            type:cc.Prefab
        },

        isInit:false,
    },

    onLoad: function () {
    },

    onInit:function(){
        this.settleCount = 0;
        this.settleList = {};
        this.oriSettlePosx = 0;
        this.oriSettlePosy = 170;
        this.oriSettlePosOffset = -60;
        
        this.niuTypeFrameMap = {};
        
        this.winIco = this.node.getChildByName("win");
        this.loseIco = this.node.getChildByName("lose");
        this.overCallBack = -1;
        this.showBeginBtnCall = -1;

        if(confige.playerMax == 9)
        {
            this.settlePosList = {};
            this.settlePosList[0] = {x:-312,y:163};
            this.settlePosList[1] = {x:33,y:163};
            this.settlePosList[2] = {x:379,y:163};
            this.settlePosList[3] = {x:-312,y:2};
            this.settlePosList[4] = {x:33,y:2};
            this.settlePosList[5] = {x:379,y:2};
            this.settlePosList[6] = {x:-312,y:-165};
            this.settlePosList[7] = {x:33,y:-165};
            this.settlePosList[8] = {x:379,y:-165};
        }

        this.isInit = true;
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
    },

    addOneSettle:function(name, type, score, gameType,handCard,chair){     //0:nomal;1:FK;2:sanKung;3:jinHua
        var newSettle = {};
        if(confige.playerMax == 6)
            newSettle = cc.instantiate(this.settle_perfab);
        else
            newSettle = cc.instantiate(this.settle_perfab9);
        this.node.addChild(newSettle);
        
        var newSettleS = newSettle.getComponent("settleOnce");
        newSettleS.onInit();
        newSettleS.setSettle(name, type, score);
        newSettleS.showCard(handCard,true);

        var newType = newSettleS.type;
        if(type != 100){
            if(gameType == 0)
                newType.spriteFrame = confige.niuTypeFrameMap[type];
            else if(gameType == 1)
                newType.spriteFrame = confige.niuTypeFrameMapFK[type];
            else if(gameType == 2)
                newType.spriteFrame = confige.sanKungTypeFrameMap[type];
            else if(gameType == 3)
                newType.spriteFrame = confige.jinHuaTypeFrameMap[type];
        }else{
            newType.spriteFrame = null;
        }
        if(confige.playerMax == 6)
            newSettle.setPosition(0,this.oriSettlePosy + this.oriSettlePosOffset*this.settleCount);
        else {
            newSettle.setPosition(this.settlePosList[this.settleCount].x,this.settlePosList[this.settleCount].y);
            if(chair == confige.meChair)
                newSettleS.settleBgMe.active = true;
        }

        this.settleList[this.settleCount] = newSettle;
        this.settleCount = this.settleCount + 1;
    },

    addOneSettleJinHua:function(name, type, score, handCard,discard,failure,isShow,chair){
        var newSettle = {};
        if(confige.playerMax == 6)
            newSettle = cc.instantiate(this.settle_perfab);
        else
            newSettle = cc.instantiate(this.settle_perfab9);
        this.node.addChild(newSettle);
        
        var newSettleS = newSettle.getComponent("settleOnce");
        newSettleS.onInit();
        newSettleS.setSettle(name, type, score);

        if(isShow)
            newSettleS.showCard(handCard,true);
        else
            newSettleS.showCard(handCard,false);
        var newType = newSettleS.type;
        if(type != 100){
            if(score >= 0)
                newType.spriteFrame = confige.jinHuaTypeFrameMap[type];
            else
                newType.spriteFrame = confige.jinHuaTypeFrameMap[type+10];
        }else{
            newType.spriteFrame = null;
        }

        if(confige.playerMax == 6)
            newSettle.setPosition(0,this.oriSettlePosy + this.oriSettlePosOffset*this.settleCount);
        else {
            newSettle.setPosition(this.settlePosList[this.settleCount].x,this.settlePosList[this.settleCount].y);
            if(chair == confige.meChair)
                newSettleS.settleBgMe.active = true;
        }
        
        if(confige.playerMax == 6)
        {
            if(discard)
                newSettleS.discard.active = true;
            if(failure)
                newSettleS.failure.active = true;
        }
        
        this.settleList[this.settleCount] = newSettle;
        this.settleCount = this.settleCount + 1;
    },
    
    show:function(win){
        this.node.active = true;
        this.winIco.active = false;
        this.loseIco.active = false;
        if(win <= 0)
        {
            this.loseIco.active = true;
        }else{
            this.winIco.active = true;
        }
    },
    
    hide:function(){
        this.node.active = false;
    },
    
    cleanData:function(){
        for(var i=0;i<this.settleCount;i++)
            this.settleList[i].destroy();
        
        this.settleCount = 0;
        this.winIco.active = false;
        this.loseIco.active = false;
    },
    
    btn_close_click:function(){
        this.cleanData();
        this.hide();
        if(this.overCallBack != -1)
            this.overCallBack();
        // else
            // this.showBeginBtnCall();
        pomelo.clientScene.onBtnReadyClicked();
        if(pomelo.clientScene.popBanker)
            pomelo.clientScene.popBanker.active = false;
    },

});