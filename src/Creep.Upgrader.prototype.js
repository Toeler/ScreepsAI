/*
 * Takes energy to the Controller and upgrades it
*/
let role = 'upgrader';
Creep[role] = role;
Creep.parts[role] = [
	[WORK, CARRY, CARRY, MOVE, MOVE], // 300
	[WORK, WORK, CARRY, CARRY, MOVE, MOVE], // 400
];
Creep.prototype.runRole[role] = function() {
	if (this.isEmpty()) {
		return this.collectEnergyFromStorage();
	} else {
		return this.upgradeController();
	}
}