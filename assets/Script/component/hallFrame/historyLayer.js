var confige = require("confige");
cc.Class({
    extends: cc.Component,

    properties: {
        history_item:{
            default:null,
            type:cc.Prefab
        },
        history_item2:{
            default:null,
            type:cc.Prefab
        },
        isInit:false,
    },

    onLoad: function () {

    },

    onInit:function(){
        if(cc.sys.platform == cc.sys.MOBILE_BROWSER)
        {
            this.node.height = 790;
            this.hisBg1 = this.node.getChildByName("bg1");
            this.hisBg2 = this.node.getChildByName("bg2");
            this.hisBg1.height = 790;
            this.hisBg2.height = 790;
        }

        this.historyContent = this.node.getChildByName("historyScrollView").getChildByName("view").getChildByName("content");
        
        this.historyNotice = this.node.getChildByName("notice");

        this.historyItemBeginY = -10;
        this.historyItemOffsetY = -250;
        this.historyItemOffsetY2 = -365;

        this.historyItemList = {};
        this.isInit = true;
    },

    updateHistory:function(){
        for(var i in this.historyItemList)
        {
            this.historyItemList[i].destroy();
        }
        this.historyItemList = {};
 
        if(confige.curHistory.allGames == 0){
            this.historyNotice.active = true;
            return;
        }else{
            this.historyNotice.active = false;
        }

        var newContentHeight = 0;
        var historyItemCount = 0;
        for(var i in confige.curHistory.List)
        {
            historyItemCount++;

            var curRoomData = confige.curHistory.List[i];
            console.log("curRoomData======");
            console.log(curRoomData);
            var newHistoryItem = {};

            var newHisPlayerCount = 0;
            for(var j in curRoomData.player)
                newHisPlayerCount ++;
            if(newHisPlayerCount > 6){
                newHistoryItem = cc.instantiate(this.history_item2);
                newHistoryItem.y = this.historyItemBeginY - newContentHeight;
                newContentHeight += 365;
            }
            else{
                newHistoryItem = cc.instantiate(this.history_item);
                newHistoryItem.y = this.historyItemBeginY - newContentHeight;
                newContentHeight += 250;
            }
            this.historyItemList[i] = newHistoryItem;
            this.historyContent.addChild(newHistoryItem);
            
            var hisIndex = newHistoryItem.getChildByName("index").getComponent("cc.Label");
            var roomID = newHistoryItem.getChildByName("roomID").getComponent("cc.Label");
            var date = newHistoryItem.getChildByName("date").getComponent("cc.Label");
            hisIndex.string = (parseInt(i)+1);
            roomID.string = curRoomData.roomId;
            var curDate = curRoomData.date.year+"/";
            
            if(curRoomData.date.month<9)
            {
                curDate = curDate + "0" + (curRoomData.date.month+1) + "/";
            }else{
                curDate = curDate + (curRoomData.date.month+1) + "/";
            }
            if(curRoomData.date.day<10)
            {
                curDate = curDate + "0" + curRoomData.date.day + "  ";
            }else{
                curDate = curDate + curRoomData.date.day + "  ";
            }
            if(curRoomData.date.hours<10)
            {
                curDate = curDate + "0" + curRoomData.date.hours + ":";
            }else{
                curDate = curDate + curRoomData.date.hours + ":";
            }
            if(curRoomData.date.minute<10)
            {
                curDate = curDate + "0" + curRoomData.date.minute + ":";
            }else{
                curDate = curDate + curRoomData.date.minute + ":";
            }
            if(curRoomData.date.second<10)
            {
                curDate = curDate + "0" + curRoomData.date.second;
            }else{
                curDate = curDate + curRoomData.date.second;
            }
            date.string = curDate;

            for(var j in curRoomData.player)
            {
                var curPlayerData = curRoomData.player[j];
                var curNameL = newHistoryItem.getChildByName("name"+j).getComponent("cc.Label");
                var curScoreL = newHistoryItem.getChildByName("score"+j).getComponent("cc.Label");
                curNameL.string = curPlayerData.name;
                curScoreL.string = curPlayerData.score;
            }
        }
        if(newContentHeight < 500)
            newContentHeight = 500;
        this.historyContent.height = newContentHeight;
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
        this.updateHistory();
    },

    hideLayer:function(){
        this.node.active = false;
    },
});
