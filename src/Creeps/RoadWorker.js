const role = 'roadWorker'
Creep.role[role] = role;
Creep.definitions[role] = {
	base: [MOVE, WORK, WORK, CARRY]
};
Object.assign(Creep.prototype, {
	tickRoadWorker() {
		if (this.isEmpty()) {
			const closestEnergy = this.pos.findClosestByRange(this.room.getEnergyStockSources());
			this.takeEnergyFrom(closestEnergy);
		} else {
			const roads = _.filter(this.room.getRoads(), (r) => r.needsRepair());
			if (roads.length > 0) {
				const road = this.pos.findClosestByRange(roads);
				this.moveToAndRepair(road);
			}
		}
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getRoadWorkers() {
		if (!this._roadWorkers) {
			this._roadWorkers = _.filter(this.getMyCreeps(), 'memory.role', role);
		}
		return this._roadWorkers;
	},

	getRoadWorkerCount() {
		return this.getRoadWorkers().length;
	},

	needsRoadWorkers() {
		if (Game.time % 30 !== 0) {
			return false;
		}

		return this.getRoadWorkerCount() < 1 && this.hasDamagedRoads();
	}
});