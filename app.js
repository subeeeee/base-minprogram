
import Api from "/utils/api.js";
import config from "/config.js";

let disp = require("./packageIm/utils/broadcast");
let WebIM = require("./packageIm/utils/WebIM")["default"];
let msgStorage = require("./packageIm/comps/chat/msgstorage");

let msgType = require("./packageIm/comps/chat/msgtype");

function ack(receiveMsg) {
    // 处理未读消息回执
    var bodyId = receiveMsg.id; // 需要发送已读回执的消息id
    var ackMsg = new WebIM.message("read", WebIM.conn.getUniqueId());
    ackMsg.set({
        id: bodyId,
        to: receiveMsg.from
    });
    WebIM.conn.send(ackMsg.body);
}


function onMessageError(err) {
    if (err.type === "error") {
        wx.showToast({
            title: err.errorText
        });
        return false;
    }
    return true;
}

function getCurrentRoute() {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    return currentPage.route;
}

function calcUnReadSpot(message) {
    let myName = wx.getStorageSync("hxaccount");
    let members = wx.getStorageSync("member") || []; //好友
    var listGroups = wx.getStorageSync('listGroup') || []; //群组
    let allMembers = members.concat(listGroups)
    let count = allMembers.reduce(function (result, curMember, idx) {
        let chatMsgs;
        chatMsgs = wx.getStorageSync(curMember.name.toLowerCase() + myName.toLowerCase()) || [];
        return result + chatMsgs.length;
    }, 0);
    getApp().globalData.unReadMessageNum = count;
    disp.fire("em.xmpp.unreadspot", message);
}

