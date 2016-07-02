'use strict';

/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

require('Structure.prototype');
require('Room.prototype');
require('Room.Controller.prototype');
require('Creep.prototype');
require('Creep.Harvester.prototype'); // TODO: Dynamically load these based on creeps in play
require('Creep.Miner.prototype'); // TODO: Dynamically load these based on creeps in play
require('Creep.Courier.prototype'); // TODO: Dynamically load these based on creeps in play
require('Creep.Builder.prototype'); // TODO: Dynamically load these based on creeps in play
require('Creep.Upgrader.prototype'); // TODO: Dynamically load these based on creeps in play
require('Creep.Scavenger.prototype'); // TODO: Dynamically load these based on creeps in play

//const CreepFactory = require('CreepFactory');
//const RoleController = require('RoleController');

Object.prototype[Symbol.iterator] = function*() {
	for(let key of Object.keys(this)) {
		yield([ key, this[key] ])
	}
}

if (!_.isNil) {
	_.isNil = function() {
		return _.isUndefined.apply(this, arguments) || _.isNull.apply(this, arguments);
	}
} else {
	console.log(_.VERSION);
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