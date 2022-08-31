import { NS } from '@ns';
import { hireRemainingEmployees, hireRoles } from 'tcorpse';


const cities = ['Sector-12', 'Aevum', 'New Tokyo', 'Volhaven', 'Ishima', 'Chongqing'];
/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	const corp = ns.corporation.getCorporation();


	// Purchase Tobacco division
	if (!corp.divisions.map(x => x.type.toLowerCase()).includes('tobacco')) {
		const divisionName = 'Brand X';
		ns.tprint("No Tobacco division found. Creating Tobacco division...");
		ns.corporation.expandIndustry('Tobacco', divisionName);
		ns.tprint(`Expanded into tobacco with division "${divisionName}"`);
	}
	else {
		ns.tprint(`Tobacco division already exists.`);
	}

	const division = ns.corporation.getDivision('Brand X');

	// Expand into Aevum
	const hasAevum = division.cities.includes('Aevum');
	if (!hasAevum) {
		ns.corporation.expandCity(division.name, 'Aevum');
	}
	const aevum = ns.corporation.getOffice(division.name, 'Aevum');
	if (!ns.corporation.hasWarehouse(division.name, 'Aevum')) {
		ns.corporation.purchaseWarehouse(division.name, 'Aevum');
	}
	const aevumSizeTarget = 30;
	if (aevum.size < aevumSizeTarget) {
		const required = aevumSizeTarget - aevum.size;
		ns.tprint(`Opening ${required} spots in Aevum to reach requested value of ${aevumSizeTarget}`);
		ns.corporation.upgradeOfficeSize(division.name, 'Aevum', required);
	}
	// Ensure office employs all possible employees
	hireRemainingEmployees(ns, aevum, division, 'Aevum');
	if (aevum.employeeJobs.Operations < 6) {
		hireRoles(ns, 'Operations', 6, division, 'Aevum', aevum.employeeJobs.Operations);
	}
	if (aevum.employeeJobs.Engineer < 6) {
		hireRoles(ns, 'Engineer', 6, division, 'Aevum', aevum.employeeJobs.Engineer);
	}
	if (aevum.employeeJobs.Business < 6) {
		hireRoles(ns, 'Business', 6, division, 'Aevum', aevum.employeeJobs.Business);
	}
	if (aevum.employeeJobs.Management < 6) {
		hireRoles(ns, 'Management', 6, division, 'Aevum', aevum.employeeJobs.Management);
	}
	if (aevum.employeeJobs["Research & Development"] < 6) {
		hireRoles(ns, 'Research & Development', 6, division, 'Aevum', aevum.employeeJobs["Research & Development"]);
	}
	// Hire 9 employees:
	// * Operations (2)
	// * Engineer (2)
	// * Business (1)
	// * Management (2)
	// * Research & Development (2)
	for (const city of cities.filter(x => x != 'Aevum')) {
		// Expand into city / purchase office
		if (!division.cities.includes(city)) {
			ns.tprint(`${division.name} does not have an office in ${city}. Expanding ...`);
			ns.corporation.expandCity(division.name, city);
		}
		else {
			ns.tprint(`${division.name} already has an office in ${city}. Skipping ...`);
		}
		// Purchase warehouse
		const office = ns.corporation.getOffice(division.name, city);
		if (!ns.corporation.hasWarehouse(division.name, city)) {
			ns.corporation.purchaseWarehouse(division.name, city);
		}
		const requiredSize = 9;
		const amount = requiredSize - office.size;
		if (amount <= 0) {
			ns.tprint(`The ${city} office of ${division.name} already has a capacity of ${office.size} employees.`);
		}
		else {
			ns.tprint(`Upgrading office size of ${division.name}'s ${city} office to ${requiredSize} (need ${amount} more)`);
			ns.corporation.upgradeOfficeSize(division.name, city, amount);
		}
		if (office.employees.length < office.size) {
			// Ensure office employs all possible employees
			hireRemainingEmployees(ns, office, division, city);
		}

		if (office.employeeJobs.Operations < 2) {
			hireRoles(ns, 'Operations', 2, division, city, office.employeeJobs.Operations);
		}
		if (office.employeeJobs.Engineer < 2) {
			hireRoles(ns, 'Engineer', 2, division, city, office.employeeJobs.Engineer);
		}
		if (office.employeeJobs.Business < 1) {
			hireRoles(ns, 'Business', 1, division, city, office.employeeJobs.Business);
		}
		if (office.employeeJobs.Management < 2) {
			hireRoles(ns, 'Management', 2, division, city, office.employeeJobs.Management);
		}
		if (office.employeeJobs["Research & Development"] < 2) {
			hireRoles(ns, 'Research & Development', 2, division, city, office.employeeJobs["Research & Development"]);
		}
	}
	if (division.products.length == 0) {
		const productName = "Cigars";
		const designInvest = 1_000_000_000;
		const marketingInvest = 1_000_000_000;
		ns.corporation.makeProduct(division.name, 'Aevum', productName, designInvest, marketingInvest);
		ns.tprint(`No products found for ${division.name}. Started making ${productName} in Aevum`);
	}
	ns.tprint(`Finished setting up ${division.name} (Phase 3)`);
}
