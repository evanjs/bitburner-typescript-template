import {NS, ScriptArg, Server} from "@ns";


/** Check if the given server is hacking a specific target
 * @param {NS} ns
 * @param {string} parent
 * @param {string} server
 * @param {string} target
 * @param route
 */
function recursiveScan(ns: NS, parent: string, server: string, target: any, route: Array<string>) {
    const children = ns.scan(server);
    for (const child of children) {
        if (parent == child) {
            continue;
        }
        if (child == target) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }

        if (recursiveScan(ns, server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}

/**
 * @param {NS} ns
 * @param {string} server
 * @returns {any[]}
 */
export function findServer(ns: NS, server: Server): any[] {
    const route: any[] = [];
    recursiveScan(ns, '', 'home', server.hostname, route);
    return route.filter(x => x !== 'home');
}

/**
 * @param {NS} ns
 */
export async function main(ns: NS) {
    const args = ns.flags([["help", false]]);
    const route: any[] = [];
    const server = args._[0];
    if (!server || args.help) {
        ns.tprint("This script helps you find a server on the network and shows you the path to get to it.");
        ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }

    recursiveScan(ns, '', 'home', server, route);
    const connString = route.filter(x => x !== 'home').join("; connect ");
    ns.tprint(`connect ${connString}`);
}

export function autocomplete(data: { servers: any; }, args: any) {
    return data.servers;
}
