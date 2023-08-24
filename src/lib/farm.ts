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
    return this.servers.filter((s) => s.isPurchase)
  }

  getOtherServers(): Server[] {
    return this.servers.filter((s) => !s.isPurchase)
  }

  async enablebasicHack(): Promise<void> {
    while (true) {
      for (const server of this.getServersWithoutHome()) {  
        server.basicHack()
      }
      await this.ns.sleep(1)
    }
  }

  async getMoney(): Promise<void> {
    while (true) {
      const serverToHack = this.findBestServerToHack()

      if (!serverToHack.hasAdminRight) {
        this.ns.print(`[+] Get Admin Right for server ${serverToHack.host}`)
        serverToHack.openPorts()
        serverToHack.nuke()
        continue
      }
      
      for (const server of this.getServersWithoutHome()) {
        if (!server.hasAdminRight) {
          this.ns.print(`[+] Get Admin Right for server ${server.host}`)
          server.openPorts()
          server.nuke()
          continue
        }
        server.hackServer(serverToHack)
      }

      await this.ns.sleep(1)
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

  private findBestServerToHack(): Server {

    const serversToHack = this.servers.filter((s) => !s.isPurchase && s.canHack && s.maxMoney > 0)
    const serverDetails = []

    for (const server of serversToHack) {
      const hackingChance = server.hackingChance
      const money = server.maxMoney
      serverDetails.push({
        server,
        hackingChance,
        money
      })
    }
    

    const bestServer = serverDetails.reduce((prev, curr) => {
      if (prev.hackingChance > curr.hackingChance) {
        return prev
      }
  
      if (prev.hackingChance === curr.hackingChance) {
        if (prev.money > curr.money) {
          return prev
        }
        return curr
      }
      return curr
    });

    return bestServer.server
  }
}