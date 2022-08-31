import { searchServers } from "scan";
import { getBestServerToHack } from "servers";
import { NS, Server } from '@ns';

let targetServer: Server;
let servers: Array<Server>;
let hasFormulas = false;
let availablePortHacks = 0;


/** Check if the given server is hacking a specific target
 * @param {NS} ns
 * @param {Server | string} server
 */
async function isHackingTarget(ns: NS, server: Server | string) {
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
    ns.tprint(c);
    
    
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
async function hackMyServers(ns: NS, servers: Array<string>) {
    for (const server of servers) {
        // if (!ns.fileExists(EARLY_HACK_SCRIPT, server)) {
        // }
        // const isHackingTargetServer = await isHackingTarget(ns, server);
        // if (!isHackingTargetServer) {
        //     ns.tprint(`${server} is not currently hacking ${targetServer.hostname}`);
        //     let threads = await getThreads(ns, server);
        //     if (threads < 1) {
        //         ns.tprint(`${server} does not have enough threads to hack ${targetServer.hostname}. Killing all running programs...`);
        //         ns.scriptKill(EARLY_HACK_SCRIPT, server);
        //         threads = await getThreads(ns, server);
        //         ns.tprint(`Threads after killing all programs: ${threads}`);
        //     }
        //     ns.tprint(`Attempting to hack ${targetServer.hostname} using ${server} with ${threads} threads`);
        //     ns.tprint(`Running ${EARLY_HACK_SCRIPT} on ${server} with ${threads} threads targeting ${targetServer.hostname}`);
        //     ns.exec(EARLY_HACK_SCRIPT, server, threads, targetServer.hostname);
        // }
        // else {
        //     // ns.tprint(`${server} is already hacking ${targetServer.hostname}. Skipping...`)
        // }
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
async function hackServers(ns: NS, servers: Server[]) {
    for (const server of servers) {
        const requiredPorts = ns.getServerNumPortsRequired(server.hostname);
        if (availablePortHacks >= server.numOpenPortsRequired) {
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


    /**
     *
     * @param {import (".").NS} ns
     * @param {import(".").Server} target
     */
    async function breach(ns: NS, target: Server) {
        const hostname = target.hostname;
        if (target.openPortCount >= ns.getServerNumPortsRequired(target.hostname)) {
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

    async function printServerPorts(ns: NS, servers: Array<Server>) {
        for (let i = 0; i <= 5; i++) {
            const serversWithIPorts = servers
                .filter((server) => ns.getServerNumPortsRequired(server.hostname) === i)
                .map((s) => ` ${s.hostname}: ${s.maxRam} GB -- (${s.requiredHackingSkill} hacking)`);
            ns.tprint(`Servers with ${i} ports: ${serversWithIPorts}`);
        }
    }
}
