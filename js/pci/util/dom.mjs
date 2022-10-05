
export function getDomRefsById(parentElement = document) {
    let $refs = {};
    parentElement.querySelectorAll('[id]').forEach($el => {
        let key = $el.id.replace(/-(.)/g, (_, s) => s.toUpperCase());
        $refs[key] = $el;
    });
    console.log($refs);
    return $refs;
}
