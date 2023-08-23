import { Node } from 'lib/node'

export interface NodeStats {
    name: string,
    node: Node,
    cost: number,
    rate: number,
    ratio: number
}