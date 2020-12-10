import imAppGetUserSig from '/utils/generateTestUserSig.js'
const PRO_LIST = [
	'原点云易',
	'紫光海阔',
	'廊坊阳光行',
	'明月江南',
]
const CONFIG_PROJECT = '原点云易'

// 静态 新增项目不用配置
const CONFIG_INFO = {
	env:'dev',
	qqMapWxKey:'LAIBZ-P6V36-2MASP-EEV4C-ZVHBF-Y3BTU',
	TIM: null,
	tim:null,
	imAppGetUserSig: imAppGetUserSig, // 临时前端获取，后期要改成后端接口查结果
	imAppID: 1400342446,
	imAppSecret: '2a9ad2a81cc737d0749533a8213956895e800b08f36560a560eba8b2c364d64e',
}
const CONFIG_PRO_INFO = {
	
	'原点云易': {
		appId: 'wxc15d5e3ee45166b8',
		proName: '云易售楼处',
		alias: '云易售楼处',
		tenantId: '1164523599620829185',
		darkColor: '#FD528D',
		lightColor: '#FF8282',
		projectName:'haikuotong',
		hostAddress: 'https://yxftest.juzhouyun.com/',
		version: '1.1.0',
		discription: '修改实时聊天'
	},
	'紫光海阔': {
		appId: 'wxdacc3a925a65bbb5',
		proName: '海阔通',
		alias: '海阔通',
		tenantId: '1254411626786029570',
		darkColor: '#FD528D',
		lightColor: '#FF8282',
		projectName:'haikuotong',
		hostAddress: 'https://crm.uni-hiku.com.cn/'
	},
	'廊坊阳光行': {
		appId: 'wx563bb6a2dd9ca56c',
		proName: '阳光郡阳光行',
		alias: '阳光行',
		tenantId: '1306865723362811905',
		darkColor: '#a32a29',
		lightColor: '#be6969',
		projectName:'yangguangjun',
		hostAddress: 'https://yxf1.juzhouyun.com/'
	},
	'明月江南': {
		appId: 'wx2132ac3ef1db679e',
		proName: '明月江南',
		alias: '明月江南',
		tenantId: '1331774509869264898',
		darkColor: '#47A6FE',
		lightColor: '#4fa6fe',
		projectName:'mingYueJiangNan',
		hostAddress: 'https://yxf1.juzhouyun.com/',
		version: '1.1.0',
		discription: '修改实时聊天'
	}
}

function getProConfInfo(item){
	const confInfo = {
		tenantId: CONFIG_PRO_INFO[item].tenantId,
		h5DoMain: 'https://yxf1.juzhouyun.com', // 小程序嵌入的h5地址   如:房价计算器
		imgServerUrl: 'https://yxf1.juzhouyun.com',// 小程序所需图片地址
		calculatorUrl: 'https://yxf1.juzhouyun.com/online/mobile/housecal/index.html',
		cdnUrl: 'https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/',
		projectName :CONFIG_PRO_INFO[item].projectName, // 所需图片在服务器地址的文件夹名
		miniprogramName: CONFIG_PRO_INFO[item].proName,
		miniprogramTitle: CONFIG_PRO_INFO[item].alias,
		darkColor: CONFIG_PRO_INFO[item].darkColor,
		lightColor: CONFIG_PRO_INFO[item].lightColor,
		hostAddress: CONFIG_PRO_INFO[item].hostAddress,// 后台项目的服务器地址
	}
	return confInfo
}




export default({
	CONFIG_INFO,
	CONFIG_INFO_PRO: getProConfInfo(CONFIG_PROJECT)
})
