import { Server, NS } from "@ns";

/** @param {import(".").NS} ns **/
export async function searchServers(ns: NS): Promise<Array<Server>> {
    let unprocessedQueue = ["home"];
    let processedQueue = [];
    while (unprocessedQueue.length > 0) {
        processedQueue.push(unprocessedQueue[0]);

        const newItems = ns.scan(unprocessedQueue[0]);
        const itemsToAdd = [];

        for (const newItem of newItems) {
            if (!processedQueue.includes(newItem)) {
                itemsToAdd.push(newItem);
            }
        }

        unprocessedQueue.shift();
        unprocessedQueue = [...unprocessedQueue, ...itemsToAdd];
    }

    processedQueue = processedQueue.filter((server) => server !== "home");
    processedQueue = processedQueue.filter((server) => server.indexOf("pserv-") === -1);


    return processedQueue.map(s => ns.getServer(s));
}
