'use strict';

/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const util = require('util');
const each = util.each;

const game = require('Game.prototype');
require('RoomPosition.prototype');
require('Room.prototype');
require('Structure.prototype');
require('Creep.prototype');
require('Flag.prototype');
require('Source');

module.exports.loop = function() {
	game.setup();

	for (let name in Memory.creeps) {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}

	if (!Room.prototype.tick) {
		Game.error('No Room.prototype.tick');
	}
	if (Game.cpuLimit < 100) {
		Game.error(`CPU Limit is ${Game.cpuLimit}`);
	}

	for (let room of each(Game.rooms)) {
		room.tick();
	}
}