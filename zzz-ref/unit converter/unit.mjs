/**
 * Converts values from one unit to and from a base unit. The base units are SI
 * units: kg.,m.,sec,deg.C,angular deg., mol, and powers of each of these. For
 * example the base units for length are meters. The base units for force are
 * kg.m/s^2, or Newtons. The base units for area are sq.m.
 *
 * Conversion is done using a simple scale and offset where:
 *     value in these units = value in base units x scale + offset
 *     i.e. Temp in deg.F = Temp in deg.C x 1.8 + 32.0
 * 
 */

// @ts-check
/* jshint esversion: 6 */

export class Unit {

    /**
     *  Create a new Unit
     *  @param code - UnitCode for the new unit (eg UnitCode.TEMPERATURECODE )
     *  @param name - name to display for these units (eg "degF" )
     *  @param scale - the scale factor ( eg 1.80 )
     *  @param offset - the offset in base units ( eg 32 )
     */
    constructor(name, code, scale, offset) {
        this.code = code;
        this.name = name;
        this.scale = scale;
        this.offset = offset;
    }

    /**
     * @param valueInBaseUnits i.e. deg.C
     * @return value in this converters units ie deg.F = deg.C * 1.8 + 32
     */
    convert(valueInBaseUnits) {
        return valueInBaseUnits * this.scale + this.offset;
    }

    /**
     * @param valueInMyUnits i.e. deg.F
     * @return value in Base units ie deg.C = (deg.F - 32) / 1.8
     */
    unconvert(valueInMyUnits) {
        return (valueInMyUnits - this.offset) / this.scale;
    }

    isCompatibleWith(otherUnit) {
        return this.code.equals(otherUnit.code);
    }

    /**
     * create a copy with a new Name
     * @param newName
     * @return a copy of this Unit
     */
    copy(newName) {
        return new Unit(newName, this.code, this.scale, this.offset);
    }

    getBaseUnits() {
        return new Unit("", this.code, 1.0, 0.0);
    }

    isBaseUnit() {
        return this.scale === 1.0 && this.offset === 0.0;
    }

    getCode() {
        return this.code;
    }

    getName() {
        return this.name;
    }

    getOffset() {
        return this.offset;
    }

    getScale() {
        return this.scale;
    }

    equals(o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Unit)) {
            return false;
        }
        let ud = o;
        if (!(this.scale == ud.scale)) {
            return false;
        }
        if (!(this.offset == ud.offset)) {
            return false;
        }
        if (!(this.name == ud.name)) {
            return false;
        }
        if (!(this.code == ud.code || (this.code && this.code.equals(ud.code)))) {
            return false;
        }
        return true;
    }

    hashCode() {
        let ret = 17;
        ret = 37 * ret;
        ret = 37 * ret;
        ret = 37 * ret;
        ret = 37 * ret;
        return ret;
    }
}

/**
 * A UnitCode keeps track of the power of each basic unit in a derived unit.
 * The basic units are: mass, length, time, angle, temperature, amper and mol
 * Basic units are measured in: kilograms, meters, seconds, radians, degrees Celcius, Ampers and Mols
 * For example a N = kg.m/s^2 its code is (1, 1, -2, 0, 0, 0, 0).
 * the code for meter is (0, 1, 0, 0, 0) so N x m (torque) has a code
 * of (1+0, 1+1, -2+0, 0+0, 0+0) = (1, 2, -2, 0, 0, 0, 0), kg.m^2/s^2 or N.m
 * To divide one unit by another you subtract each component.
 * Using this code system allows us to determine if a unit is compatible with,
 * or the inverse of, another unit.
 */
export class UnitCode {

    /*
        mass in kilograms, 
        length in meters, 
        time in seconds, 
        angle in radians, 
        temperature in degrees Celcius, 
        current in Ampers 
        moles in Mols
    */

    /**
     * Creates an instance of UnitCode.
     * @param {any} args 
     * @param Number [args.massP]
     * @param Number [args.lengthP]
     * @param Number [args.timeP]
     * @param Number [args.angleP]
     * @param Number [args.tempP]
     * @param Number [args.ampP]
     * @param Number [args.molP]
     * 
     * @memberOf UnitCode
     */
    constructor(args) {
        this.massP = args.massP || 0;
        this.lengthP = args.lengthP || 0;
        this.timeP = args.timeP || 0;
        this.angleP = args.angleP || 0;
        this.tempP = args.tempP || 0;
        this.ampP = args.ampP || 0;
        this.molP = args.molP || 0;
    }

    /**
     * Two UnitCode objects are equal if each power is equal
     **/
    equals(o) {
        if (this === o) {
            return true;
        }
        if (!(o instanceof UnitCode)) {
            return false;
        }
        let uc = o;
        if (!(this.lengthP == uc.lengthP)) {
            return false;
        }
        if (!(this.massP == uc.massP)) {
            return false;
        }
        if (!(this.timeP == uc.timeP)) {
            return false;
        }
        if (!(this.tempP == uc.tempP)) {
            return false;
        }
        if (!(this.angleP == uc.angleP)) {
            return false;
        }
        if (!(this.ampP == uc.ampP)) {
            return false;
        }
        if (!(this.molP == uc.molP)) {
            return false;
        }
        return true;
    }

    // this class is used as a hash code
    hashCode() {
        let ret = 17;
        ret = 37 * ret + this.lengthP;
        ret = 37 * ret + this.massP;
        ret = 37 * ret + this.timeP;
        ret = 37 * ret + this.tempP;
        ret = 37 * ret + this.angleP;
        ret = 37 * ret + this.ampP;
        ret = 37 * ret + this.molP;
        return ret;
    }

    mult(uc) {
        return new UnitCode({
            massP: this.massP + uc.massP,
            lengthP: this.lengthP + uc.lengthP,
            timeP: this.timeP + uc.timeP,
            angleP: this.angleP + uc.angleP,
            tempP: this.tempP + uc.tempP,
            ampP: this.ampP + uc.ampP,
            molP: this.molP + uc.molP
        });
    }

    div(uc) {
        return new UnitCode({
            massP: this.massP - uc.massP,
            lengthP: this.lengthP - uc.lengthP,
            timeP: this.timeP - uc.timeP,
            angleP: this.angleP - uc.angleP,
            tempP: this.tempP - uc.tempP,
            ampP: this.ampP - uc.ampP,
            molP: this.molP - uc.molP
        });
    }

    pow(p) {
        return new UnitCode({
            massP: this.massP * p,
            lengthP: this.lengthP * p,
            timeP: this.timeP * p,
            angleP: this.angleP * p,
            tempP: this.tempP * p,
            ampP: this.ampP * p,
            molP: this.molP * p
        });
    }

