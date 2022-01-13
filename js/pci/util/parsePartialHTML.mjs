//@ts-check

/**
 * @param {String} html HTML text that may contain script tags
 * @param {boolean} allowScripts Should script tags be made executable?
 * @returns {DocumentFragment} a document fragment eg: target.appendChild(frag);
 * 
 *  @example
 *  let frag = parsePartialHTML(
 *       `Some html with a script <script>alert('test');</script>`,
 *       true
 *   );
 *   document.getElementById("main").appendChild(frag);
 */
export function parsePartialHTML(html, allowScripts=false) {

    let doc = new DOMParser().parseFromString(html, "text/html");
    let frag = document.createDocumentFragment();
    let childNodes = doc.body.childNodes;

    while (childNodes.length) {
        frag.appendChild(childNodes[0]);
    }
    return allowScripts ? fixScriptsSoTheyAreExecuted(frag) : frag;
}

/**
 * Recreates script elements in a DocumentFragment so they can run when 
 * appended to a document.
 * @param {DocumentFragment} el the element tree to check
 * @returns {DocumentFragment} same, but modified so scripts can run
 * 
 */
function fixScriptsSoTheyAreExecuted(el) {

    let scripts = el.querySelectorAll("script");
    let script;
    let fixedScript;
    let i;
    let len;

    for (i = 0, len = scripts.length; i < len; i++) {
        script = scripts[i];
        fixedScript = document.createElement("script");
        fixedScript.type = script.type;
        if (script.innerHTML) {
            fixedScript.innerHTML = script.innerHTML;
        } else {
            fixedScript.src = script.src;
        }
        fixedScript.async = false;
        script.parentNode.replaceChild(fixedScript, script);
    }
    return el;
}