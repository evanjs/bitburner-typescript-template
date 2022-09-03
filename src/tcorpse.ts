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
 * @param {number} employeeJobs
 * @param {string} role
 * @param {number} roleTarget
 * @param {string} city
 * @param {Division} division
 * @param {number} employeeJobs
 */
export function hireRoles(ns: NS, role: string, roleTarget: number, division: Division, city: string, employeeJobs: number) {
    // ns.tprint(`${division}'s ${city} office has less than the desired ${roleTarget} employees in the ${role} position`);
    const amount = roleTarget - employeeJobs;
    if (amount > 0) {
        ns.tprint(`Assigning ${amount} employee(s) to ${role} role for ${division.name}'s office in ${city}`);
        
        for (let i = 0; i < amount; i++) {
            const employee = ns.corporation.hireEmployee(division.name, city);
            if (employee) {
                ns.corporation.assignJob(division.name, city, employee.name, role);
            }
        }
    }
    else {
        ns.tprint(`Amount: ${amount}; role: ${role}; employeeJobs: ${employeeJobs}`);
    }
}

/**
 * @param {NS} ns
 * @param {Office} office
 * * @param {Division} division
 * * @param {String} city
 */
export function hireRemainingEmployees(ns: NS, office: Office, division: Division, city: string) {
    if (office.employees.length < office.size) {
        const remainingEmployees = office.size - office.employees.length;
        ns.tprint(`We have ${office.employees.length} employees and need ${remainingEmployees} more`);
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
    for (const city of cities) {
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
export async function buySomeThings(ns: NS, material: Material, materialTarget: number, division: Division, city: string) {
    if (material.qty < materialTarget) {
        const materialToBuy = (materialTarget - material.qty) / 10;
        ns.corporation.buyMaterial(division.name, city, material.name, materialToBuy);
        ns.tprint(`Setting purchase order for ${material.name} in ${city} to ${materialToBuy} to get ${materialTarget} in one tick`);
    } else {
        return;
    }
    while (ns.corporation.getMaterial(division.name, city, material.name).qty < materialTarget) {
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
    for (const city of cities) {
        const office = ns.corporation.getOffice(division.name, city);
        const requiredSize = 9;
        const amount = requiredSize - office.size;
        if (amount <= 0) {
            ns.tprint(`The ${city} office of ${division.name} already has a capacity of ${office.size} employees.`);
        } else {
            ns.tprint(`Upgrading office size of ${division.name}'s ${city} office to ${requiredSize} (need ${amount} more)`);
            ns.corporation.upgradeOfficeSize(division.name, city, amount);
        }

        if (office.employees.length < office.size) {
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
    for (const city of cities) {
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
