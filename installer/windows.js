let electronInstaller = require("electron-winstaller");

resultPromise = electronInstaller.createWindowsInstaller({
	appDirectory: "/Users/muriloferes/Desktop/Projetos/SATFlex/V2/Executáveis/SAT-Flex-win32-ia32/",
	outputDirectory: "/Users/muriloferes/Desktop/Projetos/SATFlex/V2/Instaladores/",
	authors: "Murilo Strohmeier Feres",
	exe: "SAT-Flex.exe"
});

resultPromise.then(() => console.log("Instalador criado com sucesso!"), (e) => console.log(`Erro: ${e.message}`));
