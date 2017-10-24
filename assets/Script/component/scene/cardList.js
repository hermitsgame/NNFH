var gameData = require("gameData");
var confige = require("confige")

cc.Class({
    extends: cc.Component,

    properties: {
        cardItem:{
            default:null,
            type:cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    onInit:function(gameType){
        this.cardItemList = {};
        this.cardItemCount = 0;
        this.mainPlayerScale = 1.2;
        this.otherPlayerScale = 0.54;
        
        this.playerActiveList = {};
        this.handCardPosList =  {};
        this.handCardList = {};
        
        for(var i=0;i<confige.playerMax;i++)
        {
            this.handCardList[i] = gameData.gamePlayerNode.playerHandCardList[i];
        }

        for(var i=0;i<confige.playerMax;i++)
        {
            this.handCardPosList[i] = {};
            this.playerActiveList[i] = false;
            for(var j=0;j<5;j++)
            {
                var curCardBackNode = this.handCardList[i].cardsBack[j];
                var newVec1 = this.handCardList[i].node.convertToWorldSpaceAR(cc.v2(curCardBackNode.x,curCardBackNode.y));
                var newVec2 = this.node.convertToNodeSpaceAR(cc.v2(newVec1.x,newVec1.y));
                this.handCardPosList[i][j] = {x:newVec2.x,y:newVec2.y};
            }
        }

        // if(gameType == "niuniu")
        // {
        //     for(var i=0;i<6;i++){
        //         this.handCardPosList[i] = {};
        //         this.playerActiveList[i] = false;
        //         for(var j=0;j<5;j++)
        //         {
        //             switch(i){
        //                 case 0:
        //                 this.handCardPosList[i][j] = {x:-190 + j*80*this.mainPlayerScale,y:-265};
        //                 break;
        //                 case 1:
        //                 this.handCardPosList[i][j] = {x:414 + j*40*this.otherPlayerScale,y:12.2};
        //                 break;
        //                 case 2:
        //                 this.handCardPosList[i][j] = {x:290 + j*40*this.otherPlayerScale,y:180};
        //                 break;
        //                 case 3:
        //                 this.handCardPosList[i][j] = {x:-44 + j*40*this.otherPlayerScale,y:180};
        //                 break;
        //                 case 4:
        //                 this.handCardPosList[i][j] = {x:-378 + j*40*this.otherPlayerScale,y:180};
        //                 break;
        //                 case 5:
        //                 this.handCardPosList[i][j] = {x:-500 + j*40*this.otherPlayerScale,y:12.2};
        //                 break;
        //             }
        //         }
        //     }
        // }else if(gameType == "sanKung" || gameType == "jinHua"){
        //     for(var i=0;i<6;i++){
        //         this.handCardPosList[i] = {};
        //         this.playerActiveList[i] = false;
        //         for(var j=0;j<5;j++)
        //         {
        //             switch(i){
        //                 case 0:
        //                 this.handCardPosList[i][j] = {x:-98 + j*80*this.mainPlayerScale,y:-266};
        //                 break;
        //                 case 1:
        //                 this.handCardPosList[i][j] = {x:414 + j*40*this.otherPlayerScale,y:12.2};
        //                 break;
        //                 case 2:
        //                 this.handCardPosList[i][j] = {x:313 + j*40*this.otherPlayerScale,y:180};
        //                 break;
        //                 case 3:
        //                 this.handCardPosList[i][j] = {x:-21 + j*40*this.otherPlayerScale,y:180};
        //                 break;
        //                 case 4:
        //                 this.handCardPosList[i][j] = {x:-355 + j*40*this.otherPlayerScale,y:180};
        //                 break;
        //                 case 5:
        //                 this.handCardPosList[i][j] = {x:-474.3 + j*40*this.otherPlayerScale,y:12.2};
        //                 break;
        //             }
        //         }
        //     }
        // }
       
        this.disRoundCount = 0;
    },

    resetCardList:function(){
        for(var i=0;i<confige.playerMax;i++){
            this.playerActiveList[i] = false;
        }
        for(var i=0;i<this.cardItemCount;i++)
            this.cardItemList[i].destroy();
        this.cardItemCount = 0;
        this.disRoundCount = 0;
    },

    activePlayer:function(index){
        this.playerActiveList[index] = true;
    },

    deActivePlayer:function(index){
        this.playerActiveList[index] = false;
    },

    disCardOneRound:function(){
        var disCount = 0;
        this.disRoundCount ++;
        var curRoundCount = this.disRoundCount - 1;
        var callBack = function(){
            if(this.playerActiveList[disCount] == true)
            {
                var newCardItem = cc.instantiate(this.cardItem);
                this.node.addChild(newCardItem);
                newCardItem.active = true;
                newCardItem.x = -545;
                newCardItem.y = 190;
                this.cardItemList[this.cardItemCount] = newCardItem;
                this.cardItemCount ++;

                var action1 = cc.moveTo(0.2, cc.p(this.handCardPosList[disCount][curRoundCount].x, this.handCardPosList[disCount][curRoundCount].y));
                var scaleNum = 1;
                if(disCount == 0)
                    scaleNum = this.mainPlayerScale;
                else
                    scaleNum = this.otherPlayerScale;
                var action2 = cc.scaleTo(0.2,scaleNum);
                var self = this
                var action3 = (function(disCount,curRoundCount,self) {
                   return cc.callFunc(function () {
                    newCardItem.active = false;
                    self.handCardList[disCount].showCardBackWithIndex(curRoundCount);
                }, self)
                })(disCount,curRoundCount,self)

                newCardItem.runAction(cc.sequence(cc.spawn(action1,action2), cc.delayTime(0.1),action3));
            }            
            disCount ++;
            if(disCount == confige.playerMax)
            {
                this.unschedule(callBack);
            }
        };

        this.schedule(callBack,0.03);
    },

    disCardWithRoundTime:function(rountTime){
        var callTime = 0;
        var callMax = rountTime;
        var callBack2 = function(){
            this.disCardOneRound();
            callTime ++;
            if(callTime == callMax)
                this.unschedule(callBack2);
        };
        this.schedule(callBack2,0.05);
    },

});
