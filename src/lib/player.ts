import { Multipliers, NS } from '@ns'

export const MONEY_TO_KEEP_FILE_PATH = 'moneyToKeep.txt'

export class Player {
  constructor (public ns: NS) {
    this.ns = ns
  }

  get money(): number {
    return this.ns.getPlayer().money
  }

  get mults(): Multipliers {
    return this.ns.getPlayer().mults
  }

  get moneyToKeep(): number {
    if (!this.ns.fileExists(MONEY_TO_KEEP_FILE_PATH)) {
      return 0
    }

    return Number(this.ns.read(MONEY_TO_KEEP_FILE_PATH))
  }

  get haveBruteSSH(): boolean {
    return this.ns.fileExists('brutessh.exe')
  }

  get haveFTPCrack(): boolean {
    return this.ns.fileExists('ftpcrack.exe')
  }

  get haveRelaySMTP(): boolean {
    return this.ns.fileExists('relaysmtp.exe')
  }

  get haveHTTPWorm(): boolean {
    return this.ns.fileExists('httpworm.exe')
  }

  get haveSQLInject(): boolean {
    return this.ns.fileExists('sqlinject.exe')
  }
}
