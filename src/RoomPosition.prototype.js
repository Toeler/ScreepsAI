Object.assign(RoomPosition.prototype, {
	getUniqueId() {
		return `${this.roomName}|${this.x}:${this.y}`;
	},

	getRoom() {
		return Game.rooms[this.roomName];
	},

	getActualDistanceTo(pos) {
		return Math.sqrt(Math.pow(this.x - pos.x, 2) + Math.pow(this.y - pos.y, 2));
	},

	getCreep() {
		return this.lookFor(LOOK_CREEPS)[0];
	},

	getFreeEdges() {
		if (!Memory.freeEdges) {
			Memory.freeEdges = {};
		}
		let id = this.getUniqueId();
		if (_.isUndefined(Memory.freeEdges[id])) {
			Memory.freeEdges[id] = this.getOpenTilesAtRange().length;
		}
		return Memory.freeEdges[id];
	},

	getOpenTilesAtRange(range = 1) {
		return _.filter(this.getBuildableTilesAtRange(range), (pos) => pos.isOpen());
	},

	getBuildableTilesAtRange(range = 1) {
		const openTiles = [];

		const top = Math.max(this.y - range, 0);
		const bottom = Math.min(this.y + range, 49);
		const left = Math.max(this.x - range, 0);
		const right = Math.min(this.x + range, 49);

		const surroundingTiles = this.getRoom().lookAtArea(top, left, bottom, right, true);
		for (let tile of surroundingTiles) {
			const pos = new RoomPosition(tile.x, tile.y, this.roomName);
			if (this.getRangeTo(pos) === range && pos.isBuildable()) {
				openTiles.push(pos);
			}
		}
		
		return _.uniq(openTiles, (pos) => `${pos.x}|${pos.y}`);
	},

	isOpen() {
		return this.isBuildable() && !this.hasStructure() && !this.hasConstructionSite();
	},

	isBuildable() {
		let terrain = this.lookFor('terrain');
		return terrain === 'swamp' || terrain === 'plain';
	},

	hasStructure() {
		if (_.isUndefined(this._hasStructure)) {
			this._hasStructure = _.reject(this.lookFor('structure'), 'structureType', STRUCTURE_ROAD).length > 0;
		}
		return this._hasStructure;
	},

	getStructure() {
		if (_.isUndefined(this._structure)) {
			this._structure = _.reject(this.lookFor('structure'), 'structureType', STRUCTURE_ROAD)[0];
		}
		return this._structure;
	},

	hasConstructionSite() {
		if (_.isUndefined(this._hasConstructionSite)) {
			this._hasConstructionSite = this.lookFor('constructionSite').length > 0
		}
		return this._hasConstructionSite;
	},

	hasRoad() {
		return !_.isUndefined(_.find(this.lookFor('structure'), 'structureType', STRUCTURE_ROAD));
	}
});