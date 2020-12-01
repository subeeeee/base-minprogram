const downloadFilePromise = (url)=>{
  return new Promise((res,rej)=>{
    wx.downloadFile({
        url,
        success: (bgRes) => {
            res( bgRes.tempFilePath)
        },
        fail: (err) => {
            /** 加载图片失败 */
         //   APP.showToast(err);
            console.error(err)
            rej(err)
            wx.hideLoading();
        }
    });
  })
}

  // 删除由base64生成的保存在system里面的图片
const removeSystemFile = (filePath) => {
    wx.getFileSystemManager().unlink({
      filePath,
      success: res => {
        console.log('删除成功, 路径: ', filePath);
      },
      fail: err => {
        
      }
    })
  }

  const showLoading = (title)=>{
    wx.showLoading({
        title,
        mask: true,
    });
  }


  const saveImageToPhotosAlbum = (url)=>{
    wx.saveImageToPhotosAlbum({
        filePath: url,
        success: () => {
            wx.hideLoading();
            wx.showToast({
              title:'保存成功'
            })
          
        },
        fail(err) {
          console.error(err)
        }
    });
  }

export {
  downloadFilePromise,
  removeSystemFile,
  showLoading,
  saveImageToPhotosAlbum
}