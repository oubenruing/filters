import { Filter, GlProgram, GpuProgram, Point } from 'pixi.js';
import { vertex, wgslVertex } from '../defaults';
import fragment from './pixelate.frag';
import source from './pixelate.wgsl';

import type { FilterOptions } from 'pixi.js';

type Size = number | number[] | Point;

interface PixelateFilterOptions extends FilterOptions
{
    size?: Size;
}

/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/pixelate.png)
 *
 * @class
 * @extends Filter
 */
export class PixelateFilter extends Filter
{
    public static readonly DEFAULT_OPTIONS = {
        size: 10,
    };

    /**
     * @param {Point|Array<number>|number} [size=10] - Either the width/height of the size of the pixels, or square size
     */
    constructor(options: Size);
    /**
     * @param {PixelateFilterOptions}
     */
    constructor(options: PixelateFilterOptions);
    constructor(options: PixelateFilterOptions | Size = 10)
    {
        let size: Size;
        let rest: FilterOptions = {};

        if (typeof options === 'number' || Array.isArray(options) || options instanceof Point)
        {
            size = options;
        }
        else
        {
            ({ size, ...rest } = { ...PixelateFilter.DEFAULT_OPTIONS, ...options });
        }

        const gpuProgram = GpuProgram.from({
            vertex: {
                source: wgslVertex,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source,
                entryPoint: 'mainFragment',
            },
        });

        const glProgram = GlProgram.from({
            vertex,
            fragment,
            name: 'pixelate-filter',
        });

        super({
            gpuProgram,
            glProgram,
            resources: {
                pixelateUniforms: {
                    uSize: { value: new Float32Array(2), type: 'vec2<f32>' },
                },
            },
            ...rest
        });

        this.size = size;
    }

    /**
     * The size of the pixels
     * @default [10,10]
     */
    get size(): Size { return this.resources.pixelateUniforms.uniforms.uSize; }
    set size(value: Size)
    {
        if (value instanceof Point)
        {
            this.sizeX = value.x;
            this.sizeY = value.y;
        }
        else if (Array.isArray(value))
        {
            this.resources.pixelateUniforms.uniforms.uSize = value;
        }
        else
        {
            this.sizeX = this.sizeY = value;
        }
    }

    /**
    * The size of the pixels on the `x` axis
    * @default 10
    */
    get sizeX(): number { return this.resources.pixelateUniforms.uniforms.uSize[0]; }
    set sizeX(value: number) { this.resources.pixelateUniforms.uniforms.uSize[0] = value; }

    /**
    * The size of the pixels on the `y` axis
    * @default 10
    */
    get sizeY(): number { return this.resources.pixelateUniforms.uniforms.uSize[1]; }
    set sizeY(value: number) { this.resources.pixelateUniforms.uniforms.uSize[1] = value; }
}
