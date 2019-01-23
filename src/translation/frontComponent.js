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
