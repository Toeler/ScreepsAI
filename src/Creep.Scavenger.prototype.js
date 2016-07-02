/*
 * Picks up any energy on the ground that isn't near a source and moves it to storage.
 * Moved energy from storage to any spawners that aren't full
*/
let role = 'scavenger';
Creep[role] = role;
Creep.parts[role] = [
	[MOVE, CARRY, MOVE, CARRY], // 200
	[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY] // 300
	[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY], // 400
	[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY] // 500
];
Creep.prototype.runRole[role] = function() {
	let target = this.getClosestNonFullSpawn();
	if (target) {
		if (this.isNotEmpty()) {
			return this.transferEnergyTo(target);
		} else {
			return this.collectEnergyFromTarget(this.getClosestNonEmptyEnergyPickUpNotInSpawn());
		}
	} else {
		if (this.isNotFull()) {
			return this.collectEnergyFromTarget(this.findClosestDroppedEnergy());
		} else {
			return this.dropEnergyAtStorage();
		}
	}
}

Creep.prototype.getClosestNonEmptyEnergyPickUpNotInSpawn = function() {
	return this.getClosestNonEmptyEnergyPickUp((structure) => structure.structureType != STRUCTURE_SPAWN);
}