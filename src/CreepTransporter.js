/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

module.exports = class CreepTransporter extends CreepBase {
	static get parts() {
		return [
			[CARRY, CARRY, MOVE, MOVE] // 200
		];
	}

	// Gets builders that aren't at capacity
	getNearestBuilder() {
		return this.pos.findClosestByPath(FIND_MY_CREEPS, {
			filter: (creep) => creep.memory.role == 'Builder' && creep.carry.energy < (creep.carryCapacity - 10)
		});
	}

	// Gets extensions that aren't at capacity
	getNearestExtension() {
		return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
			filter: (structure) => structure.structureType == STRUCTURE_EXTENSION && !structure.isAtCapacity()
		});
	}

	// Gets upgrader that aren't at capacity
	getNearestUpgrader() {
		return this.pos.findClosestByPath(FIND_MY_CREEPS, {
			filter: (creep) => creep.memory.role == 'Upgrader' && creep.carry.energy < (creep.carryCapacity - 10)
		});
	}

	// Gets spawners that have dropped energy next to them
	getNearestSpawner() {
		return this.pos.findClosestByPath(FIND_MY_SPAWNS, {
			filter: (spawner) => spawner.energy < spawner.energyCapacity && spawner.pos.findInRange(FIND_DROPPED_ENERGY, 1).length
		});
	}

	getTarget() {
		return this.getNearestExtension()
			|| this.getNearestBuilder()
			//|| this.getNearestUpgrader()
			|| this.getNearestSpawner();
	}

	runAction() {
		if (this.energy == 0) {
			return this.getEnergyFromNearestSpawner();
		}

		let target = this.getTarget();
		if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(target);
		}
	}
};