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
        this.joinRoomID = "";
        this.joinRoomIDLabel = this.node.getChildByName("New Label").getComponent("cc.Label");
        this.roomNumNode = this.node.getChildByName("roomNumList");
        this.roomNumList = {};
        for(var i=1;i<=6;i++)
            this.roomNumList[i] = this.roomNumNode.getChildByName("num"+i).getComponent("cc.Label");
        this.curRoomIDCount = 0;
        this.isInit = true;
    },

    onBtnJoinRoom:function(curRoomID){
        if(curRoomID)
            this.joinRoomID = curRoomID;
        var roomId = parseInt(this.joinRoomID);
        var self = this;
        var joinCallFunc = function(){
            console.log("onBtnJoinRoom joinCallFunc!!!!!");
            self.parent.loadingLayer.showLoading();
        };
        pomelo.clientSend("join",{"roomId":roomId}, joinCallFunc);
        console.log("join room" + roomId);
    },

    onBtnJoinNum:function(event, customEventData){
        var index = parseInt(customEventData);
        if(index >= 0 && index <= 9)
        {
            if(this.curRoomIDCount < 6)
            {
                this.joinRoomID += customEventData;
                this.curRoomIDCount ++;
                this.roomNumList[this.curRoomIDCount].string = index;
            }
            if(this.curRoomIDCount == 6)
            {
                var roomId = parseInt(this.joinRoomID);
                pomelo.clientSend("join",{"roomId":roomId});
            }
        }
        else if(index == 10){
            if(this.curRoomIDCount != 0)
            {
                this.joinRoomID = this.joinRoomID.substring(0,this.joinRoomID.length-1)
                this.roomNumList[this.curRoomIDCount].string = "";
                this.curRoomIDCount --;
            }
        }
        else if(index == 11){
            this.joinRoomID = "";
            this.curRoomIDCount = 0;
            for(var i=1;i<=6;i++)
                this.roomNumList[i].string = "";
        }
        
        this.joinRoomIDLabel.string = this.joinRoomID;
    },

    cleanRoomId:function(){
        this.joinRoomID = "";
        this.curRoomIDCount = 0;
        for(var i=1;i<=6;i++)
           this.roomNumList[i].string = "";
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.cleanRoomId();
    },
});
