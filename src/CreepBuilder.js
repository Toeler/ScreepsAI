/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

module.exports = class CreepBuilder extends CreepBase {
	static get parts() {
		return [
			[WORK, WORK, CARRY, MOVE], // 300
			[WORK, WORK, CARRY, CARRY, MOVE] // 350
		];
	}

	// Any damages rampart takes priority over other structures
	getMostDamagedStructure() {
		let damagedStructures = this.room.find(FIND_STRUCTURES, {
			filter: (structure) => 
				structure.structureType == STRUCTURE_ROAD
					? structure.getHitsPercent() < 50
					: structure.hits < structure.hitsMax
		});

		
		damagedStructures.sort((a, b) => 
			(b.structureType == STRUCTURE_RAMPART - a.structureType == STRUCTURE_RAMPART)
			|| a.getHitsPercent() > b.getHitsPercent()
		);

		return damagedStructures[0];
	}

	repairAnyDamagedStructures() {
		let damagedStructure = this.getMostDamagedStructure();
		if (damagedStructure) {
			if (this.creep.repair(damagedStructure) == ERR_NOT_IN_RANGE) {
				this.creep.moveTo(damagedStructure);
			}
			return damagedStructure;
		}
	}

	// Build:
	//  - Closest non-road started construction
	//  - Closest non-road unstarted construction
	//  - Closest road started construction
	//  - Closest road unstarted construction
	buildAnyConstructions() {
		let constructions = this.room.find(FIND_MY_CONSTRUCTION_SITES);
		constructions.sort((a, b) => (a.structureType == STRUCTURE_ROAD - b.structureType == STRUCTURE_ROAD) || b.progress - a.progress || this.pos.getRangeTo(a) - this.pos.getRangeTo(b));
		let construction = constructions[0];
		if (construction) {
			if (this.pos.inRangeTo(construction, 0)) {
				console.log('For some reason we suicide here?');
			}

			if (this.creep.build(construction) == ERR_NOT_IN_RANGE) {
				this.creep.moveTo(construction);
			}
			return;
		}
	}

	runAction() {
		if (this.energy == 0) {
			return this.getEnergyFromNearestSpawner();
		}
		if (!this.repairAnyDamagedStructures()) {
			this.buildAnyConstructions();
		}
	}
}