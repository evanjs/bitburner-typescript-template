import { searchServers } from "scan";
import { getBestServerToHack } from "servers";
import { NS, Server } from '@ns';
import { breach } from 'breach';

let targetServer: Server;
let servers: Array<Server>;
let hasFormulas = false;
let availablePortHacks = 0;


/** Check if the given server is hacking a specific target
 * @param {NS} ns
 * @param {Server | string} server
 */
async function isHackingTarget(ns: NS, server: Server | string): Promise<boolean> {
    if (typeof server == "string") {
        ns.print(`Checking if ${server} is hacking ${targetServer.hostname}`);
        return ns.isRunning('hack.js', server, targetServer.hostname);
    } else {
        ns.print(`Checking if ${server.hostname} is hacking ${targetServer.hostname}`);
        return ns.isRunning('hack.js', server.hostname, targetServer.hostname);
    }
}


// let targetOverride = "";
/**
 * Main function body
 * @param {NS} ns
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

    let targetServerName = "";
    if (ns.args.length > 0) {
        targetServerName = ns.args[0] as string;
        targetServer = await ns.getServer(targetServerName)
    }


    const a = 1 + 2;
    ns.tprint(a);
    const b = 2;

    ns.tprint(b);
    const c = 3 + 1;
    ns.tprint(c + b + a + c);


    // populate the server map with entries of name/required hacking level
    servers = await searchServers(ns);
    const myServers = ns.getPurchasedServers();
    const allServers = servers.filter((server) => server.maxRam > 0 &&
        !myServers.includes(server.hostname) &&
        !server.hostname.startsWith("share"));
    //   await printServerPorts(ns, allServers);

    // get the best server we can hack at our current level
    if (targetServerName != null && targetServerName.length === 0) {
        const tryTargetServer = await getBestServerToHack(ns, allServers);
        if (tryTargetServer == null) {
            ns.tprint("Could not determine best server to hack.\nFalling back to n00dles");
            targetServer = ns.getServer("n00dles");
        } else {
            targetServer = tryTargetServer;
        }
        ns.tprint(`Best server to hack is ${targetServer.hostname} (${targetServer.requiredHackingSkill})`);
    } else {
        ns.tprint(`Using hacking target override of ${targetServerName}`);
        targetServer = ns.getServer(targetServerName);
    }
    // const isHomeHackingTarget = await isHackingTarget(ns, home);
    // const homeMessage = isHomeHackingTarget ? "hacking" : "not hacking";
    // ns.print(`Home is ${homeMessage} target`);
    // if (!isHomeHackingTarget) {
    //     ns.scriptKill(EARLY_HACK_SCRIPT, "home");
    //     const threads = await getHomeThreads(ns, home);
    //     ns.tprint(`Trying to run hack script on home with ${threads} threads`);
    //     ns.tprint(`Home has ${threads} available threads`);
    //     ns.run(EARLY_HACK_SCRIPT, threads, targetServer.hostname);
    // }
    // ns.tprint(`My servers: ${JSON.stringify(myServers, null, 2)}`)
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
async function hackMyServers(ns: NS, servers: Array<string>): Promise<void> {
    for (const server of servers) {
        ns.scp('hack.js', server);
        ns.scp('grow.js', server);
        ns.scp('weaken.js', server);
        ns.scp('threads.js', server);
        ns.scp('constants.js', server);
        ns.scp('split.js', server)

        const isHackingTargetServer = await isHackingTarget(ns, server);
        if (!isHackingTargetServer) {
            ns.tprint(`Attempting to hack ${targetServer.hostname} using ${server}`);
            const result = ns.exec('split.js', server, 1, server, targetServer.hostname);
            if (result > 0) {
                ns.tprint(`${server} is now hacking ${targetServer.hostname}`);
            } else {
                ns.tprint(`Failed to start hacking ${targetServer.hostname} using ${server}`);
            }
        }
    }
}

/**
 * Hack servers
 * @param {import (".").NS} ns
 * @param {Server[]} servers
 */
async function hackServers(ns: NS, servers: Server[]): Promise<void> {
    for (const server of servers) {
        const requiredPorts = ns.getServerNumPortsRequired(server.hostname);
        if (availablePortHacks >= (server.numOpenPortsRequired ?? 999)) {
            if (!server.hasAdminRights) {
                ns.tprint(`Player does not have admin access to ${server.hostname}. Attempting to breach...`);
                await breach(ns, server);
            }

            ns.scp('hack.js', server.hostname);
            ns.scp('grow.js', server.hostname);
            ns.scp('weaken.js', server.hostname);
            ns.scp('threads.js', server.hostname);
            ns.scp('constants.js', server.hostname);
            ns.scp('split.js', server.hostname)

            const isHackingTargetServer = await isHackingTarget(ns, server);
            if (!isHackingTargetServer) {
                ns.tprint(`Attempting to hack ${targetServer.hostname} using ${server.hostname}`);
                const result = ns.exec('split.js', server.hostname, 1, server.hostname, targetServer.hostname);
                if (result > 0) {
                    ns.tprint(`${server.hostname} is now hacking ${targetServer.hostname}`);
                } else {
                    ns.tprint(`Failed to start hacking ${targetServer.hostname} using ${server.hostname}`);
                }
            }
        } else {
            ns.print(`Do not have enough hacks (${availablePortHacks}) to run scripts on ${server.hostname} (Need: ${requiredPorts}). Skipping ...`);
        }
    }
}
