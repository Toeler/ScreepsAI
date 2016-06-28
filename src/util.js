'use strict';

/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

require('Structure.prototype');

const CreepFactory = require('CreepFactory');
const RoleController = require('RoleController');

Object.prototype[Symbol.iterator] = function*() {
	for(let key of Object.keys(this)) {
		yield([ key, this[key] ])
	}
}

_.isNil = function() {
	return _.isUndefined.apply(this, arguments) || _.isNull.apply(this, arguments);
}

Room.prototype.getFriendlyCreeps = function(type) {
	return this.find(FIND_MY_CREEPS, {
		filter: (creep) => _.isNil(type) || creep.memory.role == type
	});
}

Room.prototype.countFriendly = function(type, includeSpawning, includeQueued) {
	let existingCount = this.getFriendlyCreeps(type).length;

	let spawningCount = 0;
	let queuedCount = 0;
	if (includeSpawning) {
		spawningCount = this.activeSpawners(type).length;
	}
	if (includeQueued) {
		queuedCount = this.memory.spawnQueue.filter((role) => role == type).length; 
	}

	return existingCount + spawningCount + queuedCount;
}

Room.prototype.activeSpawners = function(type) {
    return this.find(FIND_MY_SPAWNS, {
		filter: (spawner) => !_.isNil(spawner.spawning) && (!type || Memory.creeps[spawner.spawning.name].role == type)
	});
}

Room.prototype.availableSpawners = function() {
	return this.find(FIND_MY_SPAWNS, {
		filter: (spawner) => _.isNil(spawner.spawning)
	});
}

Room.prototype.getCreepFactory = function() {
	if (!this.creepFactory) {
		this.creepFactory = new CreepFactory(this);
	}
	return this.creepFactory;
}

Room.prototype.getRoleController = function() {
	if (!this.roleController) {
		this.roleController = new RoleController(this);
	}
	return this.roleController;
}

Creep.prototype.isAtCapacity = function() {
	return this.carry.energy >= this.carryCapacity;
}

Structure.prototype.getHitsPercent = function() {
	return (this.hits / this.hitsMax) * 100;
}

Structure.prototype.isAtCapacity = function() {
	return this.energy >= this.energyCapacity;
}

module.exports = {
	spawnQueues: function() {
		let result = {};
		for (let name in Game.rooms) {
			let room = Game.rooms[name];
			result[name] = room.memory.spawnQueue;
		}
		return result;
	}
}