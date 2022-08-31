import { NS } from "@ns";

let excludeSize = 0;

/** @param {import(".").NS} ns */
export async function main(ns: NS): Promise<void> {
    if (ns.args.length > 0) {
        excludeSize = ns.args[0] as number;
    }

    const myServers = ns
        .getPurchasedServers()
        .map((s) => ns.getServer(s))
        .filter((server) =>
            server.hostname.includes("pserv-") &&
            server.maxRam < excludeSize
        )
        .map((server) => `${server.hostname}: ${server.maxRam} GB`);
    ns.tprint(`Would delete ${JSON.stringify(myServers, null, 2)}`);
    for (const server of myServers) {
        ns.killall(server);
        ns.deleteServer(server);
    }
}
