let disp = require("../../utils/broadcast");
let WebIM = require("../../utils/WebIM")["default"];
let msgStorage = require("../../comps/chat/msgstorage");


let msgType = require("../../comps/chat/msgtype");
const app = getApp()
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

let isfirstTime = true
Page({
    data: {
        search_btn: true,
        search_chats: false,
        show_mask: false,
        yourname: "",
        unReadSpotNum: 0,
        unReadNoticeNum: 0,
        messageNum: 0,
        unReadTotalNotNum: 0,
        arr: [],
        show_clear: false
    },

    onLoad(){
        let me = this
        app.watch('unReadMessageNum', function () {
            me.setData({
                count: app.globalData.unReadMessageNum
            })
        })
        const hxaccount = wx.getStorageSync("hxaccount") || '';
        const hxpassword = wx.getStorageSync("hxpassword") || '';
        app.conn.open({
            apiUrl: WebIM.config.apiURL,
            user: hxaccount,
            pwd: hxpassword,
            grant_type: 'password',
            appKey: WebIM.config.appkey
        })
       // app.globalData.unReadMessageNum = 0

        this.setData({
            nickName: wx.getStorageSync("userinfoLogin").nickName
        })

        //监听未读消息数
        disp.on("em.xmpp.unreadspot", function(message){
            // 拿到当前用户的好友列表
            const member = wx.getStorageSync('member')
            // 查询所收消息发送的用户是不是列表好友
            let hasCurrentFriend = member.find(item => item.name === message.from)
            // 好友列表中找不到该用户   更新好友列表
            if(!hasCurrentFriend) {
                // 创建新好友信息
                const newFriend = {"subscription":"both","jid":"","name": message.from,"groups":[]}
                // 拿到临时好友列表
                const temporaryFriendsList = wx.getStorageSync('temporaryFriendsList') || []
                //  把新好友信息加入 到 临时好友列表
                if(!(temporaryFriendsList.find(item => item.name === message.from))) {
                    wx.setStorageSync('temporaryFriendsList',[ ...temporaryFriendsList, newFriend ])
                }
                // me.getRoster
            }
            me.setData({
                arr: me.getChatList()
            })
        });
        disp.on("em.xmpp.contacts.remove", function(){
            me.getRoster();
            // me.setData({
            // 	arr: me.getChatList(),
            // 	unReadSpotNum: app.globalData.unReadMessageNum > 99 ? '99+' : app.globalData.unReadMessageNum,
            // });
        });
        if (app.globalData.state) {
            me.getRoster();
        }
        app.watch('state', function () {
            me.getRoster();
        })
    },
    onShow: function(){

        this.setData({
            arr: this.getChatList()
        })
        if (app.globalData.isIPX) {
            this.setData({
                isIPX: true
            })
        }
    },
    getRoster(){
        let me = this;
        let rosters = {
            success(roster, ele){
                console.log("好友名单", roster)
                var member = [];
                for(let i = 0; i < roster.length; i++){
                    if(roster[i].subscription == "both"){
                        member.push(roster[i]);
                    }
                }
               //  debugger
                wx.setStorage({
                    key: "member",
                    data: member
                });
                // me.setData({member: member});
                //if(!systemReady){
                disp.fire("em.main.ready");
                //systemReady = true;
                //}
                me.setData({
                    arr: me.getChatList(),
                    // unReadSpotNum: app.globalData.unReadMessageNum > 99 ? '99+' : app.globalData.unReadMessageNum,
                });
            },
            error(err){
                console.log('-->')
                console.log(err);
            }
        };
        WebIM.conn.getRoster(rosters);
    },

    getChatList() {
        const array = [];
        let member = wx.getStorageSync("member");
        const myName = wx.getStorageSync("myUsername");
        // 拿到临时好友列表
        const temporaryFriendsList = wx.getStorageSync('temporaryFriendsList') || [];
        // 临时好友列表和member列表同步 删除临时列表中重复好友  并更新本地
        temporaryFriendsList.forEach((item, i) => {
            if (member.find(option => item.name === option.name)) {
                temporaryFriendsList.splice(i, 1)
            }
        })
        wx.setStorageSync('temporaryFriendsList', temporaryFriendsList);
        // 在临时好友列表和member列表中查询聊天信息
        member = [ ...member, ...temporaryFriendsList ]
      //  debugger
        for(let i = 0; i < member.length; i++){
            let newChatMsgs = wx.getStorageSync(member[i].name + myName) || [];
            let historyChatMsgs = wx.getStorageSync("rendered_" + member[i].name + myName) || [];
            let curChatMsgs = historyChatMsgs.concat(newChatMsgs);
            // debugger
            if(curChatMsgs.length){
                let lastChatMsg = curChatMsgs[curChatMsgs.length - 1];
                lastChatMsg.unReadCount = newChatMsgs.length;
                if(lastChatMsg.unReadCount > 99) {
                    lastChatMsg.unReadCount = "99+";
                }
                let dateArr = lastChatMsg.time.split(' ')[0].split('-')
                let timeArr = lastChatMsg.time.split(' ')[1].split(':')
                let month = dateArr[2] < 10 ? '0' + dateArr[2] : dateArr[2]
                lastChatMsg.dateTimeNum = `${dateArr[1]}${month}${timeArr[0]}${timeArr[1]}${timeArr[2]}`
                lastChatMsg.time = `${dateArr[1]}月${dateArr[2]}日 ${timeArr[0]}时${timeArr[1]}分`
                if (lastChatMsg.info.to === wx.getStorageSync('hxaccount')) {
                    lastChatMsg.headImg = lastChatMsg.ext.headImgUrl1
                    lastChatMsg.name = lastChatMsg.ext.hxyourname1
                } else {
                    lastChatMsg.headImg = lastChatMsg.ext.headImgUrl
                    lastChatMsg.name = lastChatMsg.ext.hxyourname
                }
                array.push(lastChatMsg);
            }
        }
        array.sort((a, b) => {
            return b.dateTimeNum - a.dateTimeNum
        })
        return array;
    },
    del_chat: function(event){
        let detail = event.currentTarget.dataset.item;
        let nameList;
        if (detail.chatType == 'groupchat' || detail.chatType == 'chatRoom') {
            nameList = {
                your: detail.info.to
            };
        } else {
            nameList = {
                your: detail.username
            };
        }

        var myName = wx.getStorageSync("myUsername");
        var currentPage = getCurrentPages();

        wx.showModal({
            title: "删除该聊天记录",
            confirmText: "删除",
            success: function(res){
                if(res.confirm){
                    wx.setStorageSync(nameList.your + myName, "");
                    wx.setStorageSync("rendered_" + nameList.your + myName, "");
                    if(currentPage[0]){
                        currentPage[0].onShow();
                    }
                    disp.fire("em.chat.session.remove");
                }
            },
            fail: function(err){
            }
        });
    },
    imClickfun(e) {
        let data = e.currentTarget.dataset.item
        if (data.info.to === wx.getStorageSync('hxaccount')) {
            wx.setStorageSync("hxyouraccount", data.info.from);
        } else {
            wx.setStorageSync("hxyouraccount", data.info.to);
        }
        wx.setStorageSync("headImgUrl", data.headImg);
        wx.setStorageSync("hxyourname", data.name);
        wx.navigateTo({
            url: `/packageIm/pages/chatroom/chatroom`
        });

    },

});
