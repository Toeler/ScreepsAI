
/*
 * Extension methods used by all creep roles.
*/

Creep.parts = {}; // Keyed by role, an array of bodypart arrays containing increasing cost/tier
Creep.prototype.runRole = {}; // Keyed by role, the entry function for each role's actions

Creep.prototype.log = function(level, msg) {
	console.log(`${level} - ${this.name}: ${msg}`)
}

Creep.prototype.debug = function(msg) {
	// TODO: Switch a variable for debug mode, or perhaps log to some other source
	this.log('DEBUG', msg);
}

Creep.prototype.info = function(msg) {
	this.log('INFO', msg);
}

Creep.prototype.warn = function(msg) {
	this.log('WARN', msg);
}

Creep.prototype.error = function(msg) {
	// TODO: Notify me?
	this.log('ERROR', msg);
}

function getSpawnCost(bodyParts) {
	return bodyParts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
}

Creep.getHighestSpawnableTierBodyparts = function(room, role) {
	let extensions = room.find(FIND_MY_STRUCTURES, {
		filter: (structure) => structure.structureType == STRUCTURE_EXTENSION
	});

	for (let i = Creep.parts[role].length; i-- > 0;) {
		let parts = Creep.parts[role][i];
		if ((parts.length - 5) <= extensions.length && getSpawnCost(parts) <= room.energyCapacityAvailable) {
			return parts;
		}
	}
}

/**
 * Sets the creep's target
 * @param {RoomObject | string} - The target id or object 
 */
Creep.prototype.setTarget = function(target) {
	if (target instanceof RoomObject) {
		this.memory.target = target.id;
	} else {
		this.memory.target = target;
	}
}

/**
 * Determine whether this creep's carry capacity is full
 * @return {boolean} true if carry is at capacity
 */
Creep.prototype.isFull = function() {
	// TODO: Probably needs refactoring when we extract resources
	return this.carry.energy >= this.carryCapacity;
}

/**
 * Determine whether this creep's carry capacity is not full
 * @return {boolean} true if carry is not at capacity
 */
Creep.prototype.isNotFull = function() {
	return !this.isFull();
}

/**
 * Determine whether this creep's carry capacity is empty
 * @return {boolean} true if carry is empty
 */
Creep.prototype.isEmpty = function() {
	// TODO: Probably needs refactoring when we extract resources
	return this.carry.energy <= 0;
}

/**
 * Determine whether this creep's carry capacity is not empty
 * @return {boolean} true if carry is not empty
 */
Creep.prototype.isNotEmpty = function() {
	// TODO: Probably needs refactoring when we extract resources
	return !this.isEmpty();
}

/**
 * Shorthand for creep.transfer(target, RESOURCE_ENERGY, [amount])
 * @param {Creep | Spawn | Structure} target - The target to transfer energy to
 * @param {number} [amount] - The amount to transfer. If omitted, all energy will be transferred.
 * @return {number} Status code
 */
Creep.prototype.transferEnergy = function(target, amount) {
	return this.transfer(target, RESOURCE_ENERGY, amount);
}

/**
 * Shorthand for creep.drop(RESOURCE_ENERGY, [amount])
 * @param {number} [amount] - The amount to transfer. If omitted, all energy will be dropped.
 * @return {number} Status code
 */
Creep.prototype.dropEnergy = function(amount) {
	return this.drop(RESOURCE_ENERGY, amount);
}

/**
 * Move the creep to the target and harvest energy.
 * @param {RoomPosition} [target] - An optional target. If falsey, creep.memory.target will be used.
 * @return {number} Status code
 */
Creep.prototype.harvestEnergyFromTarget = function(target) {
	let harvestTarget = Game.getObjectById(target || this.memory.target);
	if (!harvestTarget) {
		return ERR_INVALID_TARGET;
	}

	let result = this.harvest(harvestTarget);
	if (result == ERR_NOT_IN_RANGE) {
		return this.moveTo(harvestTarget);
	}
	return result;
}

/**
 * Gets a nearby {Structure} or {Resource} which has energy for the taking.
 * @param {function(structure): boolean} [filter] - Optional filter to determine inclusion in result.
 * @return {Structure | Resource} The Structure or Resource to collect the energy from
 */
Creep.prototype.getClosestEnergyPickUp = function(filter = () => true) {
	return this.room.getClosestEnergyPickUp(this, filter);
}

/**
 * Gets a nearby {Structure} which has room for energy.
 * @param {function(structure): boolean} [filter] - Optional filter to determine inclusion in result.
 * @return {Structure} The Structure to drop the energy at
 */
Creep.prototype.getClosestEnergyDropOff = function(filter = () => true) {
	// TODO: Figure out why FIND_MY_STRUCTURES doesn't include this
	return this.room.getClosestEnergyDropOff(this, filter);
}

/**
 * Gets a nearby {Structure} which has room for energy.
 * * @param {function(structure): boolean} [filter] - Optional filter to determine inclusion in search.
 * @return {Structure} The storage object
 */
Creep.prototype.getClosestNonFullEnergyDropOff = function(filter = () => true) {
	return this.getClosestEnergyDropOff((structure) => structure.isNotFull() && filter(structure));
}

