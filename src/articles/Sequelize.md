# Sequelize 学习笔记

## 在 Node 中使用 MYSQL

- 访问 MYSQL 需要通过网络请求给 MYSQL 服务器，对于 Node.js 程序，这个访问 MySQL 服务器的软件包通常称为 MySQL 驱动程序。不同的编程语言需要实现自己的驱动，MySQL 官方提供了各种多种的驱动程序。目前社区使用的比较广泛的 Mysql Nodejs 驱动程序是 [mysql][1] 和 [mysql2][2] (与**mysql**的联系：兼容 mysql 大多数 API 以及性能更加优异)
- node-mysql 是一个实现了 MySQL 协议的 Node.js JavaScript 客户端，通过这个模块可以与 MySQL 数据库建立连接、执行查询等操作。如果直接使用 mysql 包提供的接口进行操作，编写的代码就比较底层，基本类同直接的 sql，例如查询操作

```js
var mysql = require('mysql')
// 建立与数据库的连接
var connection = mysql.createConnection({
  host: 'example.com',
  user: 'example',
  password: 'secret-password'
})
// 通过 mysql提供的接口进行查询
connection.query('SELECT * FROM project WHERE id = ?', ['1'], function(
  err,
  rows
) {
  if (err) {
    // error
  } else {
    for (let row in rows) {
      // 业务代码
    }
  }
})
```

## ORM (Object Relational Mapping)

- ORM框架的作用就是就是可以把关系型数据库表结构 映射为javascript对象。例如
  
> **Table project**

  | 名称            | 类型          | 允许空 | 默认值 | 主键 | 说明             |
  | --------------- | ------------- | ------ | ------ | ---- | ---------------- |
  | id              | int(11)       | Y      | -      | Y    |                  |
  | content         | text          | Y      | -      | N    | 项目描述         |
  | title           | varchar(90)   | Y      | -      | N    | 项目名称         |
  | priority_status | int(11)       | Y      | 1      | N    | 优先级id         |
  | owner           | int(11)       | Y      | 0      | N    | 项目经理（PM）id |
  | team_id         | int(11)       | Y      | 0      | N    | 小组id           |
  | process_status  | vint(11)      | Y      | -      | N    | 项目状态         |
  | schedule        | double(11, 2) | Y      | 0.00   | N    | 项目进度         |
  | prepayDate      | date          | Y      | -      | N    | 预交时间         |
  | createDate      | date          | Y      | -      | N    | 创建时间         |
  | deadline        | date          | Y      | -      | N    | 截止时间         |

```js

  // 就可以映射为,表中每一列映射为对象中一个键值对，每一行映射为一个js对象。
  {
    id:'',
    content:'',
    title:'',
    priority_status:'',
    priority_status:'',
    owner:''
    ...
  }
```

- 通过ORM框架，对数据库进行 CURD时，不需要直接去书写 SQL语句，而是通过操作对象，进而由框架转化为具体的SQL语句进行查询，将对象转化我表中的一条记录。m
- Sequelize 是Nodejs中比较常用的ORM框架
  
## Sequelize基础使用

> **建立数据库连接**

```js

let Sequelize = require("sequelize");
let sequelize = new Sequelize(
    'sample', // 数据库名
    'root', // 用户名
    'password', // 用户密码
    {
        dialect: 'mysql', // 数据库使用mysql
        host: 'localhost', // 数据库服务器ip
        port: 3306, // mysql默认端口
        define: {
            'underscored': true // 字段以下划线（_）来分割（默认是驼峰命名风格）
        },
        pool: {
          max: 20, // 连接池最大连接数量
          min: 0, // 连接池最小连接数量
          idle: 10000 // 每个线程最长等待时间
        }
    }
);

//  freezeTableName: true,
```

> **定义模型**
- 模型：用来表述（描述）数据库表字段信息的对象，每一个模型对象表示数据库中的一个表，后续对数据库的操作都是通过对应的模型对象来完成

