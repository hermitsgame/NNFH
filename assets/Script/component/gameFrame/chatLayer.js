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
        this.faceLayer = this.node.getChildByName("faceLayer");
        this.quickLayer = this.node.getChildByName("quickLayer");
        this.chatEdit = this.node.getChildByName("chatBox").getChildByName("chatEdit").getComponent("cc.EditBox");

        this.isInit = true;
    },

    onBtnChatLayerClick:function(event, customEventData){
        var clickIndex = parseInt(customEventData);
        if(clickIndex == 0)
        {
            this.faceLayer.active = true;
            this.quickLayer.active = false;
        }else if(clickIndex == 1){
            this.faceLayer.active = false;
            this.quickLayer.active = true;
        }

        if(clickIndex == 2)
        {
            var chatString = this.chatEdit.string;
            if(chatString != "")
                pomelo.clientSend("say",{"msg": {"sayType":2, "string": chatString}});
            
            console.log("say chat" + chatString);
            console.log("string length ====== " + chatString.length);
        }

        if(clickIndex >= 10 && clickIndex < 22)
        {
            var faceIndex = clickIndex - 10;
            pomelo.clientSend("say",{"msg": {"sayType":0, "index": faceIndex}});
            console.log("faceIndex" + faceIndex);
        }

        if(clickIndex >= 30 && clickIndex < 35)
        {
            var quickIndex = clickIndex - 30;
            pomelo.clientSend("say",{"msg": {"sayType":1, "index": quickIndex, "sex": confige.curSex}});
            console.log("quickIndex" + quickIndex);
        }

        if(clickIndex >= 2)
            this.hideLayer();
    },
   
    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.chatEdit.string = "";
    },
});