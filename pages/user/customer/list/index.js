import Api from '../../../../utils/api.js';
import drawQrcode from '../../../../utils/weapp.qrcode.esm.js'

//Page Object
Page({
  data: {
      QrcodeValue: '', // 二维码显示内容
      QrcodePop: false,
      searchForm: {
        nameOrMobile: '', // 客户姓名或手机号码
        reporterId: wx.getStorageSync('agentId')||wx.getStorageSync("userinfoLogin").agentId||'', // 报备人ID （登录）
        projectId: '100', // 项目ID
        status: '100', // 客户状态
        sort: 'report_time', // 排序字段名
        reportStatus: '100', // 报备状态
        sortType: '1', // 排序方式 0 asc 1 desc
        level: '100', // 客户等级
        currentPage: 1, // 分页-当前页
        pageSize: 10 // 分页-页容量
      },
      isPopupShow: {
        one: false,
        two: false,
        three: false,
        four: false
      },
      projectName: '推荐项目',
      customerStatus: '客户状态',
      reportStatus: '报备状态',
      sortType: '降序',
      level: '客户级别',
      projectsData: [],
      customerStatusData: [],
      reportStatusData: [{label: '全部', value: '100'}, {label: '有效', value: '0'}, {label: '无效', value: '1'}, {label: '到访逾期', value: '2'}, {label: '成交逾期', value: '3'}, {label: '已报备', value: '-1'}],
      levelData: [{label: '全部', value: '100'}, {label: '一级', value: '一级'}, {label: '二级', value: '二级'}],
      listData: [],
      isData: false,
      isFinished: false,
      roleType: wx.getStorageSync('roleType'),
      totalPageNum:0
  },
  lockQRcode (e) {

    console.time('small');
    wx.showLoading({
      title:'请稍后'
    })

    this.setData({
      QrcodePop:true
    },()=>{
      let item = e.currentTarget.dataset.item
      console.log(item)
      let QrcodeValue = JSON.stringify({projectId:item.projectId,mobile:item.mobile,registerId:item.registerId})
      // console.log(QrcodeValue)
      // console.log(`{"projectId":"${item.projectId}","mobile":"${item.mobile}","registerId":"${item.registerId}"}`)
      this.getCode(QrcodeValue)
    
    })

  },
  // 获取客户状态
  async customersCustomerStatus () {
    const result = await Api.fetchChannelManager({
      method: 'get',
      url: '/customersForThird/customers/customerStatus'
    })
    let customerStatusData = [{
      label: '全部',
      value: '100'
    }]
    for (let item in result.data) {
      customerStatusData.push({
        label: result.data[item],
        value: item
      })
    }
    let searchStatuId = wx.getStorageSync("searchStatuId")
    this.setData({
      customerStatusData,
      "searchForm.status":searchStatuId || (customerStatusData&&customerStatusData[0]&&customerStatusData[0].value)
    })
  },
  searchCustomersList (e) {
    this.setData({
      listData:[],
      "searchForm.currentPage":1,
      "searchForm.nameOrMobile":e.detail||''
    })
    this.customersList()
  },
  async customersList () {
    let {searchForm, isData} = this.data;
    let currentPage = searchForm.currentPage
    const params = {
      nameOrMobile: searchForm.nameOrMobile, // 客户姓名或手机号码
      reporterId: searchForm.reporterId || wx.getStorageSync('agentId')||wx.getStorageSync("userinfoLogin").agentId||'', // 报备人ID （登录）
      projectId: searchForm.projectId === '100' ? '' : searchForm.projectId, // 项目ID
      status: searchForm.status === '100' ? '' : searchForm.status, // 客户状态
      sort: searchForm.sort, // 排序字段名
      reportStatus: searchForm.reportStatus === '100' ? '' : searchForm.reportStatus, // 报备状态
      sortType: searchForm.sortType, // 排序方式 0 asc 1 desc
      currentPage, // 分页-当前页
      pageSize: searchForm.pageSize // 分页-页容量
    }

    if((searchForm.level !== '100'&&searchForm.level !== '全部')){
      params.level =  searchForm.level  // 客户等级
    }
    //Toast.loading('读取数据中...')
    // setTimeout(() => {
    //   Toast.hide()
    // }, 5000)
    const result = await Api.fetchChannelManager({
      method: 'get',
      url: '/customersForThird/customers/list',
      data: params
    })
    if (result.code === 200) {
      if (searchForm.currentPage === result.page.pageCount) {
        this.setData({
          isFinished:true
        })
      }
      searchForm.level = searchForm.level === null ? '100' : searchForm.level
      if (result.data.length > 0) {
        isData = false
      } else {
        isData = true
      }
      let curPageData = result.data.map(item=>{
        item.name =  item.name.length > 3 ? item.name.substring(0, 3) + '...' : item.name
        return item
      })
      // let listData = []
      // if(currentPage>1){
      //   if(((result.page.currentPage-1)*result.page.pageSize>=this.data.listData.length)){
      //     listData = [...this.data.listData,...curPageData]
      //   }else{
      //     let startIdx = (result.page.currentPage-1)*result.page.pageSize
      //     let endIdx = (result.page.currentPage-1)*result.page.pageSize+result.data.length
      //     listData = this.data.listData.map((i,idx)=>{
      //        if((idx>=startIdx)&&idx<=endIdx){
      //          i=result.data[idx-startIdx]||i
      //        }
      //        return i
      //     })
      //   }
      // }else{
      //   listData = curPageData
      // }

      this.setData({
        currentPage,
        listData:currentPage>1? [...this.data.listData,...curPageData]:curPageData,
        "searchForm.level": searchForm.level,
        "searchForm.currentPage":result.page.currentPage,
        totalPageNum:result.page.pageCount
      })
    } else {
      isData = true
      //Toast.failed(result.message)
      this.toast(result.message)
    }
    this.setData({
      isData
    })
  },
  showPopUp (e) {
    let {type} = e.currentTarget.dataset
    this.setData({
      [`isPopupShow.${type}`]:true
    })
  },
  async projectsOptions () {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/projects/options',
      data: {
        tenantId:getApp().globalData.tenantId,
        allProjects:1
      }
    })

    if (res.code === 200) {
      this.setData({
        projectData:[{
          label: '全部',
          value: '100'
        },...res.data.map(i=>{
          i.label = i.projectName
          i.value = i.projectId
          return i
        })]
      })
    }
  },
  //options(Object)
  onLoad: function(options){
    let searchProjectId = wx.getStorageSync('searchProjectId')
    let searchProjectName = wx.getStorageSync('searchProjectName')
    if (searchProjectId && searchProjectName) {
      this.setData({
        "searchForm.projectId":searchProjectId,
        projectName:searchProjectName,
        "searchForm.reporterId":wx.getStorageSync('agentId')||wx.getStorageSync("userinfoLogin").agentId||''
      })
    }
    let searchStatuId = wx.getStorageSync('searchStatuId')
    let searchStatuName  = wx.getStorageSync('searchStatuName')
    if ( searchStatuId&&searchStatuName ) {
      this.setData({
        "searchForm.status":searchStatuId,
        customerStatus:searchStatuName,
      })
      
    }
    let searchSortTypeId = wx.getStorageSync('searchSortTypeId')
    let searchSortTypeName = wx.getStorageSync('searchSortTypeName')
    if (searchSortTypeId && searchSortTypeName) {
      this.setData({
        "searchForm.sortType":searchSortTypeId,
        sortType:searchSortTypeName,
      })
    }

    let reportStatusId = wx.getStorageSync('reportStatusId')
    let reportStatusName = wx.getStorageSync('reportStatusName')
    if (reportStatusId &&reportStatusName) {
      this.setData({
        "searchForm.reportStatus":reportStatusId,
        reportStatus:reportStatusName=== '全部' ? '报备状态' :reportStatusName,
      })
    }


    let searchLevel = wx.getStorageSync('searchLevel')
    let searchLevelName = wx.getStorageSync('searchLevelName')
    if (searchLevel && searchLevelName) {
      this.setData({
        "searchForm.level":searchLevel,
        level:searchLevelName,
      })
    }



    this.customersCustomerStatus()
    if (this.data.searchForm.reporterId) {
      this.projectsOptions()
    }
  },
  onReady: function(){
    
  },
  onShow: function(){
    console.log(this.data.searchForm.currentPage)
    this.setData({
      "searchForm.currentPage":1
    },this.customersList)
    // this.customersList()
  },
  onHide: function(){

  },
  onUnload: function(){

  },
  onPullDownRefresh: function(){
      this.setData({
        listData:[],
        isFinished:false,
        "searchForm.currentPage":1
      },this.customersList)

  },
  onShareAppMessage: function(){

  },
  onPageScroll: function(){

  },
  //item(index,pagePath,text)
  onTabItemTap:function(item){

  },
  gotodetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user/customer/detail/index?registerId=${id}`
    });
  },
  hidePopUp(){
    this.setData({
      isPopupShow: {
        one: false,
        two: false,
        three: false,
        four: false
      },
      QrcodePop:false
    })
  },
  changeSelectedProject(e){
    let {id,name,key,value,option} = e.currentTarget.dataset
    this.setData({
      projectName: option.label === '全部' ? '推荐项目' : option.label,
      listData:[],
      "searchForm.currentPage":1,
      "searchForm.projectId":option.value
    })
    this.hidePopUp()
    this.customersList()

    wx.setStorageSync('searchProjectId', option.value)
    wx.setStorageSync('searchProjectName', option.label)
  },
  changeCustomerStatus (e) {
    let {id,name,key,value,option} = e.currentTarget.dataset
    this.setData({
      customerStatus: option.label === '全部' ? '客户状态' : option.label,
      listData:[],
      "searchForm.currentPage":1,
      "searchForm.status":option.value
    })
    this.hidePopUp()
    this.customersList()
    wx.setStorageSync('searchStatuId', option.value)
    wx.setStorageSync('searchStatuName', option.label)
  },
  changeReportStatus (e) {
    let {id,name,key,value,option} = e.currentTarget.dataset
    this.setData({
      reportStatus: option.label === '全部' ? '报备状态' : option.label,
      listData:[],
      "searchForm.currentPage":1,
      "searchForm.reportStatus":option.value
    })

    this.hidePopUp()
    this.customersList()

    wx.setStorageSync('reportStatusId', option.value)
    wx.setStorageSync('reportStatusName', option.label)
  },
  changeLevel (e) {
    let {id,name,key,value,option} = e.currentTarget.dataset
    this.setData({
      level: option.label === '全部' ? '客户级别' : option.label,
      listData:[],
      "searchForm.currentPage":1,
      "searchForm.level":option.label
    })
    this.hidePopUp()
    this.customersList()

    wx.setStorageSync('searchLevel', option.value)
    wx.setStorageSync('searchLevelName', option.label)
  },

  clickSortType () {
    let sortType = this.data.sortType
    this.setData({
      sortType: sortType === '降序' ? '升序' : '降序',
      listData:[],
      "searchForm.currentPage":1,
      "searchForm.sortType": sortType === '降序' ? '1' : '0'
    },()=>{
      this.customersList()

      wx.setStorageSync('searchSortTypeId', this.data.searchForm.sortType)
      wx.setStorageSync('searchSortTypeName', this.data.sortType)
    })

  },
  toast(title){
    wx.showToast({
      icon:'none',
      title,
      duration:3000
    })
  },
  getCode(codeInfo){

    drawQrcode({
      width: 300,
      height: 300,
      canvasId: 'myQrcode',
      ctx: wx.createCanvasContext('myQrcode'),
      text: codeInfo
    })
    wx.hideLoading()
    console.timeEnd('small');
  },
  // 滚动到底部
  onReachBottom(e) {
        if(this.data.totalPageNum>this.data.searchForm.currentPage){
            this.setData({
                "searchForm.currentPage": this.data.searchForm.currentPage + 1
            });
            this.customersList();
        }
    }
});