const NEUTRAL_STRUCTURES = [
	STRUCTURE_ROAD,
	STRUCTURE_CONTAINER
];

Object.assign(Flag.prototype, {
	tick() {
		if (this.name.toLowerCase().includes('build')) {
			if (!this.pos.isOpen()) {
				Game.info(`Flag ${this.name} is not an open position`);
				return this.remove();
			}

			const parts = this.name.split('_');
			const target = parts[1];
			let shouldBuild = this.pos.isOpen();
			const isNeutralStructure = _.includes(NEUTRAL_STRUCTURES, target);
			if (shouldBuild && target && CONTROLLER_STRUCTURES[target] && (this.room.isOwnedByMe() || isNeutralStructure)) {
				const max = CONTROLLER_STRUCTURES[target][this.room.controller.level];
				const current = this.room.find(target).length;
				shouldBuild = current < max;
			}

			if (shouldBuild) {
				if (this.room.createConstructionSite(this.pos.x, this.pos.y, target) === OK) {
					this.remove();
				}
			}
		} else if (this.name.toLowerCase() === 'rampart') {
			// TODO
		} else if (this.isReserveFlag()) {
			this.performReserveFlagRole();
		}
	},

	isReserveFlag() {
		return this.name.includes('reserve');
	},

	performReserveFlagRole() {
		// TODO
	}
});