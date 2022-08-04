import {
	App,
	Editor,
	MarkdownView,
	MarkdownPostProcessor,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	datatypesFolder: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	datatypesFolder: '/Datatypes'
}

export default class DatatypePlugin extends Plugin {
	settings: MyPluginSettings;

	postprocessors: Map<string, MarkdownPostProcessor> = new Map();

	async renderDatatype(el, source, obj): Promise<void> {
		el.innerHTML = '<div class=".datatype-object">datatype here</div>';
	}

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addCommand({
			id: "insert-datatype",
			name: "Insert Datatype",
			editorCallback: (editor, view) => {
				let modal = new InsertDatatypeModal(this.app);
				modal.onClose = () => {
					editor.getDoc().replaceSelection(
						"```dtype\ntype: hello\n```"
					);
					const cursor = editor.getCursor();
					editor.setCursor(cursor.line - 1);
				};
				modal.open();
			}
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((element, context) => {
			const objects = element.querySelectorAll("dtype");

			for (let index = 0; index < datatypes.length; index++) {
			  const datatype = datatypes.item(index);
			  const text = codeblock.innerText.trim();

			  if (isEmoji) {
				context.addChild(new Emoji(codeblock, text));
			  }
			}
		});

		this.registerMarkdownCodeBlockProcessor('dtype', async (source: string, el: HTMLElement, ctx) => {
			let userOptions = {};
			let error = null;

			let lines = source.split('\n');

			let args: { [key: string]: string } = {};
			for (let line of lines) {
				let [key, value] = line.split(':');
				args[key] = value.trim();
			}

			// get the value of the 'type' entry in args
			if (args['type'] == "hello") {
				el.innerHTML = "Hello, World!</div>";
			} else {
				error = "Unknown datatype '" + args['type'] + "'; install a plugin.";
			}

			if (error !== null) {
				const errorNode = document.createElement('div');
				errorNode.innerHTML = error;
				errorNode.addClass("obsidian-datatype-error");
				el.appendChild(errorNode);
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class InsertDatatypeModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('hello');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: DatatypePlugin;

	constructor(app: App, plugin: DatatypePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Datatypes'});

		new Setting(containerEl)
			.setName('Datatypes Folder (relative to Vault root)')
			.addText(text => text
				.setPlaceholder('/Datatypes')
				.setValue(this.plugin.settings.datatypesFolder)
				.onChange(async (value) => {
					console.log('New Datatypes folder: ' + value);
					this.plugin.settings.datatypesFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
