import { NS } from '@ns'

function getServersList(ns: NS, currentServer = "home", set = new Set<string>() ): string[] {
  let serverConnections: string[] = ns.scan(currentServer)

  serverConnections = serverConnections.filter((s) => !set.has(s))

  serverConnections.forEach((server)=> {
    set.add(server)
    return getServersList(ns, server, set)
  })

  return Array.from(set.keys())
}

function getThreadCount(ns: NS, hostname: string, scriptRamUsage: number): number {
  const usableRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
  return Math.floor(usableRam / scriptRamUsage)
}

export async function main(ns : NS) : Promise<void> {
  const servers = getServersList(ns)

  for (const server of servers) {
    await ns.scp(
      [
        "bin/grow.js",
        "bin/weaken.js",
        "bin/hack.js",
      ],
      server,
      "home"
    )
  }

  while (true) {
    for (const server of servers) {
      if (server === "home") {
        continue
      }

      if (ns.hasRootAccess(server)) {
        const moneyThresh = ns.getServerMaxMoney(server) * 0.75;
        const securityThresh = ns.getServerMinSecurityLevel(server) + 5;
        const canHack = ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server)
        let availaibleThreads = getThreadCount(ns, server, 1.75)

        if (ns.getServerSecurityLevel(server) > securityThresh) {
          if (availaibleThreads > 0) {
            ns.exec("bin/weaken.js", server, availaibleThreads, server)
          }
        } else if (ns.getServerMoneyAvailable(server) < moneyThresh) {
          if (availaibleThreads > 0) {
            ns.exec("bin/grow.js", server, availaibleThreads, server)
          }
        } else {
          availaibleThreads = getThreadCount(ns, server, 1.70)
          if (availaibleThreads > 0 && canHack) {
            ns.exec("bin/hack.js", server, availaibleThreads, server)
          }
        }
      } else {

        const serverProp = await ns.getServer(server)

        if (!serverProp.ftpPortOpen) {
          try {
            ns.ftpcrack(server)
          } catch (e) {
            e
          }
        }

        if (!serverProp.sshPortOpen) {
          try {
            ns.brutessh(server)
          } catch (e) {
            e
          }
        }

        if (serverProp.openPortCount >= serverProp.numOpenPortsRequired) {
          try {
            ns.nuke(server)
          } catch (e) {
            e
          }
        }
      }
      await ns.sleep(1)
    }
  }
}