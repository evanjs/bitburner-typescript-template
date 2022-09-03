import { NS, Server } from "@ns";
import { findServer } from '/findServer';

export async function main(ns: NS): Promise<void> {
    const serverName = ns.args[0] as string;
    const server = await ns.getServer(serverName)
    await breach(ns, server)
    await backdoor(ns, server).then(() => {
        ns.singularity.connect('home');
    })
}

/**
 * Main function body
 * @param {import(".").NS} ns
 * @param {import(".").Server} target
 */
export async function breach(ns: NS, target: Server): Promise<void> {
    const hostname = target.hostname;
    const server = ns.getServer(hostname);
    if (target.openPortCount >= ns.getServerNumPortsRequired(target.hostname)) {
        if (target.hasAdminRights) {
            ns.tprint(`${hostname} has already been breached.`);
            
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

export async function backdoor(ns: NS, server: Server) {
    const hosts = findServer(ns, server)
    for (const host of hosts) {
        ns.singularity.connect(host);
    }
    
    if (ns.singularity.getCurrentServer() == server.hostname) {
        ns.tprint(`Successfully connected to server ${server.hostname}`);
    } else {
        ns.tprint(`Failed to connect to server ${server.hostname}`);
        ns.exit()
    }
    ns.tprint(`Attempting to install backdoor on ${server.hostname}...`)
    await ns.singularity.installBackdoor().then(() => {
        ns.tprint(`Backdoor installed on server ${server.hostname}`);
    }).catch(e => {
        ns.tprint(`Failed to install backdoor on server ${server.hostname}: ${e}`);
    })
}

export function autocomplete(data: { servers: any; }, args: any) {
    return data.servers;
}
