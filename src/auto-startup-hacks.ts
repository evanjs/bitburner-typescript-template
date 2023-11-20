import { searchServers } from "scan";
import { getThreads, getHomeThreads } from "threads";
import { getBestServerToHack } from "servers";
import { NS, Server } from "@ns";
import { EARLY_HACK_SCRIPT } from "./constants";

let targetServer: Server;

let servers = [];

let hasFormulas = false;

let availablePortHacks = 0;

/** Check if the given server is hacking a specific target
 * @param {import(".").NS} ns
 * @param {import(".").Server} server
 */
async function isHackingTarget(ns: NS, server: Server | string) {
  if (typeof server == "string") {
    ns.print(`Checking if ${server} is hacking ${targetServer.hostname}`);
    return ns.isRunning(EARLY_HACK_SCRIPT, server, targetServer.hostname);
  } else {
    ns.print(
      `Checking if ${server.hostname} is hacking ${targetServer.hostname}`
    );
    return ns.isRunning(EARLY_HACK_SCRIPT, server.hostname, targetServer.hostname);
  }
}

let targetOverride = "";

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
    ns.fileExists("SQLInject.exe"),
  ].filter(x => x).length;

  hasFormulas = ns.fileExists("Formulas.exe");
  ns.tprint(`Player has formulas.exe unlocked: ${hasFormulas}`);

  if (ns.args.length > 0) {
    targetOverride = ns.args[0] as string;
  }
  const home = ns.getServer("home");

  // populate the server map with entries of name/required hacking level
  servers = await searchServers(ns);

  const myServers = ns.getPurchasedServers();
  
  const allServers = servers.filter(
    (server) =>
      server.maxRam > 0 &&
      !myServers.includes(server.hostname) &&
      !server.hostname.startsWith("share")
  );

//   await printServerPorts(ns, allServers);

  // get the best server we can hack at our current level
  if (targetOverride.length == 0) {
    const tryTargetServer = await getBestServerToHack(ns, allServers);
    if (tryTargetServer == null) {
      ns.tprint(
        "Could not determine best server to hack.\nFalling back to n00dles"
      );
      targetServer = ns.getServer("n00dles");
    } else {
      targetServer = tryTargetServer;
    }
    ns.tprint(
      `Best server to hack is ${targetServer.hostname} (${targetServer.requiredHackingSkill})`
    );
  } else {
    ns.tprint(`Using hacking target override of ${targetOverride}`);
    targetServer = ns.getServer(targetOverride);
  }

  const isHomeHackingTarget = await isHackingTarget(ns, home);
  const homeMessage = isHomeHackingTarget ? "hacking" : "not hacking";
  ns.print(`Home is ${homeMessage} target`);
  if (!isHomeHackingTarget) {
    ns.scriptKill(EARLY_HACK_SCRIPT, "home");
    const threads = await getHomeThreads(ns, home);
    const floored = Math.floor(threads);
    ns.tprint(`Trying to run hack script on home with ${floored} threads`);
    ns.tprint(`Home has ${floored} available threads`);
    ns.run(EARLY_HACK_SCRIPT, floored, targetServer.hostname);
  }

  // ns.tprint(`My servers: ${JSON.stringify(myServers, null, 2)}`)
  if (myServers.length > 0) {
    const myServersToUse = myServers.filter((x) => x.includes("pigeon-"));
    await hackMyServers(ns, myServersToUse);
  }

  await hackServers(ns, allServers);
}

async function getFlooredThreads(ns: NS, server: string) {
  const threads = await getThreads(ns, server);
  return Math.floor(threads);
}

/**
 * Hack servers
 * @param {import (".").NS} ns
 * @param {Array.<String>} servers
 */
