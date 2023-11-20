import { searchServers } from "scan";
import { Server, NS } from '@ns';

let targetServer: Server;
let servers = [];
let hasFormulas = false;
let availablePortHacks = 0;

/**
 * Hack servers
 * @param {import (".").NS} ns
 * @param {Array.<import(".").Server>} servers
 */
async function hackServers(ns: NS, servers: Array<Server>): Promise<void> {
    for (const server of servers) {
        const requiredPorts = ns.getServerNumPortsRequired(server.hostname);
        if (availablePortHacks >= requiredPorts) {
            if (!server.hasAdminRights) {
                ns.tprint(`Player does not have admin access to ${server.hostname}. Attempting to breach...`);
                await breach(ns, server);
            }
            
            ns.tprint(`Attempting to batch ${server.hostname}`);
            const result = ns.run('xxxsinx/manager.js', 1, server.hostname, 1);
            if (result > 0) {
                ns.tprint(`Now batching ${server.hostname}`);
            } else {
                ns.tprint(`Failed to start batching ${server.hostname}`);
            }
            // }
        } else {
            ns.print(`Do not have enough hacks (${availablePortHacks}) to run scripts on ${server.hostname} (Need: ${requiredPorts}). Skipping ...`);
        }
    }


    /**
     * @param {import (".").NS} ns
     * @param {import(".").Server} target
     */
    async function breach(ns: NS, target: Server) {
        const hostname = target.hostname;
        const requiredPorts = ns.getServerNumPortsRequired(target.hostname);
        if ((target.openPortCount ?? 0) >= requiredPorts) {
            if (target.hasAdminRights) {
                ns.tprint(`${hostname} has already been breached. Skipping ...`);
            } else {
                ns.tprint(`Attempting to breach ${hostname} ...`);
                ns.nuke(hostname);
            }
            return;
        }
        if (ns.fileExists("SQLInject.exe")) {
            if (!target.sqlPortOpen) {
                ns.sqlinject(hostname);
            }
        }
        if (ns.fileExists("FTPCrack.exe")) {
            if (!target.ftpPortOpen) {
                ns.ftpcrack(hostname);
            }
        }
        if (ns.fileExists("BruteSSH.exe")) {
            if (!target.sshPortOpen) {
                ns.brutessh(hostname);
            }
        }
        if (ns.fileExists("HTTPWorm.exe")) {
            if (!target.httpPortOpen) {
                ns.httpworm(hostname);
            }
        }
        if (ns.fileExists("relaySMTP.exe")) {
            if (!target.smtpPortOpen) {
                ns.relaysmtp(hostname);
            }
        }
        ns.nuke(hostname);
    }
}


// let targetOverride = "";
/**
 * Main function body
 * @param {import(".").NS} ns
 */
export async function main(ns: NS): Promise<void> {
    availablePortHacks = [
        ns.fileExists("FTPCrack.exe"),
        ns.fileExists("BruteSSH.exe"),
        ns.fileExists("relaySMTP.exe"),
        ns.fileExists("HTTPWorm.exe"),
        ns.fileExists("SQLInject.exe")
    ].filter(x => x).length;
    hasFormulas = ns.fileExists("Formulas.exe");
    ns.tprint(`Player has formulas.exe unlocked: ${hasFormulas}`);
    if (ns.args.length > 0) {
        const targetServerName = ns.args[0] as string;
        targetServer = await ns.getServer(targetServerName)
    }

    // populate the server map with entries of name/required hacking level
    servers = await searchServers(ns);
    const myServers = ns.getPurchasedServers();
    const allServers = servers.filter((server) => server.maxRam > 0 &&
        !myServers.includes(server.hostname) &&
        !server.hostname.startsWith("share"));

    if (myServers.length > 0) {
        const myServersToUse = myServers.filter((x) => x.includes("pigeon"));
        await hackMyServers(ns, myServersToUse);
    }
    await hackServers(ns, allServers);
}

/**
 * Hack servers
 * @param {import (".").NS} ns
 * @param {Array.<String>} servers
 */
async function hackMyServers(ns: NS, servers: Array<string>) {
    for (const server of servers) {

        ns.tprint(`Attempting to batch using ${server}`);

        const result = ns.run('xxxsinx/manager.js', 1, server, 1);
        if (result > 0) {
            ns.tprint(`Now batching ${server}`);
        } else {
            ns.tprint(`Failed to start batching ${server}`);

        }
    }
}
