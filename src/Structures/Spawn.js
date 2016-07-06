Object.assign(StructureSpawn.prototype, {
	work() {
		if (this.spawning) {
			return;
		}

		let harvesterCount = this.room.getHarvesterCount();
		let availableEnergy = this.getAvailableEnergy();
		let maxEnergy = this.getMaxEnergy();
		let sources = this.room.getSourcesNeedingHarvesters();
		
		if (availableEnergy >= 300 && availableEnergy < maxEnergy) {
			if (harvesterCount < 1) {
				this.buildCreep(Creep.role.harvester, availableEnergy);
			} else if (this.room.needsCouriers()) {
				this.buildCreep(Creep.role.courier, availableEnergy);
			} else if (this.room.needsRoadWorkers()) {
				this.buildCreep(Creep.role.roadWorker, availableEnergy);
			}
		} else if (availableEnergy === maxEnergy) {
			if (this.room.needsHarvesters()) {
				this.buildCreep(Creep.role.harvester, availableEnergy);
			} else if (this.room.needsCouriers()) {
				this.buildCreep(Creep.role.courier, availableEnergy);
			} else if (this.room.needsUpgraders()) {
				this.buildCreep(Creep.role.upgrader, availableEnergy);
			} else if (this.room.needsMailmen()) {
				this.buildCreep(Creep.role.mailman, availableEnergy);
			} else if (this.room.needsBuilders()) {
				this.buildCreep(Creep.role.builder, availableEnergy);
			//} else if (this.needsScouts()) {
			//	this.buildScout(availableEnergy);
			//} else if (this.room.needsScoutHarvesters()) {
			//	this.buildScoutHarvester(availableEnergy);
			//} else if (this.room.needsClaimers()) {
			//	this.buildClaimer(availableEnergy);
			//} else if (this.room.needsWanderers()) {
			//	this.buildWanderer();
			//} else if (this.room.needsReservers()) {
			//	this.buildReserver(availableEnergy);
			//} else if (this.room.needsRemoteHarvesters()) {
			//	this.buildRemoteHarvester();
			} else if (this.room.needsRoadWorkers()) {
				this.buildCreep(Creep.role.roadWorker, availableEnergy);
			} else {
				this.buildExtensions();
			}
		} else {
			this.buildExtensions();
		}
	},

	getAvailableEnergy() {
		return this.room.energyAvailable;
	},

	getMaxEnergy() {
		return this.room.getMaxEnergy();
	},

	getName(role) {
		let count = 0;
		while (true) {
			let name = `${this.room.name}-${_.capitalize(role)}${++count}`;
			if (_.isUndefined(Game.creeps[name])) {
				return name;
			}
		}
	},

	buildExtensions() {
		// TODO: Refactor to reduce duplication
	    let range = 2;
		if (this.room.canBuildExtension()) {
			while (true) {
				for (let tile of this.pos.getOpenTilesAtRange(range)) {
					let canBuild = true;
					for (let newPos of [{x:0, y:-1}, {x:-1, y:0}, {x:1, y:0}, {x:0, y:1}]) {
						const pos = new RoomPosition(tile.x + newPos.x, tile.y + newPos.y, this.room.name);
						if (!pos.isOpen() || pos.x == this.pos.x || pos.x == this.pos.x - 1 || pos.x == this.pos.x + 1 || pos.y == this.pos.y || pos.y == this.pos.y - 1 || pos.y == this.pos.y + 1) {
							canBuild = false;
							break;
						}
					}
					
					if (canBuild) {
						if (tile.hasRoad()) {
					        console.log(`Tried to place extension, but had road at ${tile.x}:${tile.y}`);
					    }
						return this.room.createConstructionSite(tile.x, tile.y, STRUCTURE_EXTENSION);
						
					}
				}
				range++;
			}
		}
	},

	spawnNewCreep(body, memory) {
		const name = this.getName(Creep.role[memory.role]);
		const result = this.createCreep(body, name, memory);
		Game.info(`Spawning ${name} (${result === name ? "OK" : result})`);
		return result;
	},

	buildAccessRoads() {
		for (let x of [-1, 0, 1]) {
		    for (let y of [-1, 0, 1]) {
    			const pos = new RoomPosition(this.pos.x + x, this.pos.y + y, this.room.name);
    			if (pos.isOpen() && !pos.hasRoad()) {
    				this.room.buildRoad(pos);
    			}
		    }
		}
	}
});