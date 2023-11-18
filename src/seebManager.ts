import { NS } from "@ns"
import {money} from "format";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {    

    const S3B4 = 'S3B4-H74513'
    ns.tprint(`Hello I am Server Bot ${S3B4} I will buy you all the best Servers a Pigeon may need`)

    const serverLimit = ns.getPurchasedServerLimit()
    if(serverLimit === 0) return ns.tprint('You cannot buy servers :(')

    const maxServerPower = Math.floor(Math.log2(ns.getPurchasedServerMaxRam()))
    const levelUpCount = Math.min(5, serverLimit)
    const metaData = Array(maxServerPower)
    const getOwnServers = () => metaData.filter(servers => servers.names.length > 0)
    const reachedMax = () => getOwnServers().pop()?.names?.length === serverLimit

    for(const i of metaData.keys()) 
        metaData[i] = {
            power: (i+1),
            names: [],
        }

    for(const server of ns.getPurchasedServers()) {
        metaData[Math.log2(ns.getServerMaxRam(server))-1].names.push(server)
    }

    function getOptimalNewServerPower() {
        const biggestServers = getOwnServers().pop()
        if(biggestServers.names.length < levelUpCount) return biggestServers.power
        return Math.min(biggestServers.power+1, maxServerPower)
    }

    function yay() {
        ns.toast('Servers maxed out', 'success', 5000)
        ns.tprint(`*powering down bok's*`)
    }

    if(reachedMax()) return yay()

    function boughtServer(name: string, ram: number) {
        if(name === '') return
        metaData[Math.log2(ram)-1].names.push(name)
        const formatedRam = ns.formatRam(ram*1e9).toString().padEnd(10)
        const formatedMoney = money(ns.getPurchasedServerCost(ram)).toString().padEnd(10)
        ns.toast(`${S3B4}: Bought bestest server ${name.padEnd(10)} ${formatedRam} for ${formatedMoney} all the ram a chicken needs!`, 'info', 5000)
    }

    async function buyServer(serverPower: number) {
        ns.tprint(`Awaiting to buy server ${serverPower}`)
        const ram = Math.min(2**serverPower, 2**maxServerPower)
        const cost = ns.getPurchasedServerCost(ram)
        ns.tprint(`cost ${money(cost)}`)
        while(await ns.asleep(40)) {
            if(ns.getServerMoneyAvailable('home') <= cost) continue
            if(ns.getPurchasedServers().length === serverLimit) deleteSmallest()
            return boughtServer(ns.purchaseServer('pigeon', ram), ram)
        }
    }

    function deleteSmallest() { 
        ns.tprint(`deleting smallest`)
        const serverName = metaData[metaData.indexOf(getOwnServers().shift())].names.pop()
        ns.killall(serverName)
        ns.deleteServer(serverName)
    }

    async function buyStartingServer(bestServer = 1) {
        ns.tprint(`const's see how many seebs you earn in 5 seconds`)
        
        const beforeCash = ns.getServerMoneyAvailable('home')
        await ns.asleep(1000 * 5)
        const earnedCash = ns.getServerMoneyAvailable('home') - beforeCash
        while(ns.getPurchasedServerCost((2**bestServer)*2) < earnedCash) bestServer++

        if(earnedCash < 0) ns.tprint(`You ate all the seebs? Okay well nevermind, we'll still get the best server for pigeons`)
        else ns.tprint(`You earned many seebs, will buy best server for pigeon level ${bestServer}`)
  
        await buyServer(bestServer)
    }

    await buyStartingServer(ns.getPurchasedServers().length ? getOwnServers().pop().power : 1)

    while(!reachedMax()) {
        ns.toast('Refreshing running hacks...')
        const result = ns.run('auto-startup-hacks.js');
        if (result > 0) {
            ns.toast("Successfully refreshed running hacks.")
        } else {
            ns.toast("Failed to refresh running hacks.")
        }   
    }

    yay()
}
