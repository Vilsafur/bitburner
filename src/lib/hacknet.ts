import { NS } from '@ns'
import { Node } from '/lib/node';
import { NodeStats } from 'interfaces/Hacknet'
import { calculateMoneyGainRate } from '/utils/hacknet';

export class Hacknet {
    nodes: Node[]

    constructor(public ns: NS) {
        this.ns = ns
        this.nodes = this.retriveNodes()
    }

    retriveNodes(): Node[] {
        const arr = [];
        const nbNodes = this.ns.hacknet.numNodes()

        for (let i = 0; i < nbNodes; i++) {
            arr.push(new Node(this.ns, i))
        }

        return arr
    }

    upgrade(mult: number, minMoney: number): void {
        const nodeStats: NodeStats[] = []

        const newNodeStats = this._getNewNodeStats(mult)

        if (this.nodes.length === 0) {
            if (minMoney < newNodeStats.cost) {
                this.ns.print("Not enought money for the purchase node (hacknet)")
                return
            }

            this.ns.hacknet.purchaseNode()
            this.nodes = this.retriveNodes()
            return
        }

        for (const node of this.nodes) {
            const stats = node.getUpgradeRates(mult)
            nodeStats.push(...stats)
        }

        nodeStats.sort((a, b) => b.ratio - a.ratio)

        const upgrade = nodeStats[0]

        if (newNodeStats.ratio < upgrade.ratio) {
            if (minMoney < newNodeStats.cost) {
                this.ns.print("Not enought money for the purchase node (hacknet)")
                return
            }

            this.ns.hacknet.purchaseNode()
            this.nodes = this.retriveNodes()
        } else {
            if (minMoney < upgrade.cost) {
                this.ns.print(`Not enought money for the upgrade ${upgrade.name} for node ${upgrade.node.nodeNum} (hacknet)`)
                return
            }

            switch (upgrade.name) {
                case "level":
                  upgrade.node.upgradeLevel()
                  break;
                case "ram":
                    upgrade.node.upgradeRam()
                  break;
                case "core":
                    upgrade.node.upgradeCore()
                  break;
              
                default:
                  this.ns.print("name not found (hacknet)")
                  break;
              }
        }

    }

    _calculateMedianNodeRate(mult: number): number {
        if (this.nodes.length === 0) {
            return 0
          }
        
          const totalLevel: number[] = []
          const totalRam: number[] = []
          const totalCore: number[] = []
        
          for (const node of this.nodes) {
            totalLevel.push(node.level)
            totalRam.push(node.ram)
            totalCore.push(node.cores)
          }
        
          const medianLevel = totalLevel.reduce((a, b) => a + b) / this.nodes.length
          const medianRam = totalRam.reduce((a, b) => a + b) / this.nodes.length
          const medianCore = totalCore.reduce((a, b) => a + b) / this.nodes.length
        
          const nodeMedianRate = calculateMoneyGainRate(medianLevel, medianRam, medianCore, mult)
        
          return nodeMedianRate
    }

    _getNewNodeStats(mult: number): { name: string, cost: number, ratio: number } {
        const nodePurshaseCost = this.ns.hacknet.getPurchaseNodeCost()
        const nodePurshaseRate = this._calculateMedianNodeRate(mult)

        return {
            name: "node",
            cost: nodePurshaseCost,
            ratio: nodePurshaseRate / nodePurshaseCost,
        }
    }
}
