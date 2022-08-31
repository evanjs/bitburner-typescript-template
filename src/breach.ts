import { NS } from "@ns";

/**
 * Main function body
 * @param {import(".").NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const server = ns.args[0] as string;
    if (ns.fileExists("FTPCrack.exe")) {
        ns.ftpcrack(server);
    }
    if (ns.fileExists("BruteSSH.exe")) {
        ns.brutessh(server);
    }
    if (ns.fileExists("relaySMTP.exe")) {
        ns.relaysmtp(server);
    }
    if (ns.fileExists("HTTPWorm.exe")) {
        ns.httpworm(server);
    }
    if (ns.fileExists("SQLInject.exe")) {
        ns.sqlinject(server);
    }

    ns.nuke(server);
}
