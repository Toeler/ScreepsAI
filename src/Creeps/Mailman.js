const role = 'mailman'
Creep.role[role] = role;
Creep.definitions[role] = {
	base: [MOVE, CARRY],
	addon: [[MOVE, CARRY]]
};
Object.assign(Creep.prototype, {
	tickMailman() {
		if (this.isEmpty()) {
			this.memory.task = 'stock';
		} else if (this.isFull()) {
			this.memory.task = 'deliver';
		}

		if (this.memory.task === 'deliver') {
			const target = this.pos.findClosestByRange(_.filter(this.room.getMyCreeps(), (creep) => creep.needsEnergyDelivered()));
			this.deliverEnergyTo(target);
		} else if (!this.room.needsHarvesters()) {
		    const sources = _.reject(this.room.getEnergyStockSources(), 'structureType', STRUCTURE_EXTENSION);
			const closestEnergySource = this.pos.findClosestByRange(sources);
			this.takeEnergyFrom(closestEnergySource);
		}
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getMailmen() {
		if (!this._mailmen) {
			this._mailmen = _.filter(this.getMyCreeps(), 'memory.role', role);
		}
		return this._mailmen;
	},

	getMailmanCount() {
		return this.getMailmen().length;
	},

	needsMailmen() {
	    // TODO: More dynamic
		return this.getMailmanCount() < 2 && this.getMaxEnergy() < 2000 && (this.getUpgraderCount() > 0 || this.getBuilderCount() > 0) && this.getLinkCount() === 0;
	}
});