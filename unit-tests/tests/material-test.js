/* jshint esversion: 6 */
//@ts-check

import isEqual from '../../js/ext/lodash/esm/isEqual.js';

import {
    Material, Mat_Isotropic, Mat_PlanarIso12, Mat_PlanarIso13, Mat_PlanarIso23, Mat_Orthotropic, Mat_FRP
} from '../../js/pci/lpt/material.mjs';

import { assert } from '../../js/pci/util/assert.mjs';
import { printHighlightedHTML } from '../../js/pci/util/print-to-html.mjs';
import { serialize, deserialize } from '../../js/pci/util/serialize.mjs';

export function materialTest() {

    //@ ts-expect-error
    //const LoDash = _;

    let obj;
    let isError;
    let errMsg;

    function reset() {
        obj = null;
        isError = false;
        errMsg = '';
    }

    assert(true, "--- Start of Material tests");
    assert(false, "This is just a test to make sure assert() is working.");
    reset();

    //------- Start of tests ------------

    try {
        reset();
        obj = new Material();
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Can not call Material() directly. \n  err msg: " + errMsg);

    try {
        reset();
        obj = new Mat_Isotropic();
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(!isError, "Can call Mat_Isotropic() with no arguments.\n" + errMsg);

    try {
        reset();
        obj = new Mat_Isotropic({});
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Can not call Mat_Isotropic({}) with invalid arguments.\n" + errMsg);

    // Isotropic requires density>0, E1>0 & 0<PR12<=0.5
    obj = new Mat_Isotropic({
        density: 1000.0,
        E1: 1.0,
        PR12: 0.3,
    });
    assert(obj instanceof Mat_Isotropic, "Can instantiate isotropic material with only density, E1 & PR12.");
    assert(obj instanceof Material, "Mat_Isotropic is instance of Material.");
    assert(obj.E1 === 1.0, "Mat_Isotropic E1 = args.E1");
    assert(obj.E1 === obj.E2, "Mat_Isotropic E1 = E2");
    assert(obj.E1 === obj.E3, "Mat_Isotropic E1 = E3");

    let obj_constructor = obj.constructor;
    assert(true, "constructor = " + obj_constructor.name);

    //@ts-ignore
    obj = new obj_constructor();
    assert(obj instanceof Mat_Isotropic, 'new Mat_Isotropic made from constructor');

    assert(obj._clazz === "Mat_Isotropic", "_clazz === Mat_Isotropic");

    let mat_iso = new Mat_Isotropic({
        name: "An Isotropic Material",
        description: "An isotropic material.",
        density: 7850.0,
        E1: 207e9,
        PR12: 0.35,
    });
    obj = new Mat_Isotropic();

    Object.assign(obj, mat_iso);
    assert(obj.E3 === mat_iso.E3, "nullMaterial.E3 = obj.E3 after Object.assign(nullMaterial, m).");
    printHighlightedHTML(obj);

    // Isotropic requires density>0, E1>0 & 0<PR12<=0.5
    try {
        reset();
        obj = new Mat_Isotropic({
            density: 1000.0,
            E1: -1.0,
            PR12: 0.3,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating isotropic material with E1 < 0 is error: \n  err msg: " + errMsg);

    // Isotropic requires density>0, E1>0 & 0<PR12<=0.5
    try {
        reset();
        obj = new Mat_Isotropic({
            density: -1000.0,
            E1: 1.0,
            PR12: 0.3,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating isotropic material with density < 0 is error: " + errMsg);

    // Isotropic requires density>0, E1>0 & 0<PR12<=0.5
    try {
        reset();
        obj = new Mat_Isotropic({
            density: 1000.0,
            E1: 1.0,
            PR12: -0.2,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating isotropic material with PR12 < 0 is error: " + errMsg);

    // Isotropic requires density>0, E1>0 & 0<PR12<=0.5
    try {
        reset();
        obj = new Mat_Isotropic({
            density: 1000.0,
            E1: 1.0,
            PR12: -0.5,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating isotropic material with PR12 = -0.5 is error: " + errMsg);

    // Isotropic requires density>0, E1>0 & 0<PR12<=0.5
    try {
        reset();
        obj = new Mat_Isotropic({
            density: 1000.0,
            E1: 1.0,
            PR12: 0.501,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating isotropic material with PR12 = 0.501 is error: " + errMsg);

    obj = new Mat_Isotropic({
        // @ts-ignore
        name: -1.5,
        density: 1000.0,
        E1: 1.0,
        PR12: 0.3,
    });
    assert(obj instanceof Material, "Can instantiate isotropic material with name = -1.5. n.name = " + obj.name);

    obj = new Mat_Isotropic({
        // @ts-ignore
        name: { arg: 'name' },
        density: 1000.0,
        E1: 1.0,
        PR12: 0.3,
    });
    assert(obj.name !== "{arg: 'name'}", "Can instantiate isotropic material with name = {arg: 'name'}. n.name = " + obj.name);

    // Mat_Planar_Iso_12 requires density, E1, PR12, E3, G13, PR13
    obj = new Mat_PlanarIso12({
        density: 1000.0,
        E1: 20e9,
        PR12: 0.3,
        E3: 40e9,
        G13: 18e9,
        PR13: 0.25,
    });
    assert(obj instanceof Material, "Can instantiate Mat_Planar_Iso_12 with density, E1, PR12, E3, G13, PR13.");


    // Mat_Planar_Iso_12 requires density>0, E1>0, 0<PR12<=0.5, E3>0, G13>0 & 0<PR13<=0.5
    try {
        reset();
        obj = new Mat_PlanarIso12({
            density: 1000.0,
            E1: 20e9,
            PR12: 0.501,
            E3: 40e9,
            G13: 18e9,
            PR13: 0.25,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating Mat_Planar_Iso_12 with PR12 = 0.501 is error: " + errMsg);

    // Mat_Planar_Iso_12 requires density>0, E1>0, 0<PR12<=0.5, E3>0, G13>0 & 0<PR13<=0.5
    try {
        reset();
        obj = new Mat_PlanarIso12({
            density: 1000.0,
            E1: 20e9,
            PR12: 0.30,
            // E3: 40e9,
            G13: 18e9,
            PR13: 0.25,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Instantiating Mat_Planar_Iso_12 without E3 is error: " + errMsg);

    // Mat_Planar_Iso_12 requires density>0, E1>0, 0<PR12<=0.5, E3>0, G13>0 & 0<PR13<=0.5
    isError = false;
    errMsg = '';
    obj = new Mat_PlanarIso12({
        density: 1000.0,
        E1: 20e9,
        PR12: 0.30,
        E3: 0.0000050e9,
        G13: 18e9,
        PR13: 0.25,
    });
    assert(obj instanceof Material, "Instantiating Mat_Planar_Iso_12 with numeric string E3 is ok, obj.E3 = " +
        obj.E3 + " (should be 5000).");


    // Mat_Planar_Iso_13 requires density, E1, PR13, E2, G12, PR12
    obj = new Mat_PlanarIso13({
        density: 1000.0,
        E1: 20e9,
        PR13: 0.3,
        E2: 40e9,
        G12: 18e9,
        PR12: 0.25,
    });
    assert(obj instanceof Material, "Can instantiate Mat_Planar_Iso_13 with density, E1, PR13, E2, G12, PR12.");
    assert(obj.E1 === obj.E3, "obj.E1 === obj.E3");
    assert(obj.E2 > obj.E3, "obj.E2 > obj.E3");

    // Mat_Planar_Iso_23 requires density, E2, PR23, E1, G12, PR12
    obj = new Mat_PlanarIso23({
        density: 1000.0,
        E2: 20e9,
        PR23: 0.3,
        E1: 208e9,
        G12: 8e9,
        PR12: 0.25,
    });
    assert(obj instanceof Material, "Can instantiate Mat_Planar_Iso_23 with density, E2, PR23, E1, G12, PR12.");
    assert(obj.E2 === obj.E3, "obj.E2 === obj.E3");
    assert(obj.E1 > obj.E2, "obj.E1 > obj.E2");


    // Mat_Orthotropic requires E1, E2, E3, G12, G13, G23, PR12, PR13, PR23
    obj = new Mat_Orthotropic({
        density: 1000.0,
        E1: 100e9,
        E2: 20e9,
        E3: 3e9,
        G12: 12e9,
        G13: 13e9,
        G23: 23e9,
        PR12: 0.12,
        PR13: 0.13,
        PR23: 0.23,
    });
    assert(obj instanceof Material, "Can instantiate Mat_Orthotropic with E1, E2, E3, G12, G13, G23, PR12, PR13, PR23.");
    assert(obj.E2 != obj.E3, "obj.E2 != obj.E3");
    assert(obj.PR12 != obj.PR23, "obj.PR12 != obj.PR23");

    let fiber;
    let resin;
    let cfrp;

    try {
        reset();
        fiber = new Mat_PlanarIso23({
            density: 1800,
            E1: 207e9,
            PR12: 0.25,
            G12: 20e9,
            E2: 15e9,
            PR23: 0.3,
        });

        resin = new Mat_Isotropic({
            density: 1150,
            E1: 20e9,
            PR12: 0.35,
        });

        cfrp = new Mat_FRP({
            fiber: fiber,
            resin: resin,
            vf: 0.55,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(!isError && cfrp instanceof Material, "Composite Material instantiated from fiber, resin & vf");
    assert(cfrp.E1 === 0.55 * 207e9 + 0.45 * 20e9, "E1 = vf x e1f + (1-vf)*E1r,  E1 = " + cfrp.E1);
    printHighlightedHTML(cfrp);

    try {
        reset();
        cfrp = new Mat_FRP({
            fiber: fiber,
            resin: resin,
            vf: -0.1,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Composite Material instantiated with vf<0 is error: " + errMsg);

    try {
        reset();
        cfrp = new Mat_FRP({
            fiber: fiber,
            resin: resin,
            vf: 1.1,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Composite Material instantiated with vf>1 is error: " + errMsg);

    try {
        isError = false;
        errMsg = "";
        cfrp = undefined;

        cfrp = new Mat_FRP({
            fiber: null,
            resin: resin,
            vf: 0.5,
        });
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Composite Material instantiated with null fiber is error: " + errMsg);

    isError = false;
    errMsg = "";
    cfrp = undefined;

    cfrp = new Mat_FRP({
        fiber: fiber,
        resin: resin,
        vf: 0.0,
    });
    assert(isError==false, "No error creating Mat_FRP with Vf = " + cfrp.vf );
    assert(cfrp instanceof Material, "Mat_FRP with Vf = " + cfrp.vf + " is instance of Material");
    assert(cfrp.E3 === resin.E3, "Composite E3 (" + cfrp.E3 + ") === resin E3 (" + resin.E3 + ") @ vf=0");
    assert(cfrp.G12 === resin.G12, "Composite G12 (" + cfrp.G12 + ") === resin G12 (" + resin.G12 + ") @ vf=0");
    assert(cfrp.PR23 === resin.PR23, "Composite PR23 (" + cfrp.PR23 + ") === resin PR23 (" + resin.PR23 + ") @ vf=0");

    cfrp = undefined;

    cfrp = new Mat_FRP({
        fiber: fiber,
        resin: resin,
        vf: 1.0,
    });
    assert(cfrp instanceof Material, "Composite Material instantiated with vf = 1.");
    assert(cfrp.E3 === fiber.E3, "Composite E3 === fiber E3 @ vf=1.0");
    assert(cfrp.G12 === fiber.G12, "Composite G12 === fiber G12 @ vf=1.0");
    assert(cfrp.PR23 === fiber.PR23, "Composite PR23 === fiber PR23 @ vf=1.0");

    let serializedCFRP = serialize(cfrp, 6);
    printHighlightedHTML(serializedCFRP);
    let deserializedCFRP = deserialize(serializedCFRP);

    let shortSerializedCFRP = serialize(cfrp, null);
    let shortDeserializedCFRP = deserialize(shortSerializedCFRP);

    assert(
        // LoDash.isEqual(shortDeserializedCFRP, deserializedCFRP),
        isEqual(shortDeserializedCFRP, deserializedCFRP),
        "deserialize(serialize(cfrp, 6)) is equal to deserialize(serialize(cfrp, null))."
    );

    assert(cfrp !== deserializedCFRP, "Deserialized cfrp is not the same object as the original.");
    //assert(LoDash.isEqual(cfrp, deserializedCFRP), "Deserialized cfrp is equal to the original.");
    assert(isEqual(cfrp, deserializedCFRP), "Deserialized cfrp is equal to the original.");

    try {
        reset();
        obj = new Mat_Isotropic({
            density: 7850.0,
            E1: 207.0e9,
            PR12: 0.3,
        });
        //@ts-ignore
        obj.E2 = 45e9;
    } catch (err) {
        isError = true;
        errMsg = err.message;
    }
    assert(isError, "Writing to a read-only property throws an error:\n  " + errMsg);

    /**/
    assert(true, "End of tests");
}