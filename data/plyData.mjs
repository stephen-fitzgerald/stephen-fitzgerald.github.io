// @ts-check
/*jshint esversion: 6 */

import { ReleaseLayer } from '../js/pci/lpt/layup.mjs';
import { SolidLayer } from '../js/pci/lpt/layup.mjs';
import { FiberLayer } from '../js/pci/lpt/layup.mjs';
import { PrepregLayer } from '../js/pci/lpt/layup.mjs';
import { WEAVETYPE } from '../js/pci/lpt/layup.mjs';
import { FabricLayer } from '../js/pci/lpt/layup.mjs';

let PLY_DATA = function () {

    let load = function (dataStore) {

        //let dataStore = new DATA_STORE.DataStore();

        function rcForEqualVf(Rc1, rhof1, rhof2) {
            let Mf1 = 1 - Rc1;
            let Mf2 = Mf1 * (rhof2 / rhof1) / (1 - Mf1 * (1 - rhof2 / rhof1));
            return 1 - Mf2;
        }

        let h160 = dataStore.getItemByName('Divinycell H160');
        let eGlassFiber = dataStore.getItemByName('E-Glass Fiber');
        let carbonFiber = dataStore.getItemByName('Carbon Fiber');
        let epoxyResin = dataStore.getItemByName('Epoxy Resin');
        let petFilm = dataStore.getItemByName('PET Film');

        dataStore.addItem(
            'Wrightlon 3800',
            new ReleaseLayer(
                new SolidLayer({
                    material: petFilm,
                    thickness: 0.0254 * 0.002, // = 0.002"
                })
            ),
            ['release', 'sheet', 'product']
        );

        dataStore.addItem(
            'Divinycell H160 - 1/4 in',
            new SolidLayer({
                material: h160,
                thickness: 0.0254 / 4.0, // = 1/4"
            }),
            ['core', 'sheet', 'product']
        );

        dataStore.addItem('Divinycell H160 - 1/2 in', new SolidLayer({
            material: h160,
            thickness: 0.0254 / 2.0, // = 1/2"
        }), ['core', 'sheet', 'product']);

        dataStore.addItem('Divinycell H160 - 1 in', new SolidLayer({
            material: h160,
            thickness: 0.0254, // = 1"
        }), ['core', 'sheet', 'product']);


        dataStore.addItem('Unidirectional Glass - 150 gsm', new FiberLayer({
            fiber: eGlassFiber,
            faw: 0.150,
            vf: 0.55,
        }), ['fabric', 'unidirectional', 'glass', 'sheet', 'product']);


        dataStore.addItem(
            'E-Glass Prepreg - Newport 301 - 175 gsm',
            new PrepregLayer({
                layer: new FiberLayer({
                    fiber: eGlassFiber,
                    faw: 0.175,
                    vf: 0.55
                }),
                resin: epoxyResin,
                resinContent: rcForEqualVf(0.36, 1.8, 2.54),
                resinFlow: 0.02,
            }),
            ['prepreg', 'glass', 'epoxy', 'product', 'unidirectional']
        );

        dataStore.addItem('Carbon Prepreg - Newport 301 - 150 gsm',
            new PrepregLayer({
                layer: new FiberLayer({
                    fiber: carbonFiber,
                    faw: 0.150,
                    vf: 0.55,
                }),
                resin: epoxyResin,
                resinContent: 0.38,
                resinFlow: 0.02,
            }),
            ['prepreg', 'carbon', 'epoxy', 'product', 'unidirectional']
        );

        let glass175gsmAt50Vf = new FiberLayer({
            fiber: eGlassFiber,
            faw: 0.175,
            vf: 0.5,
        });

        // Plain weave glass cloth
        dataStore.addItem('Glass Cloth, Plain Weave, 350 gsm', new FabricLayer({
            layers: [glass175gsmAt50Vf, glass175gsmAt50Vf],
            angles: [0.0, 90.0],
            weaveType: WEAVETYPE.PLAIN,
        }), ['fabric', 'woven', 'glass', 'product']);

        // a pre-kitted angle-ply prepreg layer, made with existing prepreg ply definition
        let carbon150gsm = dataStore.getItemByName('Carbon Prepreg - Newport 301 - 150 gsm');
        dataStore.addItem('150 gsm Carbon +/-30', new FabricLayer({
            layers: [carbon150gsm, carbon150gsm],
            angles: [30.0, -30.0],
            weaveType: WEAVETYPE.NONE,
        }), ['kit', 'prepreg', 'carbon', 'angle-ply']);

        // a stitch-knit fabric with random mat
        dataStore.addItem('ELXM-1808 Knitted Fabric', new FabricLayer({
            layers: [
                new FiberLayer({
                    fiber: eGlassFiber,
                    faw: 0.175,
                    vf: 0.5,
                }),
                new FiberLayer({
                    fiber: eGlassFiber,
                    faw: 0.175,
                    vf: 0.5,
                }),
                new FiberLayer({
                    fiber: eGlassFiber,
                    faw: 0.175,
                    vf: 0.5,
                }),
                new FiberLayer({
                    fiber: eGlassFiber,
                    faw: 0.175,
                    vf: 0.25,
                    isRandom: true,
                }),
            ],
            angles: [0, 45, -45, 0],
            weaveType: WEAVETYPE.KNIT, // NONE works as well
        }), ['fabric', 'stitch-knit', 'glass', 'product']);

    };
    return {
        load: load,
    };
}();