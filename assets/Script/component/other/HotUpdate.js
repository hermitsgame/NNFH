// var UpdatePanel = require('../UI/UpdatePanel');
var confige = require("confige");

cc.Class({
    extends: cc.Component,

    properties: {
        // panel: UpdatePanel,
        manifestUrl: cc.RawAsset,
        // updateUI: cc.Node,
        _updating: false,
        _canRetry: false,
        needRestart: false,
        updateSchedule: -1
    },

    checkCb: function (event) {
        cc.log('Code: ' + event.getEventCode());
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.updateInfo.string = "No local manifest file found, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.updateInfo.string = "Fail to download manifest file, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.updateInfo.string = "Already up to date with the latest remote version.";
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.updateInfo.string = 'New version found, please try to update.';
                this.show();
                // this.panel.checkBtn.active = false;
                this.fileProgress.progress = 0;

                this.updateSchedule = function(){
                    // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "updateSchedule");
                    // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "progress==="+this.fileProgress.progress);
                    if(this.fileProgress.progress == 1)
                        this.restart();
                    // else
                        // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/JSCallJAVA", "JAVALog", "(Ljava/lang/String;)V", "progress != 11111111");
                };
                this.schedule(this.updateSchedule,1);
                // this.panel.byteProgress.progress = 0;
                break;
            default:
                return;
        }
        
        cc.eventManager.removeListener(this._checkListener);
        this._checkListener = null;
        this._updating = false;
    },

    updateCb: function (event) {
        
        var failed = false;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.updateInfo.string = 'No local manifest file found, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                // this.panel.byteProgress.progress = event.getPercent() / 100;
                this.fileProgress.progress = event.getPercentByFile() / 100;

                var msg = event.getMessage();
                if (msg) {
                    this.updateInfo.string = 'Updated file: ' + msg;
                    cc.log(event.getPercent().toFixed(2) + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.updateInfo.string = 'Fail to download manifest file, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.updateInfo.string = 'Already up to date with the latest remote version.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.updateInfo.string = 'Update finished. ' + event.getMessage();
                this.needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.updateInfo.string = 'Update failed. ' + event.getMessage();
                // this.panel.retryBtn.active = true;
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.updateInfo.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.updateInfo.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            this._updating = false;
        }

        if (this.needRestart) {
            this.restart();
        }
    },

    restart:function(){
        this.unschedule(this.updateSchedule);

        cc.eventManager.removeListener(this._updateListener);
        this._updateListener = null;
        cc.audioEngine.stopAll();
        // Prepend the manifest's search path
        var searchPaths = jsb.fileUtils.getSearchPaths();
        var newPaths = this._am.getLocalManifest().getSearchPaths();
        console.log(JSON.stringify(newPaths));
        Array.prototype.unshift(searchPaths, newPaths);
        // This value will be retrieved and appended to the default search path during game startup,
        // please refer to samples/js-tests/main.js for detailed usage.
        // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
        cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

        jsb.fileUtils.setSearchPaths(searchPaths);
        cc.game.restart();
    },
    
    retry: function () {
        if (!this._updating && this._canRetry) {
            // this.panel.retryBtn.active = false;
            this._canRetry = false;
            
            this.updateInfo.string = 'Retry failed Assets...';
            this._am.downloadFailedAssets();
        }
    },
    
    checkUpdate: function () {
        if (this._updating) {
            this.updateInfo.string = 'Checking or updating ...';
            return;
        }
        if (!this._am.getLocalManifest().isLoaded()) {
            this.updateInfo.string = 'Failed to load local manifest ...';
            return;
        }
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);

        this._am.checkUpdate();
        this._updating = true;
    },

    hotUpdate: function () {
        if (this._am && !this._updating) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            this._failCount = 0;
            this._am.update();
            // this.panel.updateBtn.active = false;
            this._updating = true;

            this.updateNode1.active = false;
            this.updateNode2.active = true;
        }
    },

    exit: function() {
        cc.director.end();
        if(confige.curUsePlatform == 2)
            jsb.reflection.callStaticMethod("JSCallOC","GameExit");
    },
    
    show:function(){
        this.node.active = true;
    },
    // show: function () {
        // if (this.updateUI.active === false) {
            // this.updateUI.active = true;
        // }
    // },

    // use this for initialization
    onLoad: function () {

    },

    onInit: function () {
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            return;
        }
        //me define
        this.updateInfo = this.node.getChildByName("info").getComponent("cc.Label");
        this.updateNode1 = this.node.getChildByName("node1");
        this.updateNode2 = this.node.getChildByName("node2");
        this.fileProgress = this.updateNode2.getChildByName("fileProgress").getComponent("cc.ProgressBar");

        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        cc.log('Storage path for remote asset : ' + storagePath);

        cc.log('Local manifest URL : ' + this.manifestUrl);
        this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this._am.setVersionCompareHandle(function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        });

        var infoLabel = this.updateInfo;
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                infoLabel.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                infoLabel.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        this.updateInfo.string = 'Hot update is ready, please check or directly update.';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            this.updateInfo.string = "Max concurrent tasks count have been limited to 2";
        }
        
        this.fileProgress.progress = 0;
        // this.panel.byteProgress.progress = 0;
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});
