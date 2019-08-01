// cs/cs.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    // 获取设备宽高，以备海报全屏显示
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowW: res.windowWidth,
          windowH: res.windowHeight
        })
      },
    })

    // 海报背景图线上地址
    var url = 'https://shop-1256250812.cos.ap-beijing.myqcloud.com/%E7%99%BD%E8%89%B2%E8%83%8C%E6%99%AF%E5%9B%BE.png'
    // 商品图片（哪吒头像）线上地址
    var urll = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1564567267739&di=a1ef7520ed6357e86f0433961f34886a&imgtype=0&src=http%3A%2F%2Ftvax1.sinaimg.cn%2Fcrop.0.0.1011.1011.1024%2F006MNQ2Qly8g531oqhnlyj30tf0sl7wh.jpg%3FExpires%3D1564330529%26ssig%3DkP54dSRQbD%26KID%3Dimgbed%2Ctva'
    // 小程序二维码
    var urlqCord = 'http://pic.qqtn.com/up/2019-7/2019073010080912409.jpg'

    that.getBG(url).then(function (locationData) {
      that.setData({
        bgpic: locationData
      })
    })
    that.getBG(urll).then(function (locationData) {
      that.setData({
        propic: locationData
      })
    })
    that.getBG(urlqCord).then(function (locationData) {
      that.setData({
        qCord: locationData
      })
    })
  },

  // 点击生成并保持海报到手机相册
  clickMe() {
    var that = this
    that.setData({
      show:true
    })
    that.drawCanvas()
    
  },

  // 绘制canvas
  drawCanvas() {
    var that = this
    var windowW = that.data.windowW
    var windowH = that.data.windowH
    var text = '从不拘泥任何世俗凡人的目光，我要奔向前方那光芒，生而为魔，那又如何'
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('firstCanvas')

    // 海报背景图
    context.drawImage(that.data.bgpic, (windowW - 280) / 2, (windowH -450) / 2, 280, 450)
    // 商品图片
    context.drawImage(that.data.propic, (windowW -170) / 2, (windowH - 390) / 2, 170,170)
    // 商品文字描述
    context.setFontSize(30)
    context.setFillStyle("red")
    context.fillText('￥99.99', (windowW - 200) / 2, (windowH +55) / 2)
    context.setFontSize(18)
    context.setFillStyle("#999999")
    context.fillText('￥99.99', (windowW + 50) / 2, (windowH +55) / 2)
    context.moveTo((windowW + 45) / 2, (windowH + 44) / 2); //设置线条的起始路径坐标
    context.lineTo((windowW + 200) / 2, (windowH +44) / 2); //设置线条的终点路径坐标
    context.stroke(); //对当前路径进行描边

    // 商品名字，名字很长调用方法将文字折行，传参 文字内容text，画布context
    var row = that.newLine(text, context)
    var a = 24//定义行高25
    for (var i = 0; i < row.length; i++) {
      context.setFontSize(16)
      context.setFillStyle("#000000")
      context.fillText(row[i], (windowW - 195) / 2, (windowH +130)/2 + a * i, 320)
    }

    // 识别小程序二维码
    context.drawImage(that.data.qCord, (windowW - 180) / 2, (windowH + 289) / 2, 75, 75)
    context.setFillStyle("#000000")
    context.setFontSize(12)
    context.fillText('长按识别小程序', (windowW - 0) / 2, (windowH + 350) / 2 )
    context.setFillStyle("#000000")
    context.setFontSize(18)
    context.fillText('享更多好货', (windowW - 0) / 2, (windowH + 390) / 2 )
    context.draw()
  },

  // 点击保存按钮，同时将画布转化为图片
  daochu: function () {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'firstCanvas',
      fileType: 'jpg',
      quality: 1,
      success: function (res) {
        that.setData({
          shareImage: res.tempFilePath
        })
        setTimeout(function(){
          wx.showModal({
            title: '提示',
            content: '将生成的海报保存到手机相册，可以发送给微信好友或分享到朋友圈',
            success(res) {
              if (res.confirm) {
                that.eventSave()
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        },1000)
      }
    })
  },

  // 将商品分享图片保存到本地
  eventSave() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImage,
      success(res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  //将线上图片地址下载到本地，此函数进行了封装，只有在需要转换url的时候调用即可
  getBG(url) {
    // Promise函数给我很大的帮助，让我能return出回调函数中的值
    return new Promise(function (resolve) {
      wx.downloadFile({
        url: url, 
        success: function (res) {
          url = res.tempFilePath
          resolve(url);
        }
      })
    })
  },

  // canvas多文字换行
  newLine(txt, context) {
    var txtArr = txt.split('')
    var temp = ''
    var row = []
    for (var i = 0; i < txtArr.length; i++) {
      if (context.measureText(temp).width < 210) {
        temp += txtArr[i]
      } else {
        i--
        row.push(temp)
        temp = ''
      }
    }
    row.push(temp)

    //如果数组长度大于3 则截取前三个
    if (row.length > 3) {
      var rowCut = row.slice(0, 3);
      var rowPart = rowCut[2];
      var test = "";
      var empty = [];
      for (var a = 0; a < rowPart.length; a++) {
        if (context.measureText(test).width < 180) {
          test += rowPart[a];
        } else {
          break;
        }
      }
      empty.push(test);
      var group = empty[0] + "..." //这里只显示三行，超出的用...表示
      rowCut.splice(2, 1, group);
      row = rowCut;
    }

    return row
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
})