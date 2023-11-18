import {hireRemainingEmployees, hireRoles} from 'tcorpse';
import { NS } from '@ns';

const cities = ['Sector-12', 'Aevum', 'New Tokyo', 'Volhaven', 'Ishima', 'Chongqing']

/** @param {NS} ns */
export async function main(ns: NS) {
	const corp = ns.corporation.getCorporation();
	ns.tprint(`Corporation: ${JSON.stringify(corp, null, 2)}`);


	const division = ns.corporation.getDivision('Brand X');

	// Hire x employees in each role
	for (const city of ['Aevum']) {
		const office = ns.corporation.getOffice(division.name, city);
		const amount = 1;
		const requiredEmployees = (amount*5);
		ns.corporation.upgradeOfficeSize(division.name, city, requiredEmployees);
		// await ns.sleep(1);
		// Ensure office employs all possible employees
		hireRemainingEmployees(ns, office, division, city);
		hireRoles(ns, 'Operations', amount, division, city, office.employeeJobs.Operations);
		hireRoles(ns, 'Engineer', amount, division, city, office.employeeJobs.Engineer);
		hireRoles(ns, 'Business', amount, division, city, office.employeeJobs.Business);
		hireRoles(ns, 'Management', amount, division, city, office.employeeJobs.Management);
		hireRoles(ns, 'Research & Development', amount, division, city, office.employeeJobs["Research & Development"]);
	}
}
