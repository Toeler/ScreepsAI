Object.assign(StructureTower.prototype, {
	tick() {
		if (this.room.hasHostileCreeps() && this.isNotEmpty()) {
			this.attack(this.pos.findClosestByRange(this.room.getHostileCreeps()));
		} else if (this.getEnergyPercentage() > 50) {
			const damagedStructures = _.sortBy(_.filter(this.room.getDamagedStructures(), (s) => s.needsTowerRepair()), 'hits');
			const mostDamaged = damagedStructures[0];
			this.repair(mostDamaged);
		}
	}
});

Object.assign(Structure.prototype, {
	isTower() {
		return this.structureType === STRUCTURE_TOWER;
	},

	isSourceTower() {
		if (!this._isSourceTower) {
			const sourcesNearby = _.filter(this.room.getSources(), (source) => this.pos.getRangeTo(source) <= 2);
			this._isSourceTower = this.isTower() && sourcesNearby.length > 0;
		}
		return this._isSourceTower;
	}
});