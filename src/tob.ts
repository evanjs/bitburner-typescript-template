import {NS} from '@ns';
import {hireRemainingEmployees} from 'tcorpse';

/** @param {NS} ns */
function cities(ns: NS) {
    return Object.values(ns.enums.CityName);
}

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const cityName = ns.enums.CityName.Aevum;
    const corp = ns.corporation.getCorporation();


    // Purchase Tobacco division
    if (!corp.divisions.map(x => x.includes('tobacco'))) {
        const divisionName = 'Brand X';
        ns.tprint("No Tobacco division found. Creating Tobacco division...");
        ns.corporation.expandIndustry('Tobacco', divisionName);
        ns.tprint(`Expanded into tobacco with division "${divisionName}"`);
    } else {
        ns.tprint(`Tobacco division already exists.`);
    }

    const division = ns.corporation.getDivision('Brand X');

    // Expand into Aevum
    const hasAevum = division.cities.includes(ns.enums.CityName.Aevum);
    if (!hasAevum) {
        ns.corporation.expandCity(division.name, cityName);
    }
    const aevum = ns.corporation.getOffice(division.name, cityName);
    if (!ns.corporation.hasWarehouse(division.name, cityName)) {
        ns.corporation.purchaseWarehouse(division.name, cityName);
    }
    const aevumSizeTarget = 30;
    if (aevum.size < aevumSizeTarget) {
        const required = aevumSizeTarget - aevum.size;
        ns.tprint(`Opening ${required} spots in Aevum to reach requested value of ${aevumSizeTarget}`);
        ns.corporation.upgradeOfficeSize(division.name, cityName, required);
    }
    ns.corporation.setAutoJobAssignment(division.name, cityName, 'Operations', 6);
    ns.corporation.setAutoJobAssignment(division.name, cityName, 'Engineer', 6);
    ns.corporation.setAutoJobAssignment(division.name, cityName, 'Business', 6);
    ns.corporation.setAutoJobAssignment(division.name, cityName, 'Management', 6);
    ns.corporation.setAutoJobAssignment(division.name, cityName, 'Research & Development', 6);

    // Ensure office employs all possible employees
    hireRemainingEmployees(ns, aevum, division, cityName);

    // Hire 9 employees:
    // * Operations (2)
    // * Engineer (2)
    // * Business (1)
    // * Management (2)
    // * Research & Development (2)
    for (const city of cities(ns).filter(x => x != cityName)) {
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
        ns.corporation.setAutoJobAssignment(division.name, city, 'Operations', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Engineer', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Business', 1);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Management', 2);
        ns.corporation.setAutoJobAssignment(division.name, city, 'Research & Development', 2);

        if (office.numEmployees < office.size) {
            // Ensure office employs all possible employees
            hireRemainingEmployees(ns, office, division, city);
        }

    }
    if (division.products.length == 0) {
        const productName = "Cigars";
        const designInvest = 1_000_000_000;
        const marketingInvest = 1_000_000_000;
        ns.corporation.makeProduct(division.name, cityName, productName, designInvest, marketingInvest);
        ns.tprint(`No products found for ${division.name}. Started making ${productName} in Aevum`);
    }
    ns.tprint(`Finished setting up ${division.name} (Phase 3)`);
}
