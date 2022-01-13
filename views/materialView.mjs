// @ts-check
/*jshint esversion: 6 */

import { parseRequestURL } from '../js/router.mjs';
import { getMaterial } from '../data/materialsData.mjs';
import { AbstractView } from './abstractViewx.mjs';

export class MaterialView extends AbstractView {

    constructor(templateStr) {
        super(templateStr);
    }

    buildHTML() {
        let request = parseRequestURL()
        let mat;
        let _html=`<h1> No material with id = ${request.id}.</h1>`
        try {
            mat = getMaterial(request.id);
             _html = `
            <section class="section">
                <h1 class="M"> Material </h1>
                <span> Id : ${request.id}, </span>
                <span> Name : ${mat.name}, </span>
                <span> Description : ${mat.description}, </span>
                <span> Density : ${mat.density} (kg/cu.m)</span>
            </section>
        `
        } catch (e) {
            console.log(e);
        }

        
        return _html;
    }

    async addListeners() {
        super.addListeners();
        document
        .querySelector('.M')
        .addEventListener('click', () => alert('You have clicked on the material!'));
    }

    async modelToView(){
        
    }

}