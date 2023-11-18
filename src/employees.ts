import {NS} from "@ns";

function cities(ns: NS) {
    return Object.values([ns.enums.CityName.Sector12]);
}


/** @param {import(".").NS} ns */
export async function main(ns: NS): Promise<void> {
for (const city of cities(ns)) {
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
