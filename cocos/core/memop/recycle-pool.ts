
/**
 * @packageDocumentation
 * @module memop
 */

/**
 * @en Recyclable object pool. It's designed to be entirely reused each time.
 * There is no put and get method, each time you get the [[data]], you can use all elements as new.
 * You shouldn't simultaneously use the same RecyclePool in more than two overlapped logic.
 * Its size can be automatically incremented or manually resized.
 * @zh 循环对象池。这种池子被设计为每次使用都完整复用。
 * 它没有回收和提取的函数，通过获取 [[data]] 可以获取池子中所有元素，全部都应该被当做新对象来使用。
 * 开发者不应该在相互交叉的不同逻辑中同时使用同一个循环对象池。
 * 池子尺寸可以在池子满时自动扩充，也可以手动调整。
 * @see [[Pool]]
 */
export class RecyclePool<T = any> {
    private _fn: () => T;
    private _count = 0;
    private _data: T[];

    /**
     * @en Constructor with the allocator of elements and initial pool size, all elements will be pre-allocated.
     * @zh 使用元素的构造器和初始大小的构造函数，所有元素都会被预创建。
     * @param fn The allocator of elements in pool, it's invoked directly without `new`
     * @param size Initial pool size
     */
    constructor (fn: () => T, size: number) {
        this._fn = fn;
        this._data = new Array(size);

        for (let i = 0; i < size; ++i) {
            this._data[i] = fn();
        }
    }

    /**
     * @en The length of the object pool.
     * @zh 对象池大小。
     */
    get length () {
        return this._count;
    }

    /**
     * @en The underlying array of all pool elements.
     * @zh 实际对象池数组。
     */
    get data () {
        return this._data;
    }

    /**
     * @en Resets the object pool. Only changes the length to 0
     * @zh 清空对象池。目前仅仅会设置尺寸为 0
     */
    public reset () {
        this._count = 0;
    }

    /**
     * @en Resize the object poo, and fills with new created elements.
     * @zh 设置对象池大小，并填充新的元素。
     * @param size The new size of the pool
     */
    public resize (size: number) {
        if (size > this._data.length) {
            for (let i = this._data.length; i < size; ++i) {
                this._data[i] = this._fn();
            }
        }
    }

    /**
     * @en Expand the object pool, the size will be increment to current size times two, and fills with new created elements.
     * @zh 扩充对象池容量，会自动扩充尺寸到两倍，并填充新的元素。
     * @param idx 
     */
    public add () {
        if (this._count >= this._data.length) {
            this.resize(this._data.length * 2);
        }

        return this._data[this._count++];
    }

    /**
     * @en Remove an element of the object pool. This will also decrease size of the pool
     * @zh 移除对象池中的一个元素，同时会减小池子尺寸。
     * @param idx The index of the element to be removed
     */
    public removeAt (idx: number) {
        if (idx >= this._count) {
            return;
        }

        const last = this._count - 1;
        const tmp = this._data[idx];
        this._data[idx] = this._data[last];
        this._data[last] = tmp;
        this._count -= 1;
    }
}