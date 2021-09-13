const pg = window.require("pg");

export function Client(){
	return pg.Client(Configuration());
}

export function Pool(){
	return new pg.Pool(Configuration());
}

function Configuration(){
	return {
		user: "postgres",
		host: "127.0.0.1",
		database: "satflex",
		password: "postgres",
		port: 5432
	};
}