    // Constants
    //Basic Unit Codes
    static NULLCODE = new UnitCode({}); // null
    static MASSCODE = new UnitCode({ massP:1}); // kg
    static LENGTHCODE = new UnitCode({ lengthP:1}); // m
    static TIMECODE = new UnitCode({ timeP:1}); // s
    static ANGLECODE = new UnitCode({ angleP:1}); // rad
    static TEMPERATURECODE = new UnitCode({ tempP:1}); // deg C
    static CURRENTCODE = new UnitCode({ ampP:1}); // Amp
    static MOLCODE = new UnitCode({ molP:1}); // mol

    //Derived Unit Codes
    static AREACODE = UnitCode.LENGTHCODE.pow(2); // m^2
    static VOLUMECODE = UnitCode.LENGTHCODE.pow(3); // m^3
    static LENGTH4CODE = UnitCode.LENGTHCODE.pow(4); // m^4
    static SECOND_MOMENT_OF_AREA_CODE = UnitCode.LENGTHCODE.pow(4); // m^4
    static DENSITYCODE = UnitCode.MASSCODE.div(UnitCode.VOLUMECODE); // kg/m^3
    static VELOCITYCODE = UnitCode.LENGTHCODE.div(UnitCode.TIMECODE); // m/s
    static ACCELERATIONCODE = UnitCode.LENGTHCODE.div(UnitCode.TIMECODE.pow(2)); // m/s^2
    static FORCECODE = UnitCode.MASSCODE.mult(UnitCode.ACCELERATIONCODE); // N = kg m/s^2
    static MOMENTCODE = UnitCode.FORCECODE.mult(UnitCode.LENGTHCODE); // N-m = kg m/s^2 x m
    static FORCEPERLENGTHCODE = UnitCode.FORCECODE.div(UnitCode.LENGTHCODE); // N/m = kg m/s^2 x 1/m
    static PRESSURECODE = UnitCode.FORCECODE.div(UnitCode.AREACODE); // Pa = N/m^2 = kg m/s^2 x 1/m^2
    static WORKCODE = UnitCode.FORCECODE.mult(UnitCode.LENGTHCODE); // J = N-m = kg m/s^2 x m
    static POWERCODE = UnitCode.WORKCODE.div(UnitCode.TIMECODE); // W = J/s = kg m/s^2 x m/s
    static FREQUENCYCODE = UnitCode.TIMECODE.pow(-1); // 1/s
    static THERMALEXPANSIONCODE = UnitCode.TEMPERATURECODE.pow(-1); // in/in/deg.C
    static THERMALCONDUCTIVITYCODE = UnitCode.POWERCODE.div(UnitCode.LENGTHCODE.mult(UnitCode.TEMPERATURECODE)); // W/m/deg.C
    static AREALWTCODE = UnitCode.MASSCODE.div(UnitCode.AREACODE); // kg/sq.m
    static VISCOSITYCODE = UnitCode.MASSCODE.div(UnitCode.LENGTHCODE.mult(UnitCode.TIMECODE)); // kg /(m s) = 1000 cP
    static PERMEABILITYCODE = UnitCode.AREACODE; // 9.869233e-13 sq.m = 1 Darcy
}

/**
 * A simple database that maps names to Unit objects for many common engineering units.
 * This is a singleton object that creates the data in it's constructor.<p>
 * Several static methods are provided to convert values from one unit system to another.
 * @author pcomp
 */
export class GlobalUnits extends Map { //HashMap<String, Unit> {

    // This is a global database of UnitData records, used as a convienience to save 
    // effort in adding units to UnitConverter instances
    static tempUD;
    static tempDbl;
    static DATA = new GlobalUnits();

    public static Map<String, Unit> getData() {
        return DATA;
    }

    /**
     * Find a Unit in the GlobalUnits collection given a name as a key for lookup.
     * @param name name of unit as saved in GlobalUnits keyset
     * @return the Unit saved under the given name
     */
    public static Unit getUnitByName(String name) {
        return getData().get(name);
    }

    /** 
     * A global (static) method for converting between units already named in GlobalUnits.  
     * @throws IllegalArgumentException if both unit names don't already exist in GlobalUnits
     * @throws IllegalArgumentException if either unit name is null
     * @throws IllegalArgumentException if units are not compatible
     */
    public static double convertValueFromTo(double currentValue, String currentUnitName, String newUnitName) {
        return convertValueFromTo(currentValue, getUnitByName(currentUnitName), getUnitByName(newUnitName));
    }

    /**
     * converts currentValue, given in currentUnits, to its' equivalent value in newUnits
     */
    public static double convertValueFromTo(double currentValue, Unit currentUnit, Unit newUnit) {

        if (currentUnit == null) {
            throw new IllegalArgumentException("Can't convert null units to anything!");
        }

        if (newUnit == null) {
            throw new IllegalArgumentException("Can't convert " + currentUnit.getName() + " to null units");
        }

        // Check for incompatible units error
        if (newUnit.isCompatibleWith(currentUnit) == false) {
            throw new IllegalArgumentException(
                    "Incompatible Units : '" + currentUnit.getName() + "' & '" + newUnit.getName() + "'.");
        }

        // Check for identical units - don't convert, just return current value
        if (newUnit.equals(currentUnit)) {
            return currentValue;
        }

        // Do conversion by standard formula
        return (currentValue - currentUnit.getOffset()) / currentUnit.getScale() * newUnit.getScale() + newUnit.getOffset();
    }

    /**
     * 
     * @param theUnitName
     * @return a Map containing all the Units in GlobalUnits that are compatible 
     * with the one named theUnitName.
     */
    public static Map<String, Unit> getAllCompatibleUnits(String theUnitName) {
        return getAllCompatibleUnits(getUnitByName(theUnitName));
    }

    /**
     * 
     * @param theUnit
     * @return a Map containing all the Units in GlobalUnits that are compatible 
     * with theUnit
     */
    public static Map<String, Unit> getAllCompatibleUnits(Unit theUnit) {
        if (theUnit == null) {
            throw new NullPointerException("Can't find units compatible with null!");
        }
        Map<String, Unit> ret = new HashMap<String, Unit>();
        for (String s : getData().keySet()) {
            Unit u = getUnitByName(s);
            if (u != null && u.isCompatibleWith(theUnit)) {
                ret.put(s, u);
            }
        }
        return ret;
    }

