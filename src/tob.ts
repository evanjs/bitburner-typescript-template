import { Division, Material, NS, Office } from '@ns';

const cities = ['Sector-12', 'Aevum', 'New Tokyo', 'Volhaven', 'Ishima', 'Chongqing']
const employeeUpgrades = [
	'FocusWires',
	'Nuoptimal Nootropic Injector Implants',
	'Neural Accelerators',
	'Speech Processor Implants',
	'Smart Factories'
];

const warehouseUpgrades = [
	'Smart Factories',
	'Smart Storage'
]

/**
 * @param {NS} ns
 * @param {Array.<String>} upgrades
 * @param {number} upgradeTarget
 */
function getUpgrades(ns: NS, upgrades: Array<string>, upgradeTarget: number) {
	for (const upgrade of upgrades) {
		const upgradesToPurchase = upgradeTarget - ns.corporation.getUpgradeLevel(upgrade);
		if (upgradesToPurchase == 0) {
			ns.tprint(`${upgrade} is already level ${upgradeTarget}. Skipping ...`);
		} else {
			ns.tprint(`Purchasing ${upgradesToPurchase} levels of ${upgrade} to reach level ${upgradeTarget}`);
			for (let i = 0; i < upgradesToPurchase; i++) {
				ns.corporation.levelUpgrade(upgrade)
			}
			ns.tprint(`${upgrade} has been upgraded to level ${upgradeTarget}`);
		}
	}
}

/**
 * @param {NS} ns
 * @param {number} employeeJobs
 * @param {String} role
 * @param roleTarget
 * @param city
 * @param {String} division
 */
function hireRoles(ns: NS, role: string, roleTarget: number, division: string, city: string, employeeJobs: number) {
	if (employeeJobs < roleTarget) {
		ns.tprint(`${division}'s ${city} office has less than the desired ${roleTarget} employees in the ${role} position`);
		ns.tprint(`Assigning ${roleTarget} employee(s) to ${role} role for ${division}'s office in ${city}`);
		ns.corporation.setAutoJobAssignment(division, city, role, roleTarget);
	}
}

/**
 * @param {NS} ns
 * @param {Office} office
 * * @param {String} division
 * * @param {String} city
 */
function hireRemainingEmployees(ns: NS, office: Office, division: string, city: string) {
	if (office.employees.length < office.size) {
		const remainingEmployees = office.size - office.employees.length;
		for (let i = 0; i < remainingEmployees; i++) {
			ns.corporation.hireEmployee(division, city);
		}
	} else {
		ns.tprint(`${division}'s office in ${city} already has ${office.employees.length}, which is greater than the required value of ${office.size}`);
	}
}

/**
 * @param {NS} ns
 * @param {String} target
 * @param {Division} division
 */
async function upgradeWarehouses(ns: NS, target: number, division: Division) {
	// Upgrade each warehouse to <target> units
	for (const city of cities) {
		let warehouse = ns.corporation.getWarehouse(division.name, city);
		if (warehouse.size < target) {
			while (warehouse.size < target) {
				warehouse = ns.corporation.getWarehouse(division.name, city);
				if (warehouse.size < target) {
					ns.tprint(`Warehouse size (${warehouse.size}) is less than target (${target})`)
					ns.corporation.upgradeWarehouse(division.name, city, 1);

					const newWarehouse = ns.corporation.getWarehouse(division.name, city);
					ns.tprint(`Upgraded size for ${division.name}'s' warehouse in ${city} from ${warehouse.size} to ${newWarehouse.size}`);
					await ns.sleep(100)
				} else {
					ns.tprint(`${division.name}'s warehouse in ${city} already has a size of ${target}. Continuing...`);
				}
			}
		}
	}
	ns.tprint(`Upgraded ${division.name}'s warehouse in all cities to ${target}`);
}


/**
 * @param {NS} ns
 * @param {Material} material
 * @param materialTarget
 * @param {Division} division
 * @param {String} city
 */
