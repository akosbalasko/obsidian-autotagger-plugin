import { writable } from "svelte/store";

import { DEFAULT_SETTINGS, AutotaggerPluginSettings } from './AutotaggerPluginSettings';

export const settings = writable<AutotaggerPluginSettings>(DEFAULT_SETTINGS);
