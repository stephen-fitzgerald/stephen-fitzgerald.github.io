//@ts-check

import { AbstractLayer, SolidLayer } from "../../js/pci/lpt/layup.mjs";
import { Laminate } from "../../js/pci/lpt/lpt.mjs";
import { Mat_Isotropic } from "../../js/pci/lpt/material.mjs";
import{assert, diff} from "../../js/pci/util/assert.mjs";

export function layupTest(){

    assert( true, "***  Testing layup.mjs  ***");

    let steel =  new Mat_Isotropic({
        name: 'Steel',
        description: 'Generic mild steel.',
        density: 7850.0, // kg/m^3
        E1: 207e9, // Pa
        PR12: 0.30,
    });

    let steelLayer = new SolidLayer({
        name: "Solid Layer",
        description: "0.010 m thick Steel.",
        material: steel,
        thickness: 0.010
    });

    let steelLaminate = steelLayer.getLaminate();

    assert( steelLayer instanceof SolidLayer, "created instance of SolidLayer");
    assert( steelLayer instanceof AbstractLayer, "SolidLayer is instance of AbstractLayer");
    assert( steelLaminate instanceof Laminate, "SolidLayer.getLaminate returns a Laminate");
    assert( (diff(steel.E1, steelLaminate.E1)) < 0.015 , "Layer E1 == material E1, within 1.5%");

}