```js
// public define(modelName: String, attributes: Object, options: Object): Model
// modelName：模型名称，自定义	attributes：模型中包含都数据，每一个数据映射对应表中都每一个字段 options：模型（表）的设置

var project = sequelize.define(
  'project', // 默认表名（一般这里写单数）,生成时会自动转换成复数形式。在模型访问时的model.name
  {
    id: {
      type: Sequelize.INTEGER(11), // 字段类型
      allowNull: false, // 是否允许为NULL
      primaryKey: true, // 字段是主键
      autoIncrement: true, // 是否自增
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: false // 字段是否UNIQUE
    },
    title: {
      type: Sequelize.STRING(90),
      allowNull: true,
      validate: { //模型验证 当前字段值发生改变的时候进行验证
        is: ["^[a-z]+$",'i'],     // 只允许字母
        not: ["[a-z]",'i'],       // 不能使用字母
        isEmail: true
      },
      field: 'project_title' // 数据库中字段的实际名称	
    }
  },
  {
    tableName: 'project', // 手动设置表的实际名称
    timestamps: false, // 是否给每条记录添加 createdAt 和 updatedAt 字段，并在添加新数据和更新数据的时候自动设置这两个字段的值，默认为true
    paranoid: true, // 设置 deletedAt 字段，当删除一条记录的时候，并不是真的销毁记录，而是通过该字段来标示，即保留数据，进行假删除，默认为false
    freezeTableName: false, // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 默认为false
    indexes: [] // 定义表索引
  }
)

// 表同步:没有就新建,有就不变
// project.sync();

// 表同步:没有就新建,有就先删除再新建
// project.sync({
//     force: true
// });

```

- 注： 
  - [Sequelize和MYSQL中数据库类型对照][3]
  - 自动建表（model.sync()）有风险，谨慎使用:camel:。
  
> **增**

- 一个模型类对应一个表，一个模型实例对象（DAO）就是一条对应的表记录，通过操作这个对象来关联操作对应的表中的数据，操作模型类就是操作表，操作模型类对象就是操作该表中的某条记录，既有如下对应关系
  - 模型类 - 表
  - 模型实例 - 记录
  - DAO（Data Access Objec）这些实例对象拥有一系列操作数据的方法（**save**、**update**、**destroy**）  

```js

// 创建模型实例对象 public static build(options: Object): Model | Model[]
// options：一个对象，对应的就是表中的字段（模型中定义的属性），需要注意的是对该对象的操作不会立即反应到实际的数据库中，需要通过后续的操作进行同步比如save
attr= {
    id:"test",
    content:"iscontent",
    titile:"istitle"
}
let projectInstance = Project.build(attr) // 创建实例对象

// 实例方法
projectInstance.save() // 验证该实例，如果通过验证，则持久化到数据库中
projectInstance.update(updates: Object) // updates：要更新的字段，调用该方法等同于调用.set()然后.save()
projectInstance.destroy() // 销毁该实例（假删除或真删除）



//  public static create(values: Object, options: Object): Promise<Model>
// 构建一个新的模型实例，并进行保存。与build()方法不同的是，此方法除创建新实例外，还会将其保存到对应数据库表中。
await Project.create(attr)

```

> **查**
- **sequelize**除了通过模型创建出来的实例对单条数据进行操作，也可以通过模型类对整个对应的表进行操作

```js
// 根据主键搜索单条记录: 模型.findById(id: Number | String | Buffer) 
Project.findById(1);

// 根据条件搜索一条记录: 模型.findOne(options: Object) 
Project.findOne({
    where:{id:1}
});
//搜索特定记录或创建它（如果没有对应记录): 模型.findOrCreate(options: Object)

//在数据库中搜索多个记录，返回数据和总计数: 模型.findAll(findOptions: Object)
Project.findAll({
  where: { id:1, content: 'iscontent' }, // 搜索条件
  limit: 10, // 查询记录条数限制
  offset: 2, // 查询时的偏移/起始位置，一般用于分页查询时
  order: [ 
      "id", //根据id排序
      ["id","desc"] //根据id倒序
  ],
  attributes:["title","owner"], //返回的字段
})

// 在数据库中搜索多个记录，返回数据和总计数： 模型.findAndCountAll(findOptions: Object)
// 与findAll类似，但是返回值包含 count 属性 - 返回数据与总计数
let result = await Project.findAndCountAll({
    'limit': 20,
    'offset': 0
});
// 返回的result对象将包含2个字段：result.count是数据总数，result.rows是符合查询条件的所有数据。

```

- 限制字段
- 字段重命名
- where 子句
- 复合过滤查询
  - 在sequelize中，还存在一个Op对象，用于处理复杂的条件操作。
  - [常见的Op及解释][5]

