import {hireRemainingEmployees} from 'tcorpse';
import { NS} from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
	const corp = ns.corporation.getCorporation();
	ns.tprint(`Corporation: ${JSON.stringify(corp, null, 2)}`);


	const division = ns.corporation.getDivision('Brand X');

	// Hire x employees in each role
	for (const city of [ ns.enums.CityName.Aevum ]) {
		const office = ns.corporation.getOffice(division.name, city);
		const amount = 1;
		const requiredEmployees = (amount*5);
		ns.corporation.upgradeOfficeSize(division.name, city, requiredEmployees);
		// await ns.sleep(1);
		// Ensure office employs all possible employees
		hireRemainingEmployees(ns, office, division, city);
		ns.corporation.setAutoJobAssignment(division.name, city, 'Operations', amount);
		ns.corporation.setAutoJobAssignment(division.name, city, 'Engineer', amount);
		ns.corporation.setAutoJobAssignment(division.name, city, 'Business', amount);
		ns.corporation.setAutoJobAssignment(division.name, city, 'Management', amount);
		ns.corporation.setAutoJobAssignment(division.name, city, 'Research & Development', amount);
	}
}
