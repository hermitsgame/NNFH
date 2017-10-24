var confige = require("confige");
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
        this.inviteEdit = this.node.getChildByName("inviteNum").getComponent("cc.EditBox");
        this.isInit = true;
    },

    onBtnInviteOK:function(){
        var curInviteNum = this.inviteEdit.string;
        console.log("curInviteNum === " + curInviteNum);

        var self = this;
        var xmlHttp = this.createXMLHttpRequest();

        var httpCallback = function(){
            if (xmlHttp.readyState==4)
              {// 4 = "loaded"
              if (xmlHttp.status==200)
                {// 200 = OK
                    var curReturn = JSON.parse(xmlHttp.responseText);
                    console.log(curReturn);
                    self.hideLayer();
                    if(curReturn.errcode == 0 ){
                        self.parent.showTips("绑定代理成功!\n代理ID="+curInviteNum);
                        self.parent.btn_invite.interactable = false;
                        cc.sys.localStorage.setItem('check_invite',true);
                    }else{
                        self.parent.showTips("绑定代理失败!\n请输入正确的ID!");
                    }
                }
              else
                {
                    console.log("Problem retrieving XML data");
                }
              }
            
        };

        this.scheduleOnce(function() {
            var url = "http://pay.5d8d.com/niu_admin.php/Api/setUserAgent?";
            // confige.userInfo.playerId = 10005;
            // curInviteNum = 10002;
            url = url + "game_uid=" + confige.userInfo.playerId + "&invite_code=" + curInviteNum;
            // var md5String = ("game_uid=" + confige.userInfo.playerId + "&invite_code=" + curInviteNum+"&key=niuniuyiyousecretkey");
            // var data = {
            //     game_uid : confige.userInfo.playerId,
            //     invite_code : curInviteNum
            // }
            // data.sign = this.getMD5(md5String);
            // url += require("querystring").stringify(data);
            
            console.log("url====="+ url);
            xmlHttp.onreadystatechange = httpCallback;
            xmlHttp.open("GET", url, true);// 异步处理返回   
            xmlHttp.setRequestHeader("Content-Type",  
                    "application/x-www-form-urlencoded;");  
            xmlHttp.send();
        }, 0.25);

    },

    showLayer:function(){
        if(this.isInit == false)
            this.onInit();
        this.node.active = true;
    },

    hideLayer:function(){
        this.node.active = false;
        this.inviteEdit.string = "";
    },

    createXMLHttpRequest:function() {  
        var xmlHttp;  
        if (window.XMLHttpRequest) {  
            xmlHttp = new XMLHttpRequest();  
            if (xmlHttp.overrideMimeType)  
                xmlHttp.overrideMimeType('text/xml');  
        } else if (window.ActiveXObject) {  
            try {  
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");  
            } catch (e) {  
                try {  
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");  
                } catch (e) {  
                }  
            }  
        } 
        return xmlHttp;  
    },
});
