var confige = require("confige");

cc.Class({
    extends: cc.Component,

    properties: {
        isInit:false,
    },

    // use this for initialization
    onLoad: function () {

    },

    onInit:function(){
        this.btnOpenMusic = this.node.getChildByName("btnOpenM");
        this.btnCloseMusic = this.node.getChildByName("btnCloseM");
        this.btnOpenSound = this.node.getChildByName("btnOpenS");
        this.btnCloseSound = this.node.getChildByName("btnCloseS");

        if(confige.musicEnable == true)
            this.btnOpenMusic.active = false;
        else
            this.btnCloseMusic.active = false;

        if(confige.soundEnable == true)
            this.btnOpenSound.active = false;
        else
            this.btnCloseSound.active = false;

        this.btnRefresh = this.node.getChildByName("btnRefresh");
        this.isInit = true;
    },

    onBtnClick:function(event, customEventData){
        var clickIndex = parseInt(customEventData);
        if(clickIndex == 0)
        {
            confige.musicEnable = true;
            this.btnOpenMusic.active = false;
            this.btnCloseMusic.active = true;
            confige.audioBgId = cc.audioEngine.play(confige.audioList["bgm"],true,confige.audioVolume);
        }else if(clickIndex == 1){
            confige.musicEnable = false;
            this.btnCloseMusic.active = false;
            this.btnOpenMusic.active = true;
            cc.audioEngine.stop(confige.audioBgId);
        }else if(clickIndex == 2){
            confige.soundEnable = true;
            this.btnOpenSound.active = false;
            this.btnCloseSound.active = true;
        }else if(clickIndex == 3){
            confige.soundEnable = false;
            this.btnCloseSound.active = false;
            this.btnOpenSound.active = true;
        }
        this.saveSetting();
    },

    showSetting:function(){
        this.node.active = true;
    },

    hideSetting:function(){
        this.node.active = false;
    },

    saveSetting:function(){
        var userSetting = {
            musicEnable : confige.musicEnable,
            soundEnable : confige.soundEnable
        };
        cc.sys.localStorage.setItem('userSetting', JSON.stringify(userSetting));
        var userSetting = JSON.parse(cc.sys.localStorage.getItem('userSetting'));
        console.log(userSetting);
    },

    showRefreshBtn:function(){
        this.btnRefresh.active = true;
    },

    btnRefreshClick:function(){
        this.parent.btnClickRefresh();
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
