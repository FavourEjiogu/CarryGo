import{hostelPlaces,merchantPlaces}from'./bingham';
export type PlaceSuggestion={label:string;kind:'Food'|'Market'|'Hostel'|'Campus';mode?:'HOSTEL'|'LANDMARK'};
const campus:PlaceSuggestion[]=[{label:'Main Gate',kind:'Campus',mode:'LANDMARK'},{label:'ICT',kind:'Campus',mode:'LANDMARK'},{label:'Senate',kind:'Campus',mode:'LANDMARK'},{label:'Chapel',kind:'Campus',mode:'LANDMARK'},{label:'Student Central',kind:'Campus',mode:'LANDMARK'}];
const merchants:PlaceSuggestion[]=merchantPlaces.map(label=>({label,kind:label==='Green Plaza'?'Market':'Food',mode:'LANDMARK'}));
const hostels:PlaceSuggestion[]=hostelPlaces.map(label=>({label,kind:'Hostel',mode:'HOSTEL'}));
export const knownPlaces=[...merchants,...hostels,...campus];
export function suggestPlaces(query:string){const q=query.trim().toLowerCase();return(q?knownPlaces.filter(p=>p.label.toLowerCase().includes(q)):knownPlaces).slice(0,7)}