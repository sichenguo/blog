## 前言

最近因为单位业务一直在做微信小程序的项目，趁此机会将最近踩过的一些坑总结记录下。

### 微信小程序登陆相关

---

> ![登录流程时序](https://user-gold-cdn.xitu.io/2018/12/28/167f2e424c34693e?w=710&h=720&f=jpeg&s=61617)

- 前端调用 wx.login()，获取临时登录凭证 _code_
- 通过 wx.request()将 code 发给服务器（需要后端创建接口接收 code）
- 后端进行登录凭证校验，入参为(appid,secret,js_code,grant_type)

  > > appid 小程序唯一标识
  > > secret 小程序的 app secret
  > > js_code 登录时获取的 code
  > > grant_type 填写为 authorization_code

- 登陆凭证校验通过,从微信服务器换取 openid 和 session_key
  > openid 用户唯一标识
  > session_key 会话密钥
  >
  > > openid 是用户唯一标识，但不建议直接用做后端服务器的各用户标示符。
  > > session_key 是针对用户数据进行加密签名的密匙。session_key 在文件校验，获取用户具体信息时均需使用
  > >
  > > 一般为了安全起见，这两个数据都不会发往客户端。
- 后端将 session_key 处理之后，返回前端一个处理后的一个字符串作为用户的登陆标识，一般以 token 的形式。（自定义登陆态与 openid session_key 相关）
- 前端接收到 token,储存到 localStorage 中，每次向服务器请求数据的时候带上，作为服务器识别用户的凭证。
- 后续用户进入小程序时，首先调用 wx.checkSession() 检测登陆态，如果失败，重新发起登陆流程。

```js
//app.js
const NOLOGINCODE = 1000003 //未登录
const SUCCESS = 1000001 //成功
App({
  onLaunch: function() {
    var loginFlag = wx.getStorageSync('sessionId')
    var that = this
    if (loginFlag) {
      // 检查 session_key 是否过期
      wx.checkSession({
        // session_key 有效(未过期)
        success: function() {
          var userInfo = wx.getStorageSync('wxUserInfo')
          if (userInfo) {
            that.globalData.hasUserInfo = true
          }
        },
        // session_key 过期
        fail: function() {
          // session_key过期，重新登录
          that.doLogin()
        }
      })
    } else {
      // 无skey，作为首次登录
      this.doLogin()
    }
  },
  doLogin() {
    this.log().then(res => {
      this.$post('/auth', { code: res.code }, false).then(data => {
        wx.setStorageSync('sessionId', data.sessionId)
      })
    })
  },
  /**
   *微信登录 获取code值,并将code传递给服务器
   * @returns
   */
  log() {
    return new Promise(resolve => {
      wx.login({
        success(res) {
          if (res.errMsg === 'login:ok') {
            resolve(res)
          } else {
            wx.showToast({
              title: '微信登录失败',
              icon: 'none',
              duration: 1200
            })
          }
        },
        fail() {
          wx.showToast({
            title: '微信登录接口调用失败',
            icon: 'none',
            duration: 1200
          })
        }
      })
    })
  },
  globalData: {
    baseurl: 'https://www.fake.shop'
  }
})
```

### 网络请求封装

---

微信小程序中网络请求的 api 是 wx.request(),但是这个请求是个异步回调的形式，每次发请求都要写好长一串，而且如果是嵌套的发请求，就会发现代码写的及其臃肿，所以将其 Promisefy 是及其有必要的。
代码如下：

```js
 $get(url, data = {}, needToken = true) {
    let SUCCESS = 200
    var that = this
    needToken ? (data.token = wx.getStorageSync('ToKen')) : ''
    return new Promise((resolve, reject) => {
      wx.request({
        url: that.globalData.baseurl + url,
        method: "GET",
        header: {
          'content-type': 'application/json'
        },
        data: data,
        success(e) {
          if (e.data.code == SUCCESS) {
            resolve(e.data)
            return
          }

        },
        fail(e) {
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false
          })
          reject(e)
        }
      })
    })
  },
  $post(url, data = {}, needToken = true) {
    let that = this
    let SUCCESS = 200
    let TimeOut = 1000
    var that = this
    needToken ? (data.token = wx.getStorageSync('ToKen')) : ''
    return new Promise((resolve, reject) => {
      wx.request({
        url: that.globalData.baseurl + url,
        method: "POST",
        //此处可以根据接口文档设置header头
        // header: {
        //   'content-type': 'application/x-www-form-urlencoded'
        // },
        data: data,
        success(e) {
          if (e.statusCode == SUCCESS) {
            if (e.data.code == SUCCESS) {
              resolve(e.data)
            }
            else {
              reject(e)
              wx.showModal({
                title: '提示',
                content: e.data.msg,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    if (e.data.code == TimeOut) { //根据实际业务返回的code码判断是否过期
                      // 登录过期
                      that.doLogin();
                    }
                  }
                }
              })
            }
          } else {
            wx.showModal({
              title: '提示',
              content: e.data.error,
              showCancel: false
            })
            reject(e)
          }
        },
        fail(e) {
          console.log(e)
          wx.showModal({
            title: '提示',
            content: '请求失败',
            showCancel: false
          })
          reject(e)
        },
        complete(e) {
        }
      })

    })
  },
```

### 微信公共号支付（微信浏览器）

---

虽然是写小程序踩坑指南，但是在微信内的 H5 页面支付和小程序内掉起支付还是有相似之处的，顺便记录一下。

#### 应用场景

- 已有 H5 商城网站，用户通过消息或扫描二维码在微信内打开网页时，可以调用微信支付完成下单购买的流程。

##### 准备

> > UnionID:为了识别用户，每个用户针对每个公众号会产生一个安全的 OpenID，如果需要在多公众号、移动应用之间做用户共通，则需前往微信开放平台，将这些公众号和应用绑定到一个开放平台账号下，绑定后，一个用户虽然对多个公众号和应用有多个不同的 OpenID，但他对所有这些同一开放平台账号下的公众号和应用，只有一个 UnionID
> > 网页授权: 一些复杂的业务场景下，需要以网页的形式提供服务，通过网页授权可以获取用户的 openid（注：获取用户的 OpenID 是无需用户同意的，获取用户的基本信息则需用户同意）
> > 微信 JS-SDK：是开发者在网页上通过 JavaScript 代码使用微信原生功能的工具包，开发者可以使用它在网页上录制和播放微信语音、监听微信分享、上传手机本地图片、拍照等许多能力。

#### 业务流程时序图

![业务流程时序图](https://user-gold-cdn.xitu.io/2018/12/28/167f2e4052e7b4cc?w=893&h=1007&f=png&s=34679)

##### 主要流程

- 网页内引入 jssdk,主要有两种
  - 在需要调用 JS 接口的页面引入如下 JS 文件：http://res.wx.qq.com/open/js/jweixin-1.2.0.js [JSSDK 使用步骤][3]
  - 模块引入： 直接引入 npm 包[weixin-js-sdk][4]
  - > npm install weixin-js-sdk ;
  - > var wx = require('weixin-js-sdk');
- 网页授权
  - 我的理解就是网页授权主要是为了使在微信浏览器里面打开的第三方网页，可以跟微信公共号以及用户的微信相关联的操作，最终获取用户在该公共号下的**openid**.
  - 网站应用微信登录是基于 OAuth2.0 协议标准构建的微信 OAuth2.0 授权登录系统。获取 openid 分为两步
    - 前端通过跳转网址获取 code，然后将 code 发送给后端
    - 后端然后根据 code 获取 openid。

#### code 的获取

- 在微信公众号请求用户网页授权之前，开发者需要先到公众平台官网中的 “开发 - 接口权限 - 网页服务 - 网页帐号 - 网页授权获取用户基本信息” 的配置选项中，修改授权回调域名。本例中回调域名为 www.foo.com
- 业务流程 举例： 支付页面地址： payUrl => "http://www.foo.com/pay" 1. 要跳转到支付页面时，如果是**微信浏览器**直接跳转 href(办法有很多可以重定向也可以 location.href)到 "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ appid +"&redirect_uri="+ URLEncoder.encode(payUrl) +"&response_type=code&scope=snsapi_base&state=123#wechat_redirect" 2. 系统会自动跳转到 payUrl 并且返回一个参数 code 例如=> "http://www.aa.com/pay?code=aaa" 3. 然后读取下 code 发送后端就 ok 了，这个大家应该都会吧。
  **注：**
  > URLEncoder.encode(payUrl)是非常有必要的
  > state 参数： 用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止 csrf 攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数加 session 进行校验
  > 后端获取 openid 的原因： 因为我是前端，不想搞这个（开玩笑的 😜），其实主要可能是因为这部分逻辑部分敏感的**公众号的秘钥**等以及为了避免前端跨域的问题。
  > code 的是时限: code 作为换取 access_token 的票据，每次用户授权带上的 code 将不一样，code 只能使用一次，5 分钟未被使用自动过期。 **所以每次进行支付的时候都需要进行以上逻辑**

#### 微信内 H5 调起支付

- 需要将 openid 和 商户订单号发给后端，后端调用 api 生成前端调用支付 jsapi 需要的配置(这个主要是后端的逻辑，我目前也不是很明白 😂)
  ![配置](https://user-gold-cdn.xitu.io/2018/12/28/167f2e7f2cf5b5eb?w=800&h=377&f=png&s=130434)
  **不啰嗦，代码如下：**

```js
//this.wechaConfig 里面保存的是后端调用预支付api 以后传递给前端用来调用getBrandWCPayRequest 的配置项。
let config = {
  appId: this.wechaConfig.appId + '', // 公众号名称，由商户传入
  timeStamp: this.wechaConfig.timeStamp + '', // 时间戳，自 1970 年以来的秒数
  nonceStr: this.wechaConfig.nonceStr + '', // 随机串
  package: this.wechaConfig.package + '', //	统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=***
  signType: this.wechaConfig.signType + '', // 微信签名方式：
  paySign: this.wechaConfig.paySign + '' // 微信签名
}
// config = JSON.parse(JSON.stringify(config))
WeixinJSBridge.invoke(
  'getBrandWCPayRequest',
  config,
  function(res) {
    if (res.err_msg == 'get_brand_wcpay_request:ok') {
      // 使用以上方式判断前端返回, 微信团队郑重提示：res.err_msg 将在用户支付成功后返回    ok，但并不保证它绝对可靠。
      this.$router.push({
        name: 'payResult',
        query: {
          status: true,
          id: this.addOrder.orderId
        }
      })
    } else {
      this.$router.push({
        name: 'payResult',
        query: {
          status: false
        }
      })
    }
  }.bind(this)
)
```

**注意：**

1. 如果是使用 wx.chooseWXPay（），那么配置字段中是 timestamp 而不是 timeStamp
2. config 变量里面之所以每个变量都加 '' 例如：this.wechaConfig.appId + '',因为没有加之前在安卓上面可以正常的唤起 微信支付，而在 ios 上面测试的时候，会报错 缺少 jsapi appid 或者缺少 jsapipackage (我当时心里面就是 什么鬼啊 (((m -\_\_-)m 我明明都传了的)，所以加上查资料好多都说是 json 格式的问题， 我推测可能是由于很奇怪的原因（有理清楚的大佬评论区说下 😂），appid 的值没有被当成 String 类型被解析,所以我加了这个来处理一下。
   > 查到的比较有用的一个是 问题在于支付的时候 JSON 参数，必须全部是字符串。
   > 比如我的错误是参数中 {"timeStamp":12312312}，时间戳的值为整型，虽然 Android 上可以支付，但是 IOS 上就不行了，必须严格按文档上说的，键和值全部是字符串！这样 {"timeStamp":"12312312"} >才对！ [传送门][5]
3. 如果是进行本地调试的话，需要注意微信的接口默认使用 80 端口

---

之前写这篇文章的初衷是想着记录下自己踩过的坑，避免小伙伴们重复踩坑。现在看来内容还是干货比较少，以后会持续更新的。。。

### 参考

- [微信开放接口-小程序][1]

[1]: https://user-gold-cdn.xitu.io/2018/12/28/167f2e424c34693e?w=710&h=720&f=jpeg&s=61617
[2]: https://developers.weixin.qq.com/miniprogram/dev/api/api-login.html
[3]: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
[4]: https://www.npmjs.com/package/weixin-js-sdk
[5]: https://www.oschina.net/question/142487_162285
