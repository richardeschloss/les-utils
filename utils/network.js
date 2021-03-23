// @ts-ignore
import netstat from 'node-netstat'

/** @type import('./network').NetUtils */
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
    return new Promise((resolve, reject) => {
      const res = []
      netstat(
        {
          ...opts,
          /** @param {any} err */
          done(err) {
            /* c8 ignore next 7 */
            if (err) {
              console.error(
                'Netstat error occurred. Is it installed? Install with:\n\
                apt-get update; apt-get install net-tools'
              )
              reject(err)
            }
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

export default Object.freeze(NetUtils)
