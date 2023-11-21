import {Office, NS, Division, CityName} from '@ns';
import {hireRemainingEmployees} from 'tcorpse';
import {money} from "/format";

/** @param {NS} ns */
function cities(ns: NS) {
    return Object.values(ns.enums.CityName);
}

/** @param {NS} ns
 * @param {Office} office
 * @param {Division} division
 * @param {number} target
 */
function tryUpgradeOffice(ns: NS, office: Office, division: Division, target: number) {
    const required = target - office.size;
    const city = office.city;

    // ns.tprint(`Opening ${required} spots in ${city} to reach requested value of ${target}`);
    // ns.corporation.upgradeOfficeSize(division.name, city, required);

    ns.tprint(`Attempting to upgrade office size of ${division.name}'s ${city} office to ${target} (need ${required} more)`);
    const officeUpgradeSizeCost = ns.corporation.getOfficeSizeUpgradeCost(division.name, city, required)
    const officeUpgradeSizeCostFormatted = money(officeUpgradeSizeCost);

    const currentFunds = ns.corporation.getCorporation().funds;
    const currentFundsFormatted = money(currentFunds)

    const diff = officeUpgradeSizeCost - currentFunds;
    const diffFormatted = money(diff);

    const haveSufficientFunds = officeUpgradeSizeCost > currentFunds;
    if (haveSufficientFunds) {
        ns.tprint(`Come back later, you're broke.\nYou need: ${officeUpgradeSizeCostFormatted}\nCurrent Funds: ${currentFundsFormatted}\nYou are ${diffFormatted} short`);
        return false;
    } else {
        ns.corporation.upgradeOfficeSize(division.name, city, required);
        return true;
    }
}

const tryPurchaseWarehouse = (ns: NS, division: Division, city: CityName): boolean => {
    const warehouseCost = ns.corporation.getUpgradeWarehouseCost(division.name, city);
    const warehouseCostFormatted = money(warehouseCost);

    const funds = ns.corporation.getCorporation().funds;
    const fundsFormatted = money(funds);

    const diff = warehouseCost - funds;
    const diffFormatted = money(diff);

    const haveSufficientFunds = warehouseCost < funds;

    if (!haveSufficientFunds) {
        ns.tprint(`Come back later, you're broke.\nYou need: ${warehouseCostFormatted}\nCurrent Funds: ${fundsFormatted}\nYou are ${diffFormatted} short`);
        return false;
    } else {
        ns.corporation.purchaseWarehouse(division.name, city);
        return true;
    }
};

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
        const success = tryPurchaseWarehouse(ns, division, cityName);
        if (success) {
            ns.tprint(`Successfully purchased warehouse for Aevum.`)
        }

    }

    // Ensure Aevum has 30 employees
    // Ensure Aevum has a minimum of 6 employees assigned to each role
    const aevumSizeTarget = 30;
    if (aevum.size < aevumSizeTarget) {
        const success = tryUpgradeOffice(ns, aevum, division, aevumSizeTarget);
        if (success) {
            ns.tprint(`Successfully upgraded Aevum office to ${aevumSizeTarget} employees.`)
            ns.tprint(`Configuring job assignment and hiring employees ...`)
            ns.corporation.setAutoJobAssignment(division.name, cityName, 'Operations', 6);
            ns.corporation.setAutoJobAssignment(division.name, cityName, 'Engineer', 6);
            ns.corporation.setAutoJobAssignment(division.name, cityName, 'Business', 6);
            ns.corporation.setAutoJobAssignment(division.name, cityName, 'Management', 6);
            ns.corporation.setAutoJobAssignment(division.name, cityName, 'Research & Development', 6);

            // Ensure office employs all possible employees
            hireRemainingEmployees(ns, aevum, division, cityName);
        } else {
            ns.tprint(`Failed to upgrade Aevum office to ${aevumSizeTarget} employees. Exiting...`)
            // return
        }
    }

    // Hire 9 employees:
    // * Operations (2)
    // * Engineer (2)
    // * Business (1)
    // * Management (2)
    // * Research & Development (2)
    for (const city of cities(ns).filter(x => x != cityName)) {
        // Expand into city / purchase office

        // If there is no warehouse/presence in a city
        if (!division.cities.includes(city)) {
            ns.tprint(`${division.name} does not have an office in ${city}. Expanding ...`);
            ns.corporation.expandCity(division.name, city);
        } else {
            ns.tprint(`${division.name} already has an office in ${city}. Skipping ...`);
        }
        // Purchase warehouse
        const office = ns.corporation.getOffice(division.name, city);

        // Try to purchase warehouse for city if none exists
        if (!ns.corporation.hasWarehouse(division.name, city)) {
            const success = tryPurchaseWarehouse(ns, division, city);
            if (success) {
                ns.tprint(`Successfully purchased warehouse in ${city}.`)
            } else {
                ns.tprint(`Not enough money for warehouse in ${city}`)
                ns.tprint(`Exiting now/not attempting further purchases`)
                return;
            }
        } else {
            ns.tprint(`${division.name} already has an warehouse in ${city}. Skipping ...`);
        }


        // ensure employee requirements are met
        const requiredSize = 9;
        if (office.size < requiredSize) {
            const success = tryUpgradeOffice(ns, aevum, division, aevumSizeTarget);
            if (success) {
                ns.tprint("Should only reach this point if we have enough money to upgrade the office size");

                ns.corporation.setAutoJobAssignment(division.name, city, 'Operations', 2);
                ns.corporation.setAutoJobAssignment(division.name, city, 'Engineer', 2);
                ns.corporation.setAutoJobAssignment(division.name, city, 'Business', 1);
                ns.corporation.setAutoJobAssignment(division.name, city, 'Management', 2);
                ns.corporation.setAutoJobAssignment(division.name, city, 'Research & Development', 2);

                hireRemainingEmployees(ns, office, division, city);
            }
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
