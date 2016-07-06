const LEVEL = {
	DEBUG: 'DEBUG',
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR'
}

module.exports.setup = function setup() {
	Object.assign(Game, {
		log(level, msg) {
			console.log(`${level}: ${msg}`);
		},
		debug(msg) {
			if (Memory.debug) {
				this.log(LEVEL.DEBUG, msg);
			}
		},
		info(msg) {
			this.log(LEVEL.INFO, msg);
		},
		warn(msg) {
			this.log(LEVEL.WARN, msg);
		},
		error(msg) {
			this.log(LEVEL.ERROR, msg);
		},

		startStats() {
			Memory.statsBuffer = {};
			if (!Memory.stats) {
				Memory.stats = {};
			}
		},

		endStats() {
			Memory.stats = Memory.statsBuffer;
			delete Memory.statsBuffer;
		},

		submitStat(metric, values, tags) {
			if (_.isNumber(values)) {
				values = { value: values };
			}

			if (!Memory.statsBuffer[metric]) {
				Memory.statsBuffer[metric] = [];
			}
			Memory.statsBuffer[metric].push({ values: values, tags: tags });
		},

		calculateCost(parts) {
			return _.reduce(parts, (sum, part) =>
				sum + BODYPART_COST[_.isString(part) ? part : part.type]
			, 0);
		}
	});
}