const role = 'upgrader'
Creep.role[role] = role;
const addon = [WORK, CARRY];
Creep.definitions[role] = {
	base: [MOVE, WORK, CARRY],
	addon: [addon, MOVE],
	hasRoomFor: {
		[addon]: function(body) {
			const workParts = _.filter(body, (p) => p === WORK).length;
			let workPartsNeeded = this.room.getMaxEnergyProducedPerTick() - this.room.getUpgraderWorkPartCount();
			if (this.room.controller.level === 8) {
				workPartsNeeded = Math.min(15, workPartsNeeded);
			}
			
			const storage = this.room.getStorage();
    	    let maxEnergy = this.room.getMaxEnergyProducedPerTick();
    	    if (storage && storage.getEnergyPercentage() < 50) {
    	        // Give us some overhead to store some energy
    	        maxEnergy *= (3/4);
    	    }

			if (this.room.controller.pos.getFreeEdges() > 1) {
				workPartsNeeded = Math.min(workPartsNeeded, maxEnergy / 2);
			}

			return workParts < workPartsNeeded;
		},
		[MOVE]: function(body) { return _.filter(body, (p) => p === MOVE).length < 5; }
	}
};
Object.assign(Creep.prototype, {
	tickUpgrader() {
		if (this.isNotEmpty()) {
			this.moveToAndUpgrade(this.room.controller);
		} else if (this.isEmpty() && this.room.hasDroppedControllerEnergy()) {
			this.takeEnergyFrom(this.room.getDroppedControllerEnergy());
		} else if (this.isEmpty() && this.room.getLinkCount() > 0) {
			const closestLink = this.pos.findClosestByRange(this.room.getLinks());
			if (this.pos.getRangeTo(closestLink) < 5) {
				this.takeEnergyFrom(closestLink);
			} else {
				this.moveToAndUpgrade(this.room.controller);
			}
		}
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getUpgraders() {
		if (!this._upgraders) {
			this._upgraders = _.filter(this.getMyCreeps(), 'memory.role', role);
		}
		return this._upgraders;
	},

	getUpgraderCount() {
		return this.getUpgraders().length;
	},

	needsUpgraders() {
		const storage = this.getStorage();
	    let maxEnergy = this.getMaxEnergyProducedPerTick();
	    if (storage && storage.getEnergyPercentage() < 50) {
	        // Give us some overhead to store some energy
	        maxEnergy *= (3/4);
	    }
		return this.getUpgraderCount() < this.controller.pos.getFreeEdges() &&
			(this.hasDroppedControllerEnergy() || this.getStorage()) &&
			this.getUpgraderWorkPartCount() < maxEnergy &&
			!this.getConstructionSites().length;
	},

	getUpgraderWorkPartCount() {
		if (_.isUndefined(this._upgraderWorkParts)) {
			this._upgraderWorkParts = _.reduce(this.getUpgraders(), (sum, upgrader) =>
				sum + _.filter(upgrader.body, 'type', WORK).length
			, 0);
		}
		return this._upgraderWorkParts;
	}
});