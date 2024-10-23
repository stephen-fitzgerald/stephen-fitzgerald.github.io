// @ts-check
/*jshint esversion: 6 */


/**
 * Nodes just wrap the data object with some graph traversal properties.
 * They expose x & y properties of the data object
 *
 * @class Node
 */
class Node {

    /**
     * Creates a Node to wrap the data object, with some graph traversal properties.
     * Nodes expose the data.x & data.y properties of the data object for reading.
     * IE if node = new Node(data) then node.x === data.x.
     *
     * @constructor
     * @param {{x:number, y:number}} data
     */
    constructor(data) {
        this.data = data;
        this.f = 0.0;
        this.g = 0.0;
        this.h = 0.0;
        this.parent = null;
    }
    get x() {
        return this.data.x;
    }
    get y() {
        return this.data.y;
    }
}

export class Graph {

    /** @typedef {{x:number, y:number}} Data */
    /** @typedef {{ data: Data, f: number, g: number, h: number, parent: Node | null, }} -Node*/
    /** @typedef {Map<Node,Set<Node>>} AdjacencyList */

    constructor() {
        /** @type {AdjacencyList} - Map to find neighbors of a node */
        this.adjacencyList = new Map();
        // Map to find the node that contains an particular data object
        this.nodeMap = new Map();
    }

    /**
     * Add a new node to the graph.  
     * Fails silently if the node is already in the graph.
     *
     * @param {Node} node
     */
    addNode(node) {
        if (this.nodeMap.get(node.data) == undefined) {
            this.nodeMap.set(node.data, node);
        }
        if (this.adjacencyList.get(node) == undefined) {
            this.adjacencyList.set(node, new Set());
        }
    }

    /**
     * Add an edge by adding two nodes to each others neighbors collection
     *
     * @param {Node} node1
     * @param {Node} node2
     */
    addEdge(node1, node2) {
        const list1 = this.adjacencyList.get(node1);
        const list2 = this.adjacencyList.get(node2);
        if (list1 && list2) {
            list1.add(node2);
            list2.add(node1);
        }
    }

    /**
     * Get an array of neighbors of a node in this graph
     *
     * @param {Node} node
     * @returns {Node[]} a (possibly empty) array of neighbors
     */
    getNeighbours(node) {
        const set = this.adjacencyList.get(node);
        return set == undefined ? [] : Array.from(set);
    }


    /**
     * Returns true if node2 is a neighbor of node1.
     *
     * @param {Node} node1
     * @param {Node} node2
     * @returns {boolean}
     */
    hasEdge(node1, node2) {
        const set = this.adjacencyList.get(node1);
        return set == undefined ? false : set.has(node2);
    }

    /**
    * Create an edge list, which is an array of edges.  Each edge is a 2-item 
    * array of Nodes, representing a connection between the pair of Nodes.
    */
    getEdges() {
        const edges = [];
        this.adjacencyList.forEach((neighbours, node) => {
            neighbours.forEach((neighbor) => {
                // check if reciprocal edge exists already
                if (edges.find((pair) => {
                    (pair[0] === neighbor && pair[1] === node);
                }) == undefined) {
                    edges.push([node, neighbor]);
                }
            });
        });
        return edges;
    }

    /**
     * Remove a node from this graph by removing all references to
     * it from other node's neighbors lists, and then deleting it from 
     * the adjacency list.
     *
     * @param {Node} nodeToRemove
     * @returns {boolean} true if the node was found and removed
     */
    removeNode(nodeToRemove) {
        let ret = false;
        // get the list of the target node's neighbors
        const neighbours = this.adjacencyList.get(nodeToRemove);
        if (neighbours != undefined) {
            // remove nodeToremove from each neighbour's neighbours lists
            neighbours.forEach((nbr) => {
                let nbrs = this.adjacencyList.get(nbr);
                nbrs?.delete(nodeToRemove);
            });
            // clear out the node's neighbours list
            neighbours.clear();
            // delete the node from the adjacency list
            ret = this.adjacencyList.delete(nodeToRemove);
        }
        this.nodeMap.delete(nodeToRemove.data);
        return ret;
    }

    /**
     * Create a new node for a data object, if required, and add it to the graph.
     *
     * @param { Data } data reference to an {x,y} point object
     * @returns { Node } reference for the newly created node
     * */
    addNodeFor(data) {
        let n = this.nodeMap.get(data);
        if (n == undefined) {
            n = new Node(data);
        }
        this.addNode(n);
        return n;
    }

    /**
     * Find an existing node for the given data,
     * or undefined if none exists
     *
     * @param {Data} data     
     * @returns { Node | undefined }
     */
    getNodeFor(data) {
        return this.nodeMap.get(data);
    }


    /**
     * Create a new Graph from an object edge list, which
     * is an array of edges.  Each edge is a 2-item array of data objects,
     * representing a connection between the pair of objects.
     * 
     * @static
     * @param {Array<Array<any>>} edges
     * @returns {Graph}
     */
    static fromObjectEdgeList(edges) {
        let theGraph = new Graph();
        for (let i = 0; i < edges.length; i++) {
            const node1 = theGraph.addNodeFor(edges[i][0]);
            const node2 = theGraph.addNodeFor(edges[i][1]);
            theGraph.addEdge(node1, node2);
        }
        return theGraph;
    }
}
