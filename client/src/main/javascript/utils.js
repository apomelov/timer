import patch from "json-touch-patch"
import jp from "jsonpath/jsonpath.min"


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


export const applyPatch = (target, patches) => patch(
    target,
    patches.flatMap(patch => {
        const paths = (patch.op === "add")
                ? [ patch.path.slice(1).replaceAll(".", "/") ]
                : jp.paths(target, patch.path).map(path => path.join("/").slice(1));

        return paths.map(path => ({...patch, path}))
    }),
    { strict: true }
);


export const removePrefix = (str, prefix) => str.startsWith(prefix) ? str.slice(prefix.length) : str;

export const removeSuffix = (str, suffix) => str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
