import { NS } from '@ns'
import { Hacknet } from '/lib/hacknet'
import { Player } from '/lib/player'

export async function main(ns : NS) : Promise<void> {
  ns.disableLog("sleep")

  const hacknet = new Hacknet(ns)
  const player = new Player(ns)

  while (ns.hacknet.numNodes() < 25) {

    hacknet.upgrade(player.mults.hacknet_node_money, player.money)
    await ns.sleep(100)
  }

  ns.tprint("# HACKNET # All nodes purchased")
}
