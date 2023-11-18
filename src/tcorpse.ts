import {CityName, Division, Material, NS, Office} from '@ns';

function cities(ns: NS) {
    return Object.values(ns.enums.CityName);
}

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
];

/**
 * @param {NS} ns
 * @param {Array.<String>} upgrades
 * @param {number} upgradeTarget
 */
function getUpgrades(ns: NS, upgrades: string[], upgradeTarget: number) {
    for (const upgrade of upgrades) {
        const upgradesToPurchase = upgradeTarget - ns.corporation.getUpgradeLevel(upgrade);
        if (upgradesToPurchase == 0) {
            ns.tprint(`${upgrade} is already level ${upgradeTarget}. Skipping ...`);
        } else {
            ns.tprint(`Purchasing ${upgradesToPurchase} levels of ${upgrade} to reach level ${upgradeTarget}`);
            for (let i = 0; i < upgradesToPurchase; i++) {
                ns.corporation.levelUpgrade(upgrade);
            }
            ns.tprint(`${upgrade} has been upgraded to level ${upgradeTarget}`);
        }
    }
}

/**
 * @param {NS} ns
 * @param {Office} office
 * * @param {Division} division
 * * @param {String} city
 */
export function hireRemainingEmployees(ns: NS, office: Office, division: Division, city: CityName) {
    if (office.numEmployees < office.size) {
        const remainingEmployees = office.size - office.numEmployees;
        ns.tprint(`We have ${office.numEmployees} employees and need ${remainingEmployees} more`);
        for (let i = 0; i < remainingEmployees; i++) {
            ns.corporation.hireEmployee(division.name, city);
        }
    }
}

/**
 * @param {NS} ns
 * @param {String} target
 * @param {Division} division
 */
async function upgradeWarehouses(ns: NS, target: number, division: Division) {
    // Upgrade each warehouse to <target> units
    for (const city of cities(ns)) {
        let warehouse = ns.corporation.getWarehouse(division.name, city);
        if (warehouse.size < target) {
            while (warehouse.size < target) {
                warehouse = ns.corporation.getWarehouse(division.name, city);
                if (warehouse.size < target) {
                    ns.tprint(`Warehouse size (${warehouse.size}) is less than target (${target})`);
                    ns.corporation.upgradeWarehouse(division.name, city, 1);
                    const newWarehouse = ns.corporation.getWarehouse(division.name, city);
                    ns.tprint(`Upgraded size for ${division.name}'s' warehouse in ${city} from ${warehouse.size} to ${newWarehouse.size}`);
                    await ns.sleep(100);
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
export async function buySomeThings(ns: NS, material: Material, materialTarget: number, division: Division, city: CityName) {
    if (material.stored < materialTarget) {
        const materialToBuy = (materialTarget - material.stored) / 10;
        ns.corporation.buyMaterial(division.name, city, material.name, materialToBuy);
        ns.tprint(`Setting purchase order for ${material.name} in ${city} to ${materialToBuy} to get ${materialTarget} in one tick`);
    } else {
        return;
    }
    while (ns.corporation.getMaterial(division.name, city, material.name).stored < materialTarget) {
        ns.tprint(`${material.name} for ${division.name} in ${city} has not yet reached ${materialTarget}. Waiting ...`);
        await ns.sleep(1000);
    }
    ns.tprint(`Reached ${materialTarget} ${material.name} units in ${city} for ${division.name}. Continuing`);
    ns.corporation.buyMaterial(division.name, city, material.name, 0);
    ns.tprint(`Cleared purchase order for ${material.name} in ${city} (${division.name})`);
}

/**
 * @param {NS} ns
 */
export async function main(ns: NS): Promise<void> {
    const corp = ns.corporation.getCorporation();
    ns.tprint(`Corporation: ${JSON.stringify(corp, null, 2)}`);
    const division = ns.corporation.getDivision('The Farm');

    // Hire 9 employees:
    // * Operations (2)
    // * Engineer (2)
    // * Business (1)
    // * Management (2)
    // * Research & Development (2)
    for (const city of cities(ns)) {
        const office = ns.corporation.getOffice(division.name, city);
        const requiredSize = 9;
        const amount = requiredSize - office.size;
        if (amount <= 0) {
            ns.tprint(`The ${city} office of ${division.name} already has a capacity of ${office.size} employees.`);
        } else {
            ns.tprint(`Upgrading office size of ${division.name}'s ${city} office to ${requiredSize} (need ${amount} more)`);
            ns.corporation.upgradeOfficeSize(division.name, city, amount);
        }

        if (office.numEmployees < office.size) {
            hireRemainingEmployees(ns, office, division, city);
        }

        ns.corporation.setAutoJobAssignment(division.name, city, 'Operations', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Engineer', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Business', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Management', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Research & Development', 2);
    }

    // Upgrade Smart Factory and Smart Storage to 10
    getUpgrades(ns, warehouseUpgrades, 10);

    // upgrade warehouses in each city to 2,000
    await upgradeWarehouses(ns, 2_000, division);

    // Buy materials
    // Hardware: 267.5 for 1 tick: 125 + 2,675 = 2,800
    const hardwareTarget = 2_800;
    // Robots: 9.6/s for 1 tick: 96
    const robotsTarget = 96;
    // AI Cores: 244.5/s for 1 tick: 75 + 2,445 = 2,520
    const aiCoresTarget = 2_520;
    // Real Estate: 11,940/s for 1 tick: 27,000 + 119,400 = 146,400
    const realEstateTarget = 146_400;
    for (const city of cities(ns)) {
        const hardware = ns.corporation.getMaterial(division.name, city, 'Hardware');
        const robots = ns.corporation.getMaterial(division.name, city, 'Robots');
        const aiCores = ns.corporation.getMaterial(division.name, city, 'AI Cores');
        const realEstate = ns.corporation.getMaterial(division.name, city, 'Real Estate');
        await buySomeThings(ns, hardware, hardwareTarget, division, city);
        await buySomeThings(ns, robots, robotsTarget, division, city);
        await buySomeThings(ns, aiCores, aiCoresTarget, division, city);
        await buySomeThings(ns, realEstate, realEstateTarget, division, city);
    }
    ns.tprint(`Finished setting up ${division.name} (Phase 2)`);
    ns.tprint("See if you can find an offer from investors for ~$5t before proceeding with Phase 3");
}
