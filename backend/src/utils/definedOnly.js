// Drops undefined values so partial updates don't unset fields that weren't sent.
const definedOnly = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

export default definedOnly;
