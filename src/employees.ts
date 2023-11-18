import { NS } from "@ns";

// const cities = [ 'Aevum', 'Neo Tokyo', 'Volhaven', 'Ishima', 'Chongqing' ]
const cities = [ "Sector-12" ];


/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
for (const city of cities) {
		const warehouse = ns.corporation.getWarehouse('The Farm', city);
		if (!warehouse.smartSupplyEnabled) {
			ns.tprint(`Enabling smart supply for The Farm's warehouse in ${city}`);
		}
		

		const office = ns.corporation.getOffice('The Farm', city);
		const randd = office.employeeJobs["Research & Development"];
		ns.tprint(JSON.stringify(office, null, 2));
		ns.tprint(`R and D lol: ${randd}`);
		
	}
}
