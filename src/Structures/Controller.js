Object.assign(StructureController.prototype, {
	placeFlags() {
		if (!Memory.structures) {
	        Memory.structures = {};
	    }
	    if (!Memory.structures[this.id]) {
	        Memory.structures[this.id] = {};
	    }
	    const memory = Memory.structures[this.id];
	    
	    if (memory.link) {
	        const linkPos = new RoomPosition(memory.link.x, memory.link.y, this.room.name);
	        const structure = linkPos.getStructure();
	        if (structure && structure.structureType !== STRUCTURE_LINK && structure.structureType !== STRUCTURE_ROAD) {
	            delete memory.link;
	        }
	    }
	    if (memory.energyDrop) {
	        const energyDropPos = new RoomPosition(memory.energyDrop.x, memory.energyDrop.y, this.room.name);
	        const structure = energyDropPos.getStructure();
	        if (structure && structure.structureType !== STRUCTURE_ROAD) {
	            delete memory.link;
	        }
	    }
		const buildablePositions = [...this.pos.getBuildableTilesAtRange(2)];
		const dropSpot = _.find(buildablePositions, pos => pos.x === this.pos.x || pos.y === this.pos.y) || buildablePositions[0];
		if (!memory.energyDrop) {
		    memory.energyDrop = dropSpot;
		    this.room.placeFlag(memory.energyDrop, 'CONTROLLER_ENERGY_DROP');
		}
		_.remove(buildablePositions, (pos) => pos === dropSpot);
		_.sortBy(buildablePositions, (pos) => pos.getRangeTo(dropSpot));
		if (!memory.link) {
		    memory.link = _.find(buildablePositions, (p) => p.isOpen());
		    this.room.placeBuildFlag(memory.link, STRUCTURE_LINK);
		}
	}
});