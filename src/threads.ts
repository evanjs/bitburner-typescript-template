import { EARLY_HACK_SCRIPT } from "/constants";
import { Server, NS } from '@ns';

/**
 * Get the number of threads available on the specified server
 * @param {import(".").NS} ns
 * @param {import(".").Server} serv
 */
export async function getThreads(ns: NS, serv: string | Server): Promise<number> {
    let finalRam: number;
    if (typeof (serv) == 'string') {
        const availableRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
        finalRam = availableRam / ns.getScriptRam(EARLY_HACK_SCRIPT, serv);
    }
    else {
        const availableRam = serv.maxRam - serv.ramUsed;
        finalRam = availableRam / ns.getScriptRam(EARLY_HACK_SCRIPT, serv.hostname);
    }
    return finalRam;
}

export async function getThreadsSplit(ns: NS, serv: Server | string, type: string): Promise<number> {
    let script = "";
    let finalRam = 0;
    switch (type) {
        case 'hack':
        script = 'hack.js';
        break;
        case 'grow':
        script = 'grow.js';
        break;
        case 'weaken':
        script = 'weaken.js';
        break;
        default:
        ns.tprint("Invalid script type specified");
        return -1;
    }

    if (typeof (serv) == 'string') {
        const availableRam = ns.getServerMaxRam(serv) - ns.getServerUsedRam(serv);
        finalRam = availableRam / ns.getScriptRam(script, serv);
    }
    else {
        const availableRam = serv.maxRam - serv.ramUsed;
        finalRam = availableRam / ns.getScriptRam(script, serv.hostname);
    }
    return finalRam;
}

/**
 * @param {import(".").NS} ns
 * @param {import(".").Server} home
 * @param {string} type
 */
export async function getHomeThreadsSplit(ns: NS, home: Server, type: string): Promise<number> {
    // let finalRam = 0;
    let script = "";
    switch (type) {
        case 'hack':
        script = 'hack.js';
        break;
        case 'grow':
        script = 'grow.js';
        break;
        case 'weaken':
        script = 'weaken.js';
        break;
        default:
        ns.tprint("Invalid script type specified");
        return -1;
    }
    home = home != null ? home : ns.getServer('home');
    const scriptRam = ns.getScriptRam(script, home.hostname);
    const schedulerRam = ns.getScriptRam('auto-startup-hacks2.js', home.hostname);
    const finalRam = home.maxRam - home.ramUsed - schedulerRam;
    const scriptThreads = (finalRam / scriptRam);
    const finalThreads = scriptThreads - 2;
    return Math.max(finalThreads, 2);
}

/**
 * Get the number of threads available on the home server (minus a few threads for core services)
 * @param {import(".").NS} ns
 * @param {import(".").Server} home
 */
export async function getHomeThreads(ns: NS, home: Server): Promise<number> {
    home = home != null ? home : ns.getServer('home');
    const scriptRam = ns.getScriptRam(EARLY_HACK_SCRIPT, home.hostname);
    const schedulerRam = ns.getScriptRam('auto-startup-hacks.js', home.hostname);
    const finalRam = home.maxRam - home.ramUsed - schedulerRam;
    const scriptThreads = (finalRam / scriptRam);
    const finalThreads = scriptThreads - 2;
    return Math.max(finalThreads, 2);
}
