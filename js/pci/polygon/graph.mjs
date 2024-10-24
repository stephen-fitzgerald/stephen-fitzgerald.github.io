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
}

export class Graph {

    /** @typedef {{x:number, y:number}} Data */
    /** @typedef {{ data: Data, f: number, g: number, h: number, parent: Node | null, }} -Node*/
    /** @typedef {Map<Node,Set<Node>>} AdjacencyList */

    constructor(edges) {
        /** @type {AdjacencyList} - Map to find neighbors of a node */
        this.adjacencyList = new Map();
        // Map to find the node that contains an particular data object
        this.nodeMap = new Map();

        if (edges != undefined) {
            for (let i = 0; i < edges.length; i++) {
                const node1 = this.addNodeFor(edges[i][0]);
                const node2 = this.addNodeFor(edges[i][1]);
                this.addEdge(node1, node2);
            }
        }
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
    get edgeList() {
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


    /**
     * Implements the A* pathfinding algorithm.
     * @param {Node | {x:number,y:number}} start - The start pt.
     * @param {Node | {x:number,y:number}} goal - The goal pt.
     * @returns {Array<{x: number, y: number}>} - The path from the start to the goal, or an empty array if no path is found.
     */
    aStarPath(start, goal) {

        let StartNode = start instanceof Node ? start : this.getNodeFor(start);
        let goalNode = goal instanceof Node ? goal : this.getNodeFor(goal);

        if (StartNode == undefined || goalNode == undefined) {
            return [];  // no path
        }

        function heuristic(node, goal) {
            return distance(node, goal);
        }

        function distance(nodeA, nodeB) {
            return Math.sqrt((nodeB.data.x - nodeA.data.x) ** 2 + (nodeB.data.y - nodeA.data.y) ** 2);
        }

        /** @type {Array<Node>} */
        let openList = [];
        /** @type {Array<Node>} */
        let closedList = [];

        openList.push(StartNode);

        while (openList.length > 0) {
            // Get node with the lowest f value from the open list
            let currentNode = openList.reduce((lowest, node) => lowest.f < node.f ? lowest : node);

            // If we've reached the goal, return the path
            if (currentNode === goalNode) {
                let path = [];
                let temp = currentNode;
                while (temp != null) {
                    path.push(temp.data);
                    temp = temp.parent;
                }
                return path.reverse();  // Return the path from start to goal
            }

            // Remove current node from open list and add to closed list
            openList = openList.filter(node => node !== currentNode);
            closedList.push(currentNode);

            // go through all of the current node's neighbors
            for (let neighbor of this.getNeighbours(currentNode)) {

                if (closedList.includes(neighbor) == false) {

                    // Calculate the new g score from the start to this neighbor
                    let gScore = currentNode.g + distance(currentNode, neighbor);

                    // if neighbor not in the open list, or this new path to it has a lower gScore
                    // add it to, or update it in, the open list with updated g, h, f & parent
                    let inOpen = openList.includes(neighbor);
                    if (!inOpen || gScore < neighbor.g) {
                        neighbor.g = gScore;
                        neighbor.h = heuristic(neighbor, goalNode);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.parent = currentNode;
                        // Add neighbor to open list if it's not already there
                        if (!inOpen) {
                            openList.push(neighbor);
                        }
                    }
                }
            }
        }
        return [];  // No path found
    }

}
