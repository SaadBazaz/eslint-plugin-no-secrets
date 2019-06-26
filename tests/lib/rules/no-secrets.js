const RuleTester = require("eslint/lib/testers/rule-tester"),
  rule = require("../../..").rules["no-secrets"],
  { HIGH_ENTROPY, PATTERN_MATCH } = require("../../../utils"),
  P = require("../../../regexes"),
  _ = require("lodash");

const ruleTester = new RuleTester({ env: { es6: true } });

const STRING_TEST = `
const NOT_A_SECRET = "I'm not a secret, I think";
`;

const IMPORT_REQUIRE_TEST = `
const webpackFriendlyConsole = require('./config/webpack/webpackFriendlyConsole')
`;

const TEMPLATE_TEST = "const NOT_A_SECRET = `A template that isn't a secret. ${1+1} = 2`";

const SECRET_STRING_TEST = `
const A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
`;

const A_BEARER_TOKEN = `
const A_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid%2BULvsea4JtiGRiSDSJSI%3DEUifiRBkKG5E2XzMDjRfl76ZC9Ub0wnz4XsNiRVBChTYbJcE3F";
`;

const IN_AN_OBJECT = `
const VAULT = {
  token:"BAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid%2BULvsea4JtiGRiSDSJSI%3DEUifiRBkKG5E2XzMDjRfl76ZC9Ub0wnz4XsNiRVBChTYbJcE3F"
}
`;

const CSS_CLASSNAME = `
const CSS_CLASSNAME = "hey-it-s-a-css-class-not-a-secret and-neither-this-one";
`;
const IGNORE_CONTENT_TEST = `
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
`;

const IMPORT_TEST = `
import {x} from "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
`;

const IGNORE_VAR_TEST = `const NOT_A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";`;

const IGNORE_FIELD_TEST = `
const VAULT = {
  NOT_A_SECRET:"ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva"
};

`;

const IGNORE_CLASS_FIELD_TEST = `
class A {
  constructor(){
    this.secret = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
  }
}
`;
/**
 * Test to make sure regular expressions aren't triggered by the entropy check
 */
const REGEX_TESTS = [
  P["Slack Token"],
  P["AWS API Key"],
  P["Facebook Oauth"],
  P["Twitter Oauth"],
  P["Password in URL"]
].map(regexp => ({ code: `const REGEXP = \`${regexp.source}\``, options: [] }));

const HIGH_ENTROPY_MSG = {
  messageId: HIGH_ENTROPY
};
const PATTERN_MATCH_MSG = {
  messageId: PATTERN_MATCH
};

const PATTERN_MATCH_TESTS = [P["Google (GCP) Service-account"], P["RSA private key"]].map(regexp => ({
  code: `const REGEXP = \`${regexp.source}\``,
  options: [],
  errors: [PATTERN_MATCH_MSG]
}));

ruleTester.run("no-secrets", rule, {
  valid: [
    {
      code: STRING_TEST,
      options: []
    },
    {
      code: TEMPLATE_TEST,
      options: []
    },
    {
      code: IMPORT_REQUIRE_TEST,
      options: []
    },
    {
      code: CSS_CLASSNAME,
      options: []
    },
    {
      code: IGNORE_CONTENT_TEST,
      options: [{ ignoreContent: [/^ABC/] }]
    },
    {
      code: IGNORE_CONTENT_TEST,
      options: [{ ignoreContent: "^ABC" }]
    },
    {
      //Property
      code: IGNORE_FIELD_TEST,
      options: [{ ignoreIdentifiers:[/NOT_A_SECRET/] }]
    },
    {
      code: IMPORT_TEST,
      options: [{ ignoreModules: true }],
      parserOptions: { sourceType: "module", ecmaVersion: 7 }
    },
    {
      //VariableDeclarator
      code: IGNORE_VAR_TEST,
      options: [{ignoreIdentifiers:"NOT_A_SECRET"}]
    }
  ].concat(REGEX_TESTS),
  invalid: [
    {
      code: SECRET_STRING_TEST,
      options: [],
      errors: [HIGH_ENTROPY_MSG]
    },
    {
      code: A_BEARER_TOKEN,
      options: [],
      errors: [HIGH_ENTROPY_MSG]
    },
    {
      code: IN_AN_OBJECT,
      options: [],
      errors: [HIGH_ENTROPY_MSG]
    },
    {
      code: `
        const BASIC_AUTH_HEADER =  "Authorization: Basic QWxhZGRpbjpPcGVuU2VzYW1l"
      `,
      options: [{ additionalRegexes: { "Basic Auth": "Authorization: Basic [A-Za-z0-9+/=]*" } }],
      errors: [HIGH_ENTROPY_MSG, PATTERN_MATCH_MSG]
    }
  ].concat(PATTERN_MATCH_TESTS)
});
