
cc.Class({
    extends: cc.Component,

    properties: {
        parent:{
            default:null,
            type:cc.Node
        },
        userItem:{
            default:null,
            type:cc.Node
        },
        lineItem:{
            default:null,
            type:cc.Node
        },
        isInit:false,
    },

    onLoad: function () {

    },

    onInit:function(){
        this.isInit = true;

        this.itemBeginY = -50;
        this.itemOffsetY = -225;

        this.lineBeginY = -200;
        this.lineOffsetY = -225;

        this.viewHeightOri = 430;

        this.xPosList = [-290,-100,100,290];
        //xPos：-290，-100，100，290
        this.userView = this.node.getChildByName("userView");
        this.userContent = this.userView.getChildByName("view").getChildByName("content");
        
        this.editNode = this.node.getChildByName("editNode");
        this.idEditBox = this.editNode.getChildByName("idEdit").getComponent("cc.EditBox");
        this.userName = this.editNode.getChildByName("userName").getComponent("cc.Label");

        this.checkType = false;
        this.checkBox = this.node.getChildByName("checkNode").getChildByName("check").getComponent("cc.Toggle");
        
        this.curUserCount = 0;
        this.userItemList = {};
        this.lineItemList = [];
        this.headImgList = {};
        this.curClubData = {};

        this.btnAddOK = this.editNode.getChildByName("btnOK").getComponent("cc.Button");
        this.btnRemove = this.node.getChildByName("btnRemove").getComponent("cc.Button");
        this.selectId = -1;
        this.selectNick = -1;
        this.tipsNode = this.node.getChildByName("tipsNode");
        this.tipsLabel = this.tipsNode.getChildByName("tipsLabel").getComponent("cc.Label");
    },

    btnClickWithIndex:function(event, customEventData){
        var index = parseInt(customEventData);
        switch(index){
            case 0:   //btnAdd
                this.editNode.active  = true;
                this.btnAddOK.interactable = false;
                this.idEditBox.string = "";
                this.userName.string = "用户昵称:";
                break;
            case 1:   //btnRemove
                this.tipsLabel.string = "删除成员:"+this.selectNick;
                this.tipsNode.active = true;
                break;
            case 2:   //btnOK
                var curAddId = parseInt(this.idEditBox.string);
                var self = this;
                pomelo.request("connector.club.addClubPlayer",{"playerId" : curAddId}, function(data) {
                    console.log(data);
                    if(data.flag == true){
                        self.addOneUser(data.data);
                        self.editNode.active = false;
                    }
                });

                break;
            case 3:   //btnCancle
                this.editNode.active = false;
                break;
            case 4:   //checkBox
                this.checkType = !this.checkType;
                pomelo.request("connector.club.clubSwitch",{"flag" : this.checkType}, function(data) {
                    console.log(data);
                });   
                break;
            case 5:   //tipsBox ok
                var self = this;
                pomelo.request("connector.club.removeClubPlayer",{"playerId" : parseInt(self.selectId)}, function(data) {
                    console.log(data);
                    if(data.flag == true)
                        self.removeOneUser(parseInt(self.selectId));
                });
                break;
            case 6:  //tipsBox cancle
                this.tipsNode.active = false;
                break;
        };
    },
    
    idEditEnd:function(){
        var self = this;
        var curUid = parseInt(this.idEditBox.string);
        pomelo.request("monitor.handle.queryNickName", {uid : curUid}, function(data) {
            console.log(data);
            if(data.flag == false)
            {
                console.log("查询失败！！！");
                self.userName.string = "查询失败请重新输入";
                self.btnAddOK.interactable = false;
                self.idEditBox.string = "";
            }else{
                console.log("查询成功！！！");
                self.userName.string = "用户昵称:" + data;
                self.btnAddOK.interactable = true;
            }
        });
    },

    reloadClubData:function(clubData){
        if(clubData.data.switch == "true"){
            this.checkType = true;
            this.checkBox.isChecked = true;
        }
        if(clubData.data.switch == "false"){
            this.checkType = false;
            this.checkBox.isChecked = false;
        }
        this.curClubData = clubData;
        var self = this;
        this.curUserCount = 0;
        for(var i in clubData.data)
        {
            var curUserId = i;
            
            if(curUserId != "switch")
            {
                var curUserData = JSON.parse(clubData.data[i]);
                this.addOneItem(curUserId,curUserData);
            }
        }
        
        var lineCount = parseInt(this.curUserCount/4);
        var addOne = 0;
        if(this.curUserCount%4 == 0)
            addOne = 0;
        else
            addOne = 1;
        for(var i=0;i<lineCount+addOne;i++)
        {
            var newLine = cc.instantiate(this.lineItem);
            newLine.active = true;
            this.userContent.addChild(newLine);
            this.lineItemList[i] = newLine;
            newLine.y = this.lineBeginY + this.lineOffsetY*i;
        }
        if(lineCount > 1)
        {
            this.userContent.height = 430 - this.lineOffsetY*(lineCount-1) ;
            this.userContent.y = 0;
        }else{
            this.userContent.height = 430;
            this.userContent.y = 0;
        }
        console.log("clubData ===== " + clubData);
    },

    cleanClubData:function(){
        for(var i in this.userItemList)
            this.userItemList[i].destroy();
        for(var i in this.lineItemList)
            this.lineItemList[i].destroy();

        this.userItemList = {};
        this.lineItemList = [];

        this.btnRemove.interactable = false;
        this.selectId = -1;

        // pomelo.request("connector.club.clubSwitch",{"flag" : this.checkType}, function(data) {
        //     console.log(data);
        // });
    },

    selectWithId:function(curUserId){
        this.btnRemove.interactable = true;
        this.selectId = curUserId;
    },

    addOneUser:function(data){
        var oldLineCount = parseInt((this.curUserCount-1)/4);
        this.curClubData.data[parseInt(data.uid)] = JSON.stringify(data);
        this.addOneItem(data.uid,data);
        var newLineCount = parseInt((this.curUserCount-1)/4);
        // if(this.curUserCount == 1)
        //     newLineCount ++;
        if(newLineCount > oldLineCount || newLineCount == 0)
        {
            if(this.lineItemList[newLineCount])
                this.lineItemList[newLineCount].active = true;
            else{
                var newLine = cc.instantiate(this.lineItem);
                newLine.active = true;
                this.userContent.addChild(newLine);
                this.lineItemList[newLineCount] = newLine;
                newLine.y = this.lineBeginY + this.lineOffsetY*newLineCount;
            }
            if(this.lineItemList.length > 2)
                this.userContent.height = this.userContent.height - this.lineOffsetY;
        }
    },

    removeOneUser:function(index){
        var oldLineCount = parseInt((this.curUserCount-1)/4);
        this.userItemList[index].active = false;
        var curUserIndex = this.userItemList[index].userIndex;
        console.log("curUserIndex === " + curUserIndex);
        for(var i in this.userItemList)
        {
            if(this.userItemList[i].userIndex > curUserIndex)
                this.userItemList[i].userIndex --;
        }
        this.curUserCount --;
        for(var i in this.userItemList)
        {
            this.userItemList[i].x = this.xPosList[this.userItemList[i].userIndex%4];
            this.userItemList[i].y = this.itemBeginY + this.itemOffsetY*parseInt(this.userItemList[i].userIndex/4);
        }

        var newLineCount = parseInt((this.curUserCount-1)/4);
        console.log("oldLineCount==="+oldLineCount);
        console.log("newLineCount==="+newLineCount);
        if(newLineCount < oldLineCount)
        {
            this.lineItemList[oldLineCount].active = false;
            if(this.lineItemList.length > 2)
                this.userContent.height = this.userContent.height + this.lineOffsetY;
        }
        if(this.curUserCount == 0)
            this.lineItemList[0].active = false;
        this.tipsNode.active = false;
        this.btnRemove.interactable = false;
        this.selectId = -1;
    },

    addOneItem:function(userId,userData){
        if(userData.nickname == null || userId == null)
            return;
        var self = this;
        // console.log("curUserId === "+userId);
        var newUserItem = cc.instantiate(this.userItem);
        newUserItem.active = true;
        this.userContent.addChild(newUserItem);
        this.userItemList[userId] = newUserItem;
        newUserItem.x = this.xPosList[this.curUserCount%4];
        newUserItem.y = this.itemBeginY + this.itemOffsetY*parseInt(this.curUserCount/4);
                
        newUserItem.userIndex = this.curUserCount;
        var curUserData = userData;
        newUserItem.getChildByName("headBox1").active = false;  //选中框
        var curUserHead = newUserItem.getChildByName("headImg").getComponent("cc.Sprite");
        if(this.headImgList[userId])
        {
            curUserHead.spriteFrame = this.headImgList[userId];
        }else{
            this.getWXHearFrameNoSave(curUserData.head,curUserHead,userId);
        }
        newUserItem.getChildByName("name").getComponent("cc.Label").string = curUserData.nickname;
        newUserItem.nickString = curUserData.nickname;
        newUserItem.getChildByName("id").getComponent("cc.Label").string = curUserData.uid;

        var curUserSelect = newUserItem.getChildByName("btnSelect").getComponent("cc.Button");
        var selectCallBack = function(){
            console.log("选择用户"+selectCallBack.id);
            if(self.selectId != -1)
                self.userItemList[self.selectId].getChildByName("headBox1").active = false;

            self.selectWithId(selectCallBack.id);
            self.userItemList[selectCallBack.id].getChildByName("headBox1").active = true;
            self.selectNick = self.userItemList[selectCallBack.id].nickString;
        };
        selectCallBack.id = userId;
        curUserSelect.node.on(cc.Node.EventType.TOUCH_END, selectCallBack, self);

        this.curUserCount ++;
    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.cleanClubData();
    },

    getWXHearFrameNoSave:function(headUrl,sprite,uid) {
        if(headUrl == ""){
            console.log("fuck@@@@@@@@@")
            return;
        }
        console.log("getWXHearFrameNoSave");
        var self = this;
        cc.loader.load({url:headUrl,type:'png'}, function (err, texture) {
            var newFrame = new cc.SpriteFrame(texture);
            if(sprite)
                sprite.spriteFrame = newFrame;
            self.headImgList[uid] = newFrame;
        });
    },
});
