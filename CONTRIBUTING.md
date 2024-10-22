# Contributing to SlateSolid

## Local Dev

1. Clone this repo.
1. `npm install`
1. `npm start`

## Icons

Icons for README were generated using `SvgLetterIcon`

```jsx
<SvgLetterIcon bg="#477bbe" fg="#fff">
S
</SvgLetterIcon>
<SvgLetterIcon bg="#d8d8d8" fg="#505050">
S
</SvgLetterIcon>
```

## Npm Builds

Using `tsup` with `tsup-preset-solid` based on this template repo:
https://github.com/solidjs-community/solid-lib-starter

Note that `tsup` does not seem to support tsconfig project configurations, therefore `tsconfig.build.json` sets `composite: false`.
