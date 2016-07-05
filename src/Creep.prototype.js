Creep.role = {};
Creep.definitions = {};
['Harvester', 'Courier', 'Upgrader', 'Mailman', 'Builder'].forEach((module) => {
	require(`./Creeps/${module}`);
});

Object.assign(Creep.prototype, {
	tick() {
		if (this.ticksToLive === 1) {
	        Game.info(`${this.name} has decayed.`);
	    }
		
		this.attemptRenew();

		const creepFlag = Game.flags[this.name];
		if (!_.isUndefined(creepFlag)) {
			if (this.pos.getRangeTo(creepFlag) === 0) {
				return creepFlag.remove();
			}
			return this.moveTo(creepFlag);
		}

		if (this.shouldBeRecycled()) {
			return this.recycle();
		}

		if (this[`tick${_.capitalize(this.memory.role)}`]) {
			return this[`tick${_.capitalize(this.memory.role)}`]();
		} else {
			Game.warn(`No tick function for ${this.name} (${this.memory.role})`);
		}
	},

	needsRenew() {
		return !this.shouldBeRecycled() && this.ticksToLive / CREEP_LIFE_TIME < 0.5;
	},

	attemptRenew() {
		const spawn = this.getSpawn();
		if (this.needsRenew() && this.pos.getRangeTo(spawn) === 1 && !spawn.spawning) {
			spawn.renewCreep(this);
		}
	},

	getTargetSource() {
		return _.find(this.room.getSources(), 'id', this.memory.target);
	},

	getSpawn() {
		return this.room.getSpawns()[0] || Game.spawns[this.memory.spawn];
	},

	// TODO: Handle minerals
	isFull() {
		return this.carry.energy === this.carryCapacity;
	},
	isNotFull() {
		return !this.isFull();
	},

	isEmpty() {
		return this.carry.energy === 0;
	},
	isNotEmpty() {
		return !this.isEmpty();
	},
	getCarryPercent() {
		return (this.carry.energy / this.carry.capacity) * 100;
	},

	/* -------------------------------------------------- MOVEMENT -------------------------------------------------- */
	getRangeTo(target) {
		return this.pos.getRangeTo(target);
	},

	moveToAndDrop(target) {
		if (this.getRangeTo(target) > 1) {
			return this.moveTo(target);
		}
		return this.drop(RESOURCE_ENERGY);
	},

	moveToAndUpgrade(target) {
		if (this.getRangeTo(target) > 1) {
			this.moveTo(this.room.controller);
		}
		return this.attemptToUpgrade();
	},

	moveToAndBuild(target) {
		const range = this.getRangeTo(target);
		if (range > 1) {
			this.moveTo(target);
		} 
		if (range <= 3) {
			return this.build(target);
		}
	},

	moveToAndDismantle(target) {
		if (this.getRangeTo(target) === 1) {
			return this.dismantle(target);
		} else {
			return this.moveTo(target);
		}
	},

	moveToAndRepair(target) {
		const range = this.getRangeTo(target);
		if (range > 1) {
			this.moveTo(target);
		}
		if (range <= 3) {
			return this.repair(target);
		}
	},

	moveToAndHarvest(target) {
		if (this.getRangeTo(target) > 1) {
			return this.moveTo(target);
		} else {
			return this.harvest(target);
		}
	},

	/* -------------------------------------------------- FLAGS -------------------------------------------------- */
	getVisitedFlags() {
		return this.memory.visitedFlags || [];
	},

	hasVisitedFlag(flag) {
		return _.includes(this.getVisitedFlags(), flag);
	},

	findUnvisitedScoutFlags() {
		if (!this._unvisitedFlags) {
			this._unvisitedFlags = Game.getScoutFlags().filter(flag => !this.hasVisitedFlag(flag) );
		}
		return this._unvisitedFlags;
	},

	dismantleFlag(flag) {
		const structure = this.room.getStructureAt(flag.pos);
		if (structure) {
			this.moveToAndDismantle(structure);
		} else {
			flag.remove();
		}
	},

	/* -------------------------------------------------- WORK -------------------------------------------------- */
	attemptToUpgrade() {
		if (this.getRangeTo(this.room.controller) <= 2) {
			this.upgradeController(this.room.controller);
		}
	},

	takeEnergyFrom(target) {
		if (!target) {
			return ERR_INVALID_TARGET;
		}

		const range = this.getRangeTo(target);
		if (target instanceof Energy) {
			if (range > 1) {
				this.moveTo(target);
			}
			return this.pickup(target);
		}
		if (range > 1) {
			this.moveTo(target);
		}

		if (!target.transfer || target instanceof StructureTower) {
			return target.transferEnergy(this);
		}

		return target.transfer(this, RESOURCE_ENERGY);
	},

	deliverEnergyTo(target) {
		if (!target) {
			return ERR_INVALID_TARGET;
		}

		if (target instanceof Flag) {
			return this.deliverEnergyToFlag(target);
		}
		let result = this.transfer(target, RESOURCE_ENERGY);
		if (result == ERR_NOT_IN_RANGE) {
			return this.moveTo(target);
		}
		return result;
	},

	deliverEnergyToFlag(flag) {
		const range = this.getRangeTo(flag);
		if (range === 0) {
			this.drop(RESOURCE_ENERGY);
		} else {
			const blockingCreep = flag.pos.getCreep();
			if (range === 1 && blockingCreep) {
				blockingCreep.unblockFlag();
			}
			return this.moveTo(flag);
		}
	},

	unblockFlag() {
		return this.moveInRandomDirection();
	},

	moveInRandomDirection() {
		this.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]));
	},

	energyPercent() {
		return (this.carry.energy / this.carryCapacity) * 100;
	},

	needsOffloading() {
		return this.energyPercent() > 0.6;
	},

	needsEnergyDelivered() {
		if (_.includes(['harvester', 'courier', 'mailman'], this.memory.role)) {
			return false;
		}
		return (this.carry.energy / this.carryCapacity) < 0.6;
	},

	getCost() {
		return Game.calculateCost(this.body);
	},

	// TODO: Refactor this so each role can define their own
	shouldBeRecycled() {
		if (this.memory.role === Creep.role.builder) {
			return this.room.getConstructionSiteCount() < 1;
		}
		return false;
	},

	recycle() {
		const spawn = this.getSpawn();
		if (this.getRangeTo(spawn) > 1) {
			return this.moveTo(spawn);
		} else {
			Game.info(`${this.name} is no longer needed. Recycling...`);
			return spawn.recycleCreep(this);
		}
	}
});

/* -------------------------------------------------- SPAWN CODE -------------------------------------------------- */
Object.assign(StructureSpawn.prototype, {
	buildCreep(role, availableEnergy) {
		const definition = Creep.definitions[role];
		let body = definition.base;
		let cost = Game.calculateCost(body);

		let newPartIndex = 0;
		while (cost < availableEnergy && definition.addon[newPartIndex]) {
			const addon = definition.addon[newPartIndex];
			if (!definition.hasRoomFor || !definition.hasRoomFor[addon] || definition.hasRoomFor[addon].call(this, body)) {
				body = body.concat(definition.addon[newPartIndex]);
			} else {
				newPartIndex++;
			}
			cost = Game.calculateCost(body);
		}

		while (cost > availableEnergy && (definition.maxParts ? body.length <= definition.maxParts : true)) {
			body.pop();
			cost = Game.calculateCost(body);
		}

		const memory = (definition.getMemory && definition.getMemory.call(this)) || {};
		return this.spawnNewCreep(body, _.merge(memory, { role: role }));
	}
});