import type { App, MarkdownView } from 'obsidian';
import nlp from 'compromise';
import type { AutotaggerPluginSettings } from './AutotaggerPluginSettings';

export const getAutoTags = (app: App, settings: AutotaggerPluginSettings): Map<string, string> =>{
	if (app.workspace.activeLeaf) {
		const mdView = app.workspace.activeLeaf.view as MarkdownView;
		const doc = mdView.sourceMode.cmEditor;

		const content = doc.getValue().replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1');
		const plainAnalysis = nlp(content);
		console.log(JSON.stringify(plainAnalysis));
		const suggestions = [];
		if (settings.extractPlaces)
			suggestions.push(...plainAnalysis.places().json());
		if (settings.extractPeople)
			suggestions.push(...plainAnalysis.people().json());
		if (settings.extractOrganizations)
			suggestions.push(...plainAnalysis.organizations().json());
		if (settings.extractAcronyms)
			suggestions.push(...plainAnalysis.acronyms().json());

		if (settings.extractMentions)
			suggestions.push(...plainAnalysis.atMentions().json({normal:true}));
		console.log(`settings: ${JSON.stringify(settings)}`)
		console.log("plain suggestions:" +  JSON.stringify(suggestions));
		const suggestedTags = suggestions
			.map(suggestion => suggestion.terms
				.reduce((acc, curr) => acc = `${acc} ${curr.text}`, '')
			)
			.map(tag => cleanAndConvertTag(tag));
		const cleanTags = new Map(suggestedTags.map(tag => [tag, tag]));
        console.log("content: " + JSON.stringify(suggestedTags));
        
		return cleanTags;
	}

	return new Map();
}

const cleanAndConvertTag = (tag: string): string => {
    // eslint-disable-next-line no-useless-escape
    return `#${tag.trim().replace(/\[?([^\[\]]*)\]?\((.*?)\)/gm, '$1').replace(/ /gm, '-').replace(/^@/gm, '').toLocaleLowerCase()}`;
}