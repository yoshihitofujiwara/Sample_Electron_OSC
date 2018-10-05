import fs from "fs";
import cheerio from "cheerio";
import electron from "electron";
import osc from "node-osc";


/*--------------------------------------------------------------------------
	config
--------------------------------------------------------------------------*/
let window = null;

// OSC送信先のIPとPORT
let oscClient = null;
let clientIP = null;
let clientPort = null;

// OSC受信PORT
let oscServer = null;
let serverPort = null;


// init call
load(setup);



/*--------------------------------------------------------------------------
	@load
--------------------------------------------------------------------------*/
function load(callback) {
	// SettingFile
	let file = electron.app.getAppPath("Resources") + "/settings.xml";

	fs.readFile(file, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			let $ = cheerio.load(data);
			let $settings = $("settings");

			clientIP = $settings.children("clientIP").text();
			clientPort = $settings.children("clientPort").text();
			serverPort = $settings.children("serverPort").text();
		}
		if (typeof callback == "function") callback();
	});
}



/*--------------------------------------------------------------------------
	@setup アプリのセットアップ
--------------------------------------------------------------------------*/
function setup(){
	//  初期化が完了した時の処理
	electron.app.on("ready", () =>{
		openWindow();
	});

	// 全てのウィンドウが閉じたときの処理
	electron.app.on("window-all-closed", () => {
		// macOSのとき以外はアプリケーションを終了させます
		if (process.platform !== "darwin") {
			closeWindow();
		}
	});

	// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
	electron.app.on("activate", () => {
		// ウィンドウが消えている場合は再度ウィンドウを作成する
		if (window === null) {
			openWindow();
		}
	});

	openWindow();
}


/*--------------------------------------------------------------------------
	@openWindow アプリ起動
--------------------------------------------------------------------------*/
function openWindow() {
	if (window != null) closeWindow();

	// ウィンドウ生成
	window = new electron.BrowserWindow({
		width: 1280,
		height: 700
	});

	// ウィンドウに表示するURLを指定
	window.loadFile("index.html");

	// デベロッパーツールの起動
	window.webContents.openDevTools();

	// ウィンドウが閉じられたときの処理
	window.on("closed", () => {
		closeWindow();
	});

	// アプリを落とすショートカット ctr + q
	electron.globalShortcut.register("ctrl+q", () => {
		closeWindow();
	});

	// create osc
	createServer();
	createClient();
};


/*--------------------------------------------------------------------------
	@closeWindow アプリ終了
--------------------------------------------------------------------------*/
function closeWindow() {
	if (oscServer) oscServer.kill();
	if (oscClient) oscClient.kill();

	electron.session.defaultSession.clearCache(() => { })

	if (window != null) {
		window.close();
		window = null;
	}
	electron.app.quit();
}


/*--------------------------------------------------------------------------
	@createServer OSC受信
--------------------------------------------------------------------------*/
function createServer() {
	oscServer = new osc.Server(serverPort);

	// # OSC受信
	// レンダープロセスからIPC通信を受け取る
	electron.ipcMain.on("renderer", (ipcRenderer, param) => {
		// IPC通信疎通確認
		ipcRenderer.sender.send("server", "========== Settings ==========");
		ipcRenderer.sender.send("server", "SettingFilePath: " + electron.app.getAppPath("Resources") + "/settings.xml");
		ipcRenderer.sender.send("server", "clientIP: " + clientIP);
		ipcRenderer.sender.send("server", "clientPort: " + clientPort);
		ipcRenderer.sender.send("server", "serverPort: " + serverPort);
		ipcRenderer.sender.send("server", "===========================");

		// OSC通信で受け取ったメッセージをIPC通信でレンダープロセスに送る
		oscServer.on("message", (msg, rinfo) => {
			ipcRenderer.sender.send("server", msg);
		});
	});
}


/*--------------------------------------------------------------------------
	@createClient OSC送信
--------------------------------------------------------------------------*/
function createClient() {
	// OSCクライアント（送信先IP, 送信先ポート）
	oscClient = new osc.Client(clientIP, clientPort);

	// IPC通信でレンダープロセスから受け取ったメッセージをOSCフォーマットに変換して送信
	electron.ipcMain.on("client", (ipcRenderer, param) => {
		let args = param.split(" ");
		let sendMsg = new osc.Message(args[0]);

		// 引数のキャストは、アプリに応じて調整
		for (let i = 1; i < args.length; i++) {
			if (i == 1) {
				sendMsg.append(+args[i]);
			} else {
				sendMsg.append(args[i]);
			}
		}

		oscClient.send(sendMsg);
	});
}
