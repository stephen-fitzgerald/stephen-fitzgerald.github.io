//@ts-check

import { Material, Mat_FRP, Mat_Isotropic, Mat_PlanarIso12, Mat_PlanarIso23 } from '../js/pci/lpt/material.mjs';

let _materials = null;

export function getMaterials() {
    if (_materials === null) {
        _materials = initMaterials();
    }
    return _materials;
}

export function getMaterial(id) {
    let m = getMaterials();
    return m[id];
}

/**
 * 
 * @param {Material} m 
 * @returns {any} id of the new material
 */
export function addMaterial(m){
    if(m instanceof Material){
        return( _materials.push(m) - 1 );
    }
}

/**
 * 
 * @param {any} id 
 * @returns {Material | undefined} the deleted material, or undefined if not found
 */
export function deleteMaterial(id){
    let m = getMaterials();
    let ret;
    if(id>=0 && id<m.length){
        ret = m[id];
        m.splice(id,1);
    }
    return ret;
}

/**
 * 
 * @param {*} id 
 * @param {?Material} [theMaterial]
 * @returns {Material} any existing material using id
 */
export function setMaterial(id, theMaterial) {
    if (!(theMaterial instanceof Material)) {
        throw new Error("Argument must be a Material or sub-class.")
    }
    let m = getMaterials();
    let existingMaterial = m[id];
    m[id] = Material.duplicate(theMaterial);
    return existingMaterial;
}


/**
 * Returns an array of Materials for testing
 *
 * @export
 */
function initMaterials() {

    const CONVERT = {
        MSI_TO_PA: 6894.7573e6,
        PA_TO_MSI: 1.0 / 6894.7573e6,
        KSI_TO_PA: 6894.7573e3,
        PA_TO_KSI: 1.0 / 6894.7573e3,
        DEG_TO_RAD: Math.PI / 180.0,
        RAD_TO_DEG: 180.0 / Math.PI,
        IN_TO_M: 0.0254,
        M_TO_IN: 39.37007874
    };

    let materials = [];

    materials.push(
        new Mat_PlanarIso12({
            name: 'End-Grain Balsa',
            description: 'End-grain Balsa wood 12% MC',
            density: 178.0, // kg/m^3
            E1: 0.371e9,
            PR12: 0.30,
            E3: 3.71e9, // IE 3.71 GPa
            G13: 2.65e9,
            PR13: 0.38,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'PET Film',
            description: 'Polyethylene Terephthalate Film',
            density: 1390.0, // kg/m^3
            E1: 3.0e9, // GPa
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Steel',
            description: 'Generic mild steel.',
            density: 7850.0, // kg/m^3
            E1: 30.0 * CONVERT.MSI_TO_PA,
            PR12: 0.30,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Aluminum - 7075',
            description: 'Generic 7075 aluminum.',
            density: 2750.0, // kg/m^3
            E1: 11.5 * CONVERT.MSI_TO_PA,
            PR12: 0.30,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Epoxy Resin',
            description: 'Generic epoxy resin.',
            density: 1170.0, // kg/m^3
            E1: 3.1e9,
            PR12: 0.30,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Urethane Resin',
            description: 'Generic urethane resin.',
            density: 1150.0, // kg/m^3
            E1: 0.350 * CONVERT.MSI_TO_PA,
            PR12: 0.30,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Polyester Resin',
            description: 'Generic polyester resin.',
            density: 1250.0, // kg/m^3
            E1: 0.30 * CONVERT.MSI_TO_PA,
            PR12: 0.30,
        })
    );

    materials.push(
        new Mat_FRP({
            name: 'Basic FRP Material',
            description: 'Generic E-glass / polyester composite.',
            fiber: new Mat_Isotropic({
                name: 'E-Glass Fiber',
                description: 'Generic E-glass fiber.',
                density: 2540.0, // kg/m^3
                E1: 10.50 * CONVERT.MSI_TO_PA,
                PR12: 0.22,
            }),
            resin: new Mat_Isotropic({
                name: 'Polyester Resin',
                description: 'Generic polyester resin.',
                density: 1250.0, // kg/m^3
                E1: 0.30 * CONVERT.MSI_TO_PA,
                PR12: 0.30,
            }),
            vf: 0.35,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Polyester Gelcoat',
            description: 'Generic polyester gelcoat.',
            density: 1250.0, // kg/m^3
            E1: 0.250 * CONVERT.MSI_TO_PA,
            PR12: 0.30,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'E-Glass Fiber',
            description: 'Generic E-glass fiber.',
            density: 2540.0, // kg/m^3
            E1: 10.50 * CONVERT.MSI_TO_PA,
            PR12: 0.22,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'S-Glass Fiber',
            description: 'Generic S-glass fiber.',
            density: 2540.0, // kg/m^3
            E1: 12.4 * CONVERT.MSI_TO_PA,
            PR12: 0.20,
        })
    );

    materials.push(
        new Mat_PlanarIso23({
            name: 'Carbon Fiber',
            description: 'Generic standard modulus carbon fiber.',
            density: 1800.0, // kg/m^3
            E1: 227.5e9,
            E2: 20.7e9,
            G12: 8e9,
            PR12: 0.30,
            PR23: 0.25,
        })
    );

    materials.push(
        new Mat_PlanarIso23({
            name: 'Aramid Fiber',
            description: 'Generic aramid (Kevlar) fiber.',
            density: 1490.0, // kg/m^3
            E1: 22.0 * CONVERT.MSI_TO_PA,
            E2: 0.60 * CONVERT.MSI_TO_PA,
            G12: 0.42 * CONVERT.MSI_TO_PA,
            PR12: 0.35,
            PR23: 0.35,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H45 Foam',
            description: 'Divinycell foam',
            density: 48.0, // kg/m^3
            E1: 55.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H60 Foam',
            description: 'Divinycell foam',
            density: 60.0, // kg/m^3
            E1: 70.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H80 Foam',
            description: 'Divinycell foam',
            density: 80.0, // kg/m^3
            E1: 90.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H100 Foam',
            description: 'Divinycell foam',
            density: 100.0, // kg/m^3
            E1: 135.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H130 Foam',
            description: 'Divinycell foam',
            density: 130.0, // kg/m^3
            E1: 170.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H160 Foam',
            description: 'Divinycell foam',
            density: 160.0, // kg/m^3
            E1: 200.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H200 Foam',
            description: 'Divinycell foam',
            density: 200.0, // kg/m^3
            E1: 310.0e6,
            PR12: 0.40,
        })
    );

    materials.push(
        new Mat_Isotropic({
            name: 'Divinycell H250 Foam',
            description: 'Divinycell foam',
            density: 250.0, // kg/m^3
            E1: 400.0e6,
            PR12: 0.40,
        })
    );

    return materials;
}
