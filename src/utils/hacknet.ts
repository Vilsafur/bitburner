import { NS } from '@ns'

export function calculateMoneyGainRate (level: number, ram: number, cores: number, mult: number): number {
    const levelMult = level * 1.5;
    const ramMult = Math.pow(1.035, ram - 1);
    const coresMult = (cores + 5) / 6;

    return levelMult * ramMult * coresMult * mult;
}

export async function main(ns : NS) : Promise<void> {
    ns.tprint("Ce n'est pas un script")
}