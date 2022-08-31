import { getBestServerToHack } from "servers";
import { searchServers } from "scan";
import { NS } from "@ns";


/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	const servers = await searchServers(ns);
    const myServers = ns.getPurchasedServers();

    const allServers = servers.filter((server) => server.maxRam > 0 &&
        !myServers.includes(server.hostname) &&
        !server.hostname.startsWith("share"));

	const best = await getBestServerToHack(ns, allServers) ?? ns.getServer('n00dles');
    ns.tprint(`Hacking ${best.hostname} with home`);
	ns.run('homesplit.js', 1, best.hostname);
}
