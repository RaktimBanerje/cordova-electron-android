module.exports = {
    parser: "babel-eslint",
    parserOptions: {
        sourceType: "unambiguous",
        allowImportExportEverywhere: true,
        ecmaFeatures: {
          globalReturn: false,
        },
    },
};