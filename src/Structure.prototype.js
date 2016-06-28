Structure.prototype.isFull = function() {
	//console.log(this.structureType);
	if (!_.isUndefined(this.energy)) {
		return this.energy >= this.energyCapacity;
	}
	if (!_.isUndefined(this.store)) {
		return _.sum(this.store) < this.storeCapacity;
	}
}