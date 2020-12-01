import { getUserInfo } from "../../../utils/util.js";
const app =  getApp();
Component({
    data:{
        miniprogramTitle:app.globalData.miniprogramTitle,
        projectName:app.globalData.projectName,
        imgServerUrl:app.globalData.imgServerUrl,
    },
    methods: {
        getUserInfo
    }
})
