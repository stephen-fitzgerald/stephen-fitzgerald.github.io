//@ts-check

import { CONVERT } from "../js/lpt/convert.mjs";
import { ORIENTATION } from "../js/lpt/orientation.mjs";
import { Mat_Isotropic, Mat_PlanarIso23 } from "../js/lpt/material.mjs";
import { CompositeLamina, Laminate } from "../js/lpt/lpt.mjs";

export function getBatLaminates() {
    const UPRIGHT = ORIENTATION.UPRIGHT;
    let materials = new Map();
    let laminates = new Map();
    let returnData = {
      materials: materials,
      laminates: laminates,
    };
  
    let epoxyResin = new Mat_Isotropic({
      name: "Epoxy Resin",
      description: "Generic epoxy resin.",
      density: 1170.0, // kg/m^3
      E1: 3.1e9,
      PR12: 0.3,
    });
  
    let eGlassFiber = new Mat_Isotropic({
      name: "E-Glass Fiber",
      description: "Generic E-glass fiber.",
      density: 2540.0, // kg/m^3
      E1: 10.5 * CONVERT.MSI_TO_PA,
      PR12: 0.22,
    });
  
    let carbonFiber = new Mat_PlanarIso23({
      name: "Carbon Fiber",
      description: "Generic standard modulus carbon fiber.",
      density: 1800.0, // kg/m^3
      E1: 207.5e9,
      E2: 18.7e9,
      G12: 8e9,
      PR12: 0.25,
      PR23: 0.2,
    });
  
    returnData.materials.set("Epoxy Resin", epoxyResin);
    returnData.materials.set("E-Glass Fiber", eGlassFiber);
    returnData.materials.set("Carbon Fiber", carbonFiber);
  
    let glassUni = new CompositeLamina({
      name: "Glass 140 gsm",
      description: "Glass 140 gsm",
      fiber: eGlassFiber,
      resin: epoxyResin,
      vf: 0.59,
      faw: 0.14,
      isRandom: false,
    });
  
    let carbonUni = new CompositeLamina({
      name: "Carbon 150 gsm",
      description: "Carbon 150 gsm",
      fiber: carbonFiber,
      resin: epoxyResin,
      vf: 0.59,
      faw: 0.15,
      isRandom: false,
    });
  
    let carbon75 = new CompositeLamina({
      name: "Carbon 75 gsm",
      description: "Carbon 75 gsm",
      fiber: carbonFiber,
      resin: epoxyResin,
      vf: 0.59,
      faw: 0.075,
      isRandom: false,
    });
  
    let c30 = new Laminate({
      name: "C30",
      description: "2 layers of carbon at +/- 30 degrees",
      plies: [carbonUni, carbonUni],
      angles: [30.0, -30.0],
      orientations: [UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let c30L = new Laminate({
      name: "C30L",
      description: "2 layers of 75 gsm carbon at +/- 30 degrees",
      plies: [carbon75, carbon75],
      angles: [30.0, -30.0],
      orientations: [UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let c45 = new Laminate({
      name: "C 45",
      description: "2 layers of carbon at +/- 45 degrees",
      plies: [carbonUni, carbonUni],
      angles: [45.0, -45.0],
      orientations: [UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_4 = new Laminate({
      name: "4",
      description: "4 layers of carbon +/- 30 degrees",
      plies: [c30, c30, c30, c30],
      angles: [0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_4L = new Laminate({
      name: "4L",
      description: "4 layers of carbon +/- 30 degrees",
      plies: [c30L, c30, c30, c30],
      angles: [0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_4f = new Laminate({
      name: "4f",
      description: "4 layers of carbon at +- 30/45/45/30",
      plies: [c30, c45, c45, c30],
      angles: [0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_4z = new Laminate({
      name: "4z",
      description: "4 layers of carbon +/- 30, plus CL layer of 75 gsm zero",
      plies: [c30, c30, carbon75, c30, c30],
      angles: [0, 0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_4b = new Laminate({
      name: "4b",
      description: "8 layers of carbon uni @ +/- 30",
      plies: [
        carbonUni,
        carbonUni,
        carbonUni,
        carbonUni,
        carbonUni,
        carbonUni,
        carbonUni,
        carbonUni,
      ],
      angles: [30, -30, 30, -30, 30, -30, 30, -30],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_4gz = new Laminate({
      name: "4gz",
      description:
        "4 layers of 150 gsm carbon +/- 30, plus CL layer of 140 gsm glass zero",
      plies: [c30, c30, glassUni, c30, c30],
      angles: [0, 0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_5 = new Laminate({
      name: "5",
      description: "5 layers of carbon +/- 30 degrees",
      plies: [c30, c30, c30, c30, c30],
      angles: [0, 0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_5L = new Laminate({
      name: "5L",
      description: "5 layers of carbon +/- 30 degrees",
      plies: [c30L, c30, c30, c30, c30],
      angles: [0, 0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    let lam_5f = new Laminate({
      name: "5f",
      description: "5 layers of carbon +/- 30/45/30/45/30 degrees",
      plies: [c30, c45, c30, c45, c30],
      angles: [0, 0, 0, 0, 0],
      orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
      isWoven: false,
    });
  
    returnData.laminates.set("lam_4", lam_4);
    returnData.laminates.set("lam_4b", lam_4b);
    returnData.laminates.set("lam_4L", lam_4L);
    returnData.laminates.set("lam_4f", lam_4f);
    returnData.laminates.set("lam_4z", lam_4z);
    returnData.laminates.set("lam_4gz", lam_4gz);
    returnData.laminates.set("lam_5", lam_5);
    returnData.laminates.set("lam_5L", lam_5L);
    returnData.laminates.set("lam_5f", lam_5f);
  
    return returnData;
  }