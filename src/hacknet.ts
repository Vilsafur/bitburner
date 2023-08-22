import { NS } from '@ns'

function range(start: number, end: number, step = 1) {
  const arr = [];

  for (let i = start; i < end; i += step) {
    arr.push(i)
  }

  return arr
}

function calculateHnetMoneyGainRate(level: number, ram: number, cores: number, mult: number): number {
  const levelMult = level * 1.5;
  const ramMult = Math.pow(1.035, ram - 1);
  const coresMult = (cores + 5) / 6;

  return levelMult * ramMult * coresMult * mult;
}

function calculateMedianNodeRate(ns: NS, nodes: number[]): number {
  const totalLevel: number[] = []
  const totalRam: number[] = []
  const totalCore: number[] = []
  const nodesNumber: number = ns.hacknet.numNodes()

  for (const node of nodes) {
    const {level, ram, cores} = ns.hacknet.getNodeStats(node)
    totalLevel.push(level)
    totalRam.push(ram)
    totalCore.push(cores)
  }

  const medianLevel = totalLevel.reduce((a, b) => a + b) / nodesNumber
  const medianRam = totalRam.reduce((a, b) => a + b) / nodesNumber
  const medianCore = totalCore.reduce((a, b) => a + b) / nodesNumber

  const nodeMedianRate = calculateHnetMoneyGainRate(medianLevel, medianRam, medianCore, ns.getPlayer().mults.hacknet_node_money)

  return nodeMedianRate
}

export async function main(ns : NS) : Promise<void> {
  ns.disableLog("sleep")

  while (true) {
    const playerMult = ns.getPlayer().mults.hacknet_node_money
    const playerMoney = ns.getPlayer().money
    const nodes = range(0, ns.hacknet.numNodes())

    const nodeStats = []

    const nodePurshaseCost = ns.hacknet.getPurchaseNodeCost()
    const nodePurshaseRate = calculateMedianNodeRate(ns, nodes)

    nodeStats.push(
      {
        name: "node",
        cost: nodePurshaseCost,
        ratio: nodePurshaseRate / nodePurshaseCost,
      }
    )

    for (const node of nodes) {
      const { level, cores, ram, production } = ns.hacknet.getNodeStats(node)

      const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(node, 1)
      const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(node, 1)
      const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(node, 1)

      const levelUpgradeRate = calculateHnetMoneyGainRate(level + 1, ram, cores, playerMult) - production
      const ramUpgradeRate = calculateHnetMoneyGainRate(level, ram + 1, cores, playerMult) - production
      const coreUpgradeRate = calculateHnetMoneyGainRate(level, ram, cores + 1, playerMult) - production

      nodeStats.push(
        {
          name: "level",
          core: node,
          cost: levelUpgradeCost,
          rate: levelUpgradeRate,
          ratio: levelUpgradeRate / levelUpgradeCost,
        },
        {
          name: "ram",
          core: node,
          cost: ramUpgradeCost,
          rate: ramUpgradeRate,
          ratio: ramUpgradeRate / ramUpgradeCost,
        },
        {
          name: "core",
          core: node,
          cost: coreUpgradeCost,
          rate: coreUpgradeRate,
          ratio: coreUpgradeRate / coreUpgradeCost,
        }
      )
    }

    nodeStats.sort((a, b) => b.ratio - a.ratio)

    const upgrade = nodeStats[0]
    if (upgrade.cost > playerMoney ) {
      ns.print("Not enought money for the upgrade (hacknet)")
    } else {
      switch (upgrade.name) {
        case "level":
          ns.hacknet.upgradeLevel(upgrade.core as number)
          break;
        case "ram":
          ns.hacknet.upgradeRam(upgrade.core as number)
          
          break;
        case "core":
            ns.hacknet.upgradeCore(upgrade.core as number)
            
          break;
        case "node":
            ns.hacknet.purchaseNode()
            
          break;
      
        default:
          ns.print("name not found (hacknet)")
          break;
      }
    }

    await ns.sleep(100)
  }
}