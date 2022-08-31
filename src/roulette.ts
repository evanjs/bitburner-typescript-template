import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	Math.floor = (_number) => {
		return 1;
	};

	Math.random = () => {
		return 0;
	}
}
