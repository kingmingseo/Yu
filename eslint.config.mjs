// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals"), {
  rules: {
    "no-undef": "error", // 정의되지 않은 변수/함수 사용 시 에러
    "no-unused-vars": "warn", // 사용되지 않은 변수 경고
    "no-unreachable": "error", // 도달할 수 없는 코드 에러
    "no-console": "warn", // console 사용 시 경고
    "prefer-const": "error", // let 대신 const 사용 권장
    "no-var": "error", // var 사용 금지
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
