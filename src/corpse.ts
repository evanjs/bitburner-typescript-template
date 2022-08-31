import { Division, Material, NS } from "@ns";

const cities = ['Sector-12', 'Aevum', 'New Tokyo', 'Volhaven', 'Ishima', 'Chongqing'];
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
		const materialToBuy = (materialTarget - material.qty) / 10;
		ns.corporation.buyMaterial(division.name, city, material.name, materialToBuy);
		ns.tprint(`Setting purchase order for ${material.name} in ${city} to ${materialToBuy} to get ${materialTarget} in one tick`);
	}
	while (ns.corporation.getMaterial(division.name, city, material.name).qty < materialTarget) {
		ns.tprint(`${material.name} for ${division.name} in ${city} has not yet reached ${materialTarget}. Waiting ...`);
		await ns.sleep(1000);
	}
	ns.tprint(`Reached ${materialTarget} ${material.name} units in ${city} for ${division.name}. Continuing`);
	ns.corporation.buyMaterial(division.name, city, material.name, 0);
	ns.tprint(`Cleared purchase order for ${material.name} in ${city} (${division.name})`);
}
/** @param {NS} ns */
export async function main(ns: NS) {
	const corp = ns.corporation.getCorporation();
	const divisions = corp.divisions;
	ns.tprint(`Corporation: ${JSON.stringify(corp, null, 2)}`);
	// Purchase Agriculture divion
	if (divisions.length == 0) {
		ns.tprint("No divisions found. Starting agriculture division...");
		const agricultureName = 'The Farm';
		ns.corporation.expandIndustry('Agriculture', agricultureName);
		ns.tprint(`Expanded into agriculture with division "${agricultureName}"`);
	}
	else {
		ns.tprint(`Divisions: ${JSON.stringify(divisions, null, 2)}`);
	}
	const agriculture = ns.corporation.getDivision('The Farm');
	// Expand Agriculture into all cities
	if (agriculture.cities.length < 6) {
		ns.tprint(`Expanding ${agriculture.name} to all cities...`);
		for (const city of cities) {
			ns.tprint(`Trying to get office for ${agriculture.name} in ${city}`);
			const hasCity = ns.corporation.getDivision('The Farm').cities.includes(city);
			ns.tprint(`Checking if ${city} exists in ${cities}: ${hasCity}`);
			if (!hasCity) {
				ns.corporation.expandCity('The Farm', city);
				ns.tprint(`Expanded ${agriculture.name} to ${city}`);
			}
			else {
				ns.tprint(`${agriculture.name} already has an office in ${city}. Skipping...`);
			}
		}
	}
	else {
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
		ns.tprint("Purchased Smart Supply");
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
		}
		else {
			ns.tprint(`Smart supply has already been enabled for ${agriculture.name}'s warehouse in ${city}. Skipping ...`);
		}
		const office = ns.corporation.getOffice('The Farm', city);
		const employeeTarget = 3;
		const employeesToHire = employeeTarget - office.employees.length;
		ns.tprint(`Hiring ${employeesToHire} employees for ${agriculture.name}'s office in ${city} to reach ${employeeTarget} employees`);
		for (let i = 0; i < employeesToHire; i++) {
			ns.corporation.hireEmployee('The Farm', city);
		}
		if (office.employeeJobs.Operations < 1) {
			ns.tprint('Assigning 1 employee to Operations role');
			ns.corporation.setAutoJobAssignment('The Farm', city, 'Operations', 1);
		}
		if (office.employeeJobs.Engineer < 1) {
			ns.tprint('Assigning 1 employee to Engineer role');
			ns.corporation.setAutoJobAssignment('The Farm', city, 'Engineer', 1);
		}
		if (office.employeeJobs.Business < 1) {
			ns.tprint('Assigning 1 employee to Business role');
			ns.corporation.setAutoJobAssignment('The Farm', city, 'Business', 1);
		}
		ns.corporation.sellMaterial('The Farm', city, 'Food', 'MAX', 'MP');
		ns.corporation.sellMaterial('The Farm', city, 'Plants', 'MAX', 'MP');
	}
	// Buy one AdVert for agriculture division
	if (ns.corporation.getHireAdVertCount('The Farm') < 1) {
		ns.tprint(`Hiring AdVert for ${agriculture.name}`);
		ns.corporation.hireAdVert('The Farm');
	}
	else {
		ns.tprint(`1 AdVert has already been purchased for ${agriculture.name}. Skipping ...`);
	}
	// Upgrade each warehouse to 300 units
	for (const city of cities) {
		while (ns.corporation.getWarehouse(agriculture.name, city).size < 300) {
			const oldWarehouse = ns.corporation.getWarehouse(agriculture.name, city);
			ns.corporation.upgradeWarehouse(agriculture.name, city, 1);
			const newWarehouse = ns.corporation.getWarehouse(agriculture.name, city);
			ns.tprint(`Upgraded size for ${agriculture.name}'s' warehouse in ${city} from ${oldWarehouse.size} to ${newWarehouse.size}`);
			await ns.sleep(1000);
		}
		ns.tprint(`Upgraded warehouse for ${agriculture.name} in city to 300`);
	}
	// Buy 2 of each employee upgrade
	const upgradeTarget = 2;
	for (const upgrade of employeeUpgrades) {
		const upgradesToPurchase = upgradeTarget - ns.corporation.getUpgradeLevel(upgrade);
		if (upgradesToPurchase == 0) {
			ns.tprint(`${upgrade} is already level ${upgradeTarget}. Skipping ...`);
		}
		else {
			ns.tprint(`Purchasing ${upgradesToPurchase} levels of ${upgrade} to reach level ${upgradeTarget}`);
			for (let i = 0; i < upgradesToPurchase; i++) {
				ns.corporation.levelUpgrade(upgrade);
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
	ns.tprint(`Finished setting up ${agriculture.name}.`);
	ns.tprint(`Please wait until employee welfare values average around 100% before continuing.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ycHNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcnBzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDckYsTUFBTSxnQkFBZ0IsR0FBRztJQUN4QixZQUFZO0lBQ1osdUNBQXVDO0lBQ3ZDLHFCQUFxQjtJQUNyQiwyQkFBMkI7SUFDM0IsaUJBQWlCO0NBQ2pCLENBQUM7QUFFRjs7Ozs7O0dBTUc7QUFDSCxLQUFLLFVBQVUsYUFBYSxDQUFDLEVBQU0sRUFBRSxRQUFrQixFQUFFLGNBQXNCLEVBQUUsUUFBa0IsRUFBRSxJQUFZO0lBQ2hILElBQUksUUFBUSxDQUFDLEdBQUcsR0FBRyxjQUFjLEVBQUU7UUFDakMsTUFBTSxhQUFhLEdBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1RCxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzlFLEVBQUUsQ0FBQyxNQUFNLENBQUMsOEJBQThCLFFBQVEsQ0FBQyxJQUFJLE9BQU8sSUFBSSxPQUFPLGFBQWEsV0FBVyxjQUFjLGNBQWMsQ0FBQyxDQUFBO0tBQzVIO0lBQ0QsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLGNBQWMsRUFBRTtRQUMzRixFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksUUFBUSxRQUFRLENBQUMsSUFBSSxPQUFPLElBQUksd0JBQXdCLGNBQWMsZUFBZSxDQUFD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
