/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Plugin, WorkspaceLeaf, PluginSettingTab, App, Setting, } from 'obsidian';
import { AUTOTAGGER_TYPE } from './constants';
import AutotaggerView from './AutotaggerView';
import type { AutotaggerPluginSettings } from './AutotaggerPluginSettings';
import { settings } from './stores';

// const removeMd = require('remove-markdown');

const VIEW_TYPE_AUTOTAGGER = 'autotagger';

export default class AutotaggerPlugin extends Plugin {
	options: AutotaggerPluginSettings;
    private view: AutotaggerView;

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_AUTOTAGGER)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		this.register(
			settings.subscribe((value) => {
				this.options = value;
			})
		);
		
		await this.loadOptions();
		this.registerView(
            AUTOTAGGER_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new AutotaggerView(leaf, this.options))
        );

		this.addRibbonIcon('price-tag-glyph', 'Show autoTagger panel', () =>
			this.showPanel()
		);
		this.addSettingTab(new AutotaggerPluginSettingsTab(this.app, this));
		
		if (this.app.workspace.layoutReady) {
			this.initLeaf();
		} else {
			this.registerEvent(
			this.app.workspace.on("layout-ready", this.initLeaf.bind(this))
			);
		}

	}
	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(AUTOTAGGER_TYPE).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: AUTOTAGGER_TYPE,
		});

	}

    showPanel() {
        this.app.workspace
            .getRightLeaf(true)
            .setViewState({ type: AUTOTAGGER_TYPE });
    }

	/* async loadSettings() {
		this.options = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}*/

	async saveSettings() {
		await this.saveData(this.options);
	}

	async loadOptions(): Promise<void> {
		const options = await this.loadData();
		settings.update((old) => {
			return {
				...old,
				...(options || {}),
			};
		});
	
		await this.saveData(this.options);
	}
	
	async writeOptions(
		changeOpts: (settings: AutotaggerPluginSettings) => Partial<AutotaggerPluginSettings>
	): Promise<void> {
		settings.update((old) => ({ ...old, ...changeOpts(old) }));
		await this.saveData(this.options);
	}

}

class AutotaggerPluginSettingsTab extends PluginSettingTab {
	plugin: AutotaggerPlugin;

	constructor(app: App, plugin: AutotaggerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for AutoTagger plugin' });
        new Setting(containerEl)
            .setName('Extract persons:')
            .addToggle(tc => tc
            .setValue(this.plugin.options.extractPeople)
            .onChange(async (value) => {
            console.debug('Extract people: ' + value);
            this.plugin.options.extractPeople = value;
            await this.plugin.saveSettings();
		}));
		new Setting(containerEl)
			.setName('Extract organization:')
			.addToggle(tc => tc
			.setValue(this.plugin.options.extractOrganizations)
			.onChange(async (value) => {
			console.debug('Extract organizations: ' + value);
			this.plugin.options.extractOrganizations = value;
			await this.plugin.saveSettings();
		}));
		new Setting(containerEl)
			.setName('Extract places:')
			.addToggle(tc => tc
			.setValue(this.plugin.options.extractPlaces)
			.onChange(async (value) => {
			console.debug('Extract places: ' + value);
			this.plugin.options.extractPlaces = value;
			await this.plugin.saveSettings();
		}));
		new Setting(containerEl)
			.setName('Extract acronyms:')
			.addToggle(tc => tc
			.setValue(this.plugin.options.extractAcronyms)
			.onChange(async (value) => {
			console.debug('Extract acronyms: ' + value);
			this.plugin.options.extractAcronyms = value;
			await this.plugin.saveSettings();
		}));

		new Setting(containerEl)
			.setName('Extract mentions:')
			.addToggle(tc => tc
			.setValue(this.plugin.options.extractMentions)
			.onChange(async (value) => {
			console.debug('Extract mentions: ' + value);
			this.plugin.options.extractMentions = value;
			await this.plugin.saveSettings();
		}));

	}

}