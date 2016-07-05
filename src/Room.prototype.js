Object.assign(Room.prototype, {
	tick() {
		Game.debug(`Tick room ${this.name}`);
		for (let structure of this.getMyStructures()) {
			structure.tick();
		}

		for (let creep of this.getMyCreeps()) {
			creep.tick();
		}

		for (let flag of this.getFlags()) {
			flag.tick();
		}

		if (this.isOwnedByMe()) {
			if (Game.time % 10 === 0) {
				this.placeFlags();
				this.placeStructures();
			}
		}
	},

	isOwnedByMe() {
		return this.controller && this.controller.my;
	},

	getMaxEnergyProducedPerTick() {
		return this.getSourceCount() * 10; // TODO: magic number
	},

	getMaxEnergy() {
		return this.energyCapacityAvailable;
	},

	getCenterPosition() {
		return new RoomPosition(25, 25, this.name); // TODO: magic numbers
	},

	getExits() {
		if (!this._exits) {
			this._exits = this.find(FIND_EXIT);
		}
		return [...this._exits];
	},

	/* -------------------------------------------------- STRUCTURE CODE -------------------------------------------------- */
	getStructures() {
		if (!this._structures) {
			this._structures = this.find(FIND_STRUCTURES);
		}
		return [...this._structures];
	},

	getDamagedStructures() {
		if (!this._damagedStructures) {
			this._damagedStructures = _.sortBy(this.getStructures(), (structure) => structure.getHitsPercentage());
		}
		return [...this._damagedStructures];
	},

	getMostDamagedStructure() {
		return this.getDamagedStructures()[0];
	},

	getMyStructures() {
		if (!this._myStructures) {
			this._myStructures = _.filter(this.getStructures(), 'my');
		}
		return [...this._myStructures];
	},

	placeStructures() {
		/*if (this.needsObserver()) {
			this.buildObserver();
		}

		if (this.needsExtractor()) {
			this.buildExtractor();
		}

		if (this.needsTerminal()) {
			this.buildTerminal();
		}*/

		if (Game.time % 100 === 0) {
			this.buildRoads();
		}
	},

	getSpawns() {
		return _.filter(this.getMyStructures(), 'structureType', STRUCTURE_SPAWN);
	},

	getSpawn() {
		return this.getSpawns()[0];
	},

	getStorage() {
		if (_.isUndefined(this._storage)) {
			this._storage = _.find(this.getMyStructures(), 'structureType', STRUCTURE_STORAGE) || null;
		}
		return this._storage;
	},

	getTowers() {
		if (!this._towers) {
			this._towers = _.filter(this.getMyStructures(), 'structureType', STRUCTURE_TOWER);
		}
		return [...this._towers];
	},
	getTowerCount() {
		return this.getTowers().length;
	},

	getContainers() {
		if (!this._containers) {
			this._containers = _.filter(this.getMyStructures(), 'structureType', STRUCTURE_CONTAINER);
		}
		return [...this._containers];
	},
	getContainerCount() {
		return this.getContainers().length;
	},

	getLinks() {
		if (!this._links) {
			this._links = _.filter(this.getMyStructures(), 'structureType', STRUCTURE_LINK);
		}
		return [...this._links];
	},
	getLinkCount() {
		return this.getLinks().length;
	},

	getControllerLink() {
		return _.find(this.getLinks(), (link) => link.isControllerLink());
	},

	getEnergySourceStructures() {
		return _.filter(this.getMyStructures(), 'energy');
	},

	/* -------------------------------------------------- CREEP CODE -------------------------------------------------- */
	getCreeps() {
		if (!this._creeps) {
			this._creeps = this.find(FIND_CREEPS);
		}
		return [...this._creeps];
	},

	getMyCreeps() {
		if (!this._myCreeps) {
			this._myCreeps = _.filter(this.getCreeps(), 'my');
		}
		return [...this._myCreeps];
	},

	getHostileCreeps() {
		return this.find(FIND_HOSTILE_CREEPS);
	},

	hasHostileCreeps() {
		return this.getHostileCreeps().length > 0;
	},

	/* -------------------------------------------------- FLAG CODE -------------------------------------------------- */
	getFlags() {
		return this.find(FIND_FLAGS, {
			filter: (f) => f.room == this
		});
	},

	placeFlag(pos, name) {
		return this.createFlag(pos, `${name}_${this.name}|${pos.x}:${pos.y}`);
	},

	placeBuildFlag(pos, structureType) {
		return this.placeFlag(pos, `BUILD_${structureType}`);
	},

	placeFlags() {
		if (this.controller) {
			this.controller.placeFlags();
		}
		this.placeConstructionFlags();
		for (let source of this.getSources()) {
			source.placeFlags();
		}
	},

	placeStorageFlag(pos) {
		return this.placeBuildFlag(pos, STRUCTURE_STORAGE);
	},

	placeLinkFlag(pos) {
		return this.placeBuildFlag(pos, STRUCTURE_LINK);
	},

	placeTowerFlag(pos) {
		return this.placeBuildFlag(pos, STRUCTURE_TOWER);
	},

	placeContainerFlag(pos) {
		return this.placeBuildFlag(pos, STRUCTURE_CONTAINER);
	},

	placeWallFlag(pos) {
		return this.placeBuildFlag(pos, STRUCTURE_WALL);
	},

	placeConstructionFlags() {
		this.placeWallFlags();
	},

	placeWallFlags() {
		const exits = this.getExits();
		for (let exit of exits) {
			const potentialSpots = exit.getOpenTilesAtRange(2);
			const realSpots = _.filter(potentialSpots, (spot) => 
				exits.every((exit) => exit.getRangeTo(spot) >= 2)
			);
			
			for (let pos of realSpots) {
				this.placeWallFlag(pos);
			}
		}
	},

	getControllerEnergyDropFlag() {
		return _.find(this.getFlags(), (flag) => flag.name.includes('CONTROLLER_ENERGY_DROP'));
	},

	/* -------------------------------------------------- EXTENSION CODE -------------------------------------------------- */
	getExtensions() {
		if (!this._extensions) {
			this._extensions = _.filter(this.getMyStructures(), 'structureType', STRUCTURE_EXTENSION);
		}
		return [...this._extensions];
	},

	canBuildExtension() {
		if (_.isUndefined(this._canBuildExtensions)) {
			const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.controller.level] || 0;
			this._canBuildExtensions = this.getExtensions().length < maxExtensions;
		}
		return this._canBuildExtensions;
	},

	/* -------------------------------------------------- CONSTRUCTION SITE CODE -------------------------------------------------- */
	getConstructionSites() {
		if (!this._constructionSites) {
			this._constructionSites = this.find(FIND_CONSTRUCTION_SITES);
		}
		return [...this._constructionSites];
	},

	getConstructionSiteCount() {
		return this.getConstructionSites().length;
	},

	buildRoad(pos) {
		this._buildRoadCalls = this._buildRoadCalls || 0;
		if (this._buildRoadCalls < 5 && this.getConstructionSiteCount() < 5) {
			const result = this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD); 
			if (result === OK) {
				this._buildRoadCalls++;
			}
			return result;
		}
	},

	buildRoads() {
		for (let structure of this.getMyStructures()) {
			if (structure.buildAccessRoads) {
				structure.buildAccessRoads();
			}
		}

		for (let source of this.getSources()) {
			const positions = source.pos.getOpenTilesAtRange(1);
			for (let pos of positions) {
				if (!pos.hasRoad()) {
					this.buildRoad(pos);
				}
			}
		}

		const pathTo = [this.controller].concat(this.getSources());
		const spawn = this.getSpawn();
		for (let target of pathTo) {
			for (let step of this.findPath(spawn.pos, target.pos)) {
				this.buildRoad(step);
			}
		}
	},

	/* -------------------------------------------------- ENERGY MANAGEMENT CODE -------------------------------------------------- */
	getDroppedControllerEnergy() {
		if (!this._droppedControllerEnergy) {
			const flag = this.getControllerEnergyDropFlag();
			this._droppedControllerEnergy = _.find(this.find(FIND_DROPPED_ENERGY), (energy) => energy.pos.getRangeTo(flag) === 0);
		}
		return this._droppedControllerEnergy;
	},

	hasDroppedControllerEnergy() {
		return !!this.getDroppedControllerEnergy();
	},

	getEnergyStockSources() {
		if (!this._energyStockSources) {
			this._energyStockSources = this.getEnergySourceStructures().concat([this.getDroppedControllerEnergy()]).concat([this.getStorage()]);
		}
		return [...this._energyStockSources];
	},

	getStructuresNeedingEnergyDelivery() {
		if (!this._structuresNeedingEnergyDelivery) {
			this._structuresNeedingEnergyDelivery = _.filter(this.getMyStructures(), (structure) => 
				!structure.isLink() && !structure.isSourceTower() && structure.isNotFull()
			);
		}
		return [...this._structuresNeedingEnergyDelivery];
	},

	getDroppedEnergy() {
		if (!this._droppedEnergy) {
			this._droppedEnergy = this.find(FIND_DROPPED_ENERGY);
		}
		return [...this._droppedEnergy];
	},

	getSortedDroppedEnergy() {
		return _.sortBy(this.getDroppedEnergy(), 'energy').reverse();
	},

	getEnergyNeedingPickup() {
		const targets = this.getCourierTargets();
		const dumpFlag = this.getControllerEnergyDropFlag();

		return _.filter(this.getSortedDroppedEnergy(), (energy) =>
			!_.contains(targets, energy.id) &&
			this.getCenterPosition().getRangeTo(energy) < 23 &&
			energy.pos.getRangeTo(dumpFlag) !== 0 
		);
	},

	getCreepsNeedingOffloading() {
		const targets = this.getCourierTargets();
		return _.filter(this.getHarvesters(), (harvester) => harvester.needsOffloading() && _.contains(targets, harvester.id));
	},

	getEnergySourcesNeedingEnergy() {
		if (this.getEnergyNeedingPickup().length > 0) {
			return this.getEnergyNeedingPickup();
		} else if (this.getCreepsNeedingOffloading().length > 0) {
			return this.getCreepsNeedingOffloading();
		} else if (this.getStorage() && this.getStorage().isNotEmpty()) {
			return [this.getStorage()];
		} else if (this.getTowers().length > 0) {
			return _.filter(this.getTowers(), (tower) => tower.isNotEmpty());
		}

		return [];
	},

	getEnergySourceNeedingEnergy() {
		return this.getEnergySourcesNeedingEnergy()[0];
	}
});