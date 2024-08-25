import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const provider = new rpgViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(rpgViewProvider.viewType, provider));
}

class rpgViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'rpg';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, 'media')
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Escuta as alterações feitas no texto 
		vscode.window.onDidChangeTextEditorSelection(event => {
			this.updateMonsterStyle(event.textEditor.document.getText());
		});

			this.changeMonster();
	}

	private updateMonsterStyle(text: string) {
		const webview = this._view?.webview;

		if (webview) {
				webview.postMessage({ command: 'updateMonsterStyle', value: text.length });
		}
	}

	private changeMonster() {
		setInterval(() => {
			const webview = this._view?.webview;
			let random = Math.floor(Math.random() * 5);
			let listMonster = ['Frog.png','slime.png','Ogre.png', 'Mummy.png', 'wizard.png'];

			if (webview) {
				const imageUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', listMonster[random]));
	
					webview.postMessage({ command: 'changeMonster', src: imageUri.toString() });
			}
			
		}, 300000);
		
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		const imageMonsterUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'Frog.png'));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src ${webview.cspSource};">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>RPG</title>
			</head>
			<body>

				<div class="box">
					<img id="monster" class="monster" src="${imageMonsterUri}" alt="Monster" />
				</div>

				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
