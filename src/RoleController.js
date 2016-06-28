'use strict';

const roleManager = require('roleManager');

module.exports = class RoleController {
	constructor(room) {
		this.room = room;
	}

	run() {
		for (let creep of this.room.getFriendlyCreeps()) {
			if (creep.spawning || !creep.memory.role) {
				continue;
			}

			let role = roleManager.getRole(creep);
			try {
				role && role.run();
			} catch (e) {
				console.log(`Error running role for ${creep.name} (${e.stack})`);
			}
		}
	}
}