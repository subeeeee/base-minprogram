module.exports = {
    data: {
        isIPhoneX: false,
        statusBarHeight: 0
    },
    getSafeArea: function() {
        wx.getSystemInfo({
            success: ({ model, screenHeight, statusBarHeight }) => {
                const iphoneX = /iphone x/i.test(model);
                const iphoneNew = /iPhone11/i.test(model) && screenHeight === 812;
                this.data.isIPhoneX = iphoneX || iphoneNew;
                this.data.statusBarHeight = statusBarHeight;
            }
        });
    }
}