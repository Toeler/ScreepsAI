Object.assign(StructureWall.prototype, {
	needsRepair() {
		return this.hits < 1000000;
	},
	
	needsTowerRepair() {
	    return this.needsRepair() && !this.room.needsHarvesters();
	}
});