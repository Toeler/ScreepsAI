/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const CreepBase = require('CreepBase');

module.exports = class CreepCourier extends CreepBase {
	static get parts() {
		return [
			[MOVE, CARRY, MOVE, CARRY], // 200
			[MOVE, CARRY, MOVE, CARRY, MOVE, CARRY] // 300
		];
	}

	runAction() {
		if (this.memory.isTransferringWithCourier) {
			return this.memory.isTransferringWithCourier = false;
		}

		let courierTarget = Game.getObjectById(this.memory.target);
		if (_.isNil(courierTarget)) {
			this.dropEnergyAtNearestSpawner();
		    return;
		}

		let target = courierTarget;
		// Getting energy if needed
		switch (courierTarget.memory.role) {
			case 'Miner': {
				if (!this.creep.isAtCapacity()) {
					let energy = target.pos.findInRange(FIND_DROPPED_ENERGY, 1)[0];
					return this.performActionOrMoveTo(this.creep, 'pickup', [energy], target);
				}
				target = this.getEnergyDropOff();
			} break;
			case 'Upgrader': {
				if (this.energy == 0) {
					return this.getEnergyFromNearestSpawner();
				}
			} break;
			default: {
				console.log(`${this.name} has unknown target role ${courierTarget.memory.role}`);
			} break;
		}
		
		// Dropping off energy
		let targetDirection = this.pos.findPathTo(target, { ignoreCreeps: true })[0].direction;

		let leftDir = targetDirection == 1 ? 8 : targetDirection - 1;
		let rightDir = targetDirection == 8 ? 1 : targetDirection + 1;

		let courier = this.pos.findClosestByPath(FIND_MY_CREEPS, {
			filter: (creep) =>
				creep.memory.role == this.memory.role
				&& !creep.isAtCapacity()
				&& this.pos.inRangeTo(creep, 1)
				&& [targetDirection, leftDir, rightDir].indexOf(this.pos.getDirectionTo(creep)) > -1
				&& !creep.memory.isTransferringWithCourier
				&& Game.getObjectById(creep.memory.target)
				&& Game.getObjectById(creep.memory.target).memory.role == courierTarget.memory.role 
		});

		let isNearTarget = this.pos.isNearTo(target);
		if (courier && !isNearTarget) {
			target = courier;
			target.memory.isTransferringWithCourier = true;
			isNearTarget = this.pos.isNearTo(target);
		}

		if (isNearTarget) {
			if (!target.isAtCapacity()) {
				this.creep.transfer(target, RESOURCE_ENERGY);
			} else if (target instanceof Spawn) {
				this.creep.drop(RESOURCE_ENERGY);
			}
		} else {
			this.creep.moveTo(target);
		}
	}
}