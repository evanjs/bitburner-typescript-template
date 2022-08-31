import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	const hostname = ns.args[0] as string;
	const ram = ns.args[1] as number;
	const formattedRam = ram.toLocaleString('en-US');

	const availableMoney = ns.getServerMoneyAvailable("home")
	const formattedAvailableMoney = availableMoney.toLocaleString('en-US', {style: 'currency', currency: 'USD'});

    const serverCost = ns.getPurchasedServerCost(ram);
	const formattedServerCost = serverCost.toLocaleString('en-US', {style: 'currency', currency: 'USD'});

	if (serverCost > availableMoney) {
		ns.tprint(`Not enough money (${formattedAvailableMoney}) to purchase a server with ${formattedRam} GB of RAM`);
		ns.tprint(`Required: ${formattedServerCost}`);
		ns.exit();
	} else {
		const new_hostname = ns.purchaseServer(hostname, ram);
		if (new_hostname != null) {
			ns.tprint(`Successfully initialized server ${new_hostname} with ${formattedRam} GB of RAM`);
		}
	}
}
