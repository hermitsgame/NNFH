var confige = require("confige");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {

    },
    
    onInit: function(){
        this.name = this.node.getChildByName("name").getComponent("cc.Label");
        this.type = this.node.getChildByName("type").getComponent("cc.Sprite");
        this.scoreWNode = this.node.getChildByName("winscore");
        this.scoreLNode = this.node.getChildByName("losescore");
        this.scoreW = this.node.getChildByName("winscore").getComponent("cc.Label");
        this.scoreL = this.node.getChildByName("losescore").getComponent("cc.Label");
        // this.bgW = this.node.getChildByName("winBg").getComponent("cc.Label");
        // this.bgL = this.node.getChildByName("loseBg").getComponent("cc.Label");
        this.bgWNode = this.node.getChildByName("winBg");
        this.bgLNode = this.node.getChildByName("loseBg");
        this.banker = this.node.getChildByName("banker");
        this.banker.active = false;

        this.cardNode = this.node.getChildByName("cardNode");
        this.cardList = {};
        for(var i=0;i<5;i++)
            this.cardList[i] = this.cardNode.getChildByName("Card"+i);

        if(confige.playerMax == 6)
        {
            this.discard = this.node.getChildByName("discard");
            this.failure = this.node.getChildByName("failure");
        }else{
            this.scoreBgWin = this.node.getChildByName("scoreBgWin");
            this.scoreBgLose = this.node.getChildByName("scoreBgLose");
            this.settleBgMe = this.node.getChildByName("settleBgMe");
        }
        
    },
    
    setSettle: function(name, type, score){
        this.name.string = name;
        var curScore = score;
        if(parseInt(score) < 0)
        {
            this.scoreWNode.active = false;
            this.bgWNode.active = false;
            if(confige.playerMax == 9)
                this.scoreBgWin.active = false;
            this.scoreL.string = "." + score;
        }else{
            this.scoreLNode.active = false;
            this.bgLNode.active = false;
            if(confige.playerMax == 9)
                this.scoreBgLose.active = false;
            this.scoreW.string = "/" + score;
        }
    },

    showCard:function(handCard,show){
        // if(confige.playerMax == 9)
            // return;
        var beginIndex = 0;
        if(handCard.length == 3){
            beginIndex = 1;
            this.cardList[0].active = false;
            this.cardList[4].active = false;
        }
        if(show)
        {
            for(var i in handCard)
            {
                var curCardIndex = handCard[i].num + handCard[i].type*13;
                this.cardList[(beginIndex+parseInt(i))].getComponent("cc.Sprite").spriteFrame = confige.cardFrameMap[curCardIndex];
            }
        }
    },
    
    getTypeFrame:function(){
        return this.type;
    }
});
