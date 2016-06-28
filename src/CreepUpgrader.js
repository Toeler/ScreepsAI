/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

module.exports = class CreepUpgrader extends CreepBase {
	constructor(...args) {
		super(...args);
		if (!this.memory.couriers) {
			this.memory.couriers = [];
		}
		if (!this.memory.couriersNeeded) {
			this.memory.couriersNeeded = 1;
		}
	}

	static get parts() {
		return [
			[WORK, CARRY, CARRY, MOVE, MOVE], // 300
			[WORK, WORK, CARRY, CARRY, MOVE, MOVE], // 400
		];
	}

	runAction() {
		if (this.energy == 0) {
			return this.getEnergyFromNearestSpawner();
		}

		if(this.creep.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(this.room.controller);
		}
	}
}