var confige = require("confige");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        console.log("onInit!!!!!!!!!!!!!!!!!!!!!!!");
        
    },

    onInit:function(){
        confige.loadNode = this;
        cc.game.addPersistRootNode(this.node);
        this.pointItem = this.node.getChildByName("point");

        this.progressBar = this.node.getChildByName("fileProgress").getComponent("cc.ProgressBar");
        this.progressNum = this.node.getChildByName("fileProgress").getChildByName("fileNum").getComponent("cc.Label");
        this.progressCount = 0;
    },

    showNode:function(){
        this.node.active = true;
    },

    hideNode:function(){
        this.pointItem.rotation = 0;
        this.node.active = false;
        this.progressBar.progress = 0;
        this.progressCount = 0;
        this.progressNum.string = "";
    },

    setProgress:function(percent,num){
        this.pointItem.rotation = percent*1280;
        if(percent > this.progressCount)
        {
            this.progressBar.progress = percent;
            this.progressCount = percent;
        }
        // console.log("setProgress1111===="+percent);
        this.progressNum.string = parseInt(percent*100)+"%";
        if(parseInt(percent*100) > 99)
        {
            this.hideNode();            
        }
        // console.log("setProgress333333===="+this.progressNum.string);
    },
});
