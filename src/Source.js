Object.assign(Source.prototype, {
	// TODO: Handle keepers
	needsHarvesters() {
		let harvesters = _.filter(this.room.getHarvesters(), 'memory.target', this.id);
		let workParts = _.reduce(harvesters, (sum, harvester) =>
			sum + _.filter(harvester.body, 'type', WORK).length
		, 0);
		
		return workParts < 5 && harvesters.length < this.getHarvestTiles();
	},

	getHarvestTiles() {
		return this.pos.getFreeEdges();
	},

	getBuildablePositions() {
		const range2Positions = this.pos.getBuildableTilesAtRange(2);
		const range1Positions = this.pos.getBuildableTilesAtRange(1);
		return _.filter(range2Positions, (pos) =>
			range1Positions.some((pos1) =>
				pos1.getRangeTo(pos) === 1
			)
		);
	},

	placeFlags() {
		const buildablePositions = _.sortBy(this.getBuildablePositions(), (pos) => this.pos.getActualDistanceTo(pos));
		buildablePositions.pop(); // Last pos is a walkway

		for (let [index, pos] of buildablePositions.entries()) {
			if (pos.isOpen() && _.filter(this.room.getFlags(), (f) => f.pos.x === pos.x && f.pos.y === pos.y).length === 0) { // TODO: Likely not the right solution
				if (index === 0) {
					this.room.placeLinkFlag(pos);
				} else if (index === 1 && this.isNearestToController() && !this.room.getStorage()) {
					this.room.placeStorageFlag(pos);
				} else {
					this.room.placeTowerFlag(pos);
				}
			}
		}
	},

	isNearestToController() {
		if (_.isUndefined(this._isNearestToController)) {
			this._isNearestToController = this === _.sortBy(this.room.getSources(), (source) => source.pos.getRangeTo(this.room.controller))[0];
		}
		return this._isNearestToController;
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getSources() {
		if (!this._sources) {
			this._sources = this.find(FIND_SOURCES);
		}
		return this._sources;
	},

	getSourceCount() {
		return this.getSources().length;
	},

	getSourcesNeedingHarvesters() {
		return _.filter(this.getSources(), (source) => source.needsHarvesters());
	}
});