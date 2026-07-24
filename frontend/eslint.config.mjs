import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    rules: {
      "jsx-a11y/label-has-associated-control": [
        "error",
        {
          labelComponents: ["FieldLabel"],
          labelAttributes: ["htmlFor"],
          controlComponents: ["Input"],
          depth: 3,
        },
      ],

      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",

      // Common pattern with next-themes
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;



// import nextVitals from "eslint-config-next/core-web-vitals";

// const config = [
//   ...nextVitals,
//   {
//     ignores: [
//       "src/components/ui/field.tsx",
//     ],
//     rules: {
//       "jsx-a11y/label-has-associated-control": "error",
//       "jsx-a11y/click-events-have-key-events": "warn",
//       "jsx-a11y/no-noninteractive-element-interactions": "warn",
//       "react-hooks/set-state-in-effect": "off",
//     },
//   },
// ];

// export default config;