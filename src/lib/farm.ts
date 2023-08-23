import { NS } from '@ns'
import { Server } from '/lib/server'

export class Farm
{
  servers: Server[] = []

  constructor (public ns: NS) {
    this.ns = ns
    this.servers = this.retriveServers()

    this.servers.forEach(s => s.copyScripts())
  }

  getServersWithoutHome(): Server[] {
    return this.servers.filter((s) => s.host !== 'home')
  }

  getPurchaseServers(): Server[] {
    return this.servers.filter((s) => s.isPurchase())
  }

  getOtherServers(): Server[] {
    return this.servers.filter((s) => !s.isPurchase())
  }

  async enablebasicHack(): Promise<void> {
    while (true) {
      for (const server of this.getServersWithoutHome()) {  
        server.basicHack()
  
        await this.ns.sleep(1)
      }
    }
  }

  private retriveServers(currentServer = "home", set = new Set<string>() ): Server[] {
    let serverConnections: string[] = this.ns.scan(currentServer)
  
    serverConnections = serverConnections.filter((s) => !set.has(s))
  
    serverConnections.forEach((server)=> {
      set.add(server)
      return this.retriveServers(server, set)
    })
  
    return Array.from(set.keys()).map((s) => new Server(this.ns, s))
  }
}