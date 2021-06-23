export interface AutotaggerPluginSettings {
	extractOrganizations: boolean;
	extractPeople: boolean;
	extractPlaces: boolean;
	extractAcronyms: boolean;
	extractMentions: boolean;
}


export const DEFAULT_SETTINGS: AutotaggerPluginSettings = {
	extractOrganizations: true,
	extractPeople: true,
	extractPlaces: true,
	extractAcronyms: true,
	extractMentions: true

}
