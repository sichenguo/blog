### 前言

Babel 对于大部分前端项目来说已经是一个必不可少的插件了，npm 周下载量有小四百万。虽说使用频率大，但是其配置由于种类繁多，使用起来还是比较复杂的，最近正好时间比较富裕，就抽空看了看官方文档，查阅了一些相关资料，写下一篇文章，希望能给看到的同学一些小小的帮助。

### Babel 是什么

在 Babel 的[官网](https://babeljs.io/)上有一个醒目的标题——

![enter image description here](https://images.gitbook.cn/6780f5c0-f6ad-11e8-a9f2-bd39ac6c163a)

> Babel is a JavaScirpt compiler.
>
> Babel 是一个 JavaScirpt 的转译器。

转译器是什么呢？就是将项目中的 JS 代码转换成浏览器可以直接解析的 ES 标准，目前是 ES5。为什么要使用转译器？这就涉及到 JS 的发展史了。

> 从 1994 年开始，JS 开始有一个统一的语法标准——ES。此标准是欧洲计算机协会制造商提出来的。因为当时浏览器市场发展正猛，Netscape 和 Sun 共同推出了 JavaScript 1，微软不愿意放过这个市场，推出了 Jscript，同时还有第三方的 ScriptEase。三种语言竞争激烈，但其规则却不尽相同，为了给市场一个统一的发展方向，ES1 这才应运而生。简单来说就是给 JS 一个标准的格式，这样浏览器或者别的工具解析起来也有个依据。
>
> 随着时间的推移，ES 标准也在逐渐更新，一直到最近的 ES2018。这期间浏览器厂商自然也在不断跟进，试图可以直接解析 JS 语法。可是问题是标准的更新越来越频繁，浏览器跟不上了。加上之前 ES5 一度成为主流标准很多年，许多浏览器厂商都停留在对 ES5 的兼容上，即使是大厂如谷歌，对 ES6 的语法也无法全部解析。

这就造成了一个比较严重的问题，ES 新标准我们到底是用还是不用，不用的话就是跟不上时代的步伐，用了的话浏览器也无法解析。Babel 就是为了解决这个问题而出现的，不管你使用的是什么版本的 ES 规范，只要使用了合适的插件，即可转译成浏览器可以解析的语法规则，造福了广大前端开发者。

那 Babel 是怎样工作的呢？其原理也并不复杂：

Babel 首先会将 JS 代码抽象成 AST 树，全称是 Abstract Syntax Tree，也就是源代码的抽象语法结构的树状表现形式。可以这么理解：我们要想把 ES6 的语法转化成 ES5 的语法，首先要把语法转化成一个树，之后我们遍历这个语法树，一点点转换代码，之后再做对应的处理，最后即可生成我们想要的代码。

### AST 树是什么

简单来说 AST 树把当前代码拆分成一个个对象的树，之后 Babel 解析是就根据 AST 树来一点点转译。举个例子：

```
function minus(a, b) {
  return a - b;
}
```

这是一个简单的减法函数，传入 a 和 b 两个参数，返回 a-b 的结果。AST 树转换的结果可以是这样的：

```
- FunctionDeclaration:
  - id:
    - Identifier:
      - name: minus
  - params [2]
    - Identifier
      - name: a
    - Identifier
      - name: b
  - body:
    - BlockStatement
      - body [1]
        - ReturnStatement
          - argument
            - BinaryExpression
              - operator: -
              - left
                - Identifier
                  - name: a
              - right
                - Identifier
                  - name: b
```

我们从上往下看，首先是一个函数声明，里面有三个属性，id、params 和 body。id 是函数的标识，也就是函数名，params 是这个函数的参数，例子中有两个参数，所以有两个 params。同样，使用 Identifier 来标识，一个是 a，一个是 b。接下来就是这个函数的主体部分，因为只有一条语句，所以 body 部分只有一个内容。直接就是 ReturnStatement，返回内容。接下来就是语法 argument，里面是二进制表达式，也就是 BinaryExpression。operator 是操作符的意思，就是我们的减号，减号左边是变量 a，右边是变量 b。可以很清晰的看出来。

当然了，也可以是 JS 中的对象形式：

```
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "minus"
  },
  params: [{
    type: "Identifier",
    name: "a"
  }, {
      type: "Identifier",
    name: "b"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "-",
        left: {
          type: "Identifier",
          name: "a"
        },
        right: {
          type: "Identifier",
          name: "b"
        }
      }
    }]
  }
}
```

我们可以看出来 AST 的每一层都拥有相同的结构，type、name 之类的，这里的每一层可以被当做一个节点。 一个 AST 可以由单一的节点或是成百上千个节点构成。 它们组合在一起可以描述用于静态分析的程序语法。

这就是是 AST 树的作用了，将当前的语法解析成一个个节点，Babel 转换的时候会遍历 AST 树上的这些节点，然后一一对应进行转换操作。

### Babel 插件分类介绍

Babel 的功能虽然不复杂，但是其结构相对来说还是比较复杂的，各种包很多，下面我们来看下这些包的作用，决定到底用不用。 Babel 的核心模块共有 4 个。

**1. babel-core**

babel-core 不用多说，是 Babel 的核心内容，也就是 Babel 本身。提供了 Babel 转译的 API，主要用于对代码进行转译。

**2. babylon**

babylon 是 JS 的解析器，默认使用最新的 ES2017。

**3. babel-traverse**

babel-traverse 是用于查找 AST 树，具体的原理不多做赘述，有兴趣的同学可以自行查阅资料，主要是给功能包中的 babel-plugin-xxx 使用。

**4. babel-generator**

babel-generator 是 Babel 转译的最后一步，会根据查询到的 AST 树的结果生成相应的代码。

接下来就是 Bable 的功能包，共有 8 个：

**1. babel-types**

babel-types 是用来对我们的 AST 树进行校验、构建和改变的，也就是根据 Babel 的配置生成适合我们的树，之后我们才能根据树来进行查找和生成最后的代码。

**2. babel-template**

用来辅助 babel-types 进行 AST 树构建的。

**3. babel-code-frames**

用来生成错误信息，同时指出错误的位置

**4. babel-helpers**

babel-helpers 包涵了一系列 babel-template 函数，提供给下面的 plugin 使用。

**5. babel-plugin-xxx**

babel-plugin-xxx 是我们在在转译过程中用到的插件，xxx 代表了插件的内容。比方说 babel-plugin-import 就是转译 ES6 中 import 的插件。

**6. babel-preset-xxx**

babel-preset-xxx 也是我们在转译过程中会用到的插件，但是这主要是针对 ES 标准，比防说 babel-preset-2016，最新的 ES 标准就是 babel-preset-env。

**7. babel-polyfill**

babel-polyfill 用来构建一个完整的 ES6 + 环境，因为不管是浏览器还是 Node，对 ES 标准的支持程度都是不一样的，使用它则可构建统一的运行环境。

**8. babel-runtime**

babel-runtime 和 babel-polyfill 的功能类似，但是不会污染全局作用域，简单来说就是 babel-runtime 会把 JS 文件编译后放到 dist 目录下，做了映射，以供我们使用。

这一块的内容比较多，不用着急，慢慢了解，因为真正使用的其实不多。

工具包只有 2 个：

**1. babel-cli**

babel-cl 是个命令行工具，我们可以在命令行中执行相应的语句来转译 JS 文件。

**2. babel-register**

babel-register 是用来转译 require 引用的 JS 文件的，也就是说我们可以通过一个文件的 require 来一层层寻找，最终找到所有的需要转译的文件。

说了这么多，想来大家也是一头雾水，其实常用的无非是：babel-core、babel-loader、babel-polyfill、babel-preset-xxx 和 babel-plugin-xxx。babel-loader 上面没有说到，因为严格意义上来说这是 Babel 为 Webpack 准备的插件，和 Babel 关系不大。

### Babel 配置详解

我们都知道在 Babel 安装完成之后需要进行本地化的配置，选择合适的插件来解析是十分必要的。配置内容可以放在 package.json 文件中，也可以在根目录下新建的 .babelrc 文件来填写配置信息，它的基本格式是：

```
{
    "presets":[],
    "plugins":[]
}
```

主要就是 Presets 和 Plugins 配置，Presets 主要告诉 Babel 要转换的源码使用了哪些新的语法特性，是一组 Plugins 的集合。

Plugins 之前有说到过，就是解析内容的插件，根据使用标准和作用的不同，会有不同类型的插件。比方说 babel-preset-es2015 就可以将 ES6 的代码编译成 ES5；babel-preset-es2016 可以将 ES7 的代码编译为 ES6。但显然这是比较麻烦的操作，使用的 ES 标准越新，需要转译的插件也就越多。

Babel 团队很贴心的将同属 ES2015 的几十个 Transform Plugins 集合到 babel-preset-es2015 一个 Preset 中，这样我们只需要在 .babelrc 的 Presets 加入 ES2015 一个配置就可以完成全部 ES2015 语法的支持了：

```
{
  "presets": [
    "es2015"
  ]
}
```

但是随着 ES 版本的不断更新，会有更多的插件添加进来，这样 babel-preset-es2015 会不断更新，也是比较麻烦。所以 Babel 团队推出了另外一个插件——babel-preset-env。此插件会根据目标环境选择不支持的新特性来转译。也就是说它会根据我们接下来配置的环境来决定最终转译成什么样子，选择最适合我们的插件。

```
"presets": [
  ["env", {
    "modules": false,
    "targets": {
      "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      "node":"8.9.0"
    }
  }],
  "stage-2"
],
```

上例就使用了 env 属性，同时配置了需要使用的环境。modules 通常都会设置为 false，因为默认都是支持 CommonJS 规范。下面的 target 是我们需要使用的环境，这里配置了 browers 和 node 属性。browsers 是浏览器的配置，这里的意思是用户数量大于 1%，兼容最近两个版本，IE8 以下不兼容的浏览器。browsers 属性中的内容来自 [browserslist 插件](https://github.com/browserslist/browserslist)，其提供了比较丰富的浏览器分类，可以上官网具体查看。node 选项是选择当前 node 版本，8.9.0 以上的版本都支持。

最后的 stage-2 是 JS 规范制作的阶段，代表着 babel-preset-stage-2 插件，JS 规范的制作分 4 个阶段：

**1. Stage0**

此阶段就是讨论而已，但是只有 TC39 的成员可以讨论，TC39 是指定的 ES 系列标准的组织。

**2. Stage1**

这一阶段是上面讨论的正式化提案，需要解决的就是这个提案会不会有什么影响，具体该怎么实施等等，也就是开始用之前的的准备

**3. Stage2**

此阶段草案已经有了规范，并且以补丁的形式向浏览器进行推送，此外一些构建工具也可以为其进行开发，比方说 Babel。也就是这一阶段的草案已经可以使用了。

**4. Stage3**

这一阶段已经是候选推荐的范畴了，想要通过这一阶段需要满足几个条件，比方说提案这和审阅者的签字，用户是否有兴趣，至少有一个浏览器支持等。

**5. Stage4**

这一阶段那就进行最后的测试了，通过的会在 ES 的下个版本中被推出。

这里的 satge-2 就是就是通过第三阶段的 草案，一般情况下草案到了这个阶段就已经基本上确定可以被推出了，毕竟没有意义的草案也不值得讨论这么久。当然了，若是不放心可以使用 stage-3 或者压根就不使用，这都是可以的，只是有时可能会出现意想不到的 BUG，诸位可自行选择。

Plugins 部分为我们提供了某些具体的转译插件，如上文提到的 babel-plugin-import。若是使用了 vue 则需使用 babel-plugin-transform-vue-jsx，使用 react 则需使用 babel-plugin-react-transform，以此类推。

若是使用了 babel-preset-react 插件会有一个新的选项，这个我们在下面配置 React 环境的 Babel 配置中会讲到。

### 在控制台中使用 Babel

在控制台中使用 Babel 意思也就是使用命令行来直接调用 Babel 进行文件内容的转换。首先我们需要安装 Babel 官方提供的 Babel-cli 工具：

```
npm install --global babel-cli
```

之后即可在控制台中进行文件的转换：

```
babel a.js
```

这样会直接将 a.js 转译之后的结果输出的命令行，添加 - o 参数可以输出到别的文件：

```
babel a.js -o b.js
```

这样就可以吧 a.js 转译成 b.js 了。或者我们可以直接转译整个文件夹：

```
babel a -d b
```

上述代码可将 a 文件夹下的内容转译到 b 文件夹下，当然了，Babel 也贴心的为我们准备了在线转译的工具，详情点[这里](https://babeljs.io/repl/)，使用起来也是十分方便的。

### 在项目中使用 Babel

在本地使用 Babel 还是有着诸多的不便，不仅仅操作繁杂，同时项目还需要依赖环境，也不能在不同的项目中使用不同版本的 Babel。

这里我们以 Webpack 举个例子，在 Webpack 中配置 Babel 其实比较简单，只需要一个 loader 来解析 js 文件即可，打包时可以使用 Webpack 来打包文件，无需使用 Babel，也是省去了修改文件的烦恼。

首先我们需要安装一个 babel-loader：

```
npm i babel-loader --save-dev
```

之后再 Webapck 配置文件中的 module 选项下的 rules 选项中添加如下规则：

```
module: {                                          //  module配置项
  rules: [{                                        //  module下rule配置项
    test: /\.js$/,                                 //  正则匹配文件后缀名
    use: {                                         //  使用的loader
      loader: "babel-loader",                      //  使用babel-loader
    },
    exclude: /node_modules/                        //  不包括node_modules文件夹
  }]
},
```

如此我们使用 babel-loader 解析了后缀名为 js 的文件，同时去掉了 node_modules 文件夹。之后在打包项目的时候自动使用 Babel 根绝. babelrc 文件进行转译，再进行打包。

### 编写适合 Vue 项目的 Babel 配置

Vue 项目首先需要有对 Vue 的支持，这一点无需我们自己配置，Webpack 已经通过 vue-loader 将. vue 文件转换成了正常的 JS 文件。我们只需转化 JS 文件即可。但有一点需要注意的是如果我们使用了 JSX 语法，需要使用一个 Babel 的插件来解析，那就是 babel-plugin-syntax-jsx，还需要使用 babel-plugin-transform-vue-jsx 来作为辅助插件。如果不是使用就无需不用管了。

接下来就是一些常规的插件，babel-plugin-transform-runtime 插件来为项目提供运行环境，babel-preset-env 插件来根据目标环境选择不支持的新特性来转译，还有一个 babel-preset-stage-2 插件来解析 JS 草案中的新语法。

如果使用了 Eslint 来规范代码格式还需要使用 babel-eslint 插件。当然了，必不可少的就是 babel-core 核心插件。

如果引入了 iview 组件库，需要使用 babel-plugin-import 插件来引入，并且在. babelrc 文件中进行配置，在 Plugins 配置中 import 一下即可，给一个组件库名称和组件库路径，这一点在 iview 的官网上有说明。

如果引入 element 组件库，需要使用 babel-plugin-component 插件，并且在. babelrc 文件中配置，需要使用 component 方法，需要引入组件库名称和组件库样式。当然了，如果使用 Vue-CLI3.0 来新建项目，则无需手动配置 element 组件库，Vue-CLI3.0 的图形化界面可直接插曲，省去了繁琐的配置过程。

那么现在安装如下插件：

```
npm i
    babel-core                                      //  Babel核心内容
    babel-eslint                                    //  eslint插件
    babel-loader                                    //  Webpack相关插件
    babel-preset-env                                //  ES标准库
    babel-preset-stage-2                            //  ES草案
    babel-plugin-syntax-jsx                         //  JSX语法
    babel-plugin-transform-runtime                  //  运行环境
    babel-plugin-transform-vue-jsx                  //  Vue中使用JSX语法
    babel-plugin-component                          //  与下面的组件二选一
    babel-plugin-import                             //  组件库辅助插件
--save-dev
```

整体配置如下所示：

```
{
  "presets": [                                                    //  presets设置
    ["env", {                                                    //  env配置
      "modules": false,                                            //  关闭modules选项
      "targets": {                                                //  target配置
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]    //  兼容的浏览器
      }
    }],
    "stage-2"                                                    //  兼容stage-2
  ],
  "plugins": ["transform-vue-jsx", "transform-runtime",            //  plugins配置
  ["import", {                                                    //  引入iview组件库
    "libraryName": "iview",                                        //  组件库名称
    "libraryDirectory": "src/components"                        //  组件库位置
  }],
  ["component", {                                                //  引入element组件库
    "libraryName": "element-ui",                                //  组件库名称
    "styleLibraryName": "theme-chalk"                            //  组件库样式名称
  }]],
}
```

#### 编写适合 React 项目的 Babel 配置

公用的部分和 Vue 的配置类似，在此不做赘述，主要说说 React 特有的配置。

首先我们可以使用 babel-preset-react 插件来解决 React 特有语法的一些插件，默认包含三个组件：babel-plugin-syntax-jsx、babel-plugin-transform-react-jsx、babel-plugin-transform-react-display-name。同时包含开发模式的选项：babel-plugins-transform-jsx-self 和 babel-plugin-transform-react-jsx-source。安装之后我们就可以开启 .babelrc 中的额外配置。

额外配置就是在 Presets 同级有个 env 配置，里面可以进行开发模式下的具体配置，[官网](https://babeljs.io/docs/en/babel-preset-react)也有一定的介绍：

```
{
    "presets": ["react", "env", "stage-2"],                 //  presets设置
    "env": {                                                //  react组件特殊设置
        "development": {                                    //  开发模式
            "plugins": [                                    //  插件
                "transform-decorators-legacy",              //  装饰器解析器
                "transform-class-properties",               //  class声明解析器
                ["react-transform", {                       //  react-transform系列
                    "transforms": [{                        //  transforms配置
                        "transform": "react-transform-hmr", //  react热加载
                        "imports": ["react"],               //  react注入
                        "locals": ["module"]                //  本地module变量注入
                    }]
                }],
                ["import", [{"libraryName": "antd", "style": "css"}]]   //  引入antd组件库
            ]
        }
    }
}
```

Presets 中的配置与 Vue 的差不多，在此也就不多说了，重点是 env 下面的配置。

env 下面的 development 是规定了在开发模式下 Babel 的配置，transform-decorators-legacy 是为了解析我们使用的装饰器，为什么使用装饰器呢？因为这里使用了 [Mobx](https://cn.mobx.js.org/) 作为状态管理工具，Mobx 的使用需要使用到装饰器——decorator。下面的 transform-class-properties 显而易见是为了解析 class 声明的。在下面的 react-transform 是集合了 react-transform 系列的工具，可以配置多个，这里只使用户了 react-transform-hmr 工具，下面的 imports 和 locals 属性不是相同的，针对不同的插件有不同的配置，可以去插件的官网查看配置。这其实只是将局部变量（module）或者依赖（react）注入需要他们的 transforms。

最后面的 import 是为了引入 antd 组件库，跟 iview 一样，使用了 babel-plugin-import 插件来辅助引入。引入需要有两个属性，一个是组件库名称，还有就是样式类型。组件库的引入多少都会有些不同，即使使用的一样的插件，所以在使用不同组件库的时候需要查阅官方文档来耐心解决。

所以在我们需要安装如下组件：

```
npm i
    babel-core                                              //  Babel核心代码
    babel-eslint                                            //  eslint插件
    babel-loader                                            //  Webpack相关插件
    babel-preset-env                                        //  ES标准库
    babel-preset-react                                      //  react语法
    babel-preset-stage-2                                    //  ES草案
    babel-plugin-syntax-jsx                                 //  jsx语法
    babel-plugin-react-transform                            //  react插件库
    babel-plugin-transform-class-properties                 //  解析class声明
    babel-plugin-transform-decorators-legacy                //  解析装饰器
    babel-plugin-import                                     //  组件库辅助插件，视情况而定
--save-dev
```

安装完成之后按照上面的配置进行进行配置即可。

### 小结

本篇文章主要是介绍了 Babel 的原理以及日常的使用，整体来说还是比较简单的，概念部分的内容经过简化也不是很难理解，但 AST 树部分的内容远不止于此，细说起来真能讲个三天三夜，有兴趣的同学们可以深入研究下。在了解完基础的概念后，安装和配置自然而然就回了，对各种插件有个大体上的了解，使用的时候也不会一头雾水了。