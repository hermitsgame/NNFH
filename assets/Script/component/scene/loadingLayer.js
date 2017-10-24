cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
    },

    onInit:function(){
        this.pointItem = this.node.getChildByName("point");
        this.tipsLabel = this.node.getChildByName("tips").getComponent("cc.Label");
    },

    showLoading:function(){
        this.node.active = true;
        this.pointItem.rotation = 0;
        this.pointItem.runAction(cc.repeatForever(cc.rotateBy(1,360)));
    },

    hideLoading:function(){
        this.pointItem.stopAllActions();
        this.node.active = false;
    },

    setLoadingTips:function(tipsString){
        this.tipsLabel.string = tipsString;
    },
});