let isfirstTime = true
App({
    onLaunch() {
        wx.getSystemInfo({
            success(res) {
                wx.setStorageSync('deviceType', res.model)
            },
            fail() {
                wx.setStorageSync('deviceType', '其他')
            }
        })
        // this.globalData.tenantId = config.CONFIG_INFO_PRO.tenantId
        // this.globalData.h5DoMain = config.CONFIG_INFO_PRO.h5DoMain
        // this.globalData.imgServerUrl = config.CONFIG_INFO_PRO.imgServerUrl
        // this.globalData.calculatorUrl = config.CONFIG_INFO_PRO.calculatorUrl
        // this.globalData.cdnUrl = config.CONFIG_INFO_PRO.cdnUrl
        // this.globalData.projectName = config.CONFIG_INFO_PRO.projectName
        this.globalData = {
            ...this.globalData,
            ...config.CONFIG_INFO_PRO
        }
        // this.globalData.tenantI = config.CONFIG_INFO_DEV.tenantId
        // this.globalData.h5DoMain = config.CONFIG_INFO_DEV.h5DoMain
        wx.setStorageSync("chaping", 0);
        wx.setStorageSync("cityShow", 0);
        // 获取用户信息
        wx.getSetting({
            withSubscriptions:true,
            success: res => {
                console.log(res)
                if (res.authSetting["scope.userInfo"]) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo;

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res);
                            }
                        }
                    });
                }
            }
        });
        let me = this
        const hxaccount = wx.getStorageSync("hxaccount") || '';
        const hxpassword = wx.getStorageSync("hxpassword") || '';
        disp.on("em.main.ready", function () {
            calcUnReadSpot();
        });
        disp.on("em.chatroom.leave", function () {
            calcUnReadSpot();
        });
        disp.on("em.chat.session.remove", function () {
            calcUnReadSpot();
        });
        disp.on('em.chat.audio.fileLoaded', function () {
            calcUnReadSpot()
        });

        disp.on('em.main.deleteFriend', function () {
            calcUnReadSpot()
        });
        disp.on('em.chat.audio.fileLoaded', function () {
            calcUnReadSpot()
        });
        this.getNeedStatisticalList()
        //
        if (hxaccount && hxpassword) {
            this.conn.open({
                apiUrl: WebIM.config.apiURL,
                user: hxaccount,
                pwd: hxpassword,
                grant_type: 'password',
                appKey: WebIM.config.appkey
            })
        }
        WebIM.conn.listen({
            onOpened(message) {
                WebIM.conn.setPresence();
                me.globalData.state = true
            },
            onReconnect() {
            },
            onSocketConnected() {
            },
            onClosed() {
                me.conn.closed = true;
                WebIM.conn.close();
            },
            onReadMessage(message) {
                //console.log('已读', message)
            },
            onVideoMessage(message) {
                if (message) {
                    msgStorage.saveReceiveMsg(message, msgType.VIDEO);
                }
                calcUnReadSpot(message);
                ack(message);
            },
            onAudioMessage(message) {
                if (message) {
                    if (onMessageError(message)) {
                        msgStorage.saveReceiveMsg(message, msgType.AUDIO);
                    }
                    calcUnReadSpot(message);
                    ack(message);
                }
            },
            onCmdMessage(message) {
                if (message) {
                    if (onMessageError(message)) {
                        msgStorage.saveReceiveMsg(message, msgType.CMD);
                    }
                    calcUnReadSpot(message);
                    ack(message);
                }
            },
            onTextMessage(message) {
                if (message) {
                    if (onMessageError(message)) {
                        msgStorage.saveReceiveMsg(message, msgType.TEXT);
                    }
                    calcUnReadSpot(message);
                    ack(message);

                    if (message.ext.msg_extension) {
                        let msgExtension = JSON.parse(message.ext.msg_extension)
                        let conferenceId = message.ext.conferenceId
                        let password = message.ext.password
                        disp.fire("em.xmpp.videoCall", {
                            msgExtension: msgExtension,
                            conferenceId: conferenceId,
                            password: password
                        });
                    }
                }
            },
            onEmojiMessage(message) {
                if (message) {
                    if (onMessageError(message)) {
                        msgStorage.saveReceiveMsg(message, msgType.EMOJI);
                    }
                    calcUnReadSpot(message);
                    ack(message);
                }
            },

            onPictureMessage(message) {
                if (message) {
                    if (onMessageError(message)) {
                        msgStorage.saveReceiveMsg(message, msgType.IMAGE);
                    }
                    calcUnReadSpot(message);
                    ack(message);
                }
            },

            onFileMessage(message) {
                if (message) {
                    if (onMessageError(message)) {
                        msgStorage.saveReceiveMsg(message, msgType.FILE);
                    }
                    calcUnReadSpot(message);
                    ack(message);
                }
            },
            onDeliveredMessage(message) {
                console.log(message);
            },
            // 各种异常
            onError(error) {
                console.log(error)
                // 16: server-side close the websocket connection
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_DISCONNECTED) {

                }
                // 8: offline by multi login
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_ERROR) {
                    wx.showToast({
                        title: "offline by multi login",
                        duration: 3000
                    });
                    wx.redirectTo({
                        url: "../login/login"
                    });
                }
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_OPEN_ERROR) {
                    wx.hideLoading()
                    disp.fire("em.xmpp.error.passwordErr");
                    // wx.showModal({
                    // 	title: "用户名或密码错误",
                    // 	confirmText: "OK",
                    // 	showCancel: false
                    // });
                }
                if (error.type == WebIM.statusCode.WEBIM_CONNCTION_AUTH_ERROR) {
                    wx.hideLoading()
                    disp.fire("em.xmpp.error.tokenErr");
                }
                if (error.type == 'socket_error') {///sendMsgError
                    console.log('socket_errorsocket_error', error)
                    wx.showToast({
                        title: "网络已断开",
                        icon: 'none',
                        duration: 3000
                    });
                    disp.fire("em.xmpp.error.sendMsgErr", error);
                }
            }
        });
        // generalStatistical({
        //     statisticalName:'registered'
        // })
    },
    conn: {
        closed: false,
        curOpenOpt: {},
        open(opt) {
            this.curOpenOpt = opt;
            WebIM.conn.open(opt);
            this.closed = false;
        },
        reopen() {
            if (this.closed) {
                //this.open(this.curOpenOpt);
                WebIM.conn.open(this.curOpenOpt);
                this.closed = false;
            }
        }
    },
    // 微信小程序热更新
    updateManager() {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(res => {
        });
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启应用？",
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                }
            });
        });

        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: "更新提示",
                content: "新版本下载失败",
                showCancel: false
            });
        });
    },
    globalData: {
        state: false,
        env: config.CONFIG_INFO.env,
        userInfo: null,
        navigationList: null,
        awardsConfig: {},
        runDegs: 0,
        fabulousObj: null
    },
    watch(key, method) {
        var obj = this.globalData
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            set: function (val) {
                this._name = val
                method(val)
            },
            get: function () {
                return this._name
            }
        })
    },
    async getNeedStatisticalList(){
        const res = await Api.fetch({
                method: 'get',
                url: '/wx/getBehavior',
                ContentType: true
        })

        if (res.code === 200) {
            if(res.data&&res.data.dictionary){
                wx.setStorageSync("statisticalDictionary",res.data.dictionary)
            }

          } else {
              wx.showToast({
                  icon:'none',
                  title: res.message,
                  duration:3000
              })
          }
      }
});
