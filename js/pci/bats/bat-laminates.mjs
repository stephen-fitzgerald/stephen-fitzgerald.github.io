//@ts-check
import { Mat_Isotropic, Mat_PlanarIso23 } from "../lpt/material.mjs";
import { Laminate } from "../lpt/lpt.mjs";
import { FiberLayer, FabricLayer, WEAVETYPE } from "../lpt/layup.mjs";
import { CONVERT } from "../util/convert.mjs";
import { ORIENTATION } from "../lpt/orientation.mjs";

const UPRIGHT = ORIENTATION.UPRIGHT;

const epoxyResin = new Mat_Isotropic({
    name: "Epoxy Resin",
    description: "Generic epoxy resin.",
    density: 1170.0, // kg/m^3
    E1: 3.1e9,
    PR12: 0.3,
});

const eGlassFiber = new Mat_Isotropic({
    name: "E-Glass Fiber",
    description: "Generic E-glass fiber.",
    density: 2540.0, // kg/m^3
    E1: 10.5 * CONVERT.MSI_TO_PA,
    PR12: 0.22,
});

const carbonFiber = new Mat_PlanarIso23({
    name: "Carbon Fiber",
    description: "Generic standard modulus carbon fiber.",
    density: 1800.0, // kg/m^3
    E1: 207.5e9,
    E2: 18.7e9,
    G12: 8e9,
    PR12: 0.25,
    PR23: 0.2,
});

const glassUni = new FiberLayer({
    name: "Glass 140 gsm",
    description: "Glass 140 gsm",
    fiber: eGlassFiber,
    vf: 0.59,
    faw: 0.14,
    isRandom: false,
});


const carbonUni = new FiberLayer({
    name: "Carbon 150 gsm",
    description: "Carbon 150 gsm",
    fiber: carbonFiber,
    vf: 0.59,
    faw: 0.15,
    isRandom: false,
});

const carbon75 = new FiberLayer({
    name: "Carbon 75 gsm",
    description: "Carbon 75 gsm",
    fiber: carbonFiber,
    vf: 0.59,
    faw: 0.075,
    isRandom: false,
});

const c30 = new FabricLayer({
    name: "C 150 @ +/-30",
    description: "2 layers of carbon at +/- 30 degrees",
    layers: [carbonUni, carbonUni],
    angles: [30.0, -30.0],
    orientations: [UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const c30L = new FabricLayer({
    name: "C 75 @ +-30",
    description: "2 layers of 75 gsm carbon at +/- 30 degrees",
    layers: [carbon75, carbon75],
    angles: [30.0, -30.0],
    orientations: [UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const c45 = new FabricLayer({
    name: "C 150 @ +-45",
    description: "2 layers of carbon at +/- 45 degrees",
    layers: [carbonUni, carbonUni],
    angles: [45.0, -45.0],
    orientations: [UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_4 = new FabricLayer({
    name: "C 150 @ +-30 x 4",
    description: "4 layers of carbon +/- 30 degrees",
    layers: [c30, c30, c30, c30],
    angles: [0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_4L = new FabricLayer({
    name: "4L",
    description: "4 layers of carbon +/- 30 degrees",
    layers: [c30L, c30, c30, c30],
    angles: [0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_4f = new FabricLayer({
    name: "4f",
    description: "4 layers of carbon at +- 30/45/45/30",
    layers: [c30, c45, c45, c30],
    angles: [0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_4z = new FabricLayer({
    name: "4z",
    description: "4 layers of carbon +/- 30, plus CL layer of 75 gsm zero",
    layers: [c30, c30, carbon75, c30, c30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_4gz = new FabricLayer({
    name: "4gz",
    description:
        "4 layers of 150 gsm carbon +/- 30, plus CL layer of 140 gsm glass zero",
        layers: [c30, c30, glassUni, c30, c30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_5 = new FabricLayer({
    name: "5",
    description: "5 layers of carbon +/- 30 degrees",
    layers: [c30, c30, c30, c30, c30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_5L = new FabricLayer({
    name: "5L",
    description: "5 layers of carbon +/- 30 degrees",
    layers: [c30L, c30, c30, c30, c30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});

const lam_5f = new FabricLayer({
    name: "5f",
    description: "5 layers of carbon +/- 30/45/30/45/30 degrees",
    layers: [c30, c45, c30, c45, c30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    weaveType: WEAVETYPE.NONE,
});


export const batLaminates = {

    epoxyResin: epoxyResin,

    eGlassFiber: eGlassFiber,
    carbonFiber: carbonFiber,

    glassUni : glassUni,
    carbonUni : carbonUni,
    carbon75 : carbon75,

    c30 : c30,
    c30L : c30L,
    c45 : c45,
    
    lam_4 : lam_4,
    lam_4L : lam_4L,
    lam_4f : lam_4f,
    lam_4z : lam_4z,
    lam_4gz : lam_4gz,
    lam_5 : lam_5,
    lam_5L : lam_5L,
    lam_5f: lam_5f,
};
