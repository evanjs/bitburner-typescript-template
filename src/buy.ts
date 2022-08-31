import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	const player = ns.getPlayer();
	if (player.money > 200_000) {
		if (!player.tor) {
			ns.tprint("No tor router found. purchasing ...");
			if (ns.singularity.purchaseTor()) {
				ns.tprint("Tor router purchased successfully");
			} else {
				ns.tprint("Failed to purchase Tor router");
			}
		} else {
			ns.tprint("Already have tor router. Exiting...")
		}
	} else {
		ns.tprint(`Not enough money to purchase TOR router. Have: $${player.money}, Need: $200,000`)
	}
}
