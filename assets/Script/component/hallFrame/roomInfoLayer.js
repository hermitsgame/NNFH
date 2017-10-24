var confige = require("confige");
cc.Class({
    extends: cc.Component,

    properties: {
        parent:{
            default:null,
            type:cc.Node
        },

        roomInfo_item1:{
            default:null,
            type:cc.Prefab
        },

        roomInfo_item2:{        //6人
            default:null,
            type:cc.Prefab
        },
        roomInfo_item3:{        //9人
            default:null,
            type:cc.Prefab
        },
        isInit:false,
    },

    onLoad: function () {

    },

    onInit:function(){
        this.roomInfoLayerContent1 = this.node.getChildByName("roomInfoView").getChildByName("view").getChildByName("content");
        this.roomInfoLayer2 = this.node.getChildByName("infoLayer2");
        this.roomInfoLayerContent2 = this.roomInfoLayer2.getChildByName("roomList").getChildByName("view").getChildByName("content");
        this.roomInfoItemList1 = [];
        this.roomInfoItemList2 = [];
        this.roomInfoData = {};
        this.isInit = true;
    },

    createRoomInfoLayerNew:function(){
        var self = this;
        self.roomInfoItemBeginX = 150;
        self.roomInfoItemOffsetX = 260;
        pomelo.request("connector.entryHandler.getAgencyRoom",null, function(data) {
            console.log(data);
            self.roomInfoData = data.List;
            var roomInfoItemCount = 0;
            for(var i in data.List)
            {
                var curRoomInfo = data.List[i];
                if(curRoomInfo.state == 0 || curRoomInfo.state == 1)
                {
                    var newRoomInfoItem = cc.instantiate(self.roomInfo_item1);
                    self.roomInfoItemList1[roomInfoItemCount] = newRoomInfoItem;
                    self.roomInfoLayerContent1.addChild(newRoomInfoItem);
                    newRoomInfoItem.x = self.roomInfoItemBeginX + self.roomInfoItemOffsetX * roomInfoItemCount;

                    var roomState1 = newRoomInfoItem.getChildByName("onFree");
                    var roomState2 = newRoomInfoItem.getChildByName("onGame");
                    var roomIDLabel = newRoomInfoItem.getChildByName("roomID").getComponent("cc.Label");
                    var roomTypeLabel = newRoomInfoItem.getChildByName("roomType").getComponent("cc.Label");
                    var roomDate1Label = newRoomInfoItem.getChildByName("roomDate1").getComponent("cc.Label");
                    var roomDate2Label = newRoomInfoItem.getChildByName("roomDate2").getComponent("cc.Label");
                    var roomBtnJoin = newRoomInfoItem.getChildByName("btnJoin").getComponent("cc.Button");
                    var roomBtnInvite = newRoomInfoItem.getChildByName("btnInvite").getComponent("cc.Button");
                    var roomBtnClose = newRoomInfoItem.getChildByName("btnClose").getComponent("cc.Button");
                    newRoomInfoItem.id = curRoomInfo.roomId;
                    roomIDLabel.string = "房间号:"+curRoomInfo.roomId;
                    var curRoomDes = curRoomInfo.gameNumber + "局--";
                    if(curRoomInfo.gameMode == 1)
                        curRoomDes += "普通牛牛";
                    else if(curRoomInfo.gameMode == 3)
                        curRoomDes += "斗公牛";
                    else if(curRoomInfo.gameMode == 4)
                        curRoomDes += "通比牛牛";
                    else{
                        if(curRoomInfo.gameType == "zhajinniu")
                            curRoomDes += "炸金牛";
                        else if(curRoomInfo.gameType == "mingpaiqz")
                            curRoomDes += "明牌抢庄";
                        else if(curRoomInfo.gameType == "fengkuang")
                            curRoomDes += "疯狂加倍";
                        else if(curRoomInfo.gameType == "sanKung")
                            curRoomDes += "比三张";
                        else if(curRoomInfo.gameType == "zhajinhua")
                            curRoomDes += "拼三张";
                    }
                    if(curRoomInfo.bankerMode)
                    {
                        if(curRoomInfo.bankerMode == 1)
                            curRoomDes += "--随机抢庄";
                        else if(curRoomInfo.bankerMode == 2)
                            curRoomDes += "--房主坐庄";
                        else if(curRoomInfo.bankerMode == 3)
                            curRoomDes += "--轮流坐庄";
                        else if(curRoomInfo.bankerMode == 5)
                            curRoomDes += "--牛牛坐庄";
                        else if(curRoomInfo.bankerMode == 6)
                            curRoomDes += "--9点坐庄";
                    }
                    roomTypeLabel.string = curRoomDes;
                    var curDate = new Date(curRoomInfo.beginTime)
                    roomDate1Label.string = curDate.getFullYear()+"-"+(parseInt(curDate.getMonth())+1)+"-"+curDate.getDate();
                    roomDate2Label.string = curDate.getHours()+":"+curDate.getMinutes()+":"+curDate.getSeconds();
                    if(curRoomInfo.state == 1)
                    {
                        roomState1.active = false;
                        roomState2.active = true;
                    }
                    var curPlayerNode = newRoomInfoItem.getChildByName("playerNode");
                    var curPlayerCount = 0;
                    for(var k in curRoomInfo.players)
                    {
                        curPlayerCount++;
                        var curPlayerNodeName = curPlayerNode.getChildByName("name"+(parseInt(k)));
                        curPlayerNodeName.active = true;
                        curPlayerNodeName.getComponent("cc.Label").string = curRoomInfo.players[k].nickname;
                        if(curRoomInfo.playerNumber &&  curRoomInfo.playerNumber == 9)
                        {
                            if(k % 2 == 0)
                                curPlayerNodeName.x = -50;
                            else
                                curPlayerNodeName.x = 50;
                            if(k == 8)
                                curPlayerNodeName.x = 0;
                            
                            curPlayerNodeName.y = 50 - 28*parseInt(k/2);
                        }else{
                            curPlayerNodeName.x = 0;
                            curPlayerNodeName.y = 50 - 28*k;
                        }
                    }
                    var roomPlayerCount = curPlayerNode.getChildByName("num").getComponent("cc.Label");
                    var newPlayerNum = 6;
                    if(curRoomInfo.playerNumber &&  curRoomInfo.playerNumber == 9)
                        newPlayerNum = 9;
                    roomPlayerCount.string = curPlayerCount + "/" + newPlayerNum;

                    var joinCallBack = function(){
                        console.log("加入自己开的房间"+joinCallBack.id);
                        self.joinRoom(joinCallBack.id);
                    };
                    joinCallBack.id = curRoomInfo.roomId;
                    roomBtnJoin.node.on(cc.Node.EventType.TOUCH_START, joinCallBack, self);

                    var closeCallBack = function(){
                        console.log("关闭自己开的房间"+closeCallBack.id);
                        pomelo.request("connector.entryHandler.sendFrame", {"code" : "agencyFinish","params" : {"roomId" : closeCallBack.id}},function(data) {
                          if(data.flag == true)
                          {
                            console.log("关闭成功"+closeCallBack.id);
                              closeCallBack.roomInfoLayerContent1.width = closeCallBack.roomInfoLayerContent1.width - 260;
                              var curIndex = 0;
                              for(var k in closeCallBack.roomInfoItemList1)
                              {
                                if(closeCallBack.roomInfoItemList1[k].id == closeCallBack.id)
                                {
                                    curIndex = parseInt(k);
                                    console.log("第"+k+"个房间");
                                }
                              }
                              closeCallBack.roomInfoItemList1[curIndex].destroy();
                              for(var k in closeCallBack.roomInfoItemList1)
                              {
                                if(k>curIndex)
                                    if(closeCallBack.roomInfoItemList1[k])
                                        closeCallBack.roomInfoItemList1[k].x = closeCallBack.roomInfoItemList1[k].x - 260;
                              }
                              closeCallBack.roomInfoItemList1.splice(curIndex,1);
                          }
                          // console.log(closeCallBack.roomInfoItemList1);
                          // for(var k in closeCallBack.roomInfoItemList1)
                          // {
                          //   if(k>curIndex){
                          //       closeCallBack.roomInfoItemList1[k-1] = closeCallBack.roomInfoItemList1[k];
                          //       console.log(k);
                          //   }
                          // }
                        });
                    };
                    closeCallBack.id = curRoomInfo.roomId;
                    closeCallBack.i = i;
                    closeCallBack.roomInfoItemList1 = self.roomInfoItemList1;
                    closeCallBack.roomInfoLayerContent1 = self.roomInfoLayerContent1;
                    roomBtnClose.node.on(cc.Node.EventType.TOUCH_START, closeCallBack, self);

                    var inviteCallBack = function(){
                        console.log("邀请好友"+inviteCallBack.id);
                        self.btnShare(inviteCallBack.id)
                    };
                    inviteCallBack.id = curRoomInfo.roomId;
                    roomBtnInvite.node.on(cc.Node.EventType.TOUCH_START, inviteCallBack, self);

                    roomInfoItemCount++;
                }
            }
            self.roomInfoLayerContent1.width = 1070 + (roomInfoItemCount - 4) * 260;
        }); 
        this.node.active = true;
    },

    createRoomInfoLayer2:function(){
        var self = this;
        self.item2BeginY = -95;
        self.item2OffsetY = -170;
        var roomInfoItemCount = 0;
        for(var i in self.roomInfoData)
        {
            var curRoomInfo = self.roomInfoData[i];
            var newRoomInfoItem = {};
            if(curRoomInfo.playerNumber &&  curRoomInfo.playerNumber == 9)
                newRoomInfoItem = cc.instantiate(self.roomInfo_item3);
            else
                newRoomInfoItem = cc.instantiate(self.roomInfo_item2);
                
            self.roomInfoItemList2[i] = newRoomInfoItem;
            self.roomInfoLayerContent2.addChild(newRoomInfoItem);
            newRoomInfoItem.y = self.item2BeginY + self.item2OffsetY * i;
            
            var roomIDLabel = newRoomInfoItem.getChildByName("roomID").getComponent("cc.Label");
            var roomTypeLabel = newRoomInfoItem.getChildByName("roomType").getComponent("cc.Label");
            var roomDateLabel = newRoomInfoItem.getChildByName("roomDate").getComponent("cc.Label");
            roomIDLabel.string = "房间号:"+curRoomInfo.roomId;
            var curRoomDes = curRoomInfo.gameNumber + "局--";
            if(curRoomInfo.gameMode == 1)
                curRoomDes += "普通牛牛";
            else if(curRoomInfo.gameMode == 3)
                curRoomDes += "斗公牛";
            else if(curRoomInfo.gameMode == 4)
                curRoomDes += "通比牛牛";
            else{
                if(curRoomInfo.gameType == "zhajinniu")
                    curRoomDes += "炸金牛";
                else if(curRoomInfo.gameType == "mingpaiqz")
                    curRoomDes += "明牌抢庄";
                else if(curRoomInfo.gameType == "fengkuang")
                    curRoomDes += "疯狂加倍";
                else if(curRoomInfo.gameType == "sanKung")
                    curRoomDes += "比三张";
                else if(curRoomInfo.gameType == "zhajinhua")
                    curRoomDes += "拼三张";
            }
            if(curRoomInfo.bankerMode)
            {
                if(curRoomInfo.bankerMode == 1)
                    curRoomDes += "--随机抢庄";
                else if(curRoomInfo.bankerMode == 2)
                    curRoomDes += "--房主坐庄";
                else if(curRoomInfo.bankerMode == 3)
                    curRoomDes += "--轮流坐庄";
                else if(curRoomInfo.bankerMode == 5)
                    curRoomDes += "--牛牛坐庄";
                else if(curRoomInfo.bankerMode == 6)
                    curRoomDes += "--9点坐庄";
            }
            roomTypeLabel.string = curRoomDes;
            var curDate = new Date(curRoomInfo.beginTime)
            console.log(curDate);
            roomDateLabel.string = curDate.getFullYear()+"-"+(parseInt(curDate.getMonth())+1)+"-"+curDate.getDate()+"    "+curDate.getHours()+":"+curDate.getMinutes()+":"+curDate.getSeconds();
            var curPlayerNode = newRoomInfoItem.getChildByName("playerNode");
            for(var k in curRoomInfo.players)
            {
                var curPlayerNodeName = curPlayerNode.getChildByName("player"+(parseInt(k)));
                curPlayerNodeName.active = true;
                curPlayerNodeName.getChildByName("name").getComponent("cc.Label").string = curRoomInfo.players[k].nickname;
                curPlayerNodeName.getChildByName("id").getComponent("cc.Label").string = "ID:"+curRoomInfo.players[k].uid;
                var curScoreLabel = curPlayerNodeName.getChildByName("score").getComponent("cc.Label");
                curScoreLabel.string = "";
                if(curRoomInfo.player)
                {
                    if(curRoomInfo.player[k] > 0)
                        curScoreLabel.string = "+"+curRoomInfo.player[k].score;
                    else
                        curScoreLabel.string = curRoomInfo.player[k].score;
                }
            }
            roomInfoItemCount++;
        }
        self.roomInfoLayerContent2.height = 500 + (roomInfoItemCount - 3) * 170;
        this.roomInfoLayer2.active = true;
    },

    hideRoomInfoLayer1:function(){
        for(var i in this.roomInfoItemList1)
            this.roomInfoItemList1[i].destroy();
        this.roomInfoItemList1 = [];
        this.node.getChildByName("roomInfoView").getComponent("cc.ScrollView").scrollToLeft();
        this.node.active = false;
    },

    hideRoomInfoLayer2:function(){
        for(var i in this.roomInfoItemList2)
            this.roomInfoItemList2[i].destroy();
        this.roomInfoItemList2 = [];
        this.roomInfoLayer2.getChildByName("roomList").getComponent("cc.ScrollView").scrollToTop();
        this.roomInfoLayer2.active = false;
    },

    btnShare:function(id){
        var index = 0;
        for(var i in this.roomInfoData)
            if(id == this.roomInfoData[i].roomId)
                index = i;

        console.log("邀请好友" + index);
        var curData = this.roomInfoData[index];

        console.log("curShareData ===== ");
        console.log(curData);

        var curTitle = ""
        if(curData.gameMode == 1)
            curTitle += "【普通牛牛】,";
        else if(curData.gameMode == 3)
            curTitle += "【斗公牛】,";
        else if(curData.gameMode == 4)
            curTitle += "【通比牛牛】,";
        else if(curData.gameMode == 6)
            curTitle += "【疯狂加倍】,";
        else{
            if(curData.gameType == "zhajinniu"){
                curTitle += "【炸金牛】,";
            }else if(curData.gameType == "mingpaiqz"){
                curTitle += "【明牌抢庄】,";
            }else if(curData.gameType == "sanKung"){
                curTitle += "【比三张】,";
            }else if(curData.gameType == "zhajinhua"){
                curTitle += "【拼三张】,";
            }
        }
        curTitle += "房间号:" + curData.roomId;

        var curDes = "";
            if(curData.playerNumber &&  curData.playerNumber == 9)
                curDes = "九人场,"
            else
                curDes = "六人场,"
            if(curData.gameType == "zhajinniu"){
                curDes += "底分" + curData.basic + ",";
            }else if(curData.gameType == "mingpaiqz"){
                switch(curData.basic)
                {
                    case 1:
                        curDes += "底分1/2,";
                        break;
                    case 2:
                        curDes += "底分2/4,";
                        break;
                    case 3:
                        curDes += "底分4/8,";
                        break;
                    case 4:
                        curDes += "底分1/3/5,";
                        break;
                    case 5:
                        curDes += "底分2/4/6,";
                        break;
                }
            }else if(curData.gameType == "zhajinhua"){
                switch(curData.basic)
                {
                    case 1:
                        curDes += "底分1,";
                        break;
                    case 2:
                        curDes += "底分2,";
                        break;
                    case 5:
                        curDes += "底分5,";
                        break;
                }
                var curMaxBet = curData.maxBet;
                curDes += "最大单注"+curMaxBet+",";
                var curMaxRound = curData.maxRound;
                curDes += "轮数上限"+curMaxRound+",";
                switch(curData.stuffyRound)
                {
                    case 0:
                        curDes += "不闷牌,";
                        break;
                    case 1:
                        curDes += "闷1轮,";
                        break;
                    case 2:
                        curDes += "闷2轮,";
                        break;
                    case 3:
                        curDes += "闷3轮,";
                        break;
                }
            }

        curDes += curData.gameNumber + "局,";

        if(curData.cardMode == 1)
            curDes += "暗牌,";
        else if(curData.cardMode == 2)
            curDes += "明牌,"

        if(curData.gameMode == 1)
        {
            if(curData.bankerMode == 1)
                curDes += "随机抢庄,";
            else if(curData.bankerMode == 2)
                curDes += "房主坐庄,";
            else if(curData.bankerMode == 3)
                curDes += "轮流坐庄,";
            else if(curData.bankerMode == 5)
                curDes += "牛牛坐庄,";
            else if(curData.bankerMode == 6)
                curDes += "9点坐庄,";
        }
        curDes += "大家快来玩吧!";

        console.log(curTitle + curDes);
        if(confige.curUsePlatform == 1)
        {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "WXShare", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)V", curTitle, curDes, confige.shareURL, 0);
            this.parent.shareMask.active = true;
        }
        else if(confige.curUsePlatform == 2)
        {
            jsb.reflection.callStaticMethod("JSCallOC", "WXShareTitle:andDes:andUrl:andType:",curTitle, curDes, confige.shareURL, 0);
            this.parent.shareMask.active = true;
        }

        if(confige.curUsePlatform == 3)
        {
            console.log("url111111="+ confige.h5ShareUrlNew);
            console.log("url222222 ="+curData.roomId);
            var curShareURL = confige.h5ShareUrlNew.replace('ROOMNUM', curData.roomId);
            if(confige.h5InviteCode != "0")
            {
                curShareURL += "&invite_code=" + confige.h5InviteCode;
            }
            console.log("url333333="+ curShareURL);
            // wx.ready(function(res) {
                console.log("H5分享给好友");
                wx.onMenuShareAppMessage({
                    title: curTitle,
                    desc: curDes,
                    link: curShareURL,
                    imgUrl: confige.h5ShareIco,
                    trigger: function(res) {},
                    success: function(res) {},
                    cancel: function(res) {},
                    fail: function(res) {}
                });
                console.log("H5分享到朋友圈2222222");
                wx.onMenuShareTimeline({
                    title: curTitle,
                    desc: curDes,
                    link: curShareURL,
                    imgUrl: confige.h5ShareIco,
                    trigger: function(res) {},
                    success: function(res) {},
                    cancel: function(res) {},
                    fail: function(res) {}
                });
            // });
            this.parent.h5ShareNode.active = true;
            this.parent.h5ShareNode.stopAllActions();
            this.parent.h5ShareNode.opacity = 255;
            var deactiveCall = cc.callFunc(function () {
                this.parent.h5ShareNode.active = false;
            },this);  
            this.parent.h5ShareNode.runAction(cc.sequence(cc.delayTime(2),cc.fadeOut(1),deactiveCall));
        }

        var newCallFunc = function(){
            this.parent.openShare();
        };
        this.scheduleOnce(newCallFunc,0.5);
    },

    cleanRoomInfoLayer:function(){
        this.node.active = false;
        for(var i in this.roomInfoItemList)
            this.roomInfoItemList[i].destroy();

        this.node.getChildByName("roomList").getComponent("cc.ScrollView").scrollToTop();
    },

    joinRoom:function(joinRoomID){
        var roomId = parseInt(joinRoomID);
        var self = this;
        var joinCallFunc = function(){
            console.log("onBtnJoinRoom joinCallFunc!!!!!");
            self.parent.loadingLayer.showLoading();
        };
        pomelo.clientSend("join",{"roomId":roomId}, joinCallFunc);
        console.log("join room" + roomId);
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
        this.createRoomInfoLayerNew();
    },

    hideLayer:function(){
        this.node.active = false;
    },
});
