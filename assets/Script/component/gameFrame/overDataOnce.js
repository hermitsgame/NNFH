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
    },

    // use this for initialization
    onLoad: function () {

    },
    
    onInit:function(){
        this.head = this.node.getChildByName("head").getComponent("cc.Sprite");
        this.nameL = this.node.getChildByName("playerNick").getComponent("cc.Label");
        this.IDL = this.node.getChildByName("playerId").getComponent("cc.Label");
        this.scoreLWNode = this.node.getChildByName("scoreNumW");
        this.scoreLLNode = this.node.getChildByName("scoreNumL");
        this.scoreLW = this.node.getChildByName("scoreNumW").getComponent("cc.Label");
        this.scoreLL = this.node.getChildByName("scoreNumL").getComponent("cc.Label");
        // //庄
        // this.num0 = this.node.getChildByName("num0").getComponent("cc.Label");
        // //五小牛
        // this.num1 = this.node.getChildByName("num1").getComponent("cc.Label");
        // //五花牛
        // this.num2 = this.node.getChildByName("num2").getComponent("cc.Label");
        // //炸弹
        // this.num3 = this.node.getChildByName("num3").getComponent("cc.Label");
        // //牛牛
        // this.num4 = this.node.getChildByName("num4").getComponent("cc.Label");
        // //有牛
        // this.num5 = this.node.getChildByName("num5").getComponent("cc.Label");
        // //无牛
        // this.num6 = this.node.getChildByName("num6").getComponent("cc.Label");
        
        this.loseIco = this.node.getChildByName("lose");
        this.winIco = this.node.getChildByName("win");
    },
    
    showMaster:function(){
        console.log("fuck showMaster");
        this.masterIco = this.node.getChildByName("master");
        this.masterIco.active = true;
    },
    
    setScore:function(score){
        console.log("fuck score" + score);
        if(score < 0)
        {
            this.scoreLLNode.active = false;
            this.scoreLWNode.active = true;
            this.scoreLW.string = "." + score;
        }else{
            this.scoreLWNode.active = false;
            this.scoreLLNode.active = true;
            this.scoreLL.string = "/" + score;
        }
            
    },
    
    onLoadData:function(dataOnce){
        
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
