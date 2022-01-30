//@ts-check

/**
 * Makes all a element links that reference an external host open in an new 
 * tab/window by setting target='_blank' and rel='noopener' in every a element
 * 
 * @param {*} doc the page to be modified
 * @param {*} exceptions a list of hostnames that are ok to open in current window
 */
export function makeExtLinksOpenInNewWindow(doc, exceptions = []) {
    const all_links = doc.querySelectorAll('a');
    for (let i = 0; i < all_links.length; i++) {
        let a = all_links[i];
        let ah = a.hostname;
        if (ah != location.hostname && false == exceptions.includes(ah)) {
            a.rel = 'noopener';
            a.target = '_blank';
        }
    }
}

