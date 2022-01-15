/*jshint esversion: 6 */
// @ts-check

import { assert, diff} from "../../pci/util/assert.mjs";
import {CONVERT} from "../../pci/util/convert.mjs";
import { Mat_Isotropic, Mat_PlanarIso23 } from "../../pci/lpt/material.mjs";
import { SolidLamina, Laminate, CompositeLamina } from "../../pci/lpt/lpt.mjs";

export function lptTest() {

    console.log("Testing lpt.js...");

    const eps = 1e-9;

    assert( false, "This is just a test to make sure assert() is working.");

    let eGlassFiber =  new Mat_Isotropic({
        name: 'S-Glass Fiber',
        description: 'Generic S-glass fiber.',
        density: 2540.0, // kg/m^3
        E1: 12.4 * CONVERT.MSI_TO_PA,
        PR12: 0.20,
    });

    let steel = new Mat_Isotropic({
        name: 'Steel',
        description: 'Generic mild steel.',
        density: 7850.0, // kg/m^3
        E1: 30.0 * CONVERT.MSI_TO_PA,
        PR12: 0.30,
    });

    let steelPly = new SolidLamina({
        name: 'Steel - 0.030 in.',
        description: "A mild steel ply",
        material: steel,
        thickness: CONVERT.toBaseUnits(0.030, 'in'),
    });

    let thicknessInMeters = 0.030 * 0.0254;
    assert(diff(steelPly.thickness, thicknessInMeters) < eps, 'steelPly.thickness is correct within 0.00001%.');

    let steelProps = steelPly.properties;
    assert(diff(steelProps.Ex / 210e9, 1) < 0.005, 'Steel Ply modulus within 0.5% of 210 GPa.');
    assert(diff(steelProps.Ex, steelProps.Exf) < eps, 'Steel Ply flex & in-plane modulii within 0.00001%.');

    let steelLam = new Laminate({name:'steel'}).addPly(steelPly);
    assert(steelLam.plyCount === 1, 'Steel laminate has 1 ply.');

    let steelLamProps = steelLam.properties;
    assert(diff(steelProps.Ex, steelLamProps.Ex) < eps, 'Steel Ply & Laminate Ex equal within 0.00001%.');
    assert(diff(steelProps.Exf, steelLamProps.Exf) < eps, 'Steel Ply & Laminate Exf equal within 0.00001%.');

    steelLam.addPly(steelPly);
    assert(steelLam.plyCount === 2, 'Steel laminate has 2 plies now.');
    assert(diff(steelProps.Gxy, steelLamProps.Gxy) < eps, 'Steel Ply & Laminate(2) have Gxy equal within 0.00001%.');
    assert(diff(steelProps.PRxy, steelLamProps.PRxy) < eps, 'Steel Ply & Laminate(2) have PRxy equal within 0.00001%.');
    assert(steelProps.NAx - steelLamProps.NAx < eps, 'Steel Laminate NAx equals 0.0 within 0.00001%.');

    let carbonFiber = new Mat_PlanarIso23({
        name: 'Carbon Fiber',
        description: 'Generic standard modulus carbon fiber.',
        density: 1800.0, // kg/m^3
        E1: 227.5e9,
        E2: 20.7e9,
        G12: 8e9,
        PR12: 0.30,
        PR23: 0.25,
    });

    let epoxyResin = new Mat_Isotropic({
            name: 'Epoxy Resin',
            description: 'Generic epoxy resin.',
            density: 1170.0, // kg/m^3
            E1: 3.1e9,
            PR12: 0.30,
        });

    let carbonPly = new CompositeLamina({
        name: '305 gsm uni Carbon at 57% vf',
        fiber: carbonFiber,
        resin: epoxyResin,
        vf: 0.57, // default
        faw: 0.305, // kg/sqm
        isRandom: false, // default
    });

    assert(carbonPly.resin === epoxyResin, 'Carbon ply resin === input resin.');
    assert(carbonPly.fiber === carbonFiber, 'Carbon ply fiber === input fiber.');
    assert(carbonPly.vf === 0.57, 'Carbon ply vf=0.57: ' + carbonPly.vf);
    assert(carbonPly.faw === 0.305, 'Carbon ply FAW=0.305: ' + carbonPly.faw + ' gsm');
    assert(carbonPly.taw >= carbonPly.faw, 'Carbon areal wt > FAW: (' + carbonPly.faw + ' < ' + carbonPly.taw + ' )');
    assert(carbonPly.isRandom === false, 'Carbon ply is not random.');
    carbonPly.isRandom = true;
    assert(carbonPly.isRandom === true, 'Carbon ply is now random!');

    let glassPly = new CompositeLamina({
        name: '210 gsm uni Glass at 50% vf',
        fiber: eGlassFiber,
        resin: epoxyResin,
        vf: 0.57, // default
        faw: 0.210, // kg/sqm
        isRandom: false, // default
    });
    assert(glassPly.name === '210 gsm uni Glass at 50% vf', 'Glass ply name is correct.');
    assert(glassPly.description === '', 'Glass ply description is empty string.');

    for (let lamAngle = 0; lamAngle <= 180; lamAngle += 15) {

        let laminate = new Laminate()
            .addPly(carbonPly, lamAngle)
            .addPly(carbonPly, -lamAngle)
            .addPly(carbonPly, lamAngle)
            .addPly(carbonPly, -lamAngle)
            .addPly(carbonPly, lamAngle)
            .addPly(carbonPly, -lamAngle)
            .addPly(carbonPly, lamAngle)
            .addPly(carbonPly, -lamAngle);

        for (let rotationAngle = 0; rotationAngle <= 180; rotationAngle += 15) {

            let rotatedCCWLam = new Laminate()
                .addPly(laminate, rotationAngle);

            let rotatedCWLam = new Laminate()
                .addPly(laminate, -rotationAngle);

            let equivalentCCWLam = new Laminate()
                .addPly(carbonPly, lamAngle + rotationAngle)
                .addPly(carbonPly, -lamAngle + rotationAngle)
                .addPly(carbonPly, lamAngle + rotationAngle)
                .addPly(carbonPly, -lamAngle + rotationAngle)
                .addPly(carbonPly, lamAngle + rotationAngle)
                .addPly(carbonPly, -lamAngle + rotationAngle)
                .addPly(carbonPly, lamAngle + rotationAngle)
                .addPly(carbonPly, -lamAngle + rotationAngle);

            let equivalentCWLam = new Laminate()
                .addPly(carbonPly, lamAngle - rotationAngle)
                .addPly(carbonPly, -lamAngle - rotationAngle)
                .addPly(carbonPly, lamAngle - rotationAngle)
                .addPly(carbonPly, -lamAngle - rotationAngle)
                .addPly(carbonPly, lamAngle - rotationAngle)
                .addPly(carbonPly, -lamAngle - rotationAngle)
                .addPly(carbonPly, lamAngle - rotationAngle)
                .addPly(carbonPly, -lamAngle - rotationAngle);

            let ccwProps = rotatedCCWLam.properties;
            let cwProps = rotatedCWLam.properties;
            let eqCcwProps = equivalentCCWLam.properties;
            let eqCwProps = equivalentCWLam.properties;

            assert(diff(ccwProps.Ey, eqCcwProps.Ey) < eps, '' + lamAngle + ' CCW Rotated by ' + rotationAngle + ' deg, Ex is equal.');
            assert(diff(cwProps.Gxy, eqCwProps.Gxy) < eps, '' + lamAngle + ' CW Rotated by ' + rotationAngle + ' deg, Gxy is equal.');
        }
    }

}