const { NODE_ENV } = process.env

module.exports = {
    env: {
        browser: true,
        es2021: true,
        webextensions: true,
    },
    extends: [
        'plugin:react/recommended',
        'standard',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 13,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: ['server/*'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'no-console': NODE_ENV === 'commit' ? 2 : 0,
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-use-before-define': 'off',
        'prefer-promise-reject-errors': 'off',
        camelcase: 'off',
        'no-useless-constructor': 'off',
        'no-debugger': 'off',
        'no-useless-call': 'off',
        'prettier/prettier': 'error',
    },
}
