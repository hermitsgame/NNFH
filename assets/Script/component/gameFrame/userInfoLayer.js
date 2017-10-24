var confige = require("confige");
var gameData = require("gameData");
cc.Class({
    extends: cc.Component,

    properties: {
        parent:{
            default:null,
            type:cc.Node
        },
        isInit:false,
    },

    onLoad: function () {
    },

    onInit:function(){
        this.userInfoNick = this.node.getChildByName("nick").getComponent("cc.Label");
        this.userInfoID = this.node.getChildByName("id").getComponent("cc.Label");
        this.userInfoIP = this.node.getChildByName("ip").getComponent("cc.Label");
        this.selectHead = -1;
        // this.faceAniList = {};
        // for(var i=1;i<=6;i++)
        //     this.faceAniList[i] = this.node.getChildByName("faceAni"+i);

        this.isInit = true;
    },

    btnClickHeadFace:function(event,customEventData){
        var index = parseInt(customEventData);
        if(this.selectHead != -1)
            pomelo.clientSend("say",{"msg": {"sayType":100, "chairBegin":gameData.gameMainScene.meChair, "chairEnd":this.selectHead,"index":index,"sex":confige.curSex}});
        this.hideLayer();
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.selectHead = -1;
    },
});