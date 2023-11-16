// @ts-check
/*jshint esversion: 6 */

import { getMaterial } from '../data/materials-data.mjs';
import { AbstractView } from './abstract-view.mjs';


export class MaterialView extends AbstractView {
    
    constructor(args = {}) {
        super(args);
    }

    async buildHTML({id}) {
        const html = String.raw;
        let mat;
        let _html = html`<h1> No material with id = ${id}.</h1>`;
        try {
            mat = getMaterial(id);
            _html = html`
            <section class="section">
                <h1> Material </h1>
                <span class="M"> Id : ${id}, </span>
                <span class="M"> Name : ${mat.name}, </span>
                <span class="M"> Description : ${mat.description}, </span>
                <span class="M"> Density : ${mat.density} (kg/cu.m)</span>
            </section>
        `;
        } catch (e) {
            console.log(e);
        }


        return _html;
    }

    async addListeners() {
        super.addListeners();
        let elements = document?.querySelectorAll('.M');
        elements.forEach((el)=>{
            el.addEventListener(
                'click',
                () => alert('You have clicked on the material!')
            );
        })
        // document?.querySelector('.M')?.addEventListener(
        //     'click',
        //     () => alert('You have clicked on the material!')
        // );
    }

    async modelToView() {

    }

}