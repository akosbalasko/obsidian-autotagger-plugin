import { App, Modal, debounce, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile, MarkdownView, WorkspaceLeaf, } from 'obsidian';
import nlp from 'compromise';
// const removeMd = require('remove-markdown');
interface AutotaggerPluginSettings {
	indexPrefix: string;
	extractOrganizations: boolean;
	extractPeople: boolean;
	extractPlaces: boolean;
}

const DEFAULT_SETTINGS: AutotaggerPluginSettings = {
	indexPrefix: '_Index_of_',
	extractOrganizations: true,
	extractPeople: true,
	extractPlaces: true,

}

export default class AutotaggerPlugin extends Plugin {
	settings: AutotaggerPluginSettings;
    public view: AutotaggerView;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.registerView(
            'autotagger-panel',
            (leaf: WorkspaceLeaf) => (this.view = new AutotaggerView(leaf))
        );
		this.addCommand({
			id: 'get-tags',
			name: 'Get Tags',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new AutotaggerPluginModal(this.app, this.settings).open();
					}
					return true;
				}
				return false;
			}
		});
		this.addRibbonIcon('broken-link', 'Show autoTagger panel', (e) =>
			this.showPanel()
		);
	}

    showPanel() {
        this.app.workspace
            .getRightLeaf(true)
            .setViewState({ type: 'autotagger-panel' });
    }
	onunload() {

		console.debug('unloading plugin');
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


}

class AutotaggerPluginModal extends Modal {
	constructor(app: App, settings: AutotaggerPluginSettings) {
		super(app);
		const mdView = this.app.workspace.activeLeaf.view as MarkdownView;
		const doc = mdView.sourceMode.cmEditor;
		  
		const content = doc.getValue();
		const plainAnalysis = nlp(content);

		const suggestions = [];
		if (settings.extractPlaces)
			suggestions.push(...plainAnalysis.places().json());
		if (settings.extractPeople)
			suggestions.push(...plainAnalysis.people().json());
		if (settings.extractOrganizations)
			suggestions.push(...plainAnalysis.organizations().json());

		console.log("plain suggestions:" +  suggestions);
		const suggestedTags = suggestions.map(suggestion => suggestion.terms.reduce((acc: any, curr: any) => acc = `${acc} ${curr.text}`, ''));
		const cleanTags = suggestedTags.map(tag => this.cleanTag(tag));
		console.log("content: " + JSON.stringify(suggestedTags));
	}

	cleanTag(tag: string): string {
		return tag.replace(/\[?([^\[\]]*)\]?\((.*?)\)/gm, '$1');
	}



}

class AutotaggerPluginSettingsTab extends PluginSettingTab {
	plugin: AutotaggerPlugin;

	constructor(app: App, plugin: AutotaggerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for AutoTagger plugin' });

		/*new Setting(containerEl)
			.setName('Index prefix:')
			.addText(text => text
				.setPlaceholder('_Index_of_')
				.setValue(this.plugin.settings.indexPrefix)
				.onChange(async (value) => {
					console.debug('Index prefix: ' + value);
					this.plugin.settings.indexPrefix = value;
					await this.plugin.saveSettings();
				}));
*/
	}
}
