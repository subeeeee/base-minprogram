import Api from "../../../utils/api.js";
import { getUserInfo } from "../../../utils/util.js";
const app =  getApp();
Page({
    data: {
        isUserAuth: 0,
        pageType:'',
        cdnUrl:app.globalData.cdnUrl
    },
    onLoad(options) {
        // 组建中拿到顾问id houseid pageType  pageType作用未知

        const { memberid, houseid='', pageType='' } = options;
        this.setData({
            memberid,
            houseid,
            pageType
        });
        // 把顾问id放到session
        wx.setStorageSync("memberId", memberid);

        const id = wx.getStorageSync("userinfoLogin").id || "";
        // 用户身份customerId
        const customerId = wx.getStorageSync("customerId") || "";
        
        // 如果本地有环信账户
        // 后台只会给顾问保存环信账号，所有其他身份的用户一直会调/applet/member/openHx接口
        Api.fetch({
            method: 'get',
            url: '/onlineCustomer/get/' + id+`${houseid?'/':''}${houseid}`
        }).then(({ code, data }) => {
            if (code === 200) {
                const { hxAccount, hxPassword } = data;
                // 需要判断当前身份
                if (hxAccount) {
                    // 如果有账户并且身份是顾问就要去取顾问身份的账户
                    if (data.userType === '1'||data.userType === '3') {
                        this.getdetailFun(data.memberId)
                    } else {
                        wx.setStorageSync("hxpassword", hxPassword);
                        wx.setStorageSync("hxaccount", hxAccount);
                        wx.setStorageSync("myUsername", hxAccount);
                        if (!memberid) {
                            wx.redirectTo({
                                url: '/packageIm/pages/chat/chat'
                            });
                        }
                    }
                } else {
                    // 如果没有账户就去开通
                    // 顾问身份开通传memberId，type传1
                    // 用户身份传customerId，type传0
                    if (data.userType === '1'|| data.userType === '3') {
                        this.kaitong(data.memberId, 1)
                    } else {
                        this.kaitong(customerId, 0)
                    }
                }
            }
        });
    },
    onShow() {
        // const customerId = wx.getStorageSync("customerId") || "";
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        // 如果没有微信昵称 重新登陆 获取微信账号信息
        if (!userinfoLogin.nickName) {
            // wx.navigateTo({
            //     url: '/pages/login/auth/index'
            // });
            this.setData({
                isUserAuth:1
            });
            return false
        }else{
            // tabbar上的消息直接去  /packageIm/pages/chat/chat
            //  如果有顾问id ? 直接进入聊天室 -> 继续
            if (this.data.memberid) {
                this.getdetailFun()
            } else {
                //-> 去聊天列表 
                wx.redirectTo({
                    url: '/packageIm/pages/chat/chat'
                });
            }
        }
    },
    kaitong(id, type) {
        Api.fetch({
            method: 'get',
            url: '/applet/member/openHx',
            showLoading: true,
            data: {
                bizId: id,
                userType: type
            }
        }).then(({ code, data }) => {
            if (code === 200) {
                // TODO err  不知道为什么开发时候需要区分状态
                // if (type === 0) {
                    wx.setStorageSync("hxpassword", data.hxPassword);
                    wx.setStorageSync("hxaccount", data.hxAccount);
                    wx.setStorageSync("myUsername", data.hxAccount);
                // } else {
                    wx.setStorageSync("hxyourname", data.nickName);
                    wx.setStorageSync("hxyouraccount", data.hxAccount);
                // }
                //  this.data.memberid  如果是详情页里面的有对于顾问的会有这个值
                if (!this.data.memberid) {
                    if(this.data.pageType!=='tabBar'){
                        wx.redirectTo({
                            url: '/packageIm/pages/chat/chat'
                        });
                    }

                } else {
                    //当和顾问聊天 时候，顾问没有环信账号的时候，会给顾问创建账号，
                    // 我测的时候是 点楼房详情里面的在线咨询的时候 可能会走这，如果不加的话会是空白页
                    if(type==1||type==3){
                        wx.redirectTo({
                            url: `/packageIm/pages/chatroom/chatroom?houseid=${this.data.houseid}`
                        });
                    }

                }

            }
        });
    },
    getdetailFun(id) {
        // 有参数时  是从onload过来  没参数是是从onshow过来
        const { memberid = '' } = this.data;
        Api.fetch({
            method: 'get',
            url: '/applet/member/getDetail',
            showLoading: true,
            data: {
                // 这个id从两个地方拿到 都是顾问id
                memberId: id ? id : memberid
            }
        }).then(({ code, data }) => {
            if (code === 200) {
                if (data.hxAccount) {
                    // 从onload过来 没有参数 不用跳转到聊天室 
                    if (id) {
                        wx.setStorageSync("myUsername", data.hxAccount);
                        wx.setStorageSync("hxaccount", data.hxAccount);
                        wx.setStorageSync("hxpassword", data.hxPassword);
                        wx.setStorageSync("userHeadImg", data.headImgUrl ? data.headImgUrl.indexOf('http') != -1 ? data.headImgUrl : (this.data.cdnUrl + data.headImgUrl + '?x-oss-process=image/resize,h_250') : '');
                        wx.setStorageSync("userName", data.name);
                    } else {
                        // 从onshow过来  跳转到聊天室 houseid为过来时候带上的houseid
                        wx.setStorageSync("headImgUrl", data.headImgUrl ? data.headImgUrl.indexOf('http') != -1 ? data.headImgUrl : (this.data.cdnUrl + data.headImgUrl + '?x-oss-process=image/resize,h_250') : '');
                        wx.setStorageSync("hxyourname", data.name);
                        wx.setStorageSync("hxyouraccount", data.hxAccount);
                        wx.redirectTo({
                            url: `/packageIm/pages/chatroom/chatroom?houseid=${this.data.houseid}`
                        });
                    }
                } else {
                    this.kaitong(data.memberId, 1)
                }
            }
        });
    },
    getUserInfo
});
