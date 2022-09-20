// @ts-check
/*jshint esversion: 6 */

/**
 * Handles routing for the app
 */

import { getRoutes } from '../routes.mjs';
import { cleanHTML } from './ext/vjs-toolkit/clean-html.mjs';

export function parseRequestURL() {

    let url = location.hash.slice(1).toLowerCase() || '/';
    let r = url.split("/");
    let request = {
        resource: r[1],
        id: r[2],
        verb: r[3]
    };
    return request;
};

let currentPage;

export async function router() {

    let routes = getRoutes();

    // Get the parsed URl from the addressbar
    let request = parseRequestURL();

    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '');

    // Get the page from our hash of supported routes, or the 404 page 
    let page = routes[parsedURL] ? routes[parsedURL] : routes["Error404"];

    // render the html for the page
    let html = await page.buildHTML();
    //html = cleanHTML(html);

    if (currentPage) { currentPage.destroy(); }
    // set the main container elements html
    const content = null || document.getElementById('main-container');
    if (content != null) { content.innerHTML = html; }
    currentPage = page;

    // TODO wait for document to (re-)load

    // set up any required listeners for the page
    page.addListeners();

    // update the view
    page.modelToView();

}


