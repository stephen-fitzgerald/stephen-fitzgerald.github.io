// @ts-check
/*jshint esversion: 6 */

import {MaterialView} from './views/MaterialView.mjs';
import { MaterialEditView } from './views/MaterialEditView.mjs';
import { MaterialsListView } from './views/MaterialsListView.mjs';
import { MaterialsCreateView } from './views/MaterialsCreateView.mjs';
import { StaticView } from './views/StaticView.mjs';
import { BCView } from './views/barrelCompression.mjs';

export function getRoutes() {
    return ({

    '/': new StaticView({title: "Stratus LPT", path: './views/home.html'}),

    '/material/:id': new MaterialView({title: "Material View", html: "Material View"}),
    '/material/:id/edit': new MaterialEditView({title: "Material Edit", html: "Material Edit"}),

    '/materials': new MaterialsListView({title: "Materials List"}),
    '/materials-create': new MaterialsCreateView({title: "New Material"}),
    
    '/about': new StaticView({title: "About Composites App", path: './views/about.html'}),
    '/barrel-comp': new BCView({title: "Barrel Compression", path: './views/barrelCompression.html'}),

    'Error404': new StaticView({title: "Stratus LPT", path: './views/404.html'}),
    
    });
};