import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";
const app =  getApp();
Page({
    data: {
        listData: {},
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl,
    },
    onLoad() {
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data
        });
    },
    onShow() {
        this.getData()
    },
    getData() {
        Api.fetch({
            method: 'post',
            url: '/customerAppointment/queryCustomerAppointmentList',
            data: {
                customerId: wx.getStorageSync('customerId')
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.map((item,index)=>{
                    let projectFirstUrls = item.projectFirstUrls 
                    item.img = projectFirstUrls?`https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/${projectFirstUrls}`:this.data.imgServerUrl+'/xcx_images/no-cover-small.png';


                    let appointmentDate =  item.appointmentDate
                    item.appointmentDate =appointmentDate&&appointmentDate.split(' ')&&appointmentDate.split(' ')[0]||''
                })
                this.setData({
                    listData: res.data
                })
            }
        });
    },
    yuyue(e) {
        let id = e.currentTarget.dataset.id
        Api.getHouseDetails({projectId: id}).then((res) => {
            if (res.code == 200) {
                wx.navigateTo({
                    url: `/pages/house/yuyue/index?projectId=${id}&projectName=${res.data.referred}&isVerify=${res.data.isVerify}`
                });
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
});
