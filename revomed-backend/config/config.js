let config = {
	backend: "https://dev.amont.studio:9001",
	frontend: "https://dev.amont.studio:4545",
	adminFrontend: "https://dev.amont.studio:3011",
	server: null
}

let configProd = {
	backend: "https://api.revomed.ru",
	frontend: "https://revomed.ru",
	adminFrontend: "https://admin.revomed.ru",
	server: null
}


let updateServer = (server) => {
	config.server = server;
}

module.exports.updateServer = updateServer;
module.exports.config = config;