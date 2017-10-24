cc.Class({
    extends: cc.Component,

    properties: {
        frameWait:{
            default:null,
            type:cc.SpriteFrame
        },
        frameAgree:{
            default:null,
            type:cc.SpriteFrame
        },
        frameDisagree:{
            default:null,
            type:cc.SpriteFrame
        },
        isInit:false,
    },
    onLoad: function () {

    },

    onInit: function(){
        this.playerNameList = {};
        this.playerTypeList = {};
        this.playerNodeList = {};
        for(var i=0;i<9;i++)
        {
            this.playerNodeList[i] = this.node.getChildByName("player" + i);
            this.playerNameList[i] = this.node.getChildByName("player" + i).getChildByName("name").getComponent("cc.Label");
            this.playerTypeList[i] = this.node.getChildByName("player" + i).getChildByName("type").getComponent("cc.Sprite");
        }
        this.timeNum = this.node.getChildByName("timeNum").getComponent("cc.Label");
        this.warning = this.node.getChildByName("warning");

        this.btnAgree = this.node.getChildByName("btnAgree");
        this.btnDisagree = this.node.getChildByName("btnDisagree");
        this.timeCallBack = -1;
        this.isInit = true;
    },

    runTime:function(time){
        var self = this;
        var curTime = time;
        self.timeNum.string = curTime;
        self.timeCallBack = function(){
            curTime--;
            self.timeNum.string = curTime;
            if(curTime <= 0)
            {
                self.unschedule(self.timeCallBack);
                self.warning.warning.active = true;
            }
        };
        self.schedule(self.timeCallBack,1);
    },

    hideTime:function(){
        if(this.timeCallBack != -1)
            this.unschedule(this.timeCallBack);
        this.timeNum.string = "";
    },

    showFinishLayer:function(){
        this.node.active = true;
    },

    hideFinishLayer:function(){
        this.node.active = false;
        for(var i=0;i<9;i++)
        {
            this.playerNameList[i].string = "";
            this.playerTypeList[i].spriteFrame = this.frameWait;
            this.playerNodeList[i].active = false;
        }
        this.timeNum.string = "0";
        this.btnAgree.active = true;
        this.btnDisagree.active = true;
        this.warning.active = false;
        this.unscheduleAllCallbacks();
    },

    showPlayer:function(playerCount){
        for(var i=0;i<playerCount;i++)
            this.playerNodeList[i].active = true;
    },

    setPlayerName:function(index,name){
        this.playerNameList[index].string = name;
    },

    setPlayerType:function(index,type){
        console.log("setPlayerType !!!!==="+index);
        console.log("type !!!!==="+type);
        if(!this.playerTypeList[index])
            return;
        if(type == 0)
        {
            this.playerTypeList[index].spriteFrame = this.frameWait;
        }else if(type == 1){
            this.playerTypeList[index].spriteFrame = this.frameAgree;
        }else if(type == 2){
            this.playerTypeList[index].spriteFrame = this.frameDisagree;
        }
    },

    btnClickAgree:function(){
        pomelo.request("connector.entryHandler.sendFrame", {"code" : "agreeFinish"},null, function(data) {
              console.log("flag is : "+data.flag)
            }
        );
    },

    btnClickDisagree:function(){
        pomelo.request("connector.entryHandler.sendFrame", {"code" : "refuseFinish"},null, function(data) {
              console.log("flag is : "+data.flag)
            }
        );
    },

    hideAllBtn:function(){
        this.btnAgree.active = false;
        this.btnDisagree.active = false;
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
    },
});
