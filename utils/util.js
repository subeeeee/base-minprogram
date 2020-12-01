import Api from "./api.js";
import config from "../config.js";
const previewImage = (e) => {
  let { src, list } = e.currentTarget.dataset;
  //图片预览
    src = src.split('?')[0] + '?x-oss-process=image/quality,q_70'
    if (list === 'string') {
        list = list.split('?')[0] + '?x-oss-process=image/quality,q_70'
    } else {
        list.forEach(function (item, i) {
            list[i] = item.split('?')[0] + '?x-oss-process=image/quality,q_70'
        })
    }
  wx.previewImage({
    current: src, // 当前显示图片的http链接
    urls: typeof list === 'string' ? [list] : list // 需要预览的图片http链接列表
  })
};
const getUserInfo = (res,callback=(res)=>{
    let options = getCurrentPages()[getCurrentPages().length - 1]
    let text = ''
    options.options.customerId = res.data.customerId
    for (let key in options.options) {
        text += `&${key}=${options.options[key]}`
    }
    wx.redirectTo({
        url: '/' + options.route + '?web=' +text
    })
}) => {
    let info = res;
    let _userInfo={};
    let _nickName='';
    let _sex='';
    let _headImgUrl='';
    let _region='';
    let sourceType=wx.getStorageSync('shareCType');
    let sourceId=wx.getStorageSync('shareCId');
    if(info && info.detail && info.detail.userInfo){
        _userInfo=info.detail.userInfo;
        _nickName= _userInfo.nickName;
        _sex=_userInfo.gender||null;
        _headImgUrl= _userInfo.avatarUrl;
        _region= _userInfo.city || _userInfo.province;
    } else if(wx.getStorageSync('isIndexGo')==1){
        wx.setStorageSync('isIndexGo','')
    }else if(info===true&&sourceType&&sourceId){
     // 当扫码进来的时候，需要请求/wx/code2Session接口，给后端传递sourceType和sourceId
    }else{
      return false
    }
    //  授权取消不执行后面的逻辑了
    if(info&&info.detail&&info.detail.errMsg&&info.detail.errMsg.indexOf('fail')>-1){
      return
    }
    // if (info.detail.userInfo) {
        wx.login({
            success: function (res) {
                if (res.code) {
                    // let temp = {
                    //     userInfo: info.detail.userInfo
                    // };
                    let datass = {
                        js_code: res.code,
                        token: wx.getStorageSync("token") || "",
                        linkkey: wx.getStorageSync("linktoken") || "",
                    };
                    const code = res.code;
                    const registerType = wx.getStorageSync("register_type") || 0
                    Api.fetch({
                        url: "/wx/code2Session",
                        data: {
                            code,
                            tenantId: config.CONFIG_INFO_PRO.tenantId, //config.CONFIG_INFO_DEV.tenantId,
                            nickName: _nickName,
                            sex: _sex,
                            headImgUrl: _headImgUrl,
                            region: _region,
                            sourceType,//分享人  的 usertype
                            sourceId,//分享人  的 customerId
                            registerType
                        },
                        method: "POST",
                    }).then((res) => {
                        if (res.code == 200) {
                         
                            if(info){
                               wx.setStorageSync("userinfoLogin", res.data||{});
                              wx.setStorageSync("userinfo", _userInfo);
                              wx.setStorageSync("code", datass.js_code);
                              wx.setStorageSync('userType',  res.data.userType)
                            }

                            callback&&callback(res||{})
                            wx.setStorageSync("customerId", res.data.customerId);
                            wx.setStorageSync("couponConfirmPermissions", res.data.couponConfirmPermissions);
                        } else {
                            wx.showToast({
                                title: res.message
                            });
                        }
                    });
                }
            }
        });
    // }
}
const getPhoneNo =async (code, e, callback = ()=>{
  let num = 0
  let text = ''
  let options = {}
  options =  getCurrentPages()[getCurrentPages().length - 1]
  for (let key in options.options) {
      if (num === 0) {
          text += `?${key}=${options.options[key]}`
      } else {
          text += `&${key}=${options.options[key]}`
      }
  }
  wx.redirectTo({
      url: '/' + options.route + text
  })
}) => {
  //有很多地方只需要获取手机号的弹框，但是没有customerid的用户，再获取手机号的时候可能会报   请重新获取手机号，所以做一个兼容处理，等到customerId的

   let customerId='';
    let {phoneNo} = wx.getStorageSync("userinfoLogin")||{};
    if(!phoneNo&&!wx.getStorageSync("customerId")){
      let returnData=await getCustomer()
      customerId = returnData&&returnData.data&&returnData.data.customerId||''
      wx.setStorageSync('customerId',customerId)
      wx.setStorageSync("userinfoLogin", returnData.data);
    }
    
    Api.fetch({
        headers:{
          customerId
        },
        url: "/wx/getPhoneNo",
        data: {
            code: code,
            tenantId: config.CONFIG_INFO_PRO.tenantId, //config.CONFIG_INFO_DEV.tenantId,
            "encryptedData": e.detail.encryptedData,
            "iv": e.detail.iv
        },
        method: "POST",
    }).then((res) => {
        if (res.code == 200) {
          // const { code, sourceType, sourceId, nickName, sex, headImgUrl, region,phoneNo} = wx.getStorageSync("userinfoLogin")||{}
          // if(sourceType&&sourceId&&!phoneNo){
          //   reportCustomer({
          //     code,
          //     sourceType,
          //     sourceId,
          //     nickName,
          //     sex,
          //     headImgUrl,
          //     region,
          //   })
          // }

          let phoneNumber = JSON.parse(res.data.wxPhoneData).phoneNumber
          //当用户再code2session的时候没有取到手机号，获取到手机号后在重新设置一下userinfoLogin.phoneNo
          let userinfoLogin = wx.getStorageSync('userinfoLogin')||{}
          // if(userinfoLogin&&!userinfoLogin.phoneNo){
          //   userinfoLogin.phoneNo = phoneNumber
          // }
           let {customer={}} = res.data || {}
           let {userType='',memberId='',agentId='',phoneNo='',customerId='',nickName='',headImgUrl='',couponConfirmPermissions=''} = customer
           if(!userinfoLogin.id){
            userinfoLogin=customer
           }
           userinfoLogin.userType = userType
           userinfoLogin.memberId = memberId
           userinfoLogin.agentId = agentId
           userinfoLogin.phoneNo = phoneNo
           userinfoLogin.customerId = customerId
           userinfoLogin.nickName = nickName
           userinfoLogin.headImgUrl = headImgUrl
           userinfoLogin.couponConfirmPermissions = couponConfirmPermissions
           

            wx.setStorageSync('userinfoLogin',userinfoLogin)
            wx.setStorageSync('userPhone',phoneNumber )
            wx.setStorageSync('userType', userType)
            wx.setStorageSync('agentId', agentId)
            wx.setStorageSync("couponConfirmPermissions", couponConfirmPermissions);

            callback&&callback()
            

        } else {
            wx.showToast({
                title: res.message
            });
        }
    });
}
const getCustomer=async function(){
  let res = await wx.login()
  return Api.fetch({
          url: "/wx/code2Session",
          data: {
              code:res.code,
              tenantId: config.CONFIG_INFO_PRO.tenantId,
          },
          method: "POST",
      })
}
const getUserPhone = (e,callback) => {
    if(e&&e.detail&&e.detail.errMsg&&e.detail.errMsg.indexOf('fail')>-1){
      return
    }
    if ('getPhoneNumber:ok' === e.detail.errMsg) {
        Api.fetch({
            url: "/wx/getUser",
            data: {},
            method: "get",
        }).then((res) => {
            if (res.code == 200) {
              wx.login({
                success: function (res) {
                    if (res.code) {
                        getPhoneNo(res.code, e,callback)
                    }
                }
              })
                // if (res.data) {
                //     wx.checkSession({
                //         success (res) {
                //           const code = wx.getStorageSync('code')
                //             getPhoneNo(code, e,callback)
                //         },
                //         fail () {
                //             wx.login({
                //                 success: function (res) {
                //                     if (res.code) {
                //                         getPhoneNo(res.code, e,callback)
                //                     }
                //                 }
                //             })
                //         }
                //     })
                // } else {
                //     wx.login({
                //         success: function (res) {
                //             if (res.code) {
                //                 getPhoneNo(res.code, e,callback)
                //             }
                //         }
                //     });
                // }
            } else {
                wx.showToast({
                    title: res.message
                });
            }
        });
    }else{
      wx.setStorageSync("state",'')
    }
}
const saveFile = (url) => {
  if (url.indexOf('http://') === 0) {
    url = 'https://' + url.substring(7);
  }
  wx.getSetting({
    success: (res) => {
      //没有权限，发起授权
      if (!res.authSetting["scope.writePhotosAlbum"]) {
        wx.authorize({
          scope: "scope.writePhotosAlbum",
          success: () => {
            //用户允许授权，保存图片到相册
            wx.downloadFile({
              url: url,
              success: (resDownLoad) => {
                wx.saveImageToPhotosAlbum({
                  filePath: resDownLoad.tempFilePath,
                  success: () => {
                    wx.showToast({
                      title: "保存成功",
                      icon: "success",
                      duration: 3000
                    });
                  },
                  fail: () => {
                    wx.showToast({
                      title: "保存图片失败",
                      duration: 3000
                    });
                  }
                });
              },
              fail: () => {
                wx.showToast({
                  title: "下载文件失败",
                  duration: 3000
                });
              }
            });
          },
          fail: () => {
            //用户点击拒绝授权，跳转到设置页，引导用户授权
            wx.showModal({
              title: "提示",
              content: "是否允许打开相册",
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting({
                    success: () => {
                      wx.authorize({
                        scope: "scope.writePhotosAlbum",
                        success: () => {
                          wx.downloadFile({
                            url: url,
                            success: (res) => {
                              wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: () => {
                                  wx.showToast({
                                    title: "保存成功",
                                    icon: "success",
                                    duration: 3000
                                  });
                                },
                                fail: () => {
                                  wx.showToast({
                                    title: "保存图片失败",
                                    duration: 3000
                                  });
                                }
                              });
                            },
                            fail: () => {
                              wx.showToast({
                                title: "下载文件失败",
                                duration: 3000
                              });
                            }
                          });
                        }
                      });
                    },
                    fail: () => {
                      wx.showToast({
                        title: "获取授权失败",
                        duration: 3000
                      });
                    }
                  });
                }
              }

            });
          }
        });
      } else {
        //用户已授权，保存到相册
        wx.downloadFile({
          url: url,
          success: (res) => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({
                  title: "保存成功",
                  icon: "success",
                  duration: 3000
                });
              },
              fail: () => {
                wx.showToast({
                  title: "保存图片失败",
                  duration: 3000
                });
              }
            });
          },
          fail: () => {
            wx.showToast({
              title: "下载文件失败",
              duration: 3000
            });
          }
        });
      }
    },
    fail: () => {
      wx.showToast({
        title: "获取授权失败",
        duration: 3000
      });
    }
  });
};
const signStepChange = (query, type = 'next', isRedirect = true) => {
    let steps = 0
    let processArr = getApp().globalData.processArr
    if ('next' === type) {
        steps = ++getApp().globalData.signStepNum
    } else if ('prev' === type) {
        steps = --getApp().globalData.signStepNum
    }
    /**
     * 1、基本信息
     * 2、选定房源
     * 3、费用缴纳
     * 4、签署协议
     * 5、认购完成
     */
    switch (processArr[steps - 1].id) {
        case 1:
            // 填写基本信息
            if (isRedirect) {
                wx.redirectTo({
                    url: "/pages/house/signStepInputInfo/index" + (query || '')
                })
            } else {
                wx.navigateTo({
                    url: "/pages/house/signStepInputInfo/index" + (query || '')
                })
            }
            break
        case 2:
            // 选择房源
            if (isRedirect) {
                wx.redirectTo({
                    url: "/pages/house/signStepCheckHouse/index" + (query || '')
                })
            } else {
                wx.navigateTo({
                    url: "/pages/house/signStepCheckHouse/index" + (query || '')
                })
            }
            break
        case 3:
            // 支付
            if (isRedirect) {
                wx.redirectTo({
                    url: "/pages/house/signStepPay/index" + (query || '')
                })
            } else {
                wx.navigateTo({
                    url: "/pages/house/signStepPay/index" + (query || '')
                })
            }
            break
        case 4:
            // 签署协议
            let params = 'id='
            let url = getApp().globalData.h5DoMain + '/wxapph5/personalSign.html'
            params += wx.getStorageSync('contractId')
            params += '&mobile='
            params += wx.getStorageSync('contractMobile')
            params += '&projectId='
            params += wx.getStorageSync('projectInfo').id
            params += '&redirect='
            if (5 == processArr[steps].id) {
                params += encodeURI('/pages/house/signStepSuccess/index')
            } else if (3 == processArr[steps].id) {
                params += encodeURI('/pages/house/signStepPay/index')
            }
            if (isRedirect) {
              wx.redirectTo({
                  url: '/pages/h5/index/index?webUrl=' + url + '&title=认购流程&' + params
              })
            } else {
              wx.navigateTo({
                  url: '/pages/h5/index/index?webUrl=' + url + '&title=认购流程&' + params
              })
            }
            break
        case 5:
            // 认购完成
            if (isRedirect) {
                wx.redirectTo({
                    url: "/pages/house/signStepSuccess/index" + (query || '')
                })
            } else {
                wx.navigateTo({
                    url: "/pages/house/signStepSuccess/index" + (query || '')
                })
            }
            break
        default:
            break
    }
}


