export function Client(){
	return window.pg.Client(Configuration());
}

export function Pool(){
	return window.pg.Pool(Configuration());
}

function Configuration(){
	return {
		user: "postgres",
		host: "localhost",
		database: "satflex",
		password: "postgres",
		port: 5432,
	};
}
