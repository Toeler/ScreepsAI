const role = 'courier';
Creep.role[role] = role;
const addon = [MOVE, CARRY];
Creep.definitions[role] = {
	base: [MOVE, MOVE, CARRY, CARRY],
	addon: [addon],
	hasRoomFor: {
		[addon]: function(body) {
			return _.filter(body, (p) => p === CARRY).length < (this.room.getStorage() && this.room.getLinkCount() > 1 ? 10 : 100)
		}
	}
};
Object.assign(Creep.prototype, {
	tickCourier() {
		const targets = this.room.getStructuresNeedingEnergyDelivery();
		const storage = _.remove(targets, 'structureType', STRUCTURE_STORAGE);
		let dumpTarget = this.pos.findClosestByRange(targets) || (storage ? storage[0] : undefined);

		if (this.isFull()) {
			if (!dumpTarget) {
				dumpTarget = this.room.getControllerEnergyDropFlag();
			}

			if (this.memory.task != 'deliver') {
				this.say(`->${dumpTarget.name || dumpTarget.id}`);
			}

			this.memory.task = 'deliver';
		} else if (!dumpTarget || this.isEmpty()) {
			this.memory.task = 'pickup';
		}

		if (this.memory.task === 'pickup') {
			if (!this.memory.target) {
				this.memory.target = (this.room.getEnergySourceNeedingEnergy() || {}).id;
			}

			if (this.memory.target) {
				let target = Game.getObjectById(this.memory.target);
				
				if (target === dumpTarget) {
				    target = null;
				}

				let result;
				if (target) {
					result = this.takeEnergyFrom(target);
				}
				
				if (!target || result === OK || result === ERR_NOT_ENOUGH_ENERGY) {
					this.memory.target = '';
				}
			} else {
				this.deliverEnergyTo(dumpTarget);
			}
		} else {
			this.deliverEnergyTo(dumpTarget);
		}
	}
});

/* -------------------------------------------------- ROOM CODE -------------------------------------------------- */
Object.assign(Room.prototype, {
	getCouriers() {
		if (!this._couriers) {
			this._couriers = _.filter(this.getMyCreeps(), 'memory.role', role);
		}
		return this._couriers;
	},

	getCourierCount() {
		return this.getCouriers().length;
	},

	getCourierTargets() {
		return _.map(_.filter(this.getCouriers(), (courier) => !_.isUndefined(courier.memory.target)), 'memory.target');
	},

	needsCouriers() {
		const courierCount = this.getCourierCount();
		if (courierCount === 1 && this.getCouriers()[0].ticksToLive < 70) {
			return true;
		}

		const storage = this.getStorage();
		if (!storage || this.getLinkCount() === 0) {
			return courierCount < 2;
		} else if (storage.store.energy > 500000) {
			// TODO: Remove magic numbers
			return courierCount < Math.floor(storage.store.energy / 200000);
		}
		return courierCount < 1;
	}
});