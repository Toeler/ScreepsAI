/*
 * Repairs structures and builds new structures
*/
let role = 'builder';
Creep[role] = role;
Creep.parts[role] = [
	[WORK, CARRY, CARRY, MOVE, MOVE], // 300
	[WORK, WORK, CARRY, CARRY, MOVE, MOVE], // 400
];
Creep.prototype.runRole[role] = function() {
	if (this.isEmpty()) {
		return this.collectEnergyFromStorage();
	} else {
		let target = this.room.getRepairOrBuildTarget(this.pos);
		if (target) {
			return this.repairTarget(target);
		}
		return this.upgradeController();
	}
}