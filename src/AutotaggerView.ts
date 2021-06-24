import { ItemView, WorkspaceLeaf } from 'obsidian';
import { getAutoTags } from './AutoTagger';
import type { AutotaggerPluginSettings } from './AutotaggerPluginSettings';
import AutoTagger from './AutoTagger.svelte';
import { AUTOTAGGER_TYPE } from './../src/constants';
import { settings } from './stores';

export default class AutotaggerView extends ItemView {
    options: AutotaggerPluginSettings;
    autoTagger: AutoTagger;
    
    constructor(leaf: WorkspaceLeaf, options: AutotaggerPluginSettings, ) {
        super(leaf);
        this.options = options;
        this.redraw = this.redraw.bind(this);
        
        this.registerEvent(this.app.metadataCache.on('resolved', this.redraw));
        this.registerEvent(this.app.metadataCache.on('changed', this.redraw));
        this.registerEvent(this.app.workspace.on('active-leaf-change', this.redraw));

        this.register(
			settings.subscribe((value) => {
                this.options = value;
                this.redraw();
			})
		);
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
       console.debug('opening');
       const autoTags: Map<string, string> = getAutoTags(this.app, this.options);

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
        const autoTags = getAutoTags(this.app, this.options);
        this.autoTagger?.$set({ autoTags });
        

    }
}
