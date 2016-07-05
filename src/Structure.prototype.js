['Controller', 'Extension', 'Link', 'Spawn', 'Tower', 'Storage', 'Wall'].forEach((module) => {
	require(`./Structures/${module}`);
});

Object.assign(Structure.prototype, {
	tick() {
		if (this.work) {
			this.work();
		}
	},

	isFull() {
		if (this.energyCapacity) {
			return this.energy === this.energyCapacity;
		} else if (this.storeCapacity) {
			return _.sum(this.store) === this.storeCapacity;
		}
		return true;
	},
	isNotFull() {
		return !this.isFull();
	},

	isEmpty() {
		if (this.energyCapacity) {
			return this.energy === 0;
		} else if (this.storeCapacity) {
			return _.sum(this.store) === 0;
		}
		return true;
	},
	isNotEmpty() {
		return !this.isEmpty();
	},

	getEnergyPercentage() {
		if (this.energyCapacity) {
			return (this.energy / this.energyCapacity) * 100;
		} else if (this.storeCapacity) {
			return (_.sum(this.store) / this.storeCapacity) * 100;
		}
		return 0;
	},

	getHitsPercentage() {
		return (this.hits / this.hitsMax) * 100;
	},

	needsRepair() {
		return this.getHitsPercentage() < 100;
	},

	needsTowerRepair() {
		return this.getHitsPercentage() < 50;
	},

	buildAccessRoads() {
		if (this.structureType === STRUCTURE_ROAD) {
			return;
		}
		
		for (let newPos of [{x:0, y:-1}, {x:-1, y:0}, {x:1, y:0}, {x:0, y:1}]) {
			const pos = new RoomPosition(this.pos.x + newPos.x, this.pos.y + newPos.y, this.room.name);
			const terrain = pos.lookFor('terrain');
			if (terrain === 'swamp' && pos.isOpen() && !pos.hasRoad()) {
				this.room.buildRoad(pos);
			}
		}
	}
});