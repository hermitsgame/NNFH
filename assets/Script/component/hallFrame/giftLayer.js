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
        this.giftID = this.node.getChildByName("sendID").getComponent("cc.EditBox");
        this.giftNum = this.node.getChildByName("sendNum").getComponent("cc.EditBox");
        this.giftName = this.node.getChildByName("findName").getComponent("cc.Label");
        this.giftSendBtn = this.node.getChildByName("btnOK").getComponent("cc.Button");
        this.giftSendBtn.interactable = false;
        this.giftSendNick = "";
        this.isInit = true;
    },

    onBtnGitfLayer:function(event,customEventData){
        var clickIndex = parseInt(customEventData);
        var self = this;
        if(clickIndex == 0) //show
        {
            this.node.active = true;
        }else if(clickIndex == 1){  //find
            console.log("onBtnGitfLayer find")
            var curUid = parseInt(this.giftID.string);
            pomelo.request("monitor.handle.queryNickName", {uid : curUid}, function(data) {
                console.log(data);
                if(data.flag == false)
                {
                    console.log("查询失败！！！");
                    self.giftSendBtn.interactable = false;
                    self.parent.showTips("查询失败！请输入正确的玩家ID");
                    self.giftID.string = "";
                }else{
                    console.log("查询成功！！！");
                    self.giftName.string = data;
                    self.giftSendNick = data;
                    self.giftSendBtn.interactable = true;
                }
            });   
        }else if(clickIndex == 2){  //send
            console.log("onBtnGitfLayer send")
            var curUid = parseInt(this.giftID.string);
            var curDiamond = parseInt(this.giftNum.string);
            pomelo.request("monitor.handle.giveDiamond", {target : curUid,diamond : curDiamond}, function(data) {
                if(data && data.flag == true)
                {
                    console.log("赠送成功！！！");
                    self.parent.showTips("向["+self.giftSendNick+"]赠送["+curDiamond+"]钻石成功");
                    self.cleanGiftLayer();
                }else{
                    if(data)
                        self.parent.showTips(data);
                    else
                        self.parent.showTips("赠送失败,请重新输入赠送信息");
                    console.log("赠送失败！！！");
                    
                    self.cleanGiftLayer();
                }
            });
        }else if(clickIndex == 3){  //cancle
            this.cleanGiftLayer();    
        }
    },

    cleanGiftLayer:function(){
        this.giftSendBtn.interactable = false;
        this.giftID.string = "";
        this.giftNum.string = "";
        this.giftName.string = "";
        this.node.active = false;
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
