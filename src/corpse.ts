import { Division, Material, NS } from '@ns';

const cities = ['Sector-12', 'Aevum', 'New Tokyo', 'Volhaven', 'Ishima', 'Chongqing']
const employeeUpgrades = [
	'FocusWires',
	'Nuoptimal Nootropic Injector Implants',
	'Neural Accelerators',
	'Speech Processor Implants',
	'Smart Factories'
];

/**
 * @param {NS} ns
 * @param {Material} material
 * @param materialTarget
 * @param {Division} division
 * @param {String} city
 */
async function buySomeThings(ns: NS, material: Material, materialTarget: number, division: Division, city: string) {
	if (material.qty < materialTarget) {
			const materialToBuy =  (materialTarget - material.qty) / 10;
			ns.corporation.buyMaterial(division.name, city, material.name, materialToBuy);
			ns.tprint(`Setting purchase order for ${material.name} in ${city} to ${materialToBuy} to get ${materialTarget} in one tick`)
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
	const divisions = corp.divisions;
	ns.tprint(`Corporation: ${JSON.stringify(corp, null, 2)}`);

	// Purchase Agriculture divion
	if (divisions.length == 0) {
		ns.tprint("No divisions found. Starting agriculture division...");
		const agricultureName = 'The Farm';
		ns.corporation.expandIndustry('The Farm', agricultureName);
		ns.tprint(`Expanded into agriculture with division "${agricultureName}"`);
	} else {
		ns.tprint(`Divisions: ${JSON.stringify(divisions, null, 2)}`);
	}

	const agriculture = ns.corporation.getDivision('The Farm');

	// Expand Agriculture into all cities
	if (agriculture.cities.length < 6) {
		ns.tprint(`Expanding ${agriculture.name} to all cities...`)
		for (const city of cities) {
			ns.tprint(`Trying to get office for ${agriculture.name} in ${city}`);
			const hasCity = ns.corporation.getDivision('The Farm').cities.includes(city);
			ns.tprint(`Checking if ${city} exists in ${cities}: ${hasCity}`);
			if (!hasCity) {
				ns.corporation.expandCity('The Farm', city);
				ns.tprint(`Expanded ${agriculture.name} to ${city}`);
			} else {
				ns.tprint(`${agriculture.name} already has an office in ${city}. Skipping...`);
			}
		}
	} else {
		ns.tprint(`${agriculture.name} already has offices in all cities`);
	}

	// Buy warehouse for each city
	for (const city of cities) {
		if (!ns.corporation.hasWarehouse('The Farm', city)) {
			ns.corporation.purchaseWarehouse('The Farm', city);
			ns.tprint(`Purchased a warehouse for ${agriculture.name} in ${city}`);
		}
	}

	// Buy Smart Supply
	if (!ns.corporation.hasUnlockUpgrade('Smart Supply')) {
		ns.corporation.unlockUpgrade('Smart Supply');
		ns.tprint("Purchased Smart Supply")
	}

	// Enable Smart Supply for each warehouse in the Agriculture division
	// Sell Food/Plants at MAX/MP
	// Hire 3 employees:
	// * Operations (1)
	// * Engineer (1)
	// * Business (1)
	for (const city of cities) {
		const warehouse = ns.corporation.getWarehouse('The Farm', city);
		if (!warehouse.smartSupplyEnabled) {
			ns.corporation.setSmartSupply(agriculture.name, city, true);
			ns.tprint(`Smart supply has been enabled for ${agriculture.name}'s warehouse in ${city}`);
		} else {
			ns.tprint(`Smart supply has already been enabled for ${agriculture.name}'s warehouse in ${city}. Skipping ...`);
		}

		const office = ns.corporation.getOffice('The Farm', city);
		const employeeTarget = 3
		const employeesToHire = employeeTarget - office.employees.length;
		ns.tprint(`Hiring ${employeesToHire} employees for ${agriculture.name}'s office in ${city} to reach ${employeeTarget} employees`);
		for (let i = 0; i < employeesToHire; i++) {
			ns.corporation.hireEmployee('The Farm', city);
		}

		if (office.employeeJobs.Operations < 1) {
			ns.tprint('Assigning 1 employee to Operations role');
			ns.corporation.setAutoJobAssignment('The Farm', city, 'Operations', 1)
		}

		if (office.employeeJobs.Engineer < 1) {
			ns.tprint('Assigning 1 employee to Engineer role');
			ns.corporation.setAutoJobAssignment('The Farm', city, 'Engineer', 1)
		}

		if (office.employeeJobs.Business < 1) {
			ns.tprint('Assigning 1 employee to Business role');
			ns.corporation.setAutoJobAssignment('The Farm', city, 'Business', 1)
		}

		ns.corporation.sellMaterial('The Farm', city, 'Food', 'MAX', 'MP')
		ns.corporation.sellMaterial('The Farm', city, 'Plants', 'MAX', 'MP')
	}

	// Buy one AdVert for agriculture division
	if (ns.corporation.getHireAdVertCount('The Farm') < 1) {
		ns.tprint(`Hiring AdVert for ${agriculture.name}`);
		ns.corporation.hireAdVert('The Farm');
	} else {
		ns.tprint(`1 AdVert has already been purchased for ${agriculture.name}. Skipping ...`);
	}

	// Upgrade each warehouse to 300 units
	for (const city of cities) {
		while (ns.corporation.getWarehouse(agriculture.name, city).size < 300) {
			const oldWarehouse = ns.corporation.getWarehouse(agriculture.name, city);
			ns.corporation.upgradeWarehouse(agriculture.name, city, 1);
			const newWarehouse = ns.corporation.getWarehouse(agriculture.name, city);
			ns.tprint(`Upgraded size for ${agriculture.name}'s' warehouse in ${city} from ${oldWarehouse.size} to ${newWarehouse.size}`);
			await ns.sleep(1000)
		}
		ns.tprint(`Upgraded warehouse for ${agriculture.name} in city to 300`);
	}

	// Buy 2 of each employee upgrade
	const upgradeTarget = 2
	for (const upgrade of employeeUpgrades) {
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

	// Buy materials
	// 125 Hardware
	// 75 AI Cores

	for (const city of cities) {
		const hardware = ns.corporation.getMaterial('The Farm', city, 'Hardware');
		const hardwareTarget = 125; // 12.5 * 10 = 125

		const aiCores = ns.corporation.getMaterial('The Farm', city, 'AI Cores');
		const aiCoresTarget = 75; // 7.5 * 10 = 75

		const realEstate = ns.corporation.getMaterial('The Farm', city, 'Real Estate');
		const realEstateTarget = 27000; // 2,700 * 10 = 27,000


		// if (hardware.qty < hardwareTarget) {
		// 	const hardwareToBuy = (hardwareTarget - hardware.qty) / 10;
		// 	ns.corporation.buyMaterial('The Farm', city, 'Hardware', hardwareToBuy);
		// 	ns.tprint(`Setting purchase order for Hardware in ${city} to ${hardwareToBuy} to get ${hardwareTarget} in one tick`)
		// }
		// while (ns.corporation.getMaterial('The Farm', city, 'Hardware').qty < hardwareTarget) {
		// 	ns.tprint(`Hardware for ${agriculture.name} in ${city} has not yet reached ${hardwareTarget}. Waiting ...`)
		// 	await ns.sleep(1000)
		// }

		// ns.tprint(`Reached ${hardwareTarget} hardware units in ${city} for ${agriculture.name}. Clearing buy order`);
		// ns.corporation.buyMaterial('The Farm', city, 'Hardware', 0);
		// ns.tprint(`Cleared purchase order for Hardware in ${city} (${agriculture.name})`)

		// if (aiCores.qty < aiCoresTarget) {
		// 	const aiCoresToBuy =  (aiCoresTarget - aiCores.qty) / 10;
		// 	ns.corporation.buyMaterial('The Farm', city, 'AI Cores', aiCoresToBuy);
		// 	ns.tprint(`Setting purchase order for AI Cores in ${city} to ${aiCoresToBuy} to get ${aiCoresToBuy} in one tick`)
		// }
		// while (ns.corporation.getMaterial('The Farm', city, 'AI Cores').qty < aiCoresTarget) {
		// 	ns.tprint(`AI Cores for ${agriculture.name} in ${city} has not yet reached ${aiCoresTarget*10}. Waiting ...`)
		// 	await ns.sleep(1000)
		// }

		await buySomeThings(ns, hardware, hardwareTarget, agriculture, city);
		await buySomeThings(ns, aiCores, aiCoresTarget, agriculture, city);
		await buySomeThings(ns, realEstate, realEstateTarget, agriculture, city);
	}

	ns.tprint(`Finished setting up ${agriculture.name}.`)
	ns.tprint(`Please wait until employee welfare values average around 100% before continuing.`);
}
