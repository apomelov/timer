import patch from "json-touch-patch"
import jp from "jsonpath/jsonpath.min"
import {taskContextMenuId} from "./containers/TaskList";


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


export const contextMenu = (e, { menuId, target }) => {
    if (e.ctrlKey) return;

    const $menu = $("#" + menuId);

    const getMenuPosition = (mouse, direction, scrollDir) => {
        const win = $(window)[direction]();
        const scroll = $(window)[scrollDir]();
        const menu = $("#" + taskContextMenuId)[direction]();
        return mouse + scroll - (mouse + menu > win && menu < mouse ? menu : 0);
    };

    $menu.find("li").each((i, li) => {
        const $li = $(li);
        const condition = eval($li.data("condition")) || (() => { return true; });
        if (condition(target)) {
            $li.show();
        } else {
            $li.hide();
        }
    });

    $menu.data("invokedOn", target)
        .show()
        .css({
            position: "absolute",
            left: getMenuPosition(e.clientX, 'width', 'scrollLeft'),
            top: getMenuPosition(e.clientY, 'height', 'scrollTop')
        })
        .off('click')
        .on('click', 'a', function (e) {
            $menu.hide();
        })
        //
        //     var $invokedOn = $menu.data("invokedOn");
        //     var $selectedMenu = $(e.target);
        //
        //     //settings.menuSelected.call(this, $invokedOn, $selectedMenu);
        // })
    ;
    e.preventDefault();
    return false;
};