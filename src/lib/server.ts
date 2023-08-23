import { NS, Server as NSServer } from '@ns'

export class Server {
    constructor(public ns: NS, public host: string) {
        this.ns = ns
        this.host = host
    }

    info(): NSServer {
        return this.ns.getServer(this.host)
    }

    basicHack(): void {
        if (this.hasAdminRight()) {
            if (this.needWeaken()) {
                this.weaken()
            } else if (this.needGrow()) {
                this.grow()
            } else if (this.canHack()) {
                this.hack()
            }
        } else {
            this.openPorts()
            this.nuke()
        }
    }

    hasAdminRight(): boolean {
        return this.info().hasAdminRights
    }

    isPurchase(): boolean {
        return this.info().purchasedByPlayer
    }

    needWeaken(): boolean {
        const securityThresh = this.ns.getServerMinSecurityLevel(this.host) + 5
        return this.ns.getServerSecurityLevel(this.host) > securityThresh
    }

    needGrow(): boolean {
        const moneyThresh = this.ns.getServerMaxMoney(this.host) * 0.75
        return this.ns.getServerMoneyAvailable(this.host) < moneyThresh
    }

    canHack(): boolean {
        return this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(this.host)
    }

    getThreadCount(scriptRamUsage: number): number {
        const usableRam = this.ns.getServerMaxRam(this.host) - this.ns.getServerUsedRam(this.host)
        return Math.floor(usableRam / scriptRamUsage)
    }

    weaken(): void {
        const availaibleThreads = this.getThreadCount(1.75)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/weaken.js", this.host, availaibleThreads, this.host)
        }
    }

    grow(): void {
        const availaibleThreads = this.getThreadCount(1.75)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/grow.js", this.host, availaibleThreads, this.host)
        }
    }

    hack(): void {
        const availaibleThreads = this.getThreadCount(1.70)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/hack.js", this.host, availaibleThreads, this.host)
        }
    }

    openSsh(): void {
        if (this.info().sshPortOpen) {
            return
        }

        try {
            this.ns.brutessh(this.host)
        } catch (e) {
            e
        }
    }
    
    openFtp(): void {
        if (this.info().ftpPortOpen) {
            return
        }

        try {
            this.ns.ftpcrack(this.host)
        } catch (e) {
            e
        }
    }

    nuke(): void {
        const { openPortCount, numOpenPortsRequired } = this.info()
        if (openPortCount === undefined || numOpenPortsRequired === undefined) {
            return
        }
        if (openPortCount < numOpenPortsRequired) {
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

    async copyScripts(): Promise<void> {
        await this.ns.scp(
            [
              "bin/grow.js",
              "bin/weaken.js",
              "bin/hack.js",
            ],
            this.host,
            "home"
          )
    }
}
