import type { App, MarkdownView } from 'obsidian';
import nlp from 'compromise';
import type { AutotaggerPluginSettings } from './AutotaggerPluginSettings';

export const getAutoTags = (app: App, settings: AutotaggerPluginSettings): Map<string, string> =>{
	if (app.workspace.activeLeaf) {
		const mdView = app.workspace.activeLeaf.view as MarkdownView;
		const doc = mdView.sourceMode.cmEditor;

		const content = doc.getValue().replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1');
		const plainAnalysis = nlp(content);

		const suggestions = [];
		if (settings.extractPlaces)
			suggestions.push(...plainAnalysis.places().json());
		if (settings.extractPeople)
			suggestions.push(...plainAnalysis.people().json());
		if (settings.extractOrganizations)
			suggestions.push(...plainAnalysis.organizations().json());

		console.log("plain suggestions:" +  JSON.stringify(suggestions));
		const suggestedTags = suggestions
			.map(suggestion => suggestion.terms
				.reduce((acc, curr) => acc = `${acc} ${curr.text}`, '')
			)
			.map(tag => cleanTag(tag));
		const cleanTags = new Map(suggestedTags.map(tag => [tag, tag]));
        console.log("content: " + JSON.stringify(suggestedTags));
        
		return cleanTags;
	}

	return new Map();
}

const cleanTag = (tag: string): string => {
    // eslint-disable-next-line no-useless-escape
    return tag.replace(/\[?([^\[\]]*)\]?\((.*?)\)/gm, '$1');
}