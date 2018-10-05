# Electron OSC通信

## Usage
1. 通信する2台のPCを用意(Mac or Win)
2. packegeディレクトリにあるアプリをPCに設置(windows版: OSC-win32-x64 | mac版: UDP-darwin-x64)
3. アプリ内の、設定ファイルを、2台のPCに合わせてIP/Port設定する。<br><br>
windows版: /package/UDP-win32-x64/resources/app/settings.xml<br>
mac版: /package/UDP-darwin-x64/UDP.app/Contents/Resources/app/settings.xml<br>
```
<?xml version="1.0" encoding="UTF-8"?>
<settings>
	<!-- 送信 IP・PORT -->
	<clientIP>000.00.0.00</clientIP>
	<clientPort>20000</clientPort>

	<!-- 受信 PORT -->
	<serverPort>22222</serverPort>
</settings>
```
4. 2台のPCのアプリを立ち上げ、OSC送信する内容を選択し「OSC送信」すると相互にOSC通信が行えます。
※ サンプルのOSC通信では、アドレスとint型のパラメーターしか渡していません。<br>
アプリに応じて受け渡しする値を調整する際は、下記Dev環境をカスタムして使用してください。


***

## Dev

### Directory
#### /src
コンパイル前のJS, SASS開発コード、コンパイル後htdocsに出力します。<br>
js/libs配下には、パッケージ化したい必要なライブラリ置きます。<br>
js/main配下には、メインプロセスの開発を行います。<br>
js/renderer配下には、レンダラプロセスの開発を行います。

#### /htdocs
Electron開発コード(js, css以外はここで開発します)

#### /packege
アプリケーション書き出し先ディレクトリ


### Command
#### NPM Package Install
```
npm install
```

#### 開発（Debug Mode ON）
```
gulp
```

#### 開発（Debug Mode OFF）
```
gulp -pro
```

#### Package for Windows
```
gulp win-pkg
```

#### Package for Mac
```
gulp mac-pkg
```
