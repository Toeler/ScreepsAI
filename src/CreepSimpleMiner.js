/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

// Same as a Miner, but carrys its load back to the spawn. Used when the room is empty and we can't afford a Courier.
module.exports = class CreepSimpleMiner extends CreepBase {
	constructor(...args) {
		super(...args);
	}

	static get parts() {
		return [
			[WORK, WORK, MOVE, CARRY] // 300
		];
	}

	runAction() {
		if (this.creep.isAtCapacity()) {
			let spawner = this.getClosestSpawner();
			this.performActionOrMoveTo(this.creep, 'transfer', [spawner, RESOURCE_ENERGY], spawner);
		} else {
			let source = this.getClosestSource();
			this.performActionOrMoveTo(this.creep, 'harvest', [source], source);
		}
	}
}