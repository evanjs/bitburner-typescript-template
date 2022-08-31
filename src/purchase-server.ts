import { NS } from "@ns";
import { getThreads } from "threads";
import { EARLY_HACK_SCRIPT } from "constants";

const targetServer = "joesguns";

/**
 * Main function body
 * @param {import(".").NS} ns 
 */
export async function main(ns: NS): Promise<void> {
    if (ns.args.length == 0) {
        ns.tprint("Please provide a number denoting the amount of RAM to purchase.");
        ns.exit();
    }

    const ram = ns.args[0] as number;

    ns.tprint(`Purchased servers ${ns.getPurchasedServers().length}`);
    const serverLimit = ns.getPurchasedServerLimit();
    if (ns.getPurchasedServers().length === serverLimit) {
        ns.tprint(`You already have ${serverLimit} with at least ${ram} GB of RAM. Exiting ...`)
    }
    for (let i = ns.getPurchasedServers().length; i < serverLimit; i++) {
        ns.tprint(`i: ${i}`);
        if (ns.getPurchasedServers().length < serverLimit) {
            const availableMoney = ns.getServerMoneyAvailable("home")
            const serverCost = ns.getPurchasedServerCost(ram)
            ns.tprint(`Purchased servers (${ns.getPurchasedServers().length}) is less than serverLimit ${serverLimit}`)
            if (availableMoney > serverCost) {
                const psr = `pserv-${i}`;
                ns.tprint(`Purchasing server using name "${psr}" with ${ram} GB of RAM`)
                const hostname = ns.purchaseServer(psr, ram);
                ns.tprint(`Getting numbers of threads for "${hostname}"`)
                const threads = await getThreads(ns, hostname);
                await ns.scp(EARLY_HACK_SCRIPT, hostname);
                ns.exec(EARLY_HACK_SCRIPT, hostname, threads, targetServer);
            } else {
                ns.tprint(`Available money (${(availableMoney).toLocaleString()}) is less than server cost for specified ram (${(serverCost).toLocaleString()})`)
            }
        } else {
            ns.tprint(`You own ${ns.getPurchasedServers().length} servers. You cannot purchase more than ${serverLimit}.`);
        }
    }
}
