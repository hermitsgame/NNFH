cc.Class({
    extends: cc.Component,

    properties: {
        isInit:false,
    },

    onLoad: function () {

    },

    onInit:function(){
        this.helpContent = this.node.getChildByName("helpScrollView").getChildByName("view").getChildByName("content");
        this.isInit = true;
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.helpContent.y = 250;
    },
});
