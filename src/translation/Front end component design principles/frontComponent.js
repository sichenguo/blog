//01 Flat, data-oriented state/props
const state = {
  clients: {
    allClients,
    firstClient,
    lastClient: {
      name: 'John',
      phone: 'Doe',
      address: {
        number: 5,
        street: 'Estin',
        suburb: 'Parrama',
        city: 'Sydney'
      }
    }
  }
}

// 倘若我们需要去修改 address number时需要怎么办？
const test = {
  clients: {
    ...state.clients,
    lastClient: {
      ...state.clients.lastClient,
      address: {
        ...state.clients.lastClient.address,
        number: 10
      }
    }
  }
}

// 02

// 我们无法得知 customer 这个对象里面拥有什么属性
// 这个组件需要使用这个对象所有的属性值或者只是需要其中的一部分？
// 如果我想要将这个组件在别处使用，我应该传入什么样的对象

<listItem customer={customer}/>

// 下面的这个组件接收的属性就一目了然

<listItem phone={customer.phone} name={customer.name} iNumber={customer.iNumber}  />


//03 State change purity
zone:{
  handler() {
    // 重置页码
    if(this.pagination.page > 1){
        this.pagination.page = 1
        return;
    }
    this.getDataFromApi()
  }
}

// 04

watch: {
  pagination() {
    this.getDataFromApi()
  }
},
zone: {
  handler() {
    // 重置页码
    if(this.pagination.page > 1) {
        this.pagination.page = 1
        return;
    }
    this.getDataFromApi()
  }
}

//  05
const Links = ()=>(
  <div className="links-container">
    <div class="links-list">
      <a href="/">
        Home
      </a>
      <a href="/shop">
        Products
      </a>
      <a href="/help">
        Help
      </a>
    </div>
    <div className="links-logo">
      <img src="/default/logo.png"/>
    </div>
  </div>
)
// 06
const DEFAULT_LINKS = [
  {route: "/", text: "Home"},
  {route: "/shop", text: "Products"},
  {route: "/help", text: "Help"}
]
const DEFAULT_LOGO = "/default/logo.png"

const Links = ({links = DEFAULT_LINKS,logoPath = DEFAULT_LOGO }) => (
  <div className="links-container">
    <div class="links-list">
       // 将数组依次渲染为超链接
       links.map((link) => <a href={link.route}> {link.text}</a>)
    </div>
    <div className="links-logo">
      <img src={logoPath}/>
    </div>
  </div>
)

//07
const adminLinks = {
  links: [
    {route: "/", text: "Home"},
    {route: "/metrics", text: "Site metrics"},
    {route: "/admin", text: "Admin panel"}
  ],
  logoPath: "/admin/logo.png"
}
<Links {...adminLinks} />

