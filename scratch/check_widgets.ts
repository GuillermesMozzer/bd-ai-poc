
import { personalWidgetIds } from './src/workstation/workstationConstants';
import { presetVisibleWidgetIds, presetHiddenWidgetIds } from './src/workstation/publishedWorkstations';

const allPreset = [...presetVisibleWidgetIds, ...presetHiddenWidgetIds];
const missing = personalWidgetIds.filter(id => !allPreset.includes(id));
const extra = allPreset.filter(id => !personalWidgetIds.includes(id));

console.log('Missing from presets:', missing);
console.log('Extra in presets:', extra);
