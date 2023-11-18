import {Server, NS} from "@ns";

/**
 * Get the best server we can hack with our current hacking level
 * @param {import(".").NS} ns
 * @param servers
 */
export async function getBestServerToHack(ns: NS, servers: Server[]): Promise<Server | null> {
    const hasFormulas = ns.fileExists("Formulas.exe");
    const availablePortHacks = [
        ns.fileExists("FTPCrack.exe"),
        ns.fileExists("BruteSSH.exe"),
        ns.fileExists("relaySMTP.exe"),
        ns.fileExists("HTTPWorm.exe"),
        ns.fileExists("SQLInject.exe")
    ].filter(x => x).length

    const player = ns.getPlayer();

    const mults = ns.getHackingMultipliers();
    const allMults = mults?.chance * mults?.speed * mults?.money * mults?.growth;
    const level = ns.getHackingLevel();
    const hackingLevel =
        ns.fileExists('Formulas.exe') ?
            ns.formulas.skills.calculateSkill(level, allMults) :
            ns.getHackingLevel();
    const notNullServers = servers
        .filter((server: Server) => !!server)
        .filter((server: Server) => server != null);

    const calcServers = servers
        .filter((server: Server) => server.moneyMax ?? 0 > 0)
        .filter((server: Server) => ns.getServerNumPortsRequired(server.hostname) <= availablePortHacks)
        .filter((server: Server) => {
            // ns.tprint(`Checking if ${server.requiredHackingSkill} is less than or equal to ${hackingLevel}`)
            const thing = (server.requiredHackingSkill ?? 0) <= hackingLevel * 0.5;
            // ns.tprint(`${server.requiredHackingSkill} ${thing ? "is" : "is not"} less than or equal to ${hackingLevel}`)
            return thing;
        })
        .sort((a: Server, b: Server) => {
            const orDefaultMoneyMaxA = a.moneyMax ?? 0;
            const orDefaultMoneyMaxB = b.moneyMax ?? 0;

            const orDefaultMinDifficultyA = a.minDifficulty ?? 1;
            const orDefaultMinDifficultyB = b.minDifficulty ?? 1;
            if (hasFormulas) {
                const hackChanceA = ns.formulas.hacking.hackChance(a, player);
                const hackChanceB = ns.formulas.hacking.hackChance(b, player);
                return (orDefaultMoneyMaxB / orDefaultMinDifficultyB) * hackChanceB -
                    (orDefaultMoneyMaxA / orDefaultMinDifficultyA * hackChanceA)
            } else {
                return (orDefaultMoneyMaxB / orDefaultMinDifficultyB) - (orDefaultMoneyMaxA / orDefaultMinDifficultyA);
            }

        });

    let firstItem, lastItem, firstRate, lastRate = null;

    if (calcServers.length == 0) {
        return null;
    }

    if (hasFormulas) {
        firstItem = calcServers[0];
        firstRate = ns.formulas.hacking.hackPercent(firstItem, player);

        lastItem = calcServers[calcServers.length - 1];
        lastRate = ns.formulas.hacking.hackPercent(lastItem, player);
    } else {
        firstItem = calcServers[0];

        const firstItemMoneyMax = firstItem.moneyMax ?? 0;
        const firstItemMinDifficulty = firstItem.minDifficulty ?? 0;

        firstRate = firstItemMoneyMax / firstItemMinDifficulty;

        lastItem = calcServers[calcServers.length - 1];

        const lastItemMoneyMax = lastItem.moneyMax ?? 0;
        const lastItemMinDifficulty = lastItem.minDifficulty ?? 0;
        lastRate = lastItemMoneyMax / lastItemMinDifficulty;
    }

    ns.print(`First server: ${JSON.stringify(firstItem, null, 2)}\nRate: ${firstRate * 100}`);
    ns.print(`Last server: ${JSON.stringify(lastItem, null, 2)}\nRate: ${lastRate * 100}`);

    return calcServers[0];
}
