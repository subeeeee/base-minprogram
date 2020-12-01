import { getUserPhone } from "../../../utils/util.js";
const app =  getApp();
Component({
    properties: {
        hasCallBack:Boolean
    },
    data:{
        miniprogramTitle:app.globalData.miniprogramTitle,
        projectName:app.globalData.projectName,
        imgServerUrl:app.globalData.imgServerUrl,
    },
    methods: {
    	closePhoneBox:function(){
    		this.triggerEvent("parentEvent")
    	},
        getUserPhone(e){
            let callback;
            if(this.data.hasCallBack){
                callback = ()=>{
                    this.triggerEvent('callback')
                }
            }
            getUserPhone(e,callback)
        }
    }
})
