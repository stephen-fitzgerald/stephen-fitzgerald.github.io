//@ts-check
/*jshint esversion: 6 */

import { CONVERT } from "../js/pci/util/convert.mjs";
import { Mat_Isotropic, Mat_PlanarIso23 } from "../js/pci/lpt/material.mjs";
import { printToHTML, syntaxHighlight } from "../js/pci/util/print-to-html.mjs";
import { CompositeLamina, Laminate } from "../js/pci/lpt/lpt.mjs";
import { decycle, retrocycle } from "../js/pci/util/serialize.mjs";
import { ORIENTATION } from "../js/pci/lpt/orientation.mjs";
import { AbstractView } from "./abstract-view.mjs";
import { calculateBarrelCompression } from "../js/pci/bats/bat-calcs.mjs";

export class BCView extends AbstractView {
  /** @override */
  constructor(args) {
    super(args);
    this.html = undefined;
    this.path = args ? args.path : undefined;
  }

  /** @override */
  async buildHTML() {
    if (this.html == undefined) {
      let response = await fetch(this.path);
      this.html = await response.text();

      //let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let options = { year: 'numeric', month: 'short', day: '2-digit' };
      var today = new Date();
      //@ts-expect-error
      let dateStr = today.toLocaleDateString("en-US", options);
      this.html = this.html.replace("{{date}}", dateStr);
    }
    return this.html;
  }

  /**
   *
   * @override
   * @param {number} time
   * @memberof BCView
   */
  modelToView(time) {
    this.parentElement = document.getElementById("bc-div");
//    if(this.parentElement == null )this.parentElement = undefined;
    calculateBarrelCompressions(this.parentElement);
  }
}

function calculateBarrelCompressions(parentElement = document.body) {
  let UPRIGHT = ORIENTATION.UPRIGHT;

  let batOd = (2.23 * 25.4) / 1000.0;

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

  let g30 = new Laminate({
    name: "g30",
    description: "2 layers of glass at +/- 30 degrees",
    plies: [glassUni, glassUni],
    angles: [30.0, -30.0],
    orientations: [UPRIGHT, UPRIGHT],
    isWoven: false,
  });

  let g45 = new Laminate({
    name: "g45",
    description: "2 layers of glass at +/- 45 degrees",
    plies: [glassUni, glassUni],
    angles: [45.0, -45.0],
    orientations: [UPRIGHT, UPRIGHT],
    isWoven: false,
  });

  let c0 = new Laminate({
    name: "C0",
    description: "2 layers of carbon at 0 degrees",
    plies: [carbonUni, carbonUni],
    angles: [0.0, 0.0],
    orientations: [UPRIGHT, UPRIGHT],
    isWoven: false,
  });

  let c10 = new Laminate({
    name: "C10",
    description: "2 layers of carbon at +/- 10 degrees",
    plies: [carbonUni, carbonUni],
    angles: [10.0, -10.0],
    orientations: [UPRIGHT, UPRIGHT],
    isWoven: false,
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

  let lam_4b = new Laminate({
    name: "Lam_4b",
    description: "8 layers of carbon at +/- 30 degrees",
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
    angles: [30.0, -30.0, 30.0, -30.0, 30.0, -30.0, 30.0, -30.0],
    orientations: [
      UPRIGHT,
      UPRIGHT,
      UPRIGHT,
      UPRIGHT,
      UPRIGHT,
      UPRIGHT,
      UPRIGHT,
      UPRIGHT,
    ],
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

  let lam_545i = new Laminate({
    name: "545i",
    description: "545 inner wall",
    plies: [g30, c10, c0, c10, g30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    isWoven: false,
  });

  let lam_545m = new Laminate({
    name: "545m",
    description: "545 middle wall",
    plies: [g30, c10, c0, c10, g30],
    angles: [0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    isWoven: false,
  });

  let lam_545o = new Laminate({
    name: "545o",
    description: "545 outer wall",
    plies: [g30, c10, c0, c10, g45, g45],
    angles: [0, 0, 0, 0, 0, 0],
    orientations: [UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT, UPRIGHT],
    isWoven: false,
  });

  //printToHTML('Laminate "' + lam_4.name + '" Properties: ' + syntaxHighlight(lam_4.properties));
  //let barrelCompression4 = calculateWallCompression(0.0566, lam_4.properties );
  //printToHTML('Barrel compression = ' + barrelCompression4 );

  //printToHTML('Laminate "' + lam_5.name + '": ' + syntaxHighlight(lam_5));
  //printToHTML('Laminate "' + lam_5.name + '" Properties: ' + syntaxHighlight(lam_5.properties));
  //let barrelCompression5 = calculateWallCompression(0.0566, lam_5.properties );
  //printToHTML('Barrel compression = ' + barrelCompression5 );

  printToHTML(
    "555 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5, lam_5]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4445 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_4, lam_4, lam_5]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "5L55 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5L, lam_5, lam_5]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "45L5L4 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5L, lam_5L, lam_4]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "55f4f Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5f, lam_4f]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "554gz Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5, lam_4gz]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "55f4 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5f, lam_4]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "554z Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5, lam_4z]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "554f Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5, lam_4f]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "5L5L5 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5L, lam_5L, lam_5]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "554 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5, lam_5, lam_4]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4f4f4f4f Barrel compression = " +
    calculateBarrelCompression(batOd, [
      lam_4f,
      lam_4f,
      lam_4f,
      lam_4f,
    ]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4f4f4f4 Barrel compression = " +
    calculateBarrelCompression(batOd, [
      lam_4f,
      lam_4f,
      lam_4f,
      lam_4,
    ]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4f4f44 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4f, lam_4f, lam_4, lam_4]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "4f444 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4f, lam_4, lam_4, lam_4]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "4444 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_4, lam_4, lam_4]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "4b4b4b4b Barrel compression (8 layer calc)= " +
    calculateBarrelCompression(batOd, [
      lam_4b,
      lam_4b,
      lam_4b,
      lam_4b,
    ]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "5L5L5L Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5L, lam_5L, lam_5L]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "45f4f Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5f, lam_4f]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "454gz Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5, lam_4gz]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "45f4 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5f, lam_4]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "454z Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5, lam_4z]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4f54f Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4f, lam_5, lam_4f]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4L444 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4L, lam_4, lam_4, lam_4]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "454f Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5, lam_4f]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "454 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5, lam_4]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "45L5L Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4, lam_5L, lam_5L]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "5L5L4 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_5L, lam_5L, lam_4]).toFixed(0),
    undefined,
    parentElement
  );

  printToHTML(
    "4L4L44 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_4L, lam_4L, lam_4, lam_4]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  printToHTML(
    "545 LLSR12 Barrel compression = " +
    calculateBarrelCompression(batOd, [lam_545i, lam_545m, lam_545o]).toFixed(
      0
    ),
    undefined,
    parentElement
  );

  /*
  let theLaminate = lam_4;
  let highlightedText = syntaxHighlight(retrocycle(decycle(theLaminate)));
  printToHTML(
    'Laminate "' + theLaminate.name + '": ' + highlightedText,
    undefined,
    parentElement
  );
  */
  /*
    theLaminate = lam_4b;
    highlightedText = syntaxHighlight(retrocycle(decycle(theLaminate)));
    printToHTML(
      'Laminate "' + theLaminate.name + '": ' + highlightedText,
      undefined,
      parentElement
    );
    /**/
}


