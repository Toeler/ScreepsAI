/*
 * Main Miner class that drops it's energy at it's feet for a Courier to pick up.
*/
let role = 'miner';
Creep[role] = role;
Creep.parts[role] = [
	[WORK, WORK, MOVE, MOVE], // 300
	[WORK, WORK, WORK, WORK, MOVE], // 450 
	[WORK, WORK, WORK, WORK, WORK, MOVE] // 550
];
Creep.prototype.runRole[role] = function() {
	return this.harvestEnergyFromTarget();
}

Creep.prototype.getMiningSpeed = function() {
	return this.body.reduce((sum, part) => sum += (part.type == WORK ? HARVEST_POWER : 0), 0);
}

Creep.getHighestSpawnableTierMiningSpeed = function(room) {
	return this.getHighestSpawnableTierBodyparts(room, Creep.miner)
		.reduce((sum, part) => sum += (part == WORK ? HARVEST_POWER : 0), 0);
}