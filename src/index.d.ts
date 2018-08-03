/**
 * 自定义的声明文件，用于覆盖、拓展第三方框架，或者一些全部变量
 */


interface point {
    x: number,
    y: number
}
declare module Laya {
    interface Sprite {
        radio: number,
        speed: number,
        routeIndex: number,
        equation: Function,
        ignore: boolean,
        originPos: point,
        originScale: point,
        originSpeed: number,
        index: number
        type: string
        flag: number
        isLeft: boolean,
        safe: number,

    }
    interface Animation {
        prehitBounds: any
        tween: any
    }
}


declare namespace process {
    export let env: any
}