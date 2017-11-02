cc.Class({
    extends: cc.Component,

    properties: {
        itemIndex: -1,
        oriNumber: -1, 
        parent:{
            default:null,
            type:cc.Node
        },
        editBox:{
            default:null,
            type:cc.EditBox
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    editBegin:function(){
        this.oriNumber = parseInt(this.editBox.getComponent(cc.EditBox).string);
        console.log("this.oriNumber ==== "+this.oriNumber);
    },

    editEnd:function(){
        var curEditBox = this.editBox.getComponent(cc.EditBox);
        console.log("item editEnd @@@@@@@");
        console.log("str ===== " + curEditBox.string);
        var curEditNum = parseInt(curEditBox.string);
        curEditBox.string = curEditNum;
        if(curEditNum == this.oriNumber)
            return;
        if(curEditNum >= 1 && curEditNum <= 50)
            this.parent.roomTimeEditEnd(this.itemIndex,curEditNum);
        else
            curEditBox.string = this.oriNumber;
    },

    setEdit:function(str){
        this.editBox.getComponent(cc.EditBox).string = str;
        console.log("setEdit OK!!!!!!!")
    },
});
