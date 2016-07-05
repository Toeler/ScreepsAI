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

		calculateCost(parts) {
			return _.reduce(parts, (sum, part) =>
				sum + BODYPART_COST[_.isString(part) ? part : part.type]
			, 0);
		}
	});
}