const role = 'harvester';
Creep.role[role] = role;
Creep.definitions[role] = {
	base: [MOVE, WORK, CARRY],
	addon: [[WORK], [CARRY], [MOVE]],
	hasRoomFor: {
		[WORK]: function(body) { return _.filter(body, (p) => p === WORK).length < 5; },
		[CARRY]: function(body) { return _.filter(body, (p) => p === CARRY).length < 3; },
		[MOVE]: function(body) { return _.filter(body, (p) => p === MOVE).length < 5; },
	},
	getMemory: function() {
		return { target: this.pos.findClosestByRange(this.room.getSourcesNeedingHarvesters()).id }
	}
};
Object.assign(Creep.prototype, {
	tickHarvester() {
		if (this.isNotFull()) {
			return this.moveToAndHarvest(this.getTargetSource());
		} else if (this.room.getCourierCount() === 0 && this.getSpawn().getAvailableEnergy() < 300) {
			this.deliverEnergyTo(this.getSpawn());
		} else {
			const storage = this.room.getStorage();
			const towers = this.room.getTowers().filter(tower => tower.isNotFull());
			const closestTower = this.pos.findClosestByRange(towers);
			const links = this.room.getLinks();
			const closestLink = this.pos.findClosestByRange(links);
			const rangeToStore = storage ? this.pos.getRangeTo(storage) : 100;

			if (storage && storage.store.energy < (storage.storeCapacity * 0.3) && rangeToStore === 1) {
				this.deliverEnergyTo(storage);
			} else if (links.length && this.pos.getRangeTo(closestLink) <= 2 && closestLink.isNotFull()) {
				this.deliverEnergyTo(closestLink);
			} else if (storage && storage.store.energy < storage.storeCapacity && rangeToStore === 1) {
				this.deliverEnergyTo(storage);
			} else if (closestTower && this.pos.getRangeTo(closestTower) <= 2) {
				this.deliverEnergyTo(closestTower);
			} else {
				this.drop(RESOURCE_ENERGY);
			}
		}
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getHarvesters() {
		if (!this._harvesters) {
			this._harvesters = _.filter(this.getMyCreeps(), 'memory.role', role);
		}
		return this._harvesters;
	},

	getHarvesterCount() {
		return this.getHarvesters().length;
	},

	needsHarvesters() {
		return this.getSourcesNeedingHarvesters().length > 0;
	}
});