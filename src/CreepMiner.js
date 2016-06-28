/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

module.exports = class CreepMiner extends CreepBase {
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
			[WORK, WORK, MOVE, MOVE], // 300
			[WORK, WORK, WORK, WORK, MOVE], // 450 
			[WORK, WORK, WORK, WORK, WORK, MOVE] // 550
		];
	}

	getAvailableSource() {
		return this.pos.findClosestByPath(FIND_SOURCES, {
			filter: (source) => {
				let sourceMemory = Memory.sources[source.id];
				return _.isUndefined(sourceMemory) || _.isUndefined(sourceMemory.miner) || sourceMemory.miner == this.id || _.isNil(Game.getObjectById(sourceMemory.miner));
			}
		});
	}

	setSourceToMine(source) {
		if (!source) {
			return;
		}

		if (_.isUndefined(Memory.sources[source.id])) {
			Memory.sources[source.id] = { id: source.id };
		}
		Memory.sources[source.id].miner = this.id;
		this.memory.source = source.id;

		let miningPosition = source.pos;
		if (this.pos.isNearTo(source)) {
			miningPosition = this.pos;
		}
		let nearestSpawn = miningPosition.findClosestByPath(FIND_MY_SPAWNS);
		let stepsToSpawn = nearestSpawn.pos.findPathTo(source).length * 2;
		this.memory.couriersNeeded = Math.max(1, Math.min(Math.round((stepsToSpawn * 7) / 100), 5));
	}

	runAction() {
		let source = Game.getObjectById(this.memory.source);
		if (_.isNil(source)) {
			source = this.getAvailableSource();

			if (!source) {
				return;
			}

			this.setSourceToMine(source);
		}

		if (this.pos.inRangeTo(source, 5)) {
			this.memory.isNearSource = true;
		} else {
			this.memory.isNearSource = false;
		}

		if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
			this.creep.moveTo(source);
		}
	}
}