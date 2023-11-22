import {MoldedTube} from '../../js/pci/bats/molded-tube.mjs'

export function getTube() {
    return new MoldedTube({
        "name": "A Default Molded Tube",
        "description": "A simple molded tube.  1 meter long x 50 mm OD.",
        "profile": {
            "_clazz": "Profile",
            "xPositions": [
                0,
                0.25,
                0.5,
                0.75,
                1
            ],
            "oDiameters": [
                0.05,
                0.1,
                0.15,
                0.15,
                0.05
            ]
        },
        "resin": {
            "_clazz": "Mat_Isotropic",
            "_name": "Epoxy Resin",
            "_description": "Generic epoxy resin.",
            "_E1": 3100000000,
            "_PR12": 0.3,
            "_density": 1170
        },
        "plySpecs": [
            {
                "layer": {
                    "_clazz": "FiberLayer",
                    "_name": "Glass 140 gsm",
                    "_description": "Glass 140 gsm",
                    "_fiber": {
                        "_clazz": "Mat_Isotropic",
                        "_name": "E-Glass Fiber",
                        "_description": "Generic E-glass fiber.",
                        "_E1": 72394951650,
                        "_PR12": 0.22,
                        "_density": 2540
                    },
                    "_faw": 0.14,
                    "_vf": 0.59,
                    "_isRandom": false
                },
                "start": 0,
                "end": 0.75,
                "widthAtStart": 0.05 * 3.14159,
                "widthAtEnd": 0.15 * 3.14159,
                "taperStart": 0,
                "taperEnd": 0.5,
                "angle": 0,
                "orientation": "upright",
                "numPieces": 1,
                "clocking": 0,
                "epsilon": 0.00001
            },
            {
                "layer": {
                    "_clazz": "FiberLayer",
                    "_name": "Carbon 150 gsm",
                    "_description": "Carbon 150 gsm",
                    "_fiber": {
                        "_clazz": "Mat_PlanarIso23",
                        "_name": "Carbon Fiber",
                        "_description": "Generic standard modulus carbon fiber.",
                        "_density": 1800,
                        "_E1": 207500000000,
                        "_E2": 18700000000,
                        "_PR12": 0.25,
                        "_PR23": 0.2,
                        "_G12": 8000000000
                    },
                    "_faw": 0.15,
                    "_vf": 0.59,
                    "_isRandom": false
                },
                "start": 0.65,
                "end": 1.0,
                "widthAtStart": 0.15*3.14159,
                "widthAtEnd": 0.05*3.14159,
                "taperStart": 0.75,
                "taperEnd": 1.0,
                "angle": 0,
                "orientation": "upright",
                "numPieces": 1,
                "clocking": 30,
                "epsilon": 0.00001
            },
            {
                "layer": {
                    "_clazz": "FabricLayer",
                    "_name": "C 150 @ +-30 x 4",
                    "_description": "4 layers of carbon +/- 30 degrees",
                    "_layers": [
                        {
                            "_clazz": "FabricLayer",
                            "_name": "C 150 @ +/-30",
                            "_description": "2 layers of carbon at +/- 30 degrees",
                            "_layers": [
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                },
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                }
                            ],
                            "_angles": [
                                30,
                                -30
                            ],
                            "_orientations": [
                                "upright",
                                "upright"
                            ],
                            "_weaveType": "None"
                        },
                        {
                            "_clazz": "FabricLayer",
                            "_name": "C 150 @ +/-30",
                            "_description": "2 layers of carbon at +/- 30 degrees",
                            "_layers": [
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                },
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                }
                            ],
                            "_angles": [
                                30,
                                -30
                            ],
                            "_orientations": [
                                "upright",
                                "upright"
                            ],
                            "_weaveType": "None"
                        },
                        {
                            "_clazz": "FabricLayer",
                            "_name": "C 150 @ +/-30",
                            "_description": "2 layers of carbon at +/- 30 degrees",
                            "_layers": [
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                },
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                }
                            ],
                            "_angles": [
                                30,
                                -30
                            ],
                            "_orientations": [
                                "upright",
                                "upright"
                            ],
                            "_weaveType": "None"
                        },
                        {
                            "_clazz": "FabricLayer",
                            "_name": "C 150 @ +/-30",
                            "_description": "2 layers of carbon at +/- 30 degrees",
                            "_layers": [
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                },
                                {
                                    "_clazz": "FiberLayer",
                                    "_name": "Carbon 150 gsm",
                                    "_description": "Carbon 150 gsm",
                                    "_fiber": {
                                        "_clazz": "Mat_PlanarIso23",
                                        "_name": "Carbon Fiber",
                                        "_description": "Generic standard modulus carbon fiber.",
                                        "_density": 1800,
                                        "_E1": 207500000000,
                                        "_E2": 18700000000,
                                        "_PR12": 0.25,
                                        "_PR23": 0.2,
                                        "_G12": 8000000000
                                    },
                                    "_faw": 0.15,
                                    "_vf": 0.59,
                                    "_isRandom": false
                                }
                            ],
                            "_angles": [
                                30,
                                -30
                            ],
                            "_orientations": [
                                "upright",
                                "upright"
                            ],
                            "_weaveType": "None"
                        }
                    ],
                    "_angles": [
                        0,
                        0,
                        0,
                        0
                    ],
                    "_orientations": [
                        "upright",
                        "upright",
                        "upright",
                        "upright"
                    ],
                    "_weaveType": "None"
                },
                "start": 0.5,
                "end": 0.85,
                "widthAtStart": 0.15*3.14159,
                "widthAtEnd": 0.15-(0.15-0.5)*(0.85-0.75)/(1.0-0.75),
                "taperStart": 0.75,
                "taperEnd": 0.85,
                "angle": 0,
                "orientation": "upright",
                "numPieces": 2,
                "clocking": 90,
                "epsilon": 0.00001
            }
        ]
    });
}