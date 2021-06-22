/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Plugin, WorkspaceLeaf, PluginSettingTab, App, Setting, } from 'obsidian';
import { AUTOTAGGER_TYPE } from './constants';
import AutotaggerView from './AutotaggerView';

import type { AutotaggerPluginSettings } from './AutotaggerPluginSettings';
// const removeMd = require('remove-markdown');

const VIEW_TYPE_AUTOTAGGER = 'autotagger';

const DEFAULT_SETTINGS: AutotaggerPluginSettings = {
	extractOrganizations: true,
	extractPeople: true,
	extractPlaces: true,

}

export default class AutotaggerPlugin extends Plugin {
	settings: AutotaggerPluginSettings;
    private view: AutotaggerView;

	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_AUTOTAGGER)
			.forEach((leaf) => leaf.detach());
	}

	async onload(): Promise<void> {
		await this.loadSettings();
		this.registerView(
            AUTOTAGGER_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new AutotaggerView(leaf, this.settings))
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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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
            .setValue(this.plugin.settings.extractPeople)
            .onChange(async (value) => {
            console.debug('Extract people: ' + value);
            this.plugin.settings.extractPeople = value;
            await this.plugin.saveSettings();
		}));
		new Setting(containerEl)
			.setName('Extract organization:')
			.addToggle(tc => tc
			.setValue(this.plugin.settings.extractOrganizations)
			.onChange(async (value) => {
			console.debug('Extract organizations: ' + value);
			this.plugin.settings.extractOrganizations = value;
			await this.plugin.saveSettings();
		}));
		new Setting(containerEl)
			.setName('Extract places:')
			.addToggle(tc => tc
			.setValue(this.plugin.settings.extractPlaces)
			.onChange(async (value) => {
			console.debug('Extract places: ' + value);
			this.plugin.settings.extractPlaces = value;
			await this.plugin.saveSettings();
		}));
	}
}