async function hackMyServers(ns: NS, servers: string[]) {
  for (const server of servers) {
    if (!ns.fileExists(EARLY_HACK_SCRIPT, server)) {
      ns.scp(EARLY_HACK_SCRIPT, server);
    }
    const isHackingTargetServer = await isHackingTarget(ns, server);
    if (!isHackingTargetServer) {
        ns.tprint(`${server} is not currently hacking ${targetServer.hostname}`);
      let threads = await getFlooredThreads(ns, server);
      if (threads < 1) {
        ns.tprint(
          `${server} does not have enough threads to hack ${targetServer.hostname}. Killing all running programs...`
        );
        ns.scriptKill(EARLY_HACK_SCRIPT, server);

        threads = await getFlooredThreads(ns, server);
        ns.tprint(`Threads after killing all programs: ${threads}`);
      }
      ns.tprint(
        `Attempting to hack ${targetServer.hostname} using ${server} with ${threads} threads`
      );
      ns.tprint(
        `Running ${EARLY_HACK_SCRIPT} on ${server} with ${threads} threads targeting ${targetServer.hostname}`
      );
      ns.exec(EARLY_HACK_SCRIPT, server, threads, targetServer.hostname);
    } else {
          // ns.tprint(`${server} is already hacking ${targetServer.hostname}. Skipping...`)
    }
  }
}

/**
 * Hack servers
 * @param {import (".").NS} ns
 * @param {Array.<import(".").Server>} servers
 */
async function hackServers(ns: NS, servers: Server[]) {
  for (const server of servers) {
    // ns.tprint('------------------------------------')
    // ns.tprint(`---------BEGIN ${server.hostname}---------`)
    const requiredPorts = ns.getServerNumPortsRequired(server.hostname);
    if (availablePortHacks >= (server.numOpenPortsRequired ?? 999)) {
      if (!server.hasAdminRights) {
        ns.tprint(
          `Player does not have admin access to ${server.hostname}. Attempting to breach...`
        );
        await breach(ns, server);
      } else {
        // ns.tprint(`Player has admin access to ${server.hostname}.`)
      }

      // ns.tprint(`Available port hacks for ${server.hostname}: ${availablePortHacks}. Required hacks to run scripts ${requiredPorts}`)
      await ns.scp(EARLY_HACK_SCRIPT, server.hostname);

      const isHackingTargetServer = await isHackingTarget(ns, server);
      if (!isHackingTargetServer) {
        let threads = await getFlooredThreads(ns, server.hostname);
        if (threads < 1) {
          ns.tprint(
            `${server.hostname} does not have enough threads to hack ${targetServer.hostname}. Killing all running programs...`
          );
          ns.killall(server.hostname, true);
          threads = await getFlooredThreads(ns, server.hostname);
          ns.tprint(`Threads after killing all programs: ${threads}`);
        }
        ns.tprint(
          `Attempting to hack ${targetServer.hostname} using ${server.hostname} with ${threads} threads`
        );
        const result = ns.exec(
          EARLY_HACK_SCRIPT,
          server.hostname,
          threads,
          targetServer.hostname
        );
        if (result > 0) {
          ns.tprint(
            `${server.hostname} is now hacking ${targetServer.hostname}`
          );
        } else {
          ns.tprint(
            `Failed to start hacking ${targetServer.hostname} using ${server.hostname}`
          );
        }
      } else {
        // ns.tprint(`${server.hostname} is already hacking ${targetServer.hostname}. Skipping...`)
      }
    } else {
      ns.print(
        `Do not have enough hacks (${availablePortHacks}) to run scripts on ${server.hostname} (Need: ${requiredPorts}). Skipping ...`
      );
    }
    // ns.tprint(`---------END ${server.hostname}---------`)
    // ns.tprint('------------------------------------')
  }
}

/**
 *
 * @param {import (".").NS} ns
 * @param {import(".").Server} target
 */
async function breach(ns: NS, target: Server) {
  const hostname = target.hostname;
  if ((target.openPortCount ?? 0) >= ns.getServerNumPortsRequired(target.hostname)) {
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

async function printServerPorts(ns: NS, servers: Server[]): Promise<void> {
    for (let i = 0; i <= 5; i++) {
        const serversWithIPorts = servers
          .filter((server) => ns.getServerNumPortsRequired(server.hostname) === i)
          .map(
            (s) =>
              ` ${s.hostname}: ${s.maxRam} GB -- (${s.requiredHackingSkill} hacking)`
          );
        ns.tprint(`Servers with ${i} ports: ${serversWithIPorts}`);
      }
}
