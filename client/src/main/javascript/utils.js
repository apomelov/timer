export const retrocycle = ($) => {
    (function rez(value) {
        if (value && typeof value === "object") {
            for (let i in value) {
                let item = value[i];
                if (item && typeof item === "object") {
                    let path = item.$ref;
                    if (path && typeof path === "string") {
                        value[i] = eval(path);
                    } else {
                        rez(item);
                    }
                }
            }
        }
    }($));
    return $;
};

export const mapNotNull = (source, fn) => Object.keys(source)
    .filter(key => !!source[key])
    .map(key => ({key: key, value: fn(source[key])}))
    .filter(pair => !!pair.value)
    .reduce((acc, val) => { acc[val.key] = val.value; return acc; }, {});