```js
// 限制查询结果对象中的字段
let result = await Project.findAndCountAll({
    attributes:["title","owner"], 
});
// => { title: 'istitle', owner: 1 } 而不是返回所有的字段

// 字段重命名
let result = await Project.findAndCountAll({
    attributes:[ ["title","projectTitle" ],"owner"], 
});
// => { projectTitle: 'istitle', owner: 1 } 而不是返回所有的字段

// where 子句
let result = await Project.findAndCountAll({
    where:{
      id: [1, 2, 3],
      title: 'a',
      content: 'iscontent'
    }
});
// 查询projects表中满足 (id ===1 || id ===2 || id ===3) && title === 'a' && content === 'iscontent' 条件的记录

// 复合过滤
const Op = Sequelize.Op
Project.findAll({
  where: {
    title: 'a',
    id: { [Op.eq]: 1 }, // id为1
    [Op.or]: [{ priority_status: [1, 2] }, { owner: { [Op.gt]: 10 } }] // (priority_status === 1 ||priority_status === 2)&&  owner > 10
  }
})

// [常见的Op及解释][5]
[Op.and]: {a: 5}           // 且 (a = 5)
[Op.or]: [{a: 5}, {a: 6}]  // (a = 5 或 a = 6)
[Op.gt]: 6,                // id > 6
[Op.gte]: 6,               // id >= 6
[Op.lt]: 10,               // id < 10
[Op.lte]: 10,              // id <= 10
[Op.ne]: 20,               // id != 20
[Op.eq]: 3,                // = 3
[Op.not]: true,            // 不是 TRUE
[Op.between]: [6, 10],     // 在 6 和 10 之间
[Op.notBetween]: [11, 15], // 不在 11 和 15 之间
[Op.in]: [1, 2],           // 在 [1, 2] 之中
[Op.notIn]: [1, 2],        // 不在 [1, 2] 之中
[Op.like]: '%hat',         // 包含 '%hat'
[Op.notLike]: '%hat'       // 不包含 '%hat'
[Op.iLike]: '%hat'         // 包含 '%hat' (不区分大小写)  (仅限 PG)
[Op.notILike]: '%hat'      // 不包含 '%hat'  (仅限 PG)
[Op.regexp]: '^[h|a|t]'    // 匹配正则表达式/~ '^[h|a|t]' (仅限 MySQL/PG)
[Op.notRegexp]: '^[h|a|t]' // 不匹配正则表达式/!~ '^[h|a|t]' (仅限 MySQL/PG)
[Op.iRegexp]: '^[h|a|t]'    // ~* '^[h|a|t]' (仅限 PG)
[Op.notIRegexp]: '^[h|a|t]' // !~* '^[h|a|t]' (仅限 PG)
[Op.like]: { [Op.any]: ['cat', 'hat']} // 包含任何数组['cat', 'hat'] - 同样适用于 iLike 和 notLike
[Op.overlap]: [1, 2]       // && [1, 2] (PG数组重叠运算符)
[Op.contains]: [1, 2]      // @> [1, 2] (PG数组包含运算符)
[Op.contained]: [1, 2]     // <@ [1, 2] (PG数组包含于运算符)
[Op.any]: [2,3]            // 任何数组[2, 3]::INTEGER (仅限PG)

```

- 常见统计操作API
  - model.count({ where: {} })    统计查询个数
  -	model.max(field, {where:{}})  指定字段查询最大值
  -	model.min(field, {where:{}})  指定字段查询最小值
  -	model.sum(field, {where: {}}) 求和

> **改**

```js
// public static  update(values: Object, options: Object): Promise<Array<affectedCount, affectedRows>>

const result = await Project.update(
    {
      content: "newContent"
    },
    {
      where: {
        id: projectId,
        user_id: userId
      }
    }
  )
```

> **删**

- model.destroy()
- 需要注意的是，如果我们开启了paranoid模式，destroy的时候不会执行DELETE语句，而是执行一个UPDATE语句将deleted_at字段设置为当前时间（一开始此字段值为NULL）。我们可以使用model.destroy({force: true})来强制删除，从而真正从表中删除该条记录。

```js
// public destroy(options: Object): Promise<undefined>
 const result = await Project.destroy({
    where: {
      id: projectId,
      user_id: userId
    }
  })
```

- **参考：**
  - [sequelizejs官方文档-modelReference][4]

[1]: https://www.npmjs.com/package/mysql
[2]: https://www.npmjs.com/package/mysql2
[3]: https://itbilu.com/nodejs/npm/V1PExztfb.html#definition-dataType
[4]: http://docs.sequelizejs.com/class/lib/model.js~Model.html
[5]: https://segmentfault.com/a/1190000011583806