    /**
     * This is where all of the globally know units are added.  This should probably be done better, but
     * this seems pretty secure, and should not have to be changed often.
     * 
     */
    private GlobalUnits() {
        super();
        Map<String, Unit> gUDT = this;

        // setup basic unit codes
        tempUD = new Unit("none", UnitCode.NULLCODE, 1.0, 0.0);
        gUDT.put("", tempUD);
        gUDT.put("n/a", tempUD);
        gUDT.put("null", tempUD);
        gUDT.put("none", tempUD);
        gUDT.put("None", tempUD);
        gUDT.put("Null", tempUD);
        gUDT.put("No Units", tempUD);
        gUDT.put("dimensionless", tempUD);
        gUDT.put("Dimensionless", tempUD);

        // 0.0 - 1.0 vs 0 - 100%
        tempUD = new Unit("%", UnitCode.NULLCODE, 100.0, 0.0);
        gUDT.put("%", tempUD);

        // Mass
        tempUD = new Unit("Kilogram", UnitCode.MASSCODE, 1.0, 0.0);
        gUDT.put("Kilograms", tempUD);
        gUDT.put("kg", tempUD);
        gUDT.put("kg.", tempUD);
        gUDT.put("Kg.", tempUD);
        gUDT.put("Kg", tempUD);

        tempUD = new Unit("Pounds-Mass", UnitCode.MASSCODE, 2.20462262185, 0.0);
        gUDT.put("lbm", tempUD);
        gUDT.put("lb mass", tempUD);
        gUDT.put("lb.mass", tempUD);
        gUDT.put("Pounds-Mass", tempUD);

        tempUD = new Unit("Ounce-Mass", UnitCode.MASSCODE, 35.2739619496, 0.0);
        gUDT.put("ozm", tempUD);
        gUDT.put("oz.m", tempUD);
        gUDT.put("Ounces-Mass", tempUD);
        gUDT.put("oz mass", tempUD);

        tempUD = new Unit("Short Tons", UnitCode.MASSCODE, 0.001102311311, 0.0);
        gUDT.put("st", tempUD);
        gUDT.put("st.", tempUD);
        gUDT.put("Short Tons", tempUD);

        tempUD = new Unit("Long Tons", UnitCode.MASSCODE, 0.0009842, 0.0);
        gUDT.put("lt", tempUD);
        gUDT.put("lt.", tempUD);
        gUDT.put("Long Tons", tempUD);

        tempUD = new Unit("Metric Tons", UnitCode.MASSCODE, 0.001, 0.0);
        gUDT.put("mt", tempUD);
        gUDT.put("mt.", tempUD);
        gUDT.put("Metric Tons", tempUD);

        tempUD = new Unit("Grams", UnitCode.MASSCODE, 1000.0, 0.0);
        gUDT.put("g", tempUD);
        gUDT.put("g.", tempUD);
        gUDT.put("Grams", tempUD);

        // Length

        tempUD = new Unit("Metres", UnitCode.LENGTHCODE, 1.0, 0.0);
        gUDT.put("m", tempUD);
        gUDT.put("m.", tempUD);
        gUDT.put("Meters", tempUD);
        gUDT.put("Metres", tempUD);

        tempUD = new Unit("Millimetres", UnitCode.LENGTHCODE, 1000.0, 0.0);
        gUDT.put("mm", tempUD);
        gUDT.put("mm.", tempUD);
        gUDT.put("Millimeters", tempUD);
        gUDT.put("Millimetres", tempUD);

        tempUD = new Unit("Centimetres", UnitCode.LENGTHCODE, 100.0, 0.0);
        gUDT.put("cm", tempUD);
        gUDT.put("cm.", tempUD);
        gUDT.put("Centimeters", tempUD);
        gUDT.put("Centimetres", tempUD);

        tempUD = new Unit("Kilometres", UnitCode.LENGTHCODE, 0.001, 0.0);
        gUDT.put("km", tempUD);
        gUDT.put("km.", tempUD);
        gUDT.put("Kilometers", tempUD);
        gUDT.put("Kilometres", tempUD);

        tempUD = new Unit("Miles", UnitCode.LENGTHCODE, 6.21371192237e-4, 0.0);
        gUDT.put("mi", tempUD);
        gUDT.put("mi.", tempUD);
        gUDT.put("Miles", tempUD);

        tempUD = new Unit("Nautical Miles", UnitCode.LENGTHCODE, 5.39956803456e-4, 0.0);
        gUDT.put("n.mi", tempUD);
        gUDT.put("n.mi.", tempUD);
        gUDT.put("Nautical Miles", tempUD);

        tempUD = new Unit("Feet", UnitCode.LENGTHCODE, 3.28083989501, 0.0);
        gUDT.put("ft", tempUD);
        gUDT.put("ft.", tempUD);
        gUDT.put("Feet", tempUD);

        tempUD = new Unit("Inches", UnitCode.LENGTHCODE, 39.3700787402, 0.0);
        gUDT.put("in", tempUD);
        gUDT.put("in.", tempUD);
        gUDT.put("Inches", tempUD);

        // Time

        tempUD = new Unit("Seconds", UnitCode.TIMECODE, 1.0, 0.0);
        gUDT.put("s", tempUD);
        gUDT.put("s.", tempUD);
        gUDT.put("sec", tempUD);
        gUDT.put("sec.", tempUD);
        gUDT.put("Seconds", tempUD);

        tempDbl = 1.0 / 60.0;
        tempUD = new Unit("Minutes", UnitCode.TIMECODE, tempDbl, 0.0);
        gUDT.put("min", tempUD);
        gUDT.put("min.", tempUD);
        gUDT.put("Minutes", tempUD);

        tempDbl = 1.0 / 3600.0;
        tempUD = new Unit("Hours", UnitCode.TIMECODE, tempDbl, 0.0);
        gUDT.put("hr", tempUD);
        gUDT.put("hr.", tempUD);
        gUDT.put("hour", tempUD);
        gUDT.put("Hour", tempUD);
        gUDT.put("Hours", tempUD);

        tempDbl = 1.0 / (24.0 * 3600.0);
        tempUD = new Unit("Days", UnitCode.TIMECODE, tempDbl, 0.0);
        gUDT.put("day", tempUD);
        gUDT.put("days", tempUD);
        gUDT.put("Days", tempUD);

        tempDbl = 1.0 / (7.0 * 24.0 * 3600.0);
        tempUD = new Unit("Weeks", UnitCode.TIMECODE, tempDbl, 0.0);
        gUDT.put("wk", tempUD);
        gUDT.put("wk.", tempUD);
        gUDT.put("Weeks", tempUD);

        // Angle

        tempUD = new Unit("Radians", UnitCode.ANGLECODE, 1.0, 0.0);
        gUDT.put("rad", tempUD);
        gUDT.put("rad.", tempUD);
        gUDT.put("radians", tempUD);
        gUDT.put("Radians", tempUD);

        tempDbl = 180.0 / Math.PI;
        tempUD = new Unit("Angular Degrees", UnitCode.ANGLECODE, tempDbl, 0.0);
        gUDT.put("degrees", tempUD);
        gUDT.put("deg.", tempUD);
        gUDT.put("deg", tempUD);
        gUDT.put("adeg", tempUD);
        gUDT.put("adeg.", tempUD);
        gUDT.put("Angular Degrees", tempUD);

        // Temperature

        tempUD = new Unit("Degrees Celcius", UnitCode.TEMPERATURECODE, 1.0, 0.0);
        gUDT.put("C", tempUD);
        gUDT.put("degC", tempUD);
        gUDT.put("deg.C", tempUD);
        gUDT.put("deg C", tempUD);
        gUDT.put("Celcius", tempUD);
        gUDT.put("Degrees Celsius", tempUD);

        tempUD = new Unit("Degrees Farenheight", UnitCode.TEMPERATURECODE, 1.8, 32.0);
        gUDT.put("F", tempUD);
        gUDT.put("degF", tempUD);
        gUDT.put("deg.F", tempUD);
        gUDT.put("deg F", tempUD);
        gUDT.put("Farenheight", tempUD);
        gUDT.put("Degrees Farenheight", tempUD);

        tempUD = new Unit("Degrees Kelvin", UnitCode.TEMPERATURECODE, 1.0, 273.0);
        gUDT.put("deg.K", tempUD);
        gUDT.put("degK", tempUD);
        gUDT.put("K", tempUD);
        gUDT.put("Degrees Kelvin", tempUD);
        gUDT.put("Kelvin", tempUD);

        // Area

        tempUD = new Unit("Square Metres", UnitCode.AREACODE, 1.0, 0.0);
        gUDT.put("sq.m", tempUD);
        gUDT.put("sq.m.", tempUD);
        gUDT.put("m^2", tempUD);
        gUDT.put("Square Metre", tempUD);
        gUDT.put("Square Metres", tempUD);
        gUDT.put("Square Meter", tempUD);
        gUDT.put("Square Meters", tempUD);

        tempUD = new Unit("Square Millimetres", UnitCode.AREACODE, 1000000.0, 0.0);
        gUDT.put("sq.mm", tempUD);
        gUDT.put("sq.mm.", tempUD);
        gUDT.put("mm^2", tempUD);
        gUDT.put("Square Millimetre", tempUD);
        gUDT.put("Square Millimetres", tempUD);
        gUDT.put("Square Millimeter", tempUD);
        gUDT.put("Square Millimeters", tempUD);

        tempUD = new Unit("Square Centimeters", UnitCode.AREACODE, 10000.0, 0.0);
        gUDT.put("sq.cm", tempUD);
        gUDT.put("sq.cm.", tempUD);
        gUDT.put("cm^2", tempUD);
        gUDT.put("Square Centimeter", tempUD);
        gUDT.put("Square Centimeters", tempUD);

        tempDbl = 39.3700787402 * 39.3700787402;
        tempUD = new Unit("Square Inches", UnitCode.AREACODE, tempDbl, 0.0);
        gUDT.put("sq.in", tempUD);
        gUDT.put("sq.in.", tempUD);
        gUDT.put("in^2", tempUD);
        gUDT.put("Square Inch", tempUD);
        gUDT.put("Square Inches", tempUD);

        tempDbl = 3.28083989501 * 3.28083989501;
        tempUD = new Unit("Square Feet", UnitCode.AREACODE, tempDbl, 0.0);
        gUDT.put("sq.ft", tempUD);
        gUDT.put("sq.ft.", tempUD);
        gUDT.put("ft^2", tempUD);
        gUDT.put("Square Foot", tempUD);
        gUDT.put("Square Feet", tempUD);

        tempDbl = 3.28083989501 * 3.28083989501 / 9.0;
        tempUD = new Unit("Square Yards", UnitCode.AREACODE, tempDbl, 0.0);
        gUDT.put("sq.yd", tempUD);
        gUDT.put("sq.yd.", tempUD);
        gUDT.put("yd^2", tempUD);
        gUDT.put("Square Yard", tempUD);
        gUDT.put("Square Yards", tempUD);

        // Volume

        tempUD = new Unit("Cubic Metres", UnitCode.VOLUMECODE, 1.0, 0.0);
        gUDT.put("cu.m", tempUD);
        gUDT.put("cu.m.", tempUD);
        gUDT.put("m^3", tempUD);
        gUDT.put("Cubic Metre", tempUD);
        gUDT.put("Cubic Metres", tempUD);
        gUDT.put("Cubic Meter", tempUD);
        gUDT.put("Cubic Meters", tempUD);

        tempUD = new Unit("Cubic Centimetres", UnitCode.VOLUMECODE, 1000000.0, 0.0);
        gUDT.put("cu.cm", tempUD);
        gUDT.put("cu.cm.", tempUD);
        gUDT.put("cc.", tempUD);
        gUDT.put("cc", tempUD);
        gUDT.put("ml", tempUD);
        gUDT.put("ml.", tempUD);
        gUDT.put("Millilitres", tempUD);
        gUDT.put("Millilitre", tempUD);
        gUDT.put("Milliliters", tempUD);
        gUDT.put("Milliliter", tempUD);
        gUDT.put("cm^3", tempUD);
        gUDT.put("cm.^3", tempUD);
        gUDT.put("Cubic Centimetre", tempUD);
        gUDT.put("Cubic Centimetres", tempUD);
        gUDT.put("Cubic Centimeter", tempUD);
        gUDT.put("Cubic Centimeters", tempUD);

        tempUD = new Unit("Cubic Inches", UnitCode.VOLUMECODE, 61023.7440947, 0.0);
        gUDT.put("cu.in", tempUD);
        gUDT.put("cu.in.", tempUD);
        gUDT.put("in^3", tempUD);
        gUDT.put("in.^3", tempUD);
        gUDT.put("Cubic Inch", tempUD);
        gUDT.put("Cubic Inches", tempUD);

        tempUD = new Unit("Cubic Feet", UnitCode.VOLUMECODE, 35.3146667215, 0.0);
        gUDT.put("cu.ft", tempUD);
        gUDT.put("cu.ft.", tempUD);
        gUDT.put("ft^3", tempUD);
        gUDT.put("ft.^3", tempUD);
        gUDT.put("Cubic Foot", tempUD);
        gUDT.put("Cubic Feet", tempUD);

        tempUD = new Unit("Litres", UnitCode.VOLUMECODE, 1000.0, 0.0);
        gUDT.put("L", tempUD);
        gUDT.put("L.", tempUD);
        gUDT.put("Litres", tempUD);
        gUDT.put("Litre", tempUD);
        gUDT.put("Liters", tempUD);
        gUDT.put("Liter", tempUD);

        tempUD = new Unit("US Gallons", UnitCode.VOLUMECODE, 264.172052358, 0.0);
        gUDT.put("US Gal.", tempUD);
        gUDT.put("US Gal", tempUD);
        gUDT.put("Gal. US", tempUD);
        gUDT.put("Gal US", tempUD);
        gUDT.put("US Gallon", tempUD);
        gUDT.put("US Gallons", tempUD);

        tempUD = new Unit("US Quarts", UnitCode.VOLUMECODE, 1056.68820943, 0.0);
        gUDT.put("US Qt.", tempUD);
        gUDT.put("US Qt", tempUD);
        gUDT.put("Qt. US", tempUD);
        gUDT.put("Qt US", tempUD);
        gUDT.put("US Quart", tempUD);
        gUDT.put("US Quarts", tempUD);

        tempUD = new Unit("Imperial Gallons", UnitCode.VOLUMECODE, 219.969248299, 0.0);
        gUDT.put("impgal", tempUD);
        gUDT.put("galuk", tempUD);
        gUDT.put("ukgal", tempUD);
        gUDT.put("Imp. Gal.", tempUD);
        gUDT.put("Imp Gal", tempUD);
        gUDT.put("Gal. Imp", tempUD);
        gUDT.put("Gal Imp", tempUD);
        gUDT.put("Gal. UK", tempUD);
        gUDT.put("Gal UK", tempUD);
        gUDT.put("Gal. Cdn", tempUD);
        gUDT.put("Gal Cdn", tempUD);
        gUDT.put("Gal. Can.", tempUD);
        gUDT.put("Gal Can", tempUD);

        // Density

        tempUD = new Unit("Kilogram / Cubic Metre", UnitCode.DENSITYCODE, 1.0, 0.0);
        gUDT.put("kg/m^3", tempUD);
        gUDT.put("kg./cu.m.", tempUD);
        gUDT.put("kg/cu.m", tempUD);
        gUDT.put("Kilogram / Cubic Metre", tempUD);
        gUDT.put("Kilogram / Cubic Meter", tempUD);
        gUDT.put("Kilogram Per Cubic Metre", tempUD);
        gUDT.put("Kilogram Per Cubic Meter", tempUD);
        gUDT.put("Kilograms / Cubic Metre", tempUD);
        gUDT.put("Kilograms / Cubic Meter", tempUD);
        gUDT.put("Kilograms Per Cubic Metre", tempUD);
        gUDT.put("Kilograms Per Cubic Meter", tempUD);
        gUDT.put("Kg/Cu.M", tempUD);
        gUDT.put("Kg./Cu.M.", tempUD);

        tempUD = new Unit("Gram / Cubic Centimetre", UnitCode.DENSITYCODE, 1.0 / 1000.0, 0.0);
        gUDT.put("Gram / Cubic Centimetre", tempUD);
        gUDT.put("Grams / Cubic Centimetre", tempUD);
        gUDT.put("Gram / Cubic Centimeter", tempUD);
        gUDT.put("Grams / Cubic Centimeter", tempUD);
        gUDT.put("g/cm^3", tempUD);
        gUDT.put("g/cu.cm", tempUD);
        gUDT.put("g./cu.cm.", tempUD);
        gUDT.put("g/cc", tempUD);
        gUDT.put("g./c.c.", tempUD);
        gUDT.put("g./cc.", tempUD);

        tempUD = new Unit("Pounds / Cubic Inch", UnitCode.DENSITYCODE, 1.0 / 27679.9047102, 0.0);
        gUDT.put("Pounds / Cubic Inch", tempUD);
        gUDT.put("lb./cu.in.", tempUD);
        gUDT.put("lb/cu.in", tempUD);
        gUDT.put("lb/in^3", tempUD);

        tempUD = new Unit("Pounds / Cubic Foot", UnitCode.DENSITYCODE, 1.0 / 27679.9047102 * (12 * 12 * 12), 0.0);
        gUDT.put("Pounds / Cubic Foot", tempUD);
        gUDT.put("lb./cu.ft.", tempUD);
        gUDT.put("lb/cu.ft", tempUD);
        gUDT.put("lb/ft^3", tempUD);

        tempUD = new Unit("Pounds / US Gallon", UnitCode.DENSITYCODE, 1.0 / 119.826427317, 0.0);
        gUDT.put("Pounds / US Gallon", tempUD);
        gUDT.put("Lb./Gal.US", tempUD);
        gUDT.put("Lb/US Gal", tempUD);
        gUDT.put("Lb./US Gal.", tempUD);
        gUDT.put("lb./US gal.", tempUD);
        gUDT.put("lb/US gal", tempUD);
        gUDT.put("lb/gal", tempUD);
        gUDT.put("lb/usgal", tempUD);
        gUDT.put("lb/gal US", tempUD);

        // Velocity

        tempUD = new Unit("Metres / Second", UnitCode.VELOCITYCODE, 1.0, 0.0);
        gUDT.put("m/s", tempUD);
        gUDT.put("m./s.", tempUD);
        gUDT.put("m/sec", tempUD);
        gUDT.put("Metres / Second", tempUD);
        gUDT.put("Meters / Second", tempUD);

        tempUD = new Unit("Feet / Second", UnitCode.VELOCITYCODE, 3.28083989501, 0.0);
        gUDT.put("ft/s", tempUD);
        gUDT.put("Feet / Second", tempUD);

        tempUD = new Unit("Kilometres / Hour", UnitCode.VELOCITYCODE, 3.6, 0.0);
        gUDT.put("km/h", tempUD);
        gUDT.put("Kilometres / Hour", tempUD);

        tempUD = new Unit("Miles / Hour", UnitCode.VELOCITYCODE, 2.23693629205, 0.0);
        gUDT.put("mph", tempUD);
        gUDT.put("mi/h", tempUD);
        gUDT.put("Miles / Hour", tempUD);

        // Acceleration
        // m^4 - 2nd Moment of Area

        // Force

        tempUD = new Unit("Newtons", UnitCode.FORCECODE, 1.0, 0.0);
        gUDT.put("N", tempUD);
        gUDT.put("Newton", tempUD);
        gUDT.put("Newtons", tempUD);

        tempUD = new Unit("Kilograms-Force", UnitCode.FORCECODE, 0.1020, 0.0);
        gUDT.put("kgf", tempUD);
        gUDT.put("Kgf", tempUD);
        gUDT.put("Kilograms-Force", tempUD);

        tempUD = new Unit("Pounds-Force", UnitCode.FORCECODE, 0.2248, 0.0);
        gUDT.put("lbf", tempUD);
        gUDT.put("Lbf", tempUD);
        gUDT.put("Pounds-Force", tempUD);

        tempUD = new Unit("Kilo-Pounds-Force", UnitCode.FORCECODE, 0.0002248, 0.0);
        gUDT.put("kip", tempUD);
        gUDT.put("1,000 Lbf", tempUD);
        gUDT.put("Kilo-Pounds-Force", tempUD);

        tempUD = new Unit("Kilo-Newton", UnitCode.FORCECODE, 1000.0, 0.0);
        gUDT.put("kN", tempUD);
        gUDT.put("kN.", tempUD);
        gUDT.put("Kilo-Newtons", tempUD);

        // Areal Weight

        tempUD = new Unit("Kilogram / Square Metre", UnitCode.AREALWTCODE, 1.0, 0.0);
        gUDT.put("kg/sq.m", tempUD);
        gUDT.put("kg/sq.m.", tempUD);
        gUDT.put("kg/m^2", tempUD);
        gUDT.put("Kilogram / Square Metre", tempUD);

        tempUD = new Unit("Gram / Square Metre", UnitCode.AREALWTCODE, 1000.0, 0.0);
        gUDT.put("g/sq.m", tempUD);
        gUDT.put("g/sq.m.", tempUD);
        gUDT.put("g/m^2", tempUD);
        gUDT.put("Gram / Square Metre", tempUD);

        tempUD = new Unit("Ounce / Square Yard", UnitCode.AREALWTCODE, 29.4935246816, 0.0);
        gUDT.put("oz/sq.yd", tempUD);
        gUDT.put("oz/sq.yd.", tempUD);
        gUDT.put("oz/yd^2", tempUD);
        gUDT.put("Ounce / Square Yard", tempUD);

        tempUD = new Unit("Ounce / Square Foot", UnitCode.AREALWTCODE, 29.4935246816 / 9.0, 0.0);
        gUDT.put("oz/sq.ft", tempUD);
        gUDT.put("oz/sq.ft.", tempUD);
        gUDT.put("oz/ft^2", tempUD);
        gUDT.put("Ounce / Square Foot", tempUD);

        // Work/Energy

        tempUD = new Unit("Newtons", UnitCode.FORCECODE, 1.0, 0.0);
        gUDT.put("N", tempUD);
        gUDT.put("Newton", tempUD);
        gUDT.put("Newtons", tempUD);

        // Power/Heat Flow

        // Pressure/Stress

        tempUD = new Unit("Newtons / Square Meter", UnitCode.PRESSURECODE, 1.0, 0.0);
        gUDT.put("N/sq.m", tempUD);
        gUDT.put("N/sq.m.", tempUD);
        gUDT.put("N/m^2", tempUD);
        gUDT.put("Pa", tempUD);
        gUDT.put("Pa.", tempUD);
        gUDT.put("Newtons / Square Meter", tempUD);

        tempUD = new Unit("Kilo-Pascal", UnitCode.PRESSURECODE, 1.0 / 1000.0, 0.0);
        gUDT.put("kPa", tempUD);
        gUDT.put("kPa.", tempUD);
        gUDT.put("KPa", tempUD);
        gUDT.put("KPa.", tempUD);
        gUDT.put("kN/sq.m", tempUD);
        gUDT.put("kN/sq.m.", tempUD);
        gUDT.put("kN/m^2", tempUD);
        gUDT.put("Kilo-Pascal", tempUD);

        tempUD = new Unit("Mega-Pascal", UnitCode.PRESSURECODE, 1.0 / 1000000.0, 0.0);
        gUDT.put("N/sq.mm", tempUD);
        gUDT.put("N/sq.mm.", tempUD);
        gUDT.put("N/mm^2", tempUD);
        gUDT.put("MPa.", tempUD);
        gUDT.put("MPa", tempUD);
        gUDT.put("Mega-Pascal", tempUD);

        tempUD = new Unit("Giga-Pascal", UnitCode.PRESSURECODE, 1.0 / 1000000000.0, 0.0);
        gUDT.put("kN/sq.mm", tempUD);
        gUDT.put("kN/sq.mm.", tempUD);
        gUDT.put("kN/mm^2", tempUD);
        gUDT.put("GPa.", tempUD);
        gUDT.put("GPa", tempUD);
        gUDT.put("Giga-Pascal", tempUD);

        tempUD = new Unit("Pound / Square Inch", UnitCode.PRESSURECODE,1.0 / 6894.75729317,0.0);
        gUDT.put("psi", tempUD);
        gUDT.put("PSI", tempUD);
        gUDT.put("lb/sq.in", tempUD);
        gUDT.put("lb/sq.in.", tempUD);
        gUDT.put("Pound / Square Inch", tempUD);

        tempUD =new Unit("Kilo-Pound / Square Inch", UnitCode.PRESSURECODE,0.001 / 6894.75729317,0.0);
        gUDT.put("ksi", tempUD);
        gUDT.put("KSI", tempUD);
        gUDT.put("klb/sq.in", tempUD);
        gUDT.put("klb/sq.in.", tempUD);
        gUDT.put("Kilo-Pound / Square Inch", tempUD);

        tempUD =new Unit("Mega-Pound / Square Inch", UnitCode.PRESSURECODE,0.000001 / 6894.75729317,0.0);
        gUDT.put("msi", tempUD);
        gUDT.put("MSI", tempUD);
        gUDT.put("10^6lb/sq.in", tempUD);
        gUDT.put("10^6lb/sq.in.", tempUD);
        gUDT.put("Mega-Pound / Square Inch", tempUD);

        tempUD =
                new Unit(
                "Kilogram Force / Square Meter", UnitCode.PRESSURECODE,
                1.0 / 9.81,
                0.0);
        gUDT.put("kgf/sq.m", tempUD);
        gUDT.put("kgf/sq.m.", tempUD);
        gUDT.put("kgf/m^2", tempUD);
        gUDT.put("Kilogram Force / Square Meter", tempUD);

        tempUD =
                new Unit(
                "Kilogram Force / Square Millimeter", UnitCode.PRESSURECODE,
                0.000001 / 9.81,
                0.0);
        gUDT.put("kgf/sq.mm", tempUD);
        gUDT.put("kgf/sq.mm.", tempUD);
        gUDT.put("kgf/mm^2", tempUD);
        gUDT.put("Kilogram Force / Square Millimeter", tempUD);

        // Frequency
        // Thermal Expansion

        tempUD =
                new Unit(
                "Meter / Meter / Degree Celcius", UnitCode.THERMALEXPANSIONCODE,
                1.0,
                0.0);
        gUDT.put("m/m/deg.C", tempUD);
        gUDT.put("1/deg.C", tempUD);
        gUDT.put("/deg.C", tempUD);
        gUDT.put("Meter / Meter / Degree Celcius", tempUD);

        tempUD =
                new Unit(
                "Inch / Inch / Degree Farenheight", UnitCode.THERMALEXPANSIONCODE,
                1.0 / 1.8,
                0.0);
        gUDT.put("in/in/deg.F", tempUD);
        gUDT.put("1/deg.F", tempUD);
        gUDT.put("/deg.F", tempUD);
        gUDT.put("Inch / Inch / Degree Farenheight", tempUD);

        tempUD =
                new Unit(
                "Meter / Meter / Degree Kelvin", UnitCode.THERMALEXPANSIONCODE,
                1.0,
                0.0);
        gUDT.put("m/m/deg.K", tempUD);
        gUDT.put("1/deg.K", tempUD);
        gUDT.put("/deg.K", tempUD);
        gUDT.put("Meter / Meter / Degree Kelvin", tempUD);

        // Thermal Conductivity

        tempUD =
                new Unit(
                "Watts / Meter / Degree Celcius", UnitCode.THERMALCONDUCTIVITYCODE,
                1.0,
                0.0);
        gUDT.put("W/m/deg.C", tempUD);
        gUDT.put("W/m.deg.C", tempUD);
        gUDT.put("Watt/m.deg.C", tempUD);
        gUDT.put("Watts/m.deg.C", tempUD);
        gUDT.put("Watts / Meter / Degree Celcius", tempUD);

        tempUD =
                new Unit(
                "Btu / Hour / Foot / Degree Farenheight", UnitCode.THERMALCONDUCTIVITYCODE,
                .57782,
                0.0);
        gUDT.put("Btu/h.ft.deg.F", tempUD);
        gUDT.put("Btu/h/ft/deg.F", tempUD);
        gUDT.put("Btu / Hour / Foot / Degree Farenheight", tempUD);

        // viscosity - base unit is Poiseuille = Pa s = kg/m.s
        tempUD =
                new Unit(
                "Pa.s", UnitCode.VISCOSITYCODE,
                1.0,
                0.0);
        gUDT.put("Pa.s", tempUD);
        gUDT.put("kg/m.s", tempUD);
        gUDT.put("Kg/m.s", tempUD);
        gUDT.put("Poiseuille", tempUD);

        tempUD =
                new Unit(
                "centiPoise", UnitCode.VISCOSITYCODE,
                0.001,
                0.0);
        gUDT.put("centiPoise", tempUD);
        gUDT.put("cP.", tempUD);
        gUDT.put("cP", tempUD);
        gUDT.put("mPa.s", tempUD);

        tempUD =
                new Unit(
                "Darcy", UnitCode.PERMEABILITYCODE,
                1 / 9.869233e-13,
                0.0);
        gUDT.put("Darcy", tempUD);
        gUDT.put("darcy", tempUD);
    }
}

