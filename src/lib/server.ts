import { NS, Server as NSServer } from '@ns'

export class Server {
    constructor(public ns: NS, public host: string) {
        this.ns = ns
        this.host = host
    }

    info (): NSServer {
        return this.ns.getServer(this.host)
    }

    hasAdminRight(): bool {
        return this.info().hasAdminRights
    }

    needWeaken(): bool {
        const securityThresh = this.ns.getServerMinSecurityLevel(this.host) + 5
        return this.ns.getServerSecurityLevel(this.host) > securityThresh
    }

    needGrow(): bool {
        const moneyThresh = this.ns.getServerMaxMoney(this.hosts) * 0.75
        return this.ns.getServerMoneyAvailable(this.host) < moneyThresh
    }

    canHack(): bool {
        this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(this.host)
    }

    weaken(): void {
        const availaibleThreads = getThreadCount(this.ns, this.host, 1.75)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/weaken.js", this.host, availaibleThreads, this.host)
        }
    }

    grow(): void {
        const availaibleThreads = getThreadCount(this.ns, this.host, 1.75)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/grow.js", this.host, availaibleThreads, this.host)
        }
    }

    hack(): void {
        const availaibleThreads = getThreadCount(this.ns, this.host, 1.70)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/hack.js", this.host, availaibleThreads, this.host)
        }
    }

    openSsh() {
        if (this.info().sshPortOpen) {
            return
        }

        try {
            this.ns.brutessh(this.host)
        } catch (e) {
            e
        }
    }
    
    openFtp() {
        if (this.info().ftpPortOpen) {
            return
        }

        try {
            this.ns.ftpcrack(this.host)
        } catch (e) {
            e
        }
    }

    nuke() {
        if (this.info().openPortCount < this.info().numOpenPortsRequired) {
            return
        }

        try {
            this.ns.nuke(this.host)
        } catch (e) {
            e
        }
    }

    openPorts(): void {
        this.openSsh()
        this.openFtp()
    }

    async copyScripts(): void {
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
}

export async function main(ns : NS) : Promise<void> {
    ns.tprint("Ce n'est pas un script")
}
