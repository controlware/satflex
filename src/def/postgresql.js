export function Client(){
	return window.require("pg").Client(Configuration());
}

export function Pool(){
	return window.require("pg").Pool(Configuration());
}

function Configuration(){
	return {
		user: "postgres",
		host: "127.0.0.1",
		database: "satflex",
		password: "postgres",
		port: 5432,
	};
}
