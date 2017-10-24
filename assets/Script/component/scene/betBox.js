cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {

    },
    
    onInit: function () {
        this.allBetNum = this.node.getChildByName("betAll").getComponent("cc.Label");
        this.myBetNum = this.node.getChildByName("betMy").getComponent("cc.Label");
    },
    
    setAllBet:function(betNum){
        //console.log("fuck setAllBet");
        this.allBetNum.string = betNum;
    },
    
    setMyBet:function(betNum){
        //console.log("fuck setMyBet");
        this.myBetNum.string = betNum;
    },
    
    show:function(){
        this.active = true;
    },
    
    hide:function(){
        this.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