/**
 * Class UnitConverter - write a description of the class here
 * 
 * @author (your name here)
 * @version (version number or date here)
 */
class UnitConverter {

    selectedUnits;
    baseUnits; // kg, m, s, rad., deg.C, mol
    defaultUnits; // Units this converter prefers - defaults to first unit added
    unitDataTable = new Map(); //Map<String, Unit>;// units for this converter 
    aliasTable = new Map(); // Map<String, String> // alias can be used instead of unit name for lookup - see resolveAlias()

    // Construct a UnitConverter compatible with units named baseUnitName
    // baseUnitName must be in the global unit data table, gUDT
    constructor(baseUnitName) {
        let baseUnit = GlobalUnits.getUnitByName(baseUnitName);
        if (baseUnit == null) {
            throw new IllegalArgumentException("Can't find definition for base units named: " + baseUnitName);
        }
        baseUnits = baseUnit;
    }

    // Construct a UnitConverter compatible with the given Unit 
    public UnitConverter(Unit baseUnit) throws IllegalArgumentException {
        if (baseUnit == null) {
            throw new IllegalArgumentException("Base units can not be null");
        }
        baseUnits = baseUnit;
    }

    public Unit getSelectedUnits() {
        return selectedUnits;
    }

    public void setSelectedUnits(Unit newSelection) {
        if (unitDataTable.containsValue(newSelection)) {
            Unit oldValue = this.selectedUnits;
            this.selectedUnits = newSelection;
            firePropertyChange("selectedUnits", oldValue, newSelection);
        }else{
            throw new IllegalArgumentException( newSelection + " Not found in : " + unitDataTable );
        }
    }

