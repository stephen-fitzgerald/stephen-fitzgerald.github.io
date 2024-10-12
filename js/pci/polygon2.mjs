export class Polygon2 {
    constructor() {
        this.points = [];
    }


    /**
     * Add a new vertex before an existing vertex
     *
     * @param {{x:number, y:number, z:number|undefined}} pt
     * @param {number | undefined} before - if <=0 inserted at start, if undefined or >=length-1 added to end
     */
    addVertex(pt, before) {
        let pos = before < 0 ? 0 : before;
        if (pos > this.points.length)
            pos = this.points.length;
        let newPt = { x: pt.x, y: pt.y, z: pt.z };
        this.points.splice(pos, 0, newPt);
    }

   
}