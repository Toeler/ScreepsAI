'use strict';

class RoleManager {
	constructor() {
		this.roleMap = {};
	}

	requireRole(role) {
		try {
			this.roleMap[role] = require(`./Creep${role}`);
		} catch(e) {
			console.log(`Unknown role ${role} (${e})`);
			this.roleMap[role] = null;
		}
	}

	roleExists(role) {
		if (_.isUndefined(this.roleMap[role])) {
			this.requireRole(role);
		}
		return !_.isNil(this.roleMap[role]);
	}

	getRoleClass(role) {
		if (this.roleExists(role)) {
			return this.roleMap[role];
		}
	}

	getRole(creep) {
		let roleClass = this.getRoleClass(creep.memory.role);
		if (roleClass) {
			return new roleClass(creep);
		}
	}

	getBodyParts(role, room) {
		let roleClass = this.getRoleClass(role);
		if (roleClass) {
			return roleClass.getPartsTierForRoom(room);
		}
	}
}

module.exports = new RoleManager();