async function buySomeThings(ns: NS, material: Material, materialTarget: number, division: Division, city: string) {
	if (material.qty < materialTarget) {
		const materialToBuy = (materialTarget - material.qty) / 10;
		ns.corporation.buyMaterial(division.name, city, material.name, materialToBuy);
		ns.tprint(`Setting purchase order for ${material.name} in ${city} to ${materialToBuy} to get ${materialTarget} in one tick`)
	} else {
		return;
	}
	while (ns.corporation.getMaterial(division.name, city, material.name).qty < materialTarget) {
		ns.tprint(`${material.name} for ${division.name} in ${city} has not yet reached ${materialTarget}. Waiting ...`)
		await ns.sleep(1000)
	}

	ns.tprint(`Reached ${materialTarget} ${material.name} units in ${city} for ${division.name}. Continuing`)
	ns.corporation.buyMaterial(division.name, city, material.name, 0);
	ns.tprint(`Cleared purchase order for ${material.name} in ${city} (${division.name})`)
}

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	const corp = ns.corporation.getCorporation();

	// Purchase Tobacco divion
	if (!('Tobacco' in corp.divisions)) {
		ns.tprint("No Tobacco division found. Creating Tobacco division...");
		const divisionName = 'Brand X';
		ns.corporation.expandIndustry('Tobacco', divisionName)
		ns.tprint(`Expanded into tobacco with division "${divisionName}"`);
	} else {
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
	hireRemainingEmployees(ns, aevum, division.name, 'Aevum');

	if (aevum.employeeJobs.Operations < 6) {
		hireRoles(ns, 'Operations', 6, division.name, 'Aevum', aevum.employeeJobs.Operations);
	}
	if (aevum.employeeJobs.Engineer < 6) {
		hireRoles(ns, 'Engineer', 6, division.name, 'Aevum', aevum.employeeJobs.Engineer);
	}
	if (aevum.employeeJobs.Business < 6) {
		hireRoles(ns, 'Business', 6, division.name, 'Aevum', aevum.employeeJobs.Business);
	}
	if (aevum.employeeJobs.Management < 6) {
		hireRoles(ns, 'Management', 6, division.name, 'Aevum', aevum.employeeJobs.Management);
	}
	if (aevum.employeeJobs["Research & Development"] < 6) {
		hireRoles(ns, 'Research & Development', 6, division.name, 'Aevum', aevum.employeeJobs["Research & Development"]);
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
		} else {
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
		} else {
			ns.tprint(`Upgrading office size of ${division.name}'s ${city} office to ${requiredSize} (need ${amount} more)`);
			ns.corporation.upgradeOfficeSize(division.name, city, amount);
		}

		// Ensure office employs all possible employees
		hireRemainingEmployees(ns, office, division.name, city);

		if (office.employeeJobs.Operations < 2) {
			hireRoles(ns, 'Operations', 2, division.name, city, office.employeeJobs.Operations);
		}
		if (office.employeeJobs.Engineer < 2) {
			hireRoles(ns, 'Engineer', 2, division.name, city, office.employeeJobs.Engineer);
		}
		if (office.employeeJobs.Business < 1) {
			hireRoles(ns, 'Business', 1, division.name, city, office.employeeJobs.Business);
		}
		if (office.employeeJobs.Management < 2) {
			hireRoles(ns, 'Management', 2, division.name, city, office.employeeJobs.Management);
		}
		if (office.employeeJobs["Research & Development"] < 2) {
			hireRoles(ns, 'Research & Development', 2, division.name, city, office.employeeJobs["Research & Development"]);
		}
	}

	if (division.products.length == 0) {
		const productName = "Cigars";
		const designInvest = 1_000_000_000;
		const marketingInvest = 1_000_000_000;
		ns.corporation.makeProduct(division.name, 'Aevum', productName, designInvest, marketingInvest);
		ns.tprint(`No products found for ${division.name}. Started making ${productName} in Aevum`);
	}

	ns.tprint(`Finsihed setting up ${division.name} (Phase 3)`)
}