/**
 * Gets a nearby {Structure} which has room for energy.
 * @param {function(structure): boolean} [filter] - Optional filter to determine inclusion in search.
 * @return {Structure} The storage object
 */
Creep.prototype.getClosestNonEmptyEnergyPickUp = function(filter = () => true) {
	return this.getClosestEnergyPickUp((structure) => structure.isNotEmpty() && filter(structure));
}

/**
 * Move to and transfer energy to the target.
 * @param {Creep | Spawn | Structure} target - The target to transfer energy to
 * @param {number} [amount] - The amount to transfer. If omitted, all energy will be transferred.
 * @return {number} Status code
 */
Creep.prototype.transferEnergyTo = function(target, amount) {
	let result = this.transferEnergy(target);
	if (result == ERR_NOT_IN_RANGE) {
		return this.moveTo(target);
	}
	return result;
}

/**
 * Move to the storage and place any energy it has in or around it.
 * @param {Structure | string} [target] - An optional target. If falsey, a nearby non-empty storage will be used.
 * @param {boolean} [ignoreImmediateVacinity] - Optional. If true, and target is falsey, don't include storage structures in range 1 of the creep.
 * @return {number} Status code
 */
Creep.prototype.dropEnergyAtStorage = function(target, ignoreImmediateVacinity) {
	let filter = (structure) => ignoreImmediateVacinity ? !this.pos.inRangeTo(structure, 1) : true; 
	let storageTarget = target instanceof Structure ? target :
		Game.getObjectById(target) ||
		this.getClosestNonFullEnergyDropOff(filter) ||
		this.getClosestEnergyDropOff(filter);
	if (!storageTarget) {
		return ERR_INVALID_TARGET;
	}

	let result = this.transferEnergyTo(storageTarget);
	if (result == ERR_FULL) {
		return this.dropEnergy();
	}
	return result;
}

/**
 * Move to the target and collect energy from or around it
 * @param {Structure | Resource | string} target - The target to pickup the energy from
 * @return {number} Status code
 */
Creep.prototype.collectEnergyFromTarget = function(target) {
	//let pickupTarget = Game.getObjectById(target);
	let result;
	if (target instanceof Structure) {
		result = target.transferEnergy(this);
	} else {
		result = this.pickup(target);
	}
	if (result == ERR_NOT_IN_RANGE) {
		return this.moveTo(target);
	}
	return result;
}

/**
 * Move to the nearest storage and collect energy from or around it
 * @return {number} Status code
 */
Creep.prototype.collectEnergyFromStorage = function() {
	return this.collectEnergyFromTarget(this.getClosestNonEmptyEnergyPickUp());
}

/**
 * Move to and upgrader the Room's Controller
 * @return {number} Status code
 */
Creep.prototype.upgradeController = function() {
	let result = this.upgradeController(this.room.controller);
	if(result == ERR_NOT_IN_RANGE) {
		return this.moveTo(this.room.controller);
	}
	return result;
}

/**
 * If the target is a Structure then repair it, if it is a ConstructionSite then build it
 * @param {Structure | ConstructionSite | string} target - The target to repair or build
 * @return {number} Status code
 */
Creep.prototype.repairOrBuildTarget = function(target) {
	let buildTarget = _.isString(target) ? Game.getObjectById(target) : target;

	let result;
	if (buildTarget instanceof Structure) {
		result = this.repair(buildTarget);
	} else if (buildTarget instanceof ConstructionSite) {
		result = this.build(buildTarget);
	} else {
		this.warn(`Unknown repair or build target ${buildTarget.name}`)
		return ERR_INVALID_TARGET;
	}

	if(result == ERR_NOT_IN_RANGE) {
		return this.moveTo(buildTarget);
	}
	return result;
}

/**
 * Searches the room for any spawners that aren't full
 * @return {StructureSpawn} spawn
 */
Creep.prototype.getClosestNonFullSpawn = function() {
	return this.pos.findClosestByRange(FIND_MY_SPAWNS, {
		filter: (spawn) => spawn.isNotFull()
	});
}

/**
 * Gets any energy dropped around the target, or a non-empty container around the target
 * @param {RoomObject | string} target
 * @return {Resource | StructureContainer}
 */
Creep.prototype.getEnergyToPickupAtTarget = function(target) {
	target = _.isString(target) ? Game.getObjectById(target) : target;
	let energy = target.pos.findInRange(FIND_DROPPED_ENERGY, 1)[0];
	if (!energy) {
		// TODO: Use FIND_MY_STRUCTURES
		energy = target.pos.findInRange(FIND_STRUCTURES, 1, {
			filter: (structure) =>
				structure.structureType == STRUCTURE_CONTAINER &&
				!structure.isEmpty()
		})[0];
	}
	return energy;
}

/**
 * Searches the room for the closest energy on the ground
 * @return {Resource}
 */
Creep.prototype.findClosestDroppedEnergy = function() {
	return this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {
		filter: (droppedEnergy) => droppedEnergy.pos.findInRange(FIND_SOURCES, 1).length == 0
	});
}