    /** A unitConverter equals another if both have the same
     *  values for baseUnits and defaultUnits, and they also have identical 
     *  lists of units and aliases, and they have identical unitDataTables.
     * 
     *  This is an expensive calculation, you are better off using ==
     *  or isCompatibleWith() in most cases.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UnitConverter)) {
            return false;
        }
        UnitConverter uc = (UnitConverter) o;
        if (!(baseUnits == uc.baseUnits ||
                (baseUnits != null && baseUnits.equals(uc.baseUnits)))) {
            return false;
        }
        if (!(defaultUnits == uc.defaultUnits ||
                (defaultUnits != null && defaultUnits.equals(uc.defaultUnits)))) {
            return false;
        }
        if (!(aliasTable == uc.aliasTable ||
                (aliasTable != null && aliasTable.equals(uc.aliasTable)))) {
            return false;
        }
        if (!(unitDataTable == uc.unitDataTable ||
                (unitDataTable != null && unitDataTable.equals(uc.unitDataTable)))) {
            return false;
        }
        return true;
    }

    @Override
    public int hashCode() {
        int ret = 17;
        ret = 37 * ret + baseUnits.hashCode();
        ret = 37 * ret + defaultUnits.hashCode();
        ret = 37 * ret + aliasTable.hashCode();
        ret = 37 * ret + unitDataTable.hashCode();
        return ret;
    }

    /** Two converters are compatible if they both represent the same baseUnits.
     *  Base units are defined in UnitCode as the integer powers of:
     *  mass, length, time, angle, temperature and mols.
     *  If they are comapatible then they can be used interchangibly.
     */
    public boolean isCompatibleWith(UnitConverter uc) {
        if (uc == null) {
            return false;
        }
        return this.baseUnits.isCompatibleWith(uc.baseUnits);
    }

