// @ts-check
/*jshint esversion: 6 */
import {isNumeric} from '../util/isNumeric.mjs';

export const CONVERT = function () {

    const lbPerKg = 2.20462262185;
    const ozmPerKg = 35.27396195;
    const inchesPerMeter = 39.3700787402;
  
    let scale = Object.create(null);
    let offset = Object.create(null);
  
    function cleanUpUnitName(unitName) {
      if (typeof unitName !== 'string') {
        throw new Error("Illegal Argument : Unit names must be strings.");
      }
      let ret = 0.0;
      let cleanName = unitName.trim();
      cleanName = cleanName.toLowerCase();
      cleanName = cleanName.replace('.', '');
      cleanName = cleanName.replace('^', '');
      cleanName = cleanName.replace(' ', '');
      cleanName = cleanName.replace('-', '');
      return cleanName;
    }
  
    function init() {
  
      for (let i = 0, len = table.length; i < len; i++) {
        let unitName = cleanUpUnitName(table[i][0]);
  
        if (Object.hasOwnProperty.call(scale, unitName)) {
          console.log("Duplicate unit name: " + unitName);
        }
        /**/
        if (!isNumeric(table[i][1]) || !isNumeric(table[i][2])) {
          let msg = "Bad numeric data for : " + table[i][0] + '(' + unitName + ')';
          msg = msg + ', scale: ' + table[i][1] + ', offset: ' + table[i][2];
          msg = msg + "\nExcluding : " + table[i][0] + ' from conversion units list.';
          console.log(msg);
        }
        scale[unitName] = table[i][1];
        offset[unitName] = table[i][2];
      }
  
      if (table.length != Object.keys(scale).length || table.length != Object.keys(offset).length) {
        console.log('Table has length of: ' + table.length);
        console.log('Found ' + Object.keys(scale).length + ' scale factors');
        console.log('Found ' + Object.keys(offset).length + ' offset values');
      }
    }
  
    function toBaseUnits(valueInNonBaseUnits, unitName) {
      let cleanName = cleanUpUnitName(unitName);
      return (valueInNonBaseUnits - offset[cleanName]) / scale[cleanName];
    }
  
    function fromBaseUnits(valueInBaseUnits, unitName) {
      let cleanName = cleanUpUnitName(unitName);
      return valueInBaseUnits * scale[cleanName] + offset[cleanName];
    }
  
    function fromTo(value, fromUnits, toUnits) {
      let valueInBaseUnits = toBaseUnits(value, fromUnits);
      return fromBaseUnits(valueInBaseUnits, toUnits);
    }
    
    let table = [
      // Mass
      ['kg', 1.0, 0.0],
      ['kilogram', 1.0, 0.0],
  
      ['g', 1000.0, 0.0],
      ['gm', 1000.0, 0.0],
      ['gram', 1000.0, 0.0],
  
      ['lbm', lbPerKg, 0.0],
      ['lb', lbPerKg, 0.0],
  
      ['ozm', ozmPerKg, 0.0],
      ['oz', ozmPerKg, 0.0],
  
      // Length
      ['meter', 1.0, 0.0],
      ['m', 1.0, 0.0],
  
      ['millimetre', 1000.0, 0.0],
      ['mm', 1000.0, 0.0],
  
      ['centimetre', 100.0, 0.0],
      ['cm', 100.0, 0.0],
  
      ['kilometre', 0.001, 0.0],
      ['km', 0.001, 0.0],
  
      ['mile', 6.21371192237e-4, 0.0],
      ['mi', 6.21371192237e-4, 0.0],
  
      ['nauticalmile', 5.39956803456e-4, 0.0],
      ['nmi', 5.39956803456e-4, 0.0],
  
      ['feet', 3.28083989501, 0.0],
      ['ft', 3.28083989501, 0.0],
  
      ['inch', inchesPerMeter, 0.0],
      ['in', inchesPerMeter, 0.0],
  
      // Time
      ['second', 1.0, 0.0],
      ['s', 1.0, 0.0],
      ['sec', 1.0, 0.0],
  
      ['minute', 1.0 / 60.0, 0.0],
      ['min', 1.0 / 60.0, 0.0],
  
      ['hour', 1.0 / 3600.0, 0.0],
      ['hr', 1.0 / 3600.0, 0.0],
  
      ['day', 1.0 / (24.0 * 3600.0), 0.0],
  
      ['week', 1.0 / (7.0 * 24.0 * 3600.0), 0.0],
      ['wk', 1.0 / (7.0 * 24.0 * 3600.0), 0.0],
  
      // Angle
      ['radian', 1.0, 0.0],
      ['rad', 1.0, 0.0],
  
      ['degree', 180 / Math.PI, 0.0],
      ['deg', 180 / Math.PI, 0.0],
  
      // Temperature
      ['degreecelcius', 1.0, 0.0],
      ['c', 1.0, 0.0],
      ['degc', 1.0, 0.0],
      ['celcius', 1.0, 0.0],
  
      ['degreefarenheight', 1.8, 32.0],
      ['f', 1.8, 32.0],
      ['degf', 1.8, 32.0],
      ['farenheight', 1.8, 32.0],
  
      ['degreekelvin', 1.0, 273.0],
      ['kelvin', 1.0, 273.0],
      ['degk', 1.0, 273.0],
      ['k', 1.0, 273.0],
  
      // Area
      ['squaremetre', 1.0, 0.0],
      ['sqm', 1.0, 0.0],
      ['sq.m.', 1.0, 0.0],
      ['m2', 1.0, 0.0],
  
      ['squaremillimetre', 1000000.0, 0.0],
      ['sqmm', 1000000.0, 0.0],
      ['mm2', 1000000.0, 0.0],
  
      ['squarecentimetre', 10000.0, 0.0],
      ['squarecentimeter', 10000.0, 0.0],
      ['sqcm', 10000.0, 0.0],
      ['cm2', 10000.0, 0.0],
  
      ['squareinch', inchesPerMeter * inchesPerMeter, 0.0],
      ['sqin', inchesPerMeter * inchesPerMeter, 0.0],
      ['in2', inchesPerMeter * inchesPerMeter, 0.0],
  
      ['squarefoot', 3.28083989501 * 3.28083989501, 0.0],
      ['squarefeet', 3.28083989501 * 3.28083989501, 0.0],
      ['sqft', 3.28083989501 * 3.28083989501, 0.0],
      ['ft2', 3.28083989501 * 3.28083989501, 0.0],
  
      ['squareyard', 3.28083989501 * 3.28083989501 / 9.0, 0.0],
      ['sqyd', 3.28083989501 * 3.28083989501 / 9.0, 0.0],
      ['yd2', 3.28083989501 * 3.28083989501 / 9.0, 0.0],
  
      // Volume
      ['cubicmeter', 1.0, 0.0],
      ['cubicmetre', 1.0, 0.0],
      ['cum', 1.0, 0.0],
      ['m3', 1.0, 0.0],
  
      ['cubiccentimetre', 1000000.0, 0.0],
      ['cubiccentimeter', 1000000.0, 0.0],
      ['cucm', 1000000.0, 0.0],
      ['cm3', 1000000.0, 0.0],
      ['cc', 1000000.0, 0.0],
  
      ['ml', 1000000.0, 0.0],
      ['millilitre', 1000000.0, 0.0],
      ['milliliter', 1000000.0, 0.0],
  
      ['cubicinch', 61023.7440947, 0.0],
      ['cuin', 61023.7440947, 0.0],
      ['in3', 61023.7440947, 0.0],
  
      ['cubicfoot', 35.3146667215, 0.0],
      ['cuft', 35.3146667215, 0.0],
      ['ft3', 35.3146667215, 0.0],
      ['cubicfeet', 35.3146667215, 0.0],
  
      ['liter', 1000.0, 0.0],
      ['l', 1000.0, 0.0],
  
      ['gallon', 264.172052358, 0.0],
      ['gal', 264.172052358, 0.0],
      ['usgallon', 264.172052358, 0.0],
      ['gallonus', 264.172052358, 0.0],
      ['usgal', 264.172052358, 0.0],
      ['galus', 264.172052358, 0.0],
  
      ['quart', 1056.68820943, 0.0],
      ['usquart', 1056.68820943, 0.0],
      ['quartus', 1056.68820943, 0.0],
      ['qt', 1056.68820943, 0.0],
      ['qtus', 1056.68820943, 0.0],
      ['usqt', 1056.68820943, 0.0],
  
      ['imperialgallon', 219.969248299, 0.0],
      ['imperialgallons', 219.969248299, 0.0],
      ['impgallon', 219.969248299, 0.0],
      ['impgal', 219.969248299, 0.0],
      ['galuk', 219.969248299, 0.0],
      ['gallonuk', 219.969248299, 0.0],
      ['ukgallon', 219.969248299, 0.0],
  
      // Density
      ['kilogram/cubicmeter', 1.0, 0.0],
      ['kilograms/cubicmeter', 1.0, 0.0],
      ['kg/m3', 1.0, 0.0],
      ['kg/cum', 1.0, 0.0],
  
      ['gram/cubiccentimetre', 1.0 / 1000.0, 0.0],
      ['gram/cubiccentimeter', 1.0 / 1000.0, 0.0],
      ['grams/cubiccentimetre', 1.0 / 1000.0, 0.0],
      ['grams/cubiccentimeter', 1.0 / 1000.0, 0.0],
      ['g/cc', 1.0 / 1000.0, 0.0],
      ['g/cucm', 1.0 / 1000.0, 0.0],
      ['g/cm3', 1.0 / 1000.0, 0.0],
  
      ['pound/cubicinch', 1.0 / 27679.9047102, 0.0],
      ['pounds/cubicinch', 1.0 / 27679.9047102, 0.0],
      ['lb/cuin', 1.0 / 27679.9047102, 0.0],
      ['lbm/cuin', 1.0 / 27679.9047102, 0.0],
      ['lb/in3', 1.0 / 27679.9047102, 0.0],
      ['lbm/in3', 1.0 / 27679.9047102, 0.0],
  
      ['pound/cubicfoot', 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0],
      ['pounds/cubicfoot', 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0],
      ['lbm/cuft', 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0],
      ['lb/cuft', 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0],
      ['lbm/ft3', 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0],
      ['lb/ft3', 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0],
  
      ['pound/usgallon', 1.0 / 119.826427317, 0.0],
      ['pounds/usgallon', 1.0 / 119.826427317, 0.0],
      ['pounds/gallon', 1.0 / 119.826427317, 0.0],
      ['pound/gallon', 1.0 / 119.826427317, 0.0],
      ['lbm/gallon', 1.0 / 119.826427317, 0.0],
      ['lbm/usgallon', 1.0 / 119.826427317, 0.0],
      ['lb/gallon', 1.0 / 119.826427317, 0.0],
      ['lbm/gal', 1.0 / 119.826427317, 0.0],
      ['lb/gal', 1.0 / 119.826427317, 0.0],
  
      // Velocity
  
      ['metre/second', 1.0, 0.0],
      ['metres/second', 1.0, 0.0],
      ['m/s', 1.0, 0.0],
      ['m/sec', 1.0, 0.0],
  
      ['feet/second', 3.28083989501, 0.0],
      ['ft/sec', 3.28083989501, 0.0],
      ['ft/s', 3.28083989501, 0.0],
  
      ['kilometres/hour', 3.6, 0.0],
      ['kilometers/hour', 3.6, 0.0],
      ['kilometre/hour', 3.6, 0.0],
      ['kilometer/hour', 3.6, 0.0],
      ['km/hr', 3.6, 0.0],
      ['km/h', 3.6, 0.0],
      ['kph', 3.6, 0.0],
  
      ['miles/hour', 2.23693629205, 0.0],
      ['mile/hour', 2.23693629205, 0.0],
      ['mph', 2.23693629205, 0.0],
      ['mi/hr', 2.23693629205, 0.0],
      ['mi/h', 2.23693629205, 0.0],
  
      // Acceleration
      // m^4 - 2nd Moment of Area
  
      // Force
  
      ['newtons', 1.0, 0.0],
      ['newton', 1.0, 0.0],
      ['n', 1.0, 0.0],
  
      ['kilogramforce', 0.1020, 0.0],
      ['kilogramsforce', 0.1020, 0.0],
      ['kgf', 0.1020, 0.0],
  
      ['poundsforce', 0.2248, 0.0],
      ['poundforce', 0.2248, 0.0],
      ['lbf', 0.2248, 0.0],
  
      ['kilopoundsforce', 0.0002248, 0.0],
      ['kilopoundforce', 0.0002248, 0.0],
      ['kip', 0.0002248, 0.0],
  
      ['kilonewton', 1000.0, 0.0],
      ['kilonewtons', 1000.0, 0.0],
      ['kn', 1000.0, 0.0],
  
      // Areal Weight
  
      ['kilogram/squaremeter', 1.0, 0.0],
      ['kilogram/squaremetre', 1.0, 0.0],
      ['kilograms/squaremeter', 1.0, 0.0],
      ['kilograms/squaremetre', 1.0, 0.0],
      ['kg/sqm', 1.0, 0.0],
      ['kg/m2', 1.0, 0.0],
  
      ['gram/squaremeter', 1000.0, 0.0],
      ['grams/squaremeter', 1000.0, 0.0],
      ['gram/squaremetre', 1000.0, 0.0],
      ['grams/squaremetre', 1000.0, 0.0],
      ['g/sqm', 1000.0, 0.0],
      ['g/m2', 1000.0, 0.0],
  
      ['ounces/squareyard', 29.4935246816, 0.0],
      ['ounce/squareyard', 29.4935246816, 0.0],
      ['oz/sqyd', 29.4935246816, 0.0],
      ['oz/yd2', 29.4935246816, 0.0],
  
      ['ounce/squarefoot', 29.4935246816 / 9.0, 0.0],
      ['ounces/squarefoot', 29.4935246816 / 9.0, 0.0],
      ['oz/sqft', 29.4935246816 / 9.0, 0.0],
      ['oz/ft2', 29.4935246816 / 9.0, 0.0],
      ['ozm/sqft', 29.4935246816 / 9.0, 0.0],
      ['ozm/ft2', 29.4935246816 / 9.0, 0.0],
  
      // Work/Energy
  
      ['newtonmetre', 1.0, 0.0],
      ['newtonmetres', 1.0, 0.0],
      ['newtonmeter', 1.0, 0.0],
      ['newtonmeters', 1.0, 0.0],
      ['nm', 1.0, 0.0],
  
      // Power/Heat Flow
  
      // Pressure/Stress
  
      ['newton/squaremeter', 1.0, 0.0],
      ['newtons/squaremeter', 1.0, 0.0],
      ['n/sqm', 1.0, 0.0],
      ['n/m2', 1.0, 0.0],
      ['pa', 1.0, 0.0],
  
      ['kilopascal', 1.0 / 1000.0, 0.0],
      ['kpa', 1.0 / 1000.0, 0.0],
      ['kn/sqm', 1.0 / 1000.0, 0.0],
      ['kn/m2', 1.0 / 1000.0, 0.0],
  
      ['megapascal', 1.0 / 1000000.0, 0.0],
      ['mpa', 1.0 / 1000000.0, 0.0],
      ['n/sqmm', 1.0 / 1000000.0, 0.0],
      ['n/mm2', 1.0 / 1000000.0, 0.0],
  
      ['gpa', 1.0 / 1000000000.0, 0.0],
      ['gigapascal', 1.0 / 1000000000.0, 0.0],
      ['kn/sqmm', 1.0 / 1000000000.0, 0.0],
      ['kn/mm2', 1.0 / 1000000000.0, 0.0],
  
      ['pound/squareinch', 1.0 / 6894.75729317, 0.0],
      ['pounds/squareinch', 1.0 / 6894.75729317, 0.0],
      ['lb/sqin', 1.0 / 6894.75729317, 0.0],
      ['lb/in2', 1.0 / 6894.75729317, 0.0],
      ['lbf/sqin', 1.0 / 6894.75729317, 0.0],
      ['lbf/in2', 1.0 / 6894.75729317, 0.0],
      ['psi', 1.0 / 6894.75729317, 0.0],
  
      ['kilopound/squareinch', 0.001 / 6894.75729317, 0.0],
      ['kilopounds/squareinch', 0.001 / 6894.75729317, 0.0],
      ['ksi', 0.001 / 6894.75729317, 0.0],
      ['klb/sqin', 0.001 / 6894.75729317, 0.0],
      ['klb/in2', 0.001 / 6894.75729317, 0.0],
  
      ['megapound/squareinch', 0.000001 / 6894.75729317, 0.0],
      ['megapounds/squareinch', 0.000001 / 6894.75729317, 0.0],
      ['msi', 0.000001 / 6894.75729317, 0.0],
      ['106lbf/sqin', 0.000001 / 6894.75729317, 0.0],
      ['106lbf/in2', 0.000001 / 6894.75729317, 0.0],
  
      ['kilogramforce/squaremeter', 1.0 / 9.81, 0.0],
      ['kilogramforce/squaremetre', 1.0 / 9.81, 0.0],
      ['kgf/sqm', 1.0 / 9.81, 0.0],
      ['kgf/m2', 1.0 / 9.81, 0.0],
  
      ['kilogramforce/squaremillimeter', 0.000001 / 9.81, 0.0],
      ['kilogramforce/squaremillimetre', 0.000001 / 9.81, 0.0],
      ['kgf/sqmm', 0.000001 / 9.81, 0.0],
      ['kgf/mm2', 0.000001 / 9.81, 0.0],
  
      // Frequency
      // Thermal Expansion
  
      ['meter/meter/degreecelcius', 1.0, 0.0],
      ['metre/metre/degreecelcius', 1.0, 0.0],
      ['m/m/degc', 1.0, 0.0],
      ['1/degc', 1.0, 0.0],
      ['/degc', 1.0, 0.0],
  
      ['inch/inch/degreefarenheight', 1.0 / 1.8, 0.0],
      ['in/in/degf', 1.0 / 1.8, 0.0],
      ['1/degf', 1.0 / 1.8, 0.0],
      ['/degf', 1.0 / 1.8, 0.0],
  
      // Thermal Conductivity
  
      ['watts/metre/degreecelcius', 1.0, 0.0],
      ['watt/metre/degreecelcius', 1.0, 0.0],
      ['watts/meter/degreecelcius', 1.0, 0.0],
      ['watt/meter/degreecelcius', 1.0, 0.0],
      ['w/m/degc', 1.0, 0.0],
  
      ['btu/hour/foot/degreefarenheight', 0.57782, 0.0],
      ['btu/hr/ft/degf', 0.57782, 0.0],
  
      // viscosity - base unit is Poiseuille = Pa s = kg/m.s
      ['pas', 1.0, 0.0],
      ['pascalsecond', 1.0, 0.0],
      ['kg/m/s', 1.0, 0.0],
      ['Poiseuille', 1.0, 0.0],
  
      ['centipoise', 0.001, 0.0],
      ['cp', 0.001, 0.0],
      ['mpas', 0.001, 0.0],
  
      ['darcy', 1 / 9.869233e-13, 0.0],
    ];
  
    init();
  
    return {
      toBaseUnits: toBaseUnits,
      fromBaseUnits: fromBaseUnits,
      fromTo: fromTo, 
      MSI_TO_PA: 6894.7573e6,
      PA_TO_MSI: 1.0 / 6894.7573e6,
      KSI_TO_PA: 6894.7573e3,
      PA_TO_KSI: 1.0 / 6894.7573e3,
      DEG_TO_RAD: Math.PI / 180.0,
      RAD_TO_DEG: 180.0 / Math.PI,
      IN_TO_M: 0.0254,
      M_TO_IN: 39.37007874
    };
  
  }();