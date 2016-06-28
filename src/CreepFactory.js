'use strict';

/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

const roleManager = require('roleManager');

const includeSpawning = true;
const excludeSpawning = false;
const includeQueued = true;
const excludeQueued = false;

module.exports = class CreepFactory {
	constructor(room) {
		this.room = room;

		if (!_.isArray(this.room.memory.spawnQueue)) {
			this.room.memory.spawnQueue = [];
		}
		this.spawnQueue = this.room.memory.spawnQueue;
	}

	static get requiredCreeps() {
		return [
			'Miner', 'Miner', 'Upgrader',
			'Builder', 'Transporter',
			'Builder', 'Transporter',
			'Upgrader'
		];
		return [
			'Miner', 'Miner', 'Miner',
			'Builder', 'Transporter', 'Transporter',
			'Miner', 'Miner', 'Builder',
			'Transporter', 'Transporter',
			'Archer', 'Archer', 'Healer',
			'Archer', 'Archer', 'Healer',
			'Archer', 'Archer', 'Archer',
			'Archer', 'Healer', 'Archer',
			'Archer', 'Archer', 'Healer'
		];
	}

	manageCouriers() {
		let couriers = this.room.getFriendlyCreeps('Courier');
		let orphanedCouriers = [];
		for (let courier of couriers) {
			// Remove any dead targets
			if (!Game.getObjectById(courier.memory.target)) {
				orphanedCouriers.push(courier);
			}
		}

		let workers = this.room.find(FIND_MY_CREEPS, {
			filter: (creep) => creep.memory.couriersNeeded > 0
		});
		let couriersNeededToSpawn = [];
		for (let worker of workers) {
			if (!worker.memory.couriers) {
				worker.memory.couriers = [];
			}
			// Remove any dead couriers
			for (let helper of worker.memory.couriers) {
				if (!Game.getObjectById(helper)) {
					worker.memory.couriers.splice(worker.memory.couriers.indexOf(helper), 1);
				}
			}

			// Reassign orphan couriers and request new ones if required
			for (let i = worker.memory.couriers.length; i < worker.memory.couriersNeeded; i++) {
				if (orphanedCouriers.length > 0) {
					let courier = orphanedCouriers.shift();
					courier.memory.target = worker.id;
					worker.memory.couriers.push(courier.id);
				} else {
					couriersNeededToSpawn.push(worker.id);
				}
			}

			// Miners cannot function without at least 1 worker, ensure we get 1 ASAP
			if (worker.memory.role == 'Miner' && worker.memory.couriers.length == 0) {
				for (let courier of couriers) {
					let target = Game.getObjectById(courier.memory.target);
					if (target.memory.role != 'Miner') {
						target.memory.couriers.splice(target.memory.couriers.indexOf(courier.id), 1);
						courier.memory.target = worker.id;
						worker.memory.couriers.push(courier.id);
						break;
					}
				}
			}
		}
		
		if (!this.spawnQueue.find((item) => item == 'Courier' || item.type == 'Courier') && this.room.activeSpawners('Courier').length == 0) {
			for (let workerId of couriersNeededToSpawn) {
				this.spawnQueue.unshift('Courier');
			}
		}

		// Hold onto orphaned couriers until we aren't spawning any new Miners
		if (!this.spawnQueue.find((item) => item == 'Miner' || item.type == 'Miner') && this.room.activeSpawners('Miner').length == 0 && this.room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Miner' && !_.isUndefined(creep.memory.couriersNeeded)}).length == 0) {
			orphanedCouriers.forEach((courier) => console.log(`${courier.name} is no longer needed (target = ${courier.memory.target})`) || courier.suicide());
		}
	}

	spawnRequiredCreeps() {
		if (!this.room.countFriendly('Miner', includeSpawning, excludeQueued) && !this.room.countFriendly('SimpleMiner', includeSpawning, excludeQueued) && this.spawnQueue[0] != 'SimpleMiner') {
			this.spawnQueue.unshift('SimpleMiner'); // Kickstart the room
		}

		let deadCreeps = this.room.find(FIND_MY_CREEPS, {
			filter: (creep) => creep.ticksToLive == 1
		});
		for (let creep of deadCreeps) {
			console.log(`${creep.name} is dead`);
		}

		let creepTypeCounts = {};
		for (let type of this.constructor.requiredCreeps) {
			creepTypeCounts[type] = (creepTypeCounts[type] || 0) + 1;

			let currentCountOfType = this.room.countFriendly(type, includeSpawning, includeQueued);
			if (creepTypeCounts[type] > currentCountOfType) {
				this.spawnQueue.push(type);
			}
		}
		
		this.manageCouriers();

		this.spawnCreepsInQueue();
	}

	spawnCreepsInQueue() {
		let availableSpawners = this.room.availableSpawners();
		let processingQueue = true;
		let usedSpawners = [];
		while (this.spawnQueue.length > 0) {
			let role = this.spawnQueue[0];
			if (_.isString(role)) {
				role = { type: role, memory: {} }
			}
			let body = roleManager.getBodyParts(role.type, this.room);
			let spawnerToUse = availableSpawners.find((spawner) => !spawner.spawning && usedSpawners.indexOf(spawner.id) == -1 && spawner.canCreateCreep(body) == OK);
			if (_.isUndefined(spawnerToUse)) {
				break;
			}

			let count = 0;
			let name = null;
			while (!name) {
				count++;
				let tryName = `${role.type}${count}`;
				if (_.isUndefined(Game.creeps[tryName])) {
					name = tryName;
				}
			}

			console.log(`Spawning ${name}`);
			if (!role.memory) {
				role.memory = {};
			}
			role.memory.role = role.type;
			spawnerToUse.createCreep(body, name, role.memory);
			usedSpawners.push(spawnerToUse.id);

			this.spawnQueue.shift();
		}
	}
}