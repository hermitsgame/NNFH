var confige = require("confige");

cc.Class({
    extends: cc.Component,

    properties: {
        parent:{
            default:null,
            type:cc.Node
        },
        labelOri:{
            default:null,
            type:cc.Node
        },
        isInit:false,
    },

    // use this for initialization
    onLoad: function () {

    },

    onInit:function(){
        this.beginY = 230;
        this.offsetY = -40;
        this.labelCount = 0;
        var curRoomData = confige.roomData;

        var gameMode = "模       式  :  ";
        if(curRoomData.roomType == "niuniu")
        {
            if(curRoomData.gameMode == 3)
                gameMode += "斗公牛";
            else if(curRoomData.gameMode == 1)
                gameMode += "普通牛牛"
        }else if(curRoomData.roomType == "mingpaiqz")
            gameMode += "明牌抢庄";
        else if(curRoomData.roomType == "sanKung")
            gameMode += "比三张";
        else if(curRoomData.roomType == "zhajinhua")
            gameMode += "拼三张";
        this.addOneLabel(gameMode);

        var playerMax = "最大人数  :  ";
        playerMax += curRoomData.playerNumber;
        this.addOneLabel(playerMax);

        var gameNumber = "局       数  :  ";
        gameNumber += curRoomData.maxGameNumber;
        this.addOneLabel(gameNumber);
    
        var consumeMode = "扣钻模式  :  ";
        if(curRoomData.consumeMode == "agency")
            consumeMode += "代开房已扣钻";
        else if(curRoomData.consumeMode == 1)
            consumeMode += "房主扣钻";
        else if(curRoomData.consumeMode == 2)
            consumeMode += "AA扣钻";
        else if(curRoomData.consumeMode == 3)
            consumeMode += "大赢家扣钻";
        this.addOneLabel(consumeMode);

        var halfwayEnter = "中途加入  :  ";
        if(curRoomData.halfwayEnter == 1)
            halfwayEnter += "允许";
        else
            halfwayEnter += "禁止";
        this.addOneLabel(halfwayEnter);

        var waitMode = "等待类型  :  ";
        if(curRoomData.waitMode == 0)
            waitMode += "离线不等待";
        else if(curRoomData.waitMode == 1)
            waitMode += "离线等待";
        else if(curRoomData.waitMode == 2)
            waitMode += "等待倒计时";
        this.addOneLabel(waitMode);

        if(curRoomData.roomType == "niuniu" || curRoomData.roomType == "mingpaiqz")
        {
            var special = "特殊牌型  :  ";
            if(curRoomData.special == true)
                special += "开启";
            else
                special += "未开启";
            this.addOneLabel(special);
        }

        if(curRoomData.roomType == "niuniu")
        {
            if(curRoomData.gameMode == 3){
                console.log("nothing");
                var cardMode = "模式选择  :  ";
                if(curRoomData.cardMode == 1)
                    cardMode += "暗牌";
                else if(curRoomData.cardMode == 2)
                    cardMode += "明牌";
                this.addOneLabel(cardMode);
            }else if(curRoomData.gameMode == 1){
                var cardMode = "模式选择  :  ";
                if(curRoomData.cardMode == 1)
                    cardMode += "暗牌";
                else if(curRoomData.cardMode == 2)
                    cardMode += "明牌";
                this.addOneLabel(cardMode);
                var bankerMode = "庄家模式  :  ";
                if(curRoomData.bankerMode == 1)
                    bankerMode += "抢庄";
                else if(curRoomData.bankerMode == 2)
                    bankerMode += "房主坐庄";
                else if(curRoomData.bankerMode == 3)
                    bankerMode += "轮庄";
                else if(curRoomData.bankerMode == 5)
                    bankerMode += "牛牛坐庄";
                this.addOneLabel(bankerMode);
                var basicType = "押       注  :  ";
                if(curRoomData.basicType == 0)
                    basicType += "1/2/3/5";
                else if(curRoomData.basicType == 1)
                    basicType += "1/5/10/20";
                this.addOneLabel(basicType);
            }
        }else if(curRoomData.roomType == "mingpaiqz"){
            var allowAllin = "推       注  :  "
            if(curRoomData.allowAllin == true)
                allowAllin += "开启";
            else
                allowAllin += "未开启";
            this.addOneLabel(allowAllin);
            var bankerMode = "庄家模式  :  ";
            if(curRoomData.bankerMode == 1)
                bankerMode += "抢庄";
            else if(curRoomData.bankerMode == 5)
                bankerMode += "牛牛坐庄";
            this.addOneLabel(bankerMode);
            var basic = "底       分  :  ";
            basic = basic + curRoomData.basic + "分";
            this.addOneLabel(basic);
            var basicType = "押       注  :  ";
            if(curRoomData.basicType == 1)
                basicType += "1/2";
            else if(curRoomData.basicType == 2)
                basicType += "2/4";
            else if(curRoomData.basicType == 3)
                basicType += "4/8";
            else if(curRoomData.basicType == 4)
                basicType += "1/3/5";
            else if(curRoomData.basicType == 5)
                basicType += "2/4/6";
            this.addOneLabel(basicType);

        }
        else if(curRoomData.roomType == "sanKung"){
            var cardMode = "模式选择  :  ";
            if(curRoomData.cardMode == 1)
                cardMode += "暗牌";
            else if(curRoomData.cardMode == 2)
                cardMode += "明牌";
            this.addOneLabel(cardMode);
            var bankerMode = "庄家模式  :  ";
            if(curRoomData.bankerMode == 1)
                bankerMode += "抢庄";
            else if(curRoomData.bankerMode == 2)
                bankerMode += "房主坐庄";
            else if(curRoomData.bankerMode == 6)
                bankerMode += "9点坐庄";
            this.addOneLabel(bankerMode);
            var basicType = "押       注  :  ";
            if(curRoomData.basicType == 0)
                basicType += "1/2/3/5";
            else if(curRoomData.basicType == 1)
                basicType += "1/5/10/20";
            this.addOneLabel(basicType);
        }
        else if(curRoomData.roomType == "zhajinhua"){
            var basic = "底       分  :  ";
            basic = basic + curRoomData.basic + "分";
            this.addOneLabel(basic);
            var maxBet = "最大单注  :  ";
            maxBet = maxBet + curRoomData.maxBet + "分";
            this.addOneLabel(maxBet);
            var maxRound = "最大轮数  :  ";
            maxRound = maxRound + curRoomData.maxRound + "轮";
            this.addOneLabel(maxRound);
            var stuffyRound = "闷牌轮数  :  ";
            if(curRoomData.stuffyRound == 0)
                stuffyRound += "不闷";
            else
                stuffyRound = stuffyRound + "闷" + curRoomData.stuffyRound + "轮";
            this.addOneLabel(stuffyRound);
        }

    },

    addOneLabel:function(labelStr){
        var newLabel = cc.instantiate(this.labelOri);
        newLabel.getComponent("cc.Label").string = labelStr;
        this.node.addChild(newLabel);
        newLabel.y = this.beginY + this.offsetY * this.labelCount;
        this.labelCount ++;
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
