import { ItemView, WorkspaceLeaf } from 'obsidian';
import { getAutoTags } from './AutoTaggerImpl';
import type { AutotaggerPluginSettings } from './AutotaggerPluginSettings';
import AutoTagger from './AutoTagger.svelte';
import { AUTOTAGGER_TYPE } from './../src/constants';

export default class AutotaggerView extends ItemView {
    settings: AutotaggerPluginSettings;
    autoTagger: AutoTagger;
    
    constructor(leaf: WorkspaceLeaf, settings: AutotaggerPluginSettings) {
        super(leaf);
        this.settings = settings;
        this.redraw = this.redraw.bind(this);
        
        this.registerEvent(this.app.metadataCache.on('resolved', this.redraw));
        this.registerEvent(this.app.metadataCache.on('changed', this.redraw));
        this.registerEvent(this.app.workspace.on('active-leaf-change', this.redraw))
    }

    getViewType(): string {
        return AUTOTAGGER_TYPE;
    }

    getDisplayText(): string {
        return 'Autottager links';
    }

    getIcon(): string {
        return 'price-tag-glyph';
    }

    onClose(): Promise<void> {

        return Promise.resolve();
    }


    async onOpen(): Promise<void> {
       console.log('opening');
       const autoTags: Map<string, string> = getAutoTags(this.app, this.settings);

       this.autoTagger = new AutoTagger({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target: (this as any).contentEl,
        props: {
            redraw: this.redraw,
            autoTags,
        },
      });
       // getAutoTags(this.app, this.settings);
    }

    public async redraw(): Promise<void> {
        console.log('redrawing');
        const autoTags = getAutoTags(this.app, this.settings);
        this.autoTagger?.$set({ autoTags });
        

    }
}
