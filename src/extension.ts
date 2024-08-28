import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const provider = new rpgViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(rpgViewProvider.viewType, provider));
}

class rpgViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'rpg';

	private _view?: vscode.WebviewView;

	private monsterLife: number = 30;
	private defaultMonster: string = 'Frog.png';
	private listMonster: Array<string> = ['Frog.png','slime.png','Ogre.png', 'Mummy.png', 'wizard.png'];

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
			this.monsterLife--;
			this.updateMonsterStyle(event.textEditor.document.getText());
			this.updateMonsterLife(this.monsterLife);

			if (this.monsterLife === 0) {
				this.changeMonster();
				this.resetMonsterLife();
			}
		});
	}

	private updateMonsterStyle(text: string) {
		const webview = this._view?.webview;

		if (webview) {
				webview.postMessage({ command: 'updateMonsterStyle', value: text.length });
		}
	}

	private updateMonsterLife(lifePoint: number) {
		const webview = this._view?.webview;

		if (webview) {
				webview.postMessage({ command: 'updateMonsterLife', value: lifePoint });
		}
	}

	private changeMonster() {
			const webview = this._view?.webview;
			let anotherMonster = this.listMonster.filter(item => item !== this.defaultMonster);
			let random = Math.floor(Math.random() * anotherMonster.length);
			console.log(anotherMonster);
			this.defaultMonster = anotherMonster[random];

			if (webview) {
				const imageUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', this.defaultMonster));
	
					webview.postMessage({ command: 'changeMonster', value: imageUri.toString() });
			}
	}

	private resetMonsterLife() {
		this.monsterLife = 30;
		this.updateMonsterLife(this.monsterLife);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		const styleHealthUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'healthbar.css'));
		const imageMonsterUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'Frog.png'));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src ${webview.cspSource};">
				<link href="${styleMainUri}" rel="stylesheet">
				<link href="${styleHealthUri}" rel="stylesheet">
				<title>RPG</title>
			</head>
			<body id="body">

				<div class="box">

					<div style="display: block;">

						<div style="display: flex; justify-content: center; width: 100%;">
						<img id="monster" class="monster" src="${imageMonsterUri}" alt="Monster" />
						</div>
					</div>

						<div class="health-bar">
							<div class="health-indicator">
								<div class="hit"></div>
							</div>
						</div>

				</div>

				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
