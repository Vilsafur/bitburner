import { NS } from '@ns'
import { calculateMoneyGainRate } from 'utils/hacknet'
import { NodeStats } from '/interfaces/Hacknet'

export class Node {
    level = 0
    ram = 0
    cores = 0
    production = 0

    constructor (public ns: NS, public nodeNum: number) {
        this.ns = ns
        this.nodeNum = nodeNum
        this._retriveStats()
    }
    
    getLevelUpgradeRate(mult: number): number {
        return calculateMoneyGainRate(
            this.level + 1,
            this.ram,
            this.cores,
            mult
        ) - this.production
    }

    getRamUpgradeRate(mult: number): number {
        return calculateMoneyGainRate(
            this.level,
            this.ram + 1,
            this.cores,
            mult
        ) - this.production
    }

    getCoreUpgradeRate(mult: number): number {
        return calculateMoneyGainRate(
            this.level,
            this.ram,
            this.cores + 1,
            mult
        ) - this.production
    }

    getUpgradeRates(mult: number): NodeStats[] {
        const levelUpgradeCost = this.ns.hacknet.getLevelUpgradeCost(this.nodeNum, 1)
        const coreUpgradeCost = this.ns.hacknet.getCoreUpgradeCost(this.nodeNum, 1)
        const ramUpgradeCost = this.ns.hacknet.getRamUpgradeCost(this.nodeNum, 1)

        const levelUpgradeRate = this.getLevelUpgradeRate(mult)
        const ramUpgradeRate = this.getRamUpgradeRate(mult)
        const coreUpgradeRate = this.getCoreUpgradeRate(mult)

        return [
            {
                name: "level",
                node: this,
                cost: levelUpgradeCost,
                rate: levelUpgradeRate,
                ratio: levelUpgradeRate / levelUpgradeCost,
            },
            {
                name: "ram",
                node: this,
                cost: ramUpgradeCost,
                rate: ramUpgradeRate,
                ratio: ramUpgradeRate / ramUpgradeCost,
            },
            {
                name: "core",
                node: this,
                cost: coreUpgradeCost,
                rate: coreUpgradeRate,
                ratio: coreUpgradeRate / coreUpgradeCost,
            }
        ]
    }

    upgradeLevel(): void {
        this.ns.hacknet.upgradeLevel(this.nodeNum)
        this._retriveStats()
    }

    upgradeRam(): void {
        this.ns.hacknet.upgradeRam(this.nodeNum)
        this._retriveStats()
    }

    upgradeCore(): void {
        this.ns.hacknet.upgradeCore(this.nodeNum)
        this._retriveStats()
    }

    _retriveStats(): void {
        const {level, ram, cores, production } = this.ns.hacknet.getNodeStats(this.nodeNum)
        this.level = level
        this.ram = ram
        this.cores = cores
        this.production = production
    }
}
