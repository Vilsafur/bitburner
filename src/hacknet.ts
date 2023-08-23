import { NS } from '@ns'
import { Hacknet } from '/lib/hacknet'

export async function main(ns : NS) : Promise<void> {
  ns.disableLog("sleep")

  const hacknet = new Hacknet(ns)

  while (true) {
    const playerMult = ns.getPlayer().mults.hacknet_node_money
    const playerMoney = ns.getPlayer().money

    hacknet.upgrade(playerMult, playerMoney)
    await ns.sleep(100)
  }
}
