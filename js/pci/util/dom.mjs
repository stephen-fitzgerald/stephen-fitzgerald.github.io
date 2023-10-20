/**
 * Builds an object with keys matching element ids in the 
 * parent element, or the document.  IDs are coverted to camel case.
 * Values are the references themselves.
 * 
 * Usage:
 * 
 *  <div id=my-element></div>
 * 
 *  let doc = getDomRefsById();
 * 
 *  doc.myElement.addEventListener(...)
 * 
 * @export
 * @param {any} [parentElement=document] 
 * @returns {object} object with keys = camel case ids and values
 * equal to the elements reference.
 */
export function getDomRefsById(parentElement = document) {
    let $refs = {};
    parentElement.querySelectorAll('[id]').forEach($el => {
        let key = $el.id.replace(/-(.)/g, (_, s) => s.toUpperCase());
        $refs[key] = $el;
    });
    //console.log($refs);
    return $refs;
}
