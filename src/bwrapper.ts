import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const serverName = ns.args[0] as string;
    ns.exec('breach.js', 'home', 1, serverName)
}
