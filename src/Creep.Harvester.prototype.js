/*
 * Simple Miner class that also returns it's energy to the nearest dropoff.
 * Useful when we don't have the resources to build a Miner + Courier chain quickly (e.g. new map).
*/
let role = 'harvester';
Creep[role] = role;
Creep.parts[role] = [
	[WORK, WORK, MOVE, CARRY] // 300
];
Creep.prototype.runRole[role] = function() {
	if (this.isFull()) {
		return this.dropEnergyAtStorage();
	} else {
		return this.harvestEnergyFromTarget();
	}
}