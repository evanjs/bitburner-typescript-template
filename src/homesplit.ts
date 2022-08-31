import { getHomeThreadsSplit } from 'threads';
import { NS } from '@ns';

/** @param {import (".").NS} ns */
export async function main(ns: NS): Promise<void> {
	const server = ns.getServer('home');
	const targetServer = ns.args[0];
	
	const hthreads = await getHomeThreadsSplit(ns, server, 'hack');
	ns.tprint(`Split threads (hack): ${hthreads}`);

	const gthreads = await getHomeThreadsSplit(ns, server, 'grow');
	ns.tprint(`Split threads (grow): ${gthreads}`);

	const wthreads = await getHomeThreadsSplit(ns, server, 'weaken');
	ns.tprint(`Split threads (weaken): ${wthreads}`);

	const hackRatio = 2/10;
	const hackThreads = Math.floor(hthreads * hackRatio);

	const growRatio = 6/10;
	const growThreads = Math.floor(gthreads * growRatio);

	const weakenRatio = 2/10;
	const weakenThreads = Math.floor(wthreads * weakenRatio);

	if (ns.isRunning('hack.js')) {
		ns.kill('hack.js', 'home');
	}
	if (ns.isRunning('grow.js')) {
		ns.kill('grow.js', 'home')
	}

	if (ns.isRunning('weaken.js')) {
		ns.kill('weaken.js', 'home')
	}
	
	if (hackThreads == 0 || growThreads == 0 || weakenThreads == 0) {
		ns.tprint(`Grow, weaken, or hack threads for home were 0. Skipping server.`)
		return;
	}

	ns.run('hack.js', hackThreads, targetServer);
	await ns.sleep(1250);
	ns.run('grow.js', growThreads, targetServer);
	await ns.sleep(666);
	ns.run('weaken.js', weakenThreads, targetServer);
}
