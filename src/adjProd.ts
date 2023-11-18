import { NS } from "@ns";

let division = null;
let products = [];

/**
 * @param {NS} ns
 * @param {String} type
 * @param {Number} step
 * @param {String | Number} price
 */
function adjustProductPrice(ns: NS, price: string | number, type: string, step: number): string {
	let newNumber: number;
	let split: Array<string>;
	let value: string;
	if (typeof price == "string") {
		split = price.replaceAll(' ', '').split("*");
		const number = Number(split[1]);
		newNumber = type == '+' ? number + step : number - step;
		value = `${split[0]}*${newNumber}`
	} else {
		value = price.toString();
	}
	
	
	return value;
}

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	division = ns.corporation.getDivision('Brand X');
	products = division.products;
	const city = ns.enums.CityName.Aevum

	for (const productName of products) {
		const product = ns.corporation.getProduct(division.name, city, productName);
		if (product.developmentProgress < 100) {
			continue;
		}

		const productPrice = product.desiredSellPrice;
		let newPrice;
		let step = 1;
		if (product.productionAmount > product.actualSellAmount) {
			ns.tprint(`Production for ${productName} in ${city} (${division.type}) exceeds sales. Decrementing price by ${step}...`);
			newPrice = adjustProductPrice(ns, productPrice, '-', step);
		}
		if (product.productionAmount == product.actualSellAmount) {
			step = 10;
			ns.tprint(`Sales for ${productName} in ${city} (${division.type}) match production. Incrementing price by ${step}...`);
			newPrice = adjustProductPrice(ns, productPrice, '+', step);
		}

		if (newPrice) {
			ns.corporation.sellProduct(division.name, city, productName, 'MAX', newPrice, true);
			ns.tprint(`Price of ${productName} in ${city} (${division.name}) was changed from ${productPrice} to ${newPrice}`);
		}
	}
}
