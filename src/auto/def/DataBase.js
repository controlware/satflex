module.exports = {
	Client: () => {
		return require("pg").Client(module.exports.Configuration());
	},
	Pool: () => {
		return require("pg").Pool(module.exports.Configuration());
	},
	Configuration: () => {
		return {
			user: "postgres",
			host: "127.0.0.1",
			database: "satflex",
			password: "postgres",
			port: 5432
		}
	}
};
