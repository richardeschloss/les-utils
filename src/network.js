import netstat from 'node-netstat'

const NetUtils = {
  async findFreePort({ range = [8000, 9000], netstatOpts = {} }) {
    // Example netstatOpts { filter: { protocol: 'tcp' } })
    const usedPorts = (await this.netstatP(netstatOpts)).map(
      ({ local }) => local.port
    )
    const [startPort, endPort] = range
    let freePort
    for (let port = startPort; port <= endPort; port++) {
      if (!usedPorts.includes(port)) {
        freePort = port
        break
      }
    }
    return freePort
  },

  netstatP(opts) {
    return new Promise((resolve) => {
      const res = []
      netstat(
        {
          ...opts,
          done: (err) => {
            console.error('done err?', err)
            return resolve(res)
          }
        },
        (data) => res.push(data)
      )
      return res
    })
  },

  async portTaken({ port, netstatOpts = {} }) {
    const usedPorts = (await this.netstatP(netstatOpts)).map(
      ({ local }) => local.port
    )
    return usedPorts.includes(port)
  }
}

export { NetUtils }
