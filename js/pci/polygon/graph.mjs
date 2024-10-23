// @ts-check
/*jshint esversion: 6 */

class Graph {
    // Map() with nodes as keys, and nodes as values.
    // nodes are {x,y} points, + extra graph-related data: f,g,h,parent.
    /** typedef {{x:number, y:number}} Point */
    /** @typedef {any} Data */
    /** @typedef {{ data: Data, f: number, g: number, h: number, parent: Node | null, }} Node*/
    /** @typedef {Map<Node,Set<Node>>} AdjacencyList */

    /** Map to find neighbors of a node
     * @type AdjacencyList 
     */
    adjacencyList;

    /** Map to find the node that contains an object
     *  @type {Map<object,Node>} 
     */
    nodeMap;

    constructor() {
        /** @type AdjacencyList */
        this.adjacencyList = new Map();
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
     * @returns {Node[]} an array of neighbors
     */
    getNeighbours(node) {
        const set = this.adjacencyList.get(node);
        const neighbors = [];
        set?.forEach((node) => {
            neighbors.push(node);
        });
        return neighbors;
    }


    /**
     * Returns true if node2 is a neighbor of node1.
     *
     * @param {Node} node1
     * @param {Node} node2
     * @returns {boolean}
     */
    hasEdge(node1, node2) {
        let ret = false;
        const node1Neighbors = this.adjacencyList.get(node1);
        if (node1Neighbors != undefined) {
            ret = node1Neighbors.has(node2);
        }
        return ret;
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
        let n = this.getNodeFor(data);
        if (n == undefined) {
            /** @type Node */
            n = {
                data: data,
                f: 0.0,
                g: 0.0,
                h: 0.0,
                parent: null,
            };
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
     * Create a new Graph from an object adjacency list, which
     * is an array of edges.  Each edge is a 2-item array representing
     * a connection between the pair of objects.
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
