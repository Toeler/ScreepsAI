Object.assign(StructureLink.prototype, {
	tick() {
		const shouldTransfer = !this.isControllerLink() && !this.cooldown;
		const controllerLink = this.room.getControllerLink();
		const controllerLinkNeedsEnergy = controllerLink && controllerLink.energy < 100;
		if (shouldTransfer && controllerLinkNeedsEnergy) {
			this.transferEnergy(controllerLink);
		}
	}
});

Object.assign(Structure.prototype, {
	isLink() {
		return this.structureType === STRUCTURE_LINK;
	},
	isControllerLink() {
		return this.isLink() && this.pos.getRangeTo(this.room.controller) < 5;
	}
});