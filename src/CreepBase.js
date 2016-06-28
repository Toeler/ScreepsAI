module.exports = class CreepBase {
	constructor(creep) {
		this.creep = creep;
		this.id = this.creep.id;
		this.name = this.creep.name;
		this.memory = this.creep.memory;
		this.pos = this.creep.pos;
		this.room = this.creep.room;
		this.energy = this.creep.carry.energy;

		this.memory.isActive = _.isUndefined(this.memory.isActive) ? true : this.memory.isActive;
	}

	static getPartsSpawnCost(parts) {
		return parts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
	}

	static getPartsTierForRoom(room) {
		let extensions = room.find(FIND_MY_STRUCTURES, {
			filter: (structure) => structure.structureType == STRUCTURE_EXTENSION
		});
		let hasTransporters = room.getFriendlyCreeps('Transporter').length > 0;
		let extensionsCapacity = _.reduce(extensions,
			(sum, extension) => sum + (hasTransporters && extension.energyCapacity)
		, 0);

		for (let i = this.parts.length; i-- > 0;) {
			let parts = this.parts[i];
			if (this.getPartsSpawnCost(parts) <= (300 + extensionsCapacity)) {
				return parts;
			}
		}
	}

	performActionOrMoveTo(scope, action, actionArgs, moveToTarget, moveToArgs) {
	    if (scope[action].apply(scope, actionArgs) == ERR_NOT_IN_RANGE) {
	        this.creep.moveTo(moveToTarget, moveToArgs);
	    }
	}

	dropEnergyAtNearestSpawner() {
		let closestSpawner = this.pos.findClosestByPath(FIND_MY_SPAWNS, {
			filter: (spawner) => spawner.energy > 0// && this.pos.inRangeTo(spawner, 3)
		});

		if (closestSpawner) {
			this.performActionOrMoveTo(this.creep, 'transfer', [closestSpawner, RESOURCE_ENERGY], closestSpawner);
		}
	}

	getEnergyDropOff() {
		if (true) {
			return this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: (structure) => _.contains([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_CONTAINER], structure.structureType) && !structure.isFull()
			}) || 
			this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: (structure) => _.contains([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_CONTAINER], structure.structureType)
			});
		}

		let closest = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure) => _.contains([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_CONTAINER], structure.structureType)
		});

		if (closest) {
			return closest.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: (structure) => _.contains([STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_CONTAINER], structure.structureType) && !structure.isFull()
			}) || closest;
		}
	}

	getEnergyFromNearestSpawner() {
		if (this.creep.isAtCapacity()) {
			return;
		}

		// Can't be taking precious energy if we're down a Miner
		if (this.room.memory.spawnQueue.some((newCreep) => newCreep == 'Miner' || newCreep.type == 'Miner')) {
			return;
		}

		let closestSpawner = this.pos.findClosestByPath(FIND_MY_SPAWNS, {
			filter: (spawner) => spawner.energy > 0// && this.pos.inRangeTo(spawner, 3)
		});
		
		if (closestSpawner) {
			let energy = closestSpawner.pos.findInRange(FIND_DROPPED_ENERGY, 1, {
				filter: (energy) => !this.room.lookAt(energy).some((obj) => obj.type == "creep" && obj.memory && obj.memory.role == "Miner")
			})[0];
			if (energy) {
				this.performActionOrMoveTo(this.creep, 'pickup', [energy], energy);
			} else {
				this.performActionOrMoveTo(closestSpawner, 'transferEnergy', [this.creep], closestSpawner);
			}
		}
	}

	getClosestSource() {
		return this.pos.findClosestByPath(FIND_SOURCES);
	}

	getClosestSpawner() {
		return this.pos.findClosestByPath(FIND_MY_SPAWNS);
	}

	run() {
		if (this.memory.isActive) {
			this.runAction();
		}
	}
}