// @ts-check
/*jshint esversion: 6 */

/**
 * Handles routing for the app
 */

import {getRoutes} from '../routes.mjs';
import {cleanHTML} from '../js/ext/vjs-toolkit/cleanHTML.mjs';

export function parseRequestURL() {

    let url = location.hash.slice(1).toLowerCase() || '/';
    let r = url.split("/")
    let request = {
        resource: null,
        id: null,
        verb: null
    }
    request.resource = r[1]
    request.id = r[2]
    request.verb = r[3]

    return request
};

export async function router() {

    let routes = getRoutes();
    
    // Lazy load view element:
    const content = null || document.getElementById('main-container');

    // Get the parsed URl from the addressbar
    let request = parseRequestURL();

    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '')

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    let page = routes[parsedURL] ? routes[parsedURL] : routes["Error404"];
    let html = await page.buildHTML();
    html = cleanHTML(html);
    content.innerHTML = html;
    page.addListeners();
    page.modelToView();

}


