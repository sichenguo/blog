# JavaScript 设计模式简单实现-工厂模式

## 工厂模式

也被称为多态工厂模式,它属于类创建型模式。在工厂方法模式中，工厂父类负责定义创建产品对象的公共接口，而工厂子类则负责生成具体的产品对象，这样做的目的是将产品类的实例化操作延迟到工厂子类中完成，即通过工厂子类来确定究竟应该实例化哪一个具体产品类。

### 特点

- 对象的构建十分复杂
- 需要依赖具体环境创造不同的实例
- 处理具有大量相同属性的大对象

先来看一个例子。

```js
class Product {
  constructor(name) {
    this.name = name
  }
  init() {
    console.log('init')
  }
  fn1() {
    console.log('fn1')
  }
  fn2() {
    console.log('fn2')
  }
}

class Creator {
  constructor(opt) {
    this.attr = opt
  }
  create(name) {
    return new Product(name)
  }
}

// test
let creator = new Creator()
let p = creator.create('p')
p.init() // => init
p.fn1() // => fn1
p.fn2() // => fn2
```

> 在工厂方法模式中,抽象类工厂只是负责定义一个对外的公共接口,而工厂子类则负责生成具体的产品对象。这样做的目的是将产品类的实例化操作延迟到工厂子类中完成，即通过工厂子类来确定实例化出来产品的功能。

#### 应用场景
- jQuery --- \$('div')
- React.creatElement

```js
// # jQuery-demo
class jQuery {
  constructor(selector) {
    let slice = Array.prototype.slice
    let dom = Array.from(document.querySelectorAll(selector))
    let len = dom ? dom.length : 0
    dom.forEach((it, i) => {
      this[i] = dom[i]
    })
    this.length = len
    this.selector = selector || ''
  }
  append(node) {}
  addClass(name) {}
  html(data) {}
  //...
}
window.$ = function(selector) {
  return new jQuery(selector)
}
// jQuery-demo end
```

> - 可以直接 `$('div')` 而非 `new $('div')`,书写更为简单
> - 延迟话创建实例：不是直接创建实例，而是对外提供一个固定入口，优点就是 即使 jQuery 名字发生变化，也很容易去修改。

```js

// # React.creatElement
let example = React.creatElement(
  'div',
  null,
  React.creatElement('img', { src: 'example.png', className: 'example' }),
  React.creatElement('h2', null, 'example_content')
)

// 分析
React.creatElement(tag,attrs,childre) {
   return new Vnode(tag,attrs,children)
 }
class Vnode(tag,attrs,children) {
  // 省略内部实现
}
// # React.creatElement end
```

