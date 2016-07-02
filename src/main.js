'use strict';

const util = require('util');

module.exports.loop = function() {
	for (let name in Memory.creeps) {
		let creep = Memory.creeps[name];
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}

	for (let name in Game.rooms) {
		Game.rooms[name].tick();
	}
}