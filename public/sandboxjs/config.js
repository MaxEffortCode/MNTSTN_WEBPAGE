const vm = new NodeVM({
    eval: false,
    wasm: false,
    require: {
        //No buildin module allowed
        builtin: [],
        external: false,
        root: './',
        import: []
    },
    sandbox: {
        setTimeout: null,
        setInterval: null,
        eval: null,
        //Providing access to UtilFunction through utils
        utils: UtilFunctions
    }
});