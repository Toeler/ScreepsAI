const ENERGY_PICK_UP_STRUCTURES = [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
const ENERGY_DROP_OFF_STRUCTURES = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_CONTAINER];

Room.prototype.tick = function() {
	this.runRoomController();

	for (let creep of this.getFriendlyCreeps()) {
		try {
			creep.runRole[creep.memory.role].call(creep);
		} catch(e) {
			creep.error(`Failed to run role ${creep.memory.role} (${e.stack})`);
		}
	}
}

Room.prototype.getFriendlyCreeps = function(type, includeSpawning) {
	return this.find(FIND_MY_CREEPS, {
		filter: (creep) => 
			(_.isNil(type) || creep.memory.role == type) &&
			(!creep.spawning || includeSpawning)
	});
}

Room.prototype.getSources = function() {
	return this.find(FIND_SOURCES);
}

/**
 * Gets a target to repair, finding a target using a mixture of position (if provided) and importance
 * @param {RoomPosition} [pos] - An optional position to favour finding a target near 
 * @return {ConstructionSite} target
 */
Room.prototype.getRepairTarget = function(pos) {
	
}

/**
 * Gets a target to build, finding a target using a mixture of position (if provided) and importance
 * @param {RoomPosition} [pos] - An optional position to favour finding a target near 
 * @return {ConstructionSite} target
 */
Room.prototype.getBuildTarget = function(pos) {
	
}

/**
 * Gets a target to repair, or if there are no valid targets, a target to repair
 * @param {RoomPosition} [pos] - An optional position to favour finding a target near
 * @return {Structure | ConstructionSite} target
 */
Room.prototype.getRepairOrBuildTarget = function(pos) {
	return this.getRepairTarget(pos) || this.getBuildTarget(pos);
}

/**
 * Gets a {Structure} nearby to the target which has room for energy.
 * @param {RoomObject | string} target - The target to search near.
 * @param {function(structure): boolean} [filter] - Optional filter to determine inclusion in result.
 * @return {Structure} The Structure to drop the energy at
 */
Room.prototype.getClosestEnergyDropOff = function(target, filter = () => true) {
	target = (target instanceof RoomObject) ? target : Game.getObjectById(target);
	// TODO: Figure out why FIND_MY_STRUCTURES doesn't include this
	return target.pos.findClosestByRange(FIND_STRUCTURES, {
		filter: (structure) =>
			_.contains(ENERGY_DROP_OFF_STRUCTURES, structure.structureType)
			&& filter(structure)
	});
}

/**
 * Gets a nearby {Structure} or {Resource} which has energy for the taking.
 * @param {RoomObject | string} target - The target to search near.
 * @param {function(structure): boolean} [filter] - Optional filter to determine inclusion in result.
 * @return {Structure | Resource} The Structure or Resource to collect the energy from
 */
Room.prototype.getClosestEnergyPickUp = function(target, filter = () => true) {
	target = (target instanceof RoomObject) ? target : Game.getObjectById(target);
	// TODO: Figure out why FIND_MY_STRUCTURES doesn't include this
	let energy = target.pos.findClosestByRange(FIND_DROPPED_ENERGY);
	let distanceToEnergy = target.pos.getRangeTo(energy);
	return target.pos.findClosestByRange(FIND_STRUCTURES, {
		filter: (structure) =>
			_.contains(ENERGY_PICK_UP_STRUCTURES, structure.structureType)
			&& filter(structure)
			&& target.pos.getRangeTo(structure) < distanceToEnergy
	}) || energy;
}