/*
 * Ferry's energy to/from storages from/to Miners/Upgraders/Builders
*/
let role = 'courier';
Creep[role] = role;
Creep.parts[role] = [
	[MOVE, CARRY, MOVE, CARRY], // 200
	[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY], // 300
	[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY], // 400
	[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY] // 500
];
let ignoreImmediateVacinity = true;
Creep.prototype.runRole[role] = function() {
	let target = Game.getObjectById(this.memory.target);
	if (_.isNil(target)) {
		return this.dropEnergyAtStorage();
	}

	if (target instanceof Source) {
		if (this.isNotFull()) {
			return this.collectEnergyFromTarget(this.getEnergyToPickupAtTarget(target));
		}
		return this.dropEnergyAtStorage(null, ignoreImmediateVacinity);
	} else if (target.memory.role == Creep.upgrader) {
		if (this.isEmpty()) {
			return this.collectEnergyFromStorage();
		}
		return this.transferEnergyTo(target)
	} else {
		this.warn(`Unhandled target ${target.name}`);
		return ERR_INVALID_TARGET;
	}
}

/**
 * Get the number of ticks needed for the courier to get from the target, to the nearest pick up, and back, with one direction being full.
 * @param {RoomObject} target - The target to go between and the source
 * @returns {number} The numbers of ticks
 */
Creep.prototype.getCourierSpeed = function(target) {
	let nonMoveBodyParts = this.body.filter((part) => part.type != MOVE)
	let carryParts = _.filter(nonMoveBodyParts, {'type': CARRY});
	let otherParts = _.reject(nonMoveBodyParts, {'type': CARRY});
	let pickup = this.room.getClosestEnergyDropOff(target, (s) => !target.pos.isNearTo(s));
	let path = target.pos.findPathTo(pickup, {avoidCreeps: true});

	// TODO: Get the road/terrain and calculate real move speed, for now, assume there is a road
	return (carryParts.length * CARRY_CAPACITY) / path.reduce((sum) =>
		sum += ((otherParts.length * 2) + (carryParts.length * 3))
	, 0);
}