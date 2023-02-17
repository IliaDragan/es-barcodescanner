module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "mocha": true,
    "es6": true
  },
  globals: {
    module: true
  },
  extends: [
    "eslint:recommended"
  ],
  ignorePatterns: [
    "dist/**.js",
    "**/tmp/**.js"
  ],
  "parserOptions": {
    // Required for certain syntax usages
    "ecmaVersion": 2020
  },
  rules: {
    "no-ex-assign": "off",
    "no-redeclare": "off",
    "no-empty": ["error", { "allowEmptyCatch": true }],
    "linebreak-style": ["error", "unix"],
    "no-console": "off",
    "max-len": ["error", { "code": 160 }],
    "quotes": ["error", "double", {
      avoidEscape: true
    }],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "eol-last": ["error", "always"],
    "indent": ["error", 2, {
      "SwitchCase": 1,
      "ArrayExpression": "off",
      "ObjectExpression": "off"
    }],
    "arrow-spacing": ["error", {
      "before": true,
      "after": true
    }],
    "switch-colon-spacing": ["error", {
      "before": false,
      "after": true
    }],
    "block-spacing": ["error", "always"],
    "template-curly-spacing": ["error", "always"],
    "semi-spacing": ["error", {
      "before": false,
      "after": true
    }],
    "computed-property-spacing": ["error", "never", {
      "enforceForClassMembers": true
    }],
    "comma-spacing": ["error", {
      "before": false,
      "after": true
    }],
    "yield-star-spacing": ["error", "after"],
    "template-tag-spacing": ["error", "never"],
    "rest-spread-spacing": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "key-spacing": ["error", {
      beforeColon: false,
      afterColon: true,
      mode: "strict"
    }],
    "keyword-spacing": ["error", {
      "before": true,
      "after": true
    }],
    "func-call-spacing": ["error", "never"],
    "array-bracket-spacing": ["error", "never"],
    "no-useless-escape": "off"
  }
};
