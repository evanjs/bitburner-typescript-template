/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');

	const servers = GetAllServers(ns);
	const targets = servers.map(s=>s.name); // ['CSEC', 'I.I.I.I', 'avmnite-02h', 'run4theh111z', 'w0r1d_d43m0n'];
	//'millenium-fitness', 'powerhouse-fitness', 'crush-fitness', 'snap-fitness'/*, 'w0r1d_d43m0n'*/];
	//const targets = servers.map(s => s.name);

	let count = 0;

	for (const server of servers) {
		//if (servers == 'w0r1d_d43m0n') continue;

		if (!targets.includes(server.name)) {
			ns.tprint('derp 1 ' + server.name);
			continue;
		}
		//ns.tprint(server.name + ' => ' + server.route);

		let so = ns.getServer(server.name);
		if (so.requiredHackingSkill > ns.getHackingLevel()) {
			ns.tprint('derp 2');
			continue;
		}

		if (!ns.hasRootAccess(server.name)) {
			ns.tprint('derp 3');
			continue;
		}

		if (so.backdoorInstalled) {
			ns.tprint('derp 4');
			continue;
		}

		//ns.tprint('Traversing the server chain to target: ' + server.name);
		for (const node of server.route) {
			if (!ns.singularity.connect(node)) {
				ns.tprint('ERROR: Could not connect to ' + node);
			}
			else {
				//ns.tprint('INFO: Connected to ' + node);
			}
		}

		//ns.tprint('INFO: Installing backdoor on ' + server.name);
		await ns.singularity.installBackdoor();

		so = ns.getServer(server.name);
		if (so.backdoorInstalled == false) {
			ns.tprint('ERROR: Failed to install backdoor on ' + server.name);
		}
		else
			ns.tprint('SUCCESS: Installed backdoor on ' + server.name);
		count++;
	}

	ns.tprint('INFO: Done installing backdoors on ' + count + ' servers');
	ns.singularity.connect('home');
	//ns.tprint('SUCCESS: Done.');
}

export function GetAllServers(ns, root = 'home', found = new Array(), route = new Array()) {
	if (!found.find(p => p.name == root)) {
		let entry = new Object();
		entry.name = root;
		entry.route = route;
		entry.route.push(root);
		found.push(entry);
	}

	for (const server of ns.scan(root)) {
		if (!found.find(p => p.name == server)) {
			let newRoute = route.map(p => p);
			GetAllServers(ns, server, found, newRoute);
		}
	}

	return [...found];
}