    // get the base units name
    public String getBaseUnitsName() {
        return baseUnits.getName();
    }

    // Implement the IUnitConverter Interface
    /** 
     * convert valueInBaseUnits from BaseUnits to units given by newUnitsName, 
     * which must have been added to this UnitConverter.
     */
    public double convert(double valueInBaseUnits, String newUnitsName) throws IllegalArgumentException {
        return GlobalUnits.convertValueFromTo(valueInBaseUnits, baseUnits, getUnitData(newUnitsName));
    }

    // convert curVal from fromUnitsName to BaseUnits, which must be in the unitDataTable
    public double unconvert(double curVal, String fromUnitsName) throws IllegalArgumentException {

        Unit fromUnits = getUnitData(fromUnitsName);

        // Check for unknown units errors
        if (fromUnits == null) {
            throw new IllegalArgumentException("Unknown units : " + fromUnitsName);
        }
        // Check for incompatible units error
        if (fromUnits.isCompatibleWith(baseUnits) == false) {
            throw new IllegalArgumentException(
                    "Incompatible Units : '" + fromUnitsName + "' & '" + baseUnits.getName() + "'.");
        }
        return GlobalUnits.convertValueFromTo(curVal, fromUnits, baseUnits);
    }

    // add a new unit to the unitDataTable using uname as the index.
    // UnitData is looked up in gUDT via globalUnitName, which must be in gUDT
    public void addUnits(String uname, String globalUnitName) throws IllegalArgumentException {

        if (uname == null) {
            throw new IllegalArgumentException("Can not add units with empty name");
        }

        Unit ud = GlobalUnits.getUnitByName(globalUnitName);
        if (ud == null) {
            throw new IllegalArgumentException("Unknown units : " + globalUnitName);
        }

        addUnits(uname, ud);
    }

