declare module '*.less' {
    const css: {
        [key: string]: string
        use(params: { target: any }): void
    }
    export default css
}
declare module '*.webp'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
