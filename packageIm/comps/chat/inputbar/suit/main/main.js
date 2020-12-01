import Api from "../../../../../../utils/api";

let WebIM = require("../../../../../utils/WebIM")["default"];
let msgType = require("../../../msgtype");
let disp = require("../../../../../utils/broadcast");
const app =  getApp();
Component({
	properties: {
		username: {
			type: Object,
			value: {},
		},
		chatType: {
			type: String,
			value: msgType.chatType.SINGLE_CHAT,
		},
        houseid: {
			type: String,
			value: '',
            observer: function(newVal, oldVal) {
				let that = this
				setTimeout(function () {
                    that.getHouseDetail(newVal)
                },2000)
            }
		},
	},
	data: {
		inputMessage: "",		// render input 的值
		userMessage: "",		// input 的实时值
		imgServerUrl:app.globalData.imgServerUrl,
		cdnUrl:app.globalData.cdnUrl
	},

	methods: {
		getHouseDetail(id) {
            Api.getHouseDetails({projectId: id}).then((res) => {
                if (res.code == 200) {
                    if (res.data.imageUrls) {
                        res.data.imageUrls = res.data.imageUrls.split(',')
										}
										let projectFirstUrls =res.data.projectFirstUrls
                    let obj = {
                    	id: res.data.projectId,
                    	img: projectFirstUrls?`${this.data.cdnUrl}${ projectFirstUrls}`:this.data.imgServerUrl+'/xcx_images/no-cover.png',
						name: res.data.referred,
						area: `建面${res.data.minArea && res.data.maxArea ? res.data.minArea +'-'+ res.data.maxArea + 'm²' : res.data.minArea ? res.data.minArea : res.data.maxArea ? res.data.maxArea + 'm²' : ''}`,
                        averagePrice: `${!res.data.averagePrice || isNaN(res.data.averagePrice) ? '价格待定' : res.data.averagePrice + '/m²'}`,
                        hxyourname: wx.getStorageSync('hxyourname'),
                        headImgUrl: wx.getStorageSync('headImgUrl'),
                        headImgUrl1: wx.getStorageSync('userHeadImg') || wx.getStorageSync('userinfoLogin').headImgUrl,
                        hxyourname1:  wx.getStorageSync('userName') || wx.getStorageSync('userinfoLogin').nickName,
                        memberId: wx.getStorageSync('memberId'),
												hxyouraccount: wx.getStorageSync('hxyouraccount'),
												tenantId: getApp().globalData.tenantId,
					}
                    this.sendMessage(obj)
                }
            });
		},
		focus(){
			this.triggerEvent("inputFocused", null, { bubbles: true });
		},

		blur(){
			this.triggerEvent("inputBlured", null, { bubbles: true });
		},

		isGroupChat(){
			return this.data.chatType == msgType.chatType.CHAT_ROOM;
		},

		getSendToParam(){
			return this.isGroupChat() ? this.data.username.groupId : this.data.username.your;
		},

		// bindinput 不能打冒号！
		bindMessage(e){
			this.setData({
				userMessage: e.detail.value
			});
		},

		emojiAction(emoji){
			var str;
			var msglen = this.data.userMessage.length - 1;
			if(emoji && emoji != "[del]"){
				str = this.data.userMessage + emoji;
			}
			else if(emoji == "[del]"){
				let start = this.data.userMessage.lastIndexOf("[");
				let end = this.data.userMessage.lastIndexOf("]");
				let len = end - start;
				if(end != -1 && end == msglen && len >= 3 && len <= 4){
					str = this.data.userMessage.slice(0, start);
				}
				else{
					str = this.data.userMessage.slice(0, msglen);
				}
			}
			this.setData({
				userMessage: str,
				inputMessage: str
			});
		},

		sendMessage(obj){
		    if (!obj.id) {
		        obj = {
                    hxyourname: wx.getStorageSync('hxyourname'),
                    headImgUrl: wx.getStorageSync('headImgUrl'),
                    memberId: wx.getStorageSync('memberId'),
                    headImgUrl1: wx.getStorageSync('userHeadImg') || wx.getStorageSync('userinfoLogin').headImgUrl,
										hxyourname1:  wx.getStorageSync('userName') || wx.getStorageSync('userinfoLogin').nickName,
										tenantId: getApp().globalData.tenantId,
                }
            }
			let me = this;

			String.prototype.trim=function()
			{
			     return this.replace(/(^\s*)|(\s*$)/g, '');
			}
			if(!this.data.userMessage.trim() && !obj){
				return;
			}
			let id = WebIM.conn.getUniqueId();
			let msg = new WebIM.message(msgType.TEXT, id);
			msg.set({
				msg: this.data.userMessage,
				from: this.data.username.myName,
				to: this.getSendToParam(),
				roomType: false,
                ext: obj,
				chatType: this.data.chatType,
				success(id, serverMsgId){
					//console.log('成功了')
					disp.fire('em.chat.sendSuccess', id, me.data.userMessage);
				},
				fail(id, serverMsgId){
					console.log('失败了')
				}
			});
			if(this.data.chatType == msgType.chatType.CHAT_ROOM){
				msg.setGroup("groupchat");
			}
			WebIM.conn.send(msg.body);
			this.triggerEvent(
				"newTextMsg",
				{
					msg: msg,
					type: msgType.TEXT,
				},
				{
					bubbles: true,
					composed: true
				}
			);
			//
			this.setData({
				userMessage: "",
				inputMessage: "",
			});
		},
	},

	// lifetimes
	created(){},
	attached(){},
	moved(){},
	detached(){},
	ready(){},
});