    /**
     * Add a unit from GlobalUnits to this converter using the name from the global table
     * as the index. UnitData is looked up in gUDT via globalUnitName, which must be in gUDT
     */
    public void addUnits(String globalUnitName) throws IllegalArgumentException {

        Unit ud = GlobalUnits.getUnitByName(globalUnitName);
        if (ud == null) {
            throw new IllegalArgumentException("Unknown units : " + globalUnitName);
        }

        addUnits(globalUnitName, ud);
    }

    // add a new unit to the unit data table by adding a Unit record
    public void addUnits(String uName, Unit ud) throws IllegalArgumentException {

        if (uName == null) {
            throw new IllegalArgumentException(
                    "Can't add units with null name");
        }
        //if( uName.equals("") ) throw new IllegalArgumentException("Can't add units with empty name" );
        if (ud == null) {
            throw new IllegalArgumentException(
                    "Can't add null units");
        }

        if (ud.isCompatibleWith(baseUnits) == false) {
            throw new IllegalArgumentException(
                    "Incompatible Units : Cannot convert '" + baseUnits.getName() + "' to '" + ud.getName() + "'.");
        }

        unitDataTable.put(uName, ud);
        if (defaultUnits == null) {
            defaultUnits = uName;
        }
        firePropertyChange("unitsList", null, null);
    }

