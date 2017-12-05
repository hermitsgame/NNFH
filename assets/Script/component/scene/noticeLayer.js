cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        notice_item:{
            default:null,
            type:cc.Prefab
        },
    },

    // use this for initialization
    onLoad: function () {
        
    },
    
    onInit: function(){
        this.noticeCount = 0;
        this.noticeList = {};
        this.oriNoticePosx = 0;
        this.oriNoticePosy = 130;
        this.oriNoticePosOffset = -50;
        this.hasNotice = false;

        this.testContent = this.node.getChildByName("testView").getChildByName("view").getChildByName("content");
        this.testNode = this.testContent.getChildByName("text");
        this.testLabel = this.testNode.getComponent("cc.Label");
    },
    
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    showLayer:function(noticeData){
        this.node.active = true;
    },
    
    hideLayer:function(){
        this.node.active = false;
    },
    
    addNotice:function(noticeData){
        // if(this.hasNotice == true)
            // return;
        console.log(noticeData);
        // for(var i in noticeData)
        // {
        //     var newNotice = cc.instantiate(this.notice_item);
        //     this.node.addChild(newNotice);
            
        //     var newNoticeTitle = newNotice.getChildByName("title").getComponent("cc.Label");
        //     var newNoticeText = newNotice.getChildByName("text").getComponent("cc.Label");
        //     newNoticeTitle.string = noticeData[i].name;
        //     newNoticeText.string = noticeData[i].content;
            
        //     newNotice.setPosition(0,this.oriNoticePosy + this.oriNoticePosOffset*this.noticeCount);
        //     //this.noticeList[this.noticeCount] = newNotice;
        //     this.noticeCount ++;
        // }
        this.testLabel.string = noticeData[1].content;

        this.testContent.y = 0;
        var self = this;
        var callFunc = function(){
            if(self.testNode.height > 350)
                self.testContent.height = self.testNode.height + 30;
        };
        this.scheduleOnce(callFunc,0.05);
        
        // this.hasNotice = true;
    },
});
