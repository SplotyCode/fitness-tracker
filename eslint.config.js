import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import reactHooks from "eslint-plugin-react-hooks";
import reactPlugin  from 'eslint-plugin-react';
import eslint from '@eslint/js';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  pluginReactConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      'indent': ['error', 2, { SwitchCase: 1 }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      'react/jsx-key' : 'error',
      'react/jsx-no-duplicate-props' : 'error',
      'react/jsx-no-script-url' : 'error',
      'react/self-closing-comp' : 'error',
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/jsx-boolean-value': ['error', 'always'],
      'react/no-multi-comp': ['error', { ignoreStateless: true }],

      'react-hooks/rules-of-hooks' : 'error',
      'react-hooks/exhaustive-deps': 'error',

      // TODO
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];