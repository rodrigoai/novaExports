const IGNORED_KEYS = new Set(['gateway_id', 'company', 'items']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function sanitizeObject(obj) {
  if (!isObject(obj)) {
    return obj;
  }

  const newObj = {};

  for (const key in obj) {
    if (IGNORED_KEYS.has(key)) {
      continue;
    }

    let value = obj[key];

    if (isObject(value)) {
      // Special handling for 'meta' object
      if (key === 'meta') {
        const newMeta = {};
        for (const metaKey in value) {
          if (!metaKey.startsWith('_')) {
            newMeta[metaKey] = value[metaKey];
          }
        }
        newObj[key] = newMeta;
      } else {
        newObj[key] = sanitizeObject(value);
      }
    } else {
      newObj[key] = value;
    }
  }

  return newObj;
}
