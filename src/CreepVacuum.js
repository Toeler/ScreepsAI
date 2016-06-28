/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

module.exports = class CreepVacuum extends CreepBase {
	static get parts() {
		return [
			[MOVE, CARRY, MOVE, CARRY] // 200
		];
	}

	runAction() {
		if (!this.creep.isAtCapacity()) {
			let energy = this.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
				filter: (energy) => 
					!this.room.lookAt(energy).some((obj) => obj.type == "creep" && obj.memory && obj.memory.role == "Miner")
					&& !energy.pos.findInRange(FIND_MY_SPAWNS, 1).length
			});

			if (energy) {
				this.performActionOrMoveTo(this.creep, 'pickup', [energy[0]], energy[0]);
			} else {
				console.log(`No more energy for ${this.name} to pick up`);
				this.creep.suicide()
			}
		} else {
			let closestSpawner = this.pos.findClosestByPath(FIND_MY_SPAWNS);
			if (!closestSpawner) {
				console.log(`Could not find spawner for ${this.name} to drop energy off at`);
				this.creep.suicide();
			}
			if (this.pos.isNearTo(closestSpawner)) {
				this.performActionOrMoveTo(this.creep, 'transfer', [closestSpawner, RESOURCE_ENERGY], closestSpawner);
			} else {
				this.creep.moveTo(closestSpawner);
			}
		}
	}
}