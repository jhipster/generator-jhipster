export const sanitise = str => (typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str);