    // remove a unit from the unitDataTable using uname as the index.
    public void removeUnits(String unitsToRemoveName) {
        if (unitDataTable.containsKey(unitsToRemoveName)) {
            unitDataTable.remove(unitsToRemoveName);
            // search the alias table for aliases of uname
            for (Iterator i = aliasTable.values().iterator(); i.hasNext();) {
                if (((String) i.next()).equals(unitsToRemoveName)) {
                    i.remove();
                }
            }
            firePropertyChange("unitsList", null, null);
        }
    }

    // get a list of units for a drop-down menu
    public List<String> getUnitsList() {
        return new ArrayList<String>(Collections.unmodifiableSet(unitDataTable.keySet()));
    }

    // Is a unit name in the list?
    public boolean containsUnits(String uname) {
        return (unitDataTable.containsKey(uname));
    }

    // get the default units
    public String getDefaultUnits() {
        return defaultUnits;
    }

    // set the default units
    public void setDefaultUnits(String uname) {
        if (this.containsUnits(uname)) {
            defaultUnits = uname;
        }
    }

    // convert curVal, but use strings as unit descriptions - they have to be in the unitDataTable
    double convert(double curVal, String fromUnits, String toUnits)
            throws IllegalArgumentException, IllegalArgumentException {
        return GlobalUnits.convertValueFromTo(curVal, getUnitData(fromUnits), getUnitData(toUnits));
    }

    /**
     * An alias can be used in place of a unit name.  
     * For example, "SI" could be used for kg.  
     * 
     * Calling addAlias( alias, null ) will remove the alias.
     */
    public void addAlias(String alias, String unitName) throws IllegalArgumentException {
        if (alias == null || "".equals(alias)) {
            return;
        }

        // throw away any existing alias
        aliasTable.remove(alias);

        // don't add an alias with the same name as an existing unit
        if (containsUnits(alias)) {
            return;
        }
        // leave alias unset if unitName is null - effectively removes the alias if it was set
        if (unitName == null || unitName.equals("")) {
            return;
        }
        // check that the unitName refers to a valid unit
        if (getUnitData(unitName) == null) {
            throw new IllegalArgumentException("addAlias(): no such units : " + unitName);
        }

        aliasTable.put(alias, unitName);
        firePropertyChange("aliasTable", null, null);
    }

    /**
     * Looks for the alias in the unitDataTable, then in the alias table.  
     * If not found it returns null to indicate bad units.
     * @param alias - the unit name to be searched for
     * @return a valid unit name, or null if not found.
     */
    public String resolveAlias(String alias) {
        if (unitDataTable.containsKey(alias)) {
            return alias;
        } // no need to resolve
        if (aliasTable.containsKey(alias)) {
            return (String) aliasTable.get(alias);
        }
        return null;
    }

    /**
     * @param theUnitName, can be an alias
     * @return the UnitData object for theUnitName
     */
    private Unit getUnitData(String theUnitName) {
        String resolvedName = resolveAlias(theUnitName);
        return unitDataTable.get(resolvedName);
    }
}

