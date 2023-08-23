import { NS } from '@ns'
import { Farm } from '/lib/farm'

export async function main(ns : NS) : Promise<void> {
  ns.disableLog("sleep")

  const farm = new Farm(ns)

  await farm.enablebasicHack()
}
