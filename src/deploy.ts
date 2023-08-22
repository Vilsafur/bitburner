import { NS } from '@ns'
import { Server } from './lib/server'

function getServersList(ns: NS, currentServer = "home", set = new Set<string>() ): Server[] {
  let serverConnections: string[] = ns.scan(currentServer)

  serverConnections = serverConnections.filter((s) => !set.has(s))

  serverConnections.forEach((server)=> {
    set.add(server)
    return getServersList(ns, server, set)
  })

  return Array.from(set.keys()).map((s) => new Server(ns, s))
}

function getThreadCount(ns: NS, hostname: string, scriptRamUsage: number): number {
  const usableRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
  return Math.floor(usableRam / scriptRamUsage)
}

export async function main(ns : NS) : Promise<void> {
  const servers = getServersList(ns)

  for (const server of servers) {
    server.copyScripts()
  }

  while (true) {
    for (const server of servers) {
      if (server.host === "home") {
        continue
      }

      if (server.hasAdminRight()) {
        if (server.needWeaken()) {
          server.weaken()
        } else if (server.needGrow()) {
          server.grow()
        } else if (server.canHack()) {
          server.hack()
        } else {
            ns.tprint("Can do nothing on this server (deploy)")
        }
      } else {
        server.openPorts()
        server.nuke()
      }
      await ns.sleep(1)
    }
  }
}