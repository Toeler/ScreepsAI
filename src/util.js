module.exports = {
	each: function* each(obj) {
		for (let prop of Object.keys(obj)) {
			yield obj[prop];
		}
	},

	entries: function* entries(obj) {
		return Object.entries(obj);
	}
}