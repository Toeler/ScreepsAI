'use strict';

/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const util = require('util');

if (!Memory.sources) {
	Memory.sources = {};
}

module.exports.loop = function() {
	for (let name in Memory.creeps) {
		let creep = Memory.creeps[name];
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}

	for (let name in Game.rooms) {
		let room = Game.rooms[name];
		room.getCreepFactory().spawnRequiredCreeps();
		room.getRoleController().run();
	}
}