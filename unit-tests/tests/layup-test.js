//@ts-check

import { AbstractLayer, BraidedLayer, SolidLayer } from "../../js/pci/lpt/layup.mjs";
import { Laminate } from "../../js/pci/lpt/lpt.mjs";
import { Mat_Isotropic } from "../../js/pci/lpt/material.mjs";
import { assert, diff } from "../../js/pci/util/assert.mjs";
import { CONVERT } from "../../js/pci/util/convert.mjs";

export function layupTest() {

    assert(true, "***  Testing layup.mjs  ***");

    let steel = new Mat_Isotropic({
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

    assert(steelLayer instanceof SolidLayer, "created instance of SolidLayer");
    assert(steelLayer instanceof AbstractLayer, "SolidLayer is instance of AbstractLayer");
    assert(steelLaminate instanceof Laminate, "SolidLayer.getLaminate returns a Laminate");
    assert((diff(steel.E1, steelLaminate.E1)) < 0.0175, "Layer E1 == material E1, within 1.75%");

    let glassFiber = new Mat_Isotropic({
        name: 'E-Glass Fiber',
        description: 'Generic E-glass fiber.',
        density: 2540.0, // kg/m^3
        E1: 10.50 * CONVERT.MSI_TO_PA,
        PR12: 0.22,
    });

    let braid = new BraidedLayer({
        name: "2MG",
        description: "2 inch Dia glass +/- 45 braid.",
        braidDiameter: 2.0,
        biaxFibers: [glassFiber],
        biaxFaws: [150]
    });

    assert(braid instanceof BraidedLayer, "created instance of BraidedLayer.");

    //let faw = braid.getBiaxialFiberDensity();
}