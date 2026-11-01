// Escapes regex metacharacters so user input matches literally (prevents ReDoS and pattern injection).
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default escapeRegex;
