let WebIM = require("../../../../../utils/WebIM")["default"];
let msgType = require("../../../msgtype");
let EMOJI_STATUS = {
	OPENED: "showEmoji",
	CLOSED: "emoji_list",
};

Component({
	data: {
		show: EMOJI_STATUS.CLOSED,
		emoji: WebIM.Emoji,
		emojiObj: WebIM.EmojiObj,

		interval: 5000,
		duration: 3000,
		autoplay: false,
		indicatorDots: true,	// 显示面板指示点
	},
	methods: {
		openEmoji(){
			this.setData({
				show: EMOJI_STATUS.OPENED
			});
		},

		// 输出 emoji
		sendEmoji(event){
			var emoji = event.target.dataset.emoji;
			this.triggerEvent(
				"newEmojiStr",
				{
					msg: emoji,
					type: msgType.EMOJI,
				},
				{
					bubbles: true,
					composed: true
				}
			);
		},
	},
});
