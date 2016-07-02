
/**
 * Determine whether this structure's carry capacity is full
 * @return {boolean} true if carry is at capacity
 */
Structure.prototype.isFull = function() {
	if (!_.isUndefined(this.energy)) {
		return this.energy >= this.energyCapacity;
	}
	if (!_.isUndefined(this.store)) {
		return _.sum(this.store) < this.storeCapacity;
	}
}

/**
 * Determine whether this structure's carry capacity is not full
 * @return {boolean} true if carry is not at capacity
 */
Structure.prototype.isNotFull = function() {
	return !this.isFull();
}

/**
 * Determine whether this structure's carry capacity is empty
 * @return {boolean} true if carry is empty
 */
Structure.prototype.isEmpty = function() {
	if (!_.isUndefined(this.energy)) {
		return this.energy <= 0;
	}
	if (!_.isUndefined(this.store)) {
		return _.sum(this.store) <= 0;
	}
}

/**
 * Determine whether this structure's carry capacity is not empty
 * @return {boolean} true if carry is not empty
 */
Structure.prototype.isNotEmpty = function() {
	// TODO: Probably needs refactoring when we extract resources
	return !this.isEmpty();
}