const getAppData =  ()=>{
  return new Promise(async (reslove,reject)=>{
        const res =await Api.fetch({
          method: 'get',
          url: '/appConfig/getByTenantId/'+config.CONFIG_INFO_PRO.tenantId,
      })
      if(res.code === 200){
        const {appId,appSecret,posterInfo,memberCardInfo} = res.data;
        reslove({appId,appSecret,posterInfo,memberCardInfo})
      }
  })

}

const getQrCode = (type,customerId,path,appData,projectId)=>{
  return new Promise(async (reslove,reject)=>{
        const res =await Api.fetchNoSignpay({
          method: 'post',
          url: '/wx/createQrCode',
          ContentType: true,
          data: {
            "consultantId":customerId,
            type,
            path,
            "appId":appData.appId,
            "appSecret":appData.appSecret,
            projectId
          }
      })
      if (res) {
        reslove(res)
        // this.setData({
        //   qrcodeBase64:res
        // })
      } else {
          wx.showToast({
              icon:'none',
              title: "获取二维码出错，请稍后重试",
              duration:3000
          })
      }
  })


}


const generalStatistical=async (data)=>{
  const res = await Api.fetch({
       url: "/wx/behaviorRecords",
       data,
       method: "get",
   })
   if (res.code == 200) {
     console.log(res)
   }
}


// 报备接口
const reportCustomer=async ({customerId,sourceType,sourceId,sourceProjectId})=>{
  const res = await Api.fetch({
       url: "wx/reportCustomer",
       data:{
        sourceType,//分享人  的 usertype
        sourceId,//分享人  的 customerId
        registerType:wx.getStorageSync("register_type") || 0,
        sourceProjectId,
        customerId
       },
       method: "post",
   })
   if (res.code == 200) {
     console.log(res)
   }
}


module.exports = {
    previewImage,
    saveFile,
    getUserInfo,
    getUserPhone,
    signStepChange,
    hideName(str) {
      let resturnStr = "";
      if (str) {
        resturnStr = str.substr(0, 3) + "****" + str.substring(7);
      }
      return resturnStr;
    },
    getAppData,
    getQrCode,
    generalStatistical,
    reportCustomer
};
