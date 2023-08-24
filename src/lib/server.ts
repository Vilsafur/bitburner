import { NS, Server as NSServer } from '@ns'
import { Player, getPlayer } from '/lib/player'

export class Server {
    player: Player

    constructor(public ns: NS, public host: string) {
        this.ns = ns
        this.host = host
        this.player = getPlayer(ns)
    }

    get info(): NSServer {
        return this.ns.getServer(this.host)
    }

    get hasAdminRight(): boolean {
        return this.info.hasAdminRights
    }

    get isPurchase(): boolean {
        return this.info.purchasedByPlayer
    }

    get needWeaken(): boolean {
        const securityThresh = this.ns.getServerMinSecurityLevel(this.host) + 5
        return this.ns.getServerSecurityLevel(this.host) > securityThresh
    }

    get needGrow(): boolean {
        const moneyThresh = this.ns.getServerMaxMoney(this.host) * 0.75
        return this.ns.getServerMoneyAvailable(this.host) < moneyThresh
    }

    get canHack(): boolean {
        return this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(this.host)
    }

    get maxMoney(): number {
        return this.ns.getServerMaxMoney(this.host)
    }

    get hackingChance(): number {
        const hackFactor = 1.75;
        const difficultyMult = (100 - (this.info.hackDifficulty ?? 0)) / 100;
        const skillMult = hackFactor * this.player.hacking;
        const skillChance = (skillMult - this.ns.getServerRequiredHackingLevel(this.host)) / skillMult;
        let chance = skillChance * difficultyMult * this.player.mults.hacking_chance;

        if (chance > 1) {
            chance = 1;
        }
        if (chance < 0) {
            chance = 0;
        }

        return Math.round(((chance * 100) + Number.EPSILON) * 100) / 100
    }

    basicHack(): void {
        if (this.hasAdminRight) {
            if (this.needWeaken) {
                this.weaken()
            } else if (this.needGrow) {
                this.grow()
            } else if (this.canHack) {
                this.hack()
            }
        } else {
            this.openPorts()
            this.nuke()
        }
    }

    hackServer(server: Server): void {
        if (server.needWeaken) {
            this.weaken(server)
        } else if (server.needGrow) {
            this.grow(server)
        } else if (server.canHack) {
            this.hack(server)
        }
    }

    getThreadCount(scriptRamUsage: number): number {
        const usableRam = this.ns.getServerMaxRam(this.host) - this.ns.getServerUsedRam(this.host)
        return Math.floor(usableRam / scriptRamUsage)
    }

    weaken(server: Server = this): void {
        const availaibleThreads = this.getThreadCount(1.75)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/weaken.js", this.host, availaibleThreads, server.host)
        }
    }

    grow(server: Server = this): void {
        const availaibleThreads = this.getThreadCount(1.75)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/grow.js", this.host, availaibleThreads, server.host)
        }
    }

    hack(server: Server = this): void {
        const availaibleThreads = this.getThreadCount(1.70)
        if (availaibleThreads > 0) {
            this.ns.exec("bin/hack.js", this.host, availaibleThreads, server.host)
        }
    }

    openSsh(): void {
        if (this.info.sshPortOpen) {
            return
        }

        if (!this.player.haveBruteSSH) {
            return
        }

        try {
            this.ns.brutessh(this.host)
        } catch (e) {
            e
        }
    }
    
    openFtp(): void {
        if (this.info.ftpPortOpen) {
            return
        }

        if (!this.player.haveFTPCrack) {
            return
        }

        try {
            this.ns.ftpcrack(this.host)
        } catch (e) {
            e
        }
    }
    
    openHttp(): void {
        if (this.info.httpPortOpen) {
            return
        }

        if (!this.player.haveHTTPWorm) {
            return
        }

        try {
            this.ns.httpworm(this.host)
        } catch (e) {
            e
        }
    }
    
    openSmtp(): void {
        if (this.info.smtpPortOpen) {
            return
        }

        if (!this.player.haveRelaySMTP) {
            return
        }

        try {
            this.ns.relaysmtp(this.host)
        } catch (e) {
            e
        }
    }
    
    openSql(): void {
        if (this.info.sqlPortOpen) {
            return
        }

        if (!this.player.haveSQLInject) {
            return
        }

        try {
            this.ns.sqlinject(this.host)
        } catch (e) {
            e
        }
    }

    nuke(): void {
        const { openPortCount, numOpenPortsRequired } = this.info

        if (openPortCount === undefined || numOpenPortsRequired === undefined) {
            return
        }
        if (openPortCount < numOpenPortsRequired) {
            return
        }

        try {
            this.ns.nuke(this.host)
            this.ns.tprint(`[+] Admin right access on server ${this.host}`)
        } catch (e) {
            e
        }
    }

    openPorts(): void {
        this.openSsh()
        this.openFtp()
        this.openHttp()
        this.openSmtp()
        this.openSql()
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
