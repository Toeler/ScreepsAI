const includeSpawning = true;

const PRIORITY = {
	LOW: 1,
	MEDIUM: 2,
	HIGH: 3,
	IMMEDIATE: 4	
}

Room.prototype.runRoomController = function() {
	if (!this.memory.spawnQueue) {
		this.memory.spawnQueue = [];
	}

	let creeps = this.getFriendlyCreeps(null, includeSpawning);
	let miners = creeps.filter((creep) => creep.memory.role == Creep.miner);
	let harvesters = creeps.filter((creep) => creep.memory.role == Creep.harvester);
	let inactiveMiners = miners.filter((miner) => !Game.getObjectById(miner.memory.target)).concat(harvesters.filter((miner) => !Game.getObjectById(miner.memory.target)));
	let couriers = creeps.filter((creep) => creep.memory.role == Creep.courier);
	let inactiveCouriers = couriers.filter((courier) => !Game.getObjectById(courier.memory.target));
	let newMinerSpeed = Creep.getHighestSpawnableTierMiningSpeed(this);
	let sources = this.getSources();

	// Ensure we always have at least 1 Harvester or Miner/Courier combo so we don't run dry
	if (miners.length == 0) {
		if (couriers.length == 0 && harvesters.length == 0) {
			this.queueSpawnIfNotPresent(Creep.harvester, PRIORITY.IMMEDIATE);
		} else {
			this.queueSpawnIfNotPresent(Creep.miner, PRIORITY.IMMEDIATE);
		}
	} else if (couriers.length == 0) {
		this.queueSpawnIfNotPresent(Creep.courier, PRIORITY.IMMEDIATE);
	}

	// Check all sources have enough miners and couriers
	// TODO: Sort sources by proximity to a spawn
	for (let source of sources) {
		let minersOnSource = miners.filter((miner) => miner.memory.target == source.id);
		let harvestSpeed = minersOnSource.reduce((sum, miner) => sum + miner.getMiningSpeed(), 0);
		let sourceSpeedNeeded = SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME;

		if (sourceSpeedNeeded - harvestSpeed > newMinerSpeed) {
			if (inactiveMiners.length > 0) {
				let miner = inactiveMiners.shift();
				miner.setTarget(source);
				minersOnSource.push(miner.id);
			} else {
				this.queueSpawnIfNotPresent(Creep.miner, PRIORITY.HIGH);
			}
		}

		let nearestDropOff = this.getClosestEnergyDropOff(source, (structure) => !source.pos.inRangeTo(structure, 1));
		let couriersOnSource = couriers.filter((courier) => courier.memory.target == source.id);
		let courierSpeed = couriersOnSource.reduce((sum, courier) => sum + courier.getCourierSpeed(source), 0);
		console.log(courierSpeed);
		if (courierSpeed < harvestSpeed) {
			if (inactiveCouriers.length > 0) {
				let courier = inactiveCouriers.shift();
				courier.setTarget(source);
				couriersOnSource.push(courier.id);
			} else {
				this.queueSpawnIfNotPresent(Creep.courier, PRIORITY.HIGH);
			}
		}
	}
	
	// Check all creeps have the required number of couriers
	if (!this.spawnQueueContains(Creep.courier)) {
		for (let creep of creeps) {
			let requiredCouriers = creep.memory.requiredCouriers;
			let couriersAssignedToCreep = couriers.filter((courier) => courier.memory.target == creep.id);
			if (requiredCouriers && couriersAssignedToCreep.length && requiredCouriers < couriersAssignedToCreep.length) {
				if (inactiveCouriers.length > 0) {
					let courier = inactiveCouriers.shift();
					courier.setTarget(source);
					couriersAssignedToCreep.push(courier);
				} else {
					this.queueSpawnIfNotPresent(Creep.courier, PRIORITY.HIGH);
					break;
				}
			}
		}
	}

	// Check all creeps have the needed number of couriers
	if (!this.spawnQueueContains(Creep.courier)) {
		for (let creep of creeps) {
			let neededCouriers = creep.memory.neededCouriers;
			let couriersAssignedToCreep = couriers.filter((courier) => courier.memory.target == creep.id);
			if (neededCouriers && couriersAssignedToCreep.length && neededCouriers < couriersAssignedToCreep.length) {
				if (inactiveCouriers.length > 0) {
					let courier = inactiveCouriers.shift();
					courier.setTarget(source);
					couriersAssignedToCreep.push(courier);
				} else {
					this.queueSpawnIfNotPresent(Creep.courier, PRIORITY.MEDIUM);
					break;
				}
			}
		}
	}

	// Spawn required creeps with priority
	this.spawnNextInQueue();
}


// TODO: Handle pushing extra params
Room.prototype.queueSpawn = function(role, priority) {
	this.memory.spawnQueue.push({
		role: role,
		priority: priority
	});
}

Room.prototype.queueSpawnIfNotPresent = function(role, priority) {
	let existing = this.memory.spawnQueue.filter((queuedSpawn) => queuedSpawn.role == role);
	if (existing.length == 0) {
		this.queueSpawn(role, priority);
	} else if (!existing.some((queuedSpawn) => queuedSpawn.priority >= priority)) {
		// If we have one lower priority, update it
		let lowestPriority = existing.filter((queuedSpawn) => queuedSpawn.priority < priority).sort((a, b) => a.priority - b.priority)[0];
		if (lowestPriority) {
			lowestPriority.priority = priority;
		}
	}
}

Room.prototype.spawnQueueContains = function(role, priority) {
	return this.memory.spawnQueue.some((queuedSpawn) =>
		queuedSpawn.role == role && queuedSpawn.priority >= priority
	);
}

Room.prototype.spawnNextInQueue = function() {
	let spawnQueue = this.memory.spawnQueue = _.sortBy(this.memory.spawnQueue, 'priority').reverse(); // Replace by _.orderBy in lodash 4.0
	let availableSpawns = this.find(FIND_MY_SPAWNS, { filter: (spawn) => _.isNil(spawn.spawning) });
	while (spawnQueue.length > 0 && availableSpawns.length > 0) {
		let queuedItem = spawnQueue[0];
		let bodyParts = Creep.getHighestSpawnableTierBodyparts(this, queuedItem.role);
		let spawnToUse = availableSpawns.find((spawn) =>
			!spawn.spawning && spawn.canCreateCreep(bodyParts) == OK
		);
		if (_.isUndefined(spawnToUse)) {
			break;
		}

		let name = getNameForNewCreep(queuedItem.role);

		console.log(`Spawning ${name}`);
		let memory = {
			role: queuedItem.role
		};

		spawnToUse.createCreep(bodyParts, name, memory);
		_.remove(availableSpawns, spawnToUse);

		spawnQueue.shift();
	}
}

function getNameForNewCreep(role) {
	let count = 0;
	while (true) {
		count++;
		let name = `${role}${count}`;
		if (_.isUndefined(Game.creeps[name])) {
			return name;
		}
	}
}