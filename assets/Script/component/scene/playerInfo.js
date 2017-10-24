cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        // this.nameLabel = this.node.getChildByName("name").getComponent("cc.Label");
        // this.scoreLabel = this.node.getChildByName("score").getComponent("cc.Label");   
        // console.log("fuck load");
    },
    
    onInit:function() {
        this.nameLabel = this.node.getChildByName("name").getComponent("cc.Label");
        this.scoreLabel = this.node.getChildByName("score").getComponent("cc.Label"); 
        this.headImg = this.node.getChildByName("head").getComponent("cc.Sprite");
    },
    
    setName : function(name){
        this.nameLabel.string = name;
    },
    
    setScore : function(score){
        this.scoreLabel.string = score;
    },

    setHeadSpriteFrame : function(newFrame){
        this.headImg.spriteFrame = newFrame;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
