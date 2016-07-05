const role = 'builder';
Creep.role[role] = role;
Creep.definitions[role] = {
	base: [MOVE, WORK, CARRY],
	addon: [[MOVE, WORK, CARRY]],
	maxParts: 50
};
Object.assign(Creep.prototype, {
	tickBuilder() {
		if (this.isFull()) {
			this.memory.task = 'work';
		} else if (this.isEmpty() || this.memory.task === 'stockup') {
			this.memory.task = 'stockup';

			let target;
			if (this.room.hasDroppedControllerEnergy()) {
				target = this.room.getDroppedControllerEnergy();
			} else if (this.room.getControllerLink() && this.room.getControllerLink().isNotEmpty()) {
				target = this.room.getControllerLink();
			} else if (this.room.getStorage() && this.room.getStorage().isNotEmpty()) {
				target = this.room.getStorage();
			}
			this.takeEnergyFrom(target);
		}

		if (this.memory.task === 'work') {
			this.attemptToUpgrade();

			const constructionSites = this.room.getConstructionSites();
			if (constructionSites.length) {
				const closestSite = this.pos.findClosestByRange(constructionSites);
				const result = this.moveToAndBuild(closestSite);
				if (result != OK) {
					// Try one more target to prevent getting stuck
				    this.moveToAndBuild(this.pos.findClosestByRange(_.without(constructionSites, closestSite)));
				}
			} else if (this.memory.target) {
				const target = Game.getObjectById(this.memory.target);
				if (target.hits < target.hitsMax) {
					this.moveToAndRepair(target);
				} else {
					this.memory.target = null;
				}
			} else {
				const mostDamagedStructure = this.room.getMostDamagedStructure();

				if (mostDamagedStructure) {
					this.memory.target = mostDamagedStructure.id;
				}
			}
		}
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getBuilders() {
		if (!this._builders) {
			this._builders = _.filter(this.getMyCreeps(), 'memory.role', role);
		}
		return this._builders;
	},

	getBuilderCount() {
		return this.getBuilders().length;
	},

	needsBuilders() {
		return this.getBuilderCount() < 1 && this.getConstructionSiteCount() > 0;
	}
});

/* -------------------------------------------------- SPAWN CODE -------------------------------------------------- */
/*Object.assign(StructureSpawn.prototype, {
	buildBuilder(availableEnergy) {
		const body = [MOVE, MOVE, WORK, CARRY];
		let cost = Game.calculateCost(body);
		while (cost < availableEnergy) {
			body.push(MOVE);
			body.push(CARRY);
			body.push(WORK);
			cost = Game.calculateCost(body);
		}

		while (cost > availableEnergy || body.length > 50) {
			body.pop();
			cost = Game.calculateCost(body);
		}

		this.spawnNewCreep(body, { role: Creep.role.builder });
	}
});*/