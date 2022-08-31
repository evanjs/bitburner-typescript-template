import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    if (ns.args.length == 0) {
        ns.tprint("No size provided.  Please provide the desired server RAM spec in GB (e.g. '1024')");
        ns.exit();
    }

    const desiredRam = ns.args[0] as number;

    ns.run('delete-all-servers.js', desiredRam)
    ns.run('purchase-server.js', 1, desiredRam);
}
