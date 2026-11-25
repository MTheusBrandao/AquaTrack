// Registra o que o app agenda/cancela, para os testes conferirem.
export const scheduled = new Map();
let counter = 0;
export const SchedulableTriggerInputTypes = { DATE: 'date' };
export const AndroidImportance = { DEFAULT: 3 };
export function setNotificationHandler() {}
export async function setNotificationChannelAsync() {}
export async function getPermissionsAsync() { return { granted: true, canAskAgain: true }; }
export async function requestPermissionsAsync() { return { granted: true }; }
export async function scheduleNotificationAsync(request) { const id = `n${++counter}`; scheduled.set(id, request); return id; }
export async function cancelScheduledNotificationAsync(id) { scheduled.delete(id); }
