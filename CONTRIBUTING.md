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

## Npm Publishing

- Update `package.json` versions
- Run `npm i`
- Run `npm run publish:npm`

## Notes on Packaging Libraries for Usage with SolidJS

There needs to be a `solid` exports condition for libraries to treat `.jsx` files appropriately.

```json
"exports": {
  "solid": {
    "development": "./dist/index.jsx",
    "import": "./dist/index.jsx"
  }
}
```

It seems that the index file in the published packages needs to be `index.jsx` instead of `index.js` to be consumed properly by SolidJS. I can't find any docs on this, but [#79](https://github.com/slate-solid/slate-solid/issues/79) seems to have been caused by this. Namely the children of `<Slate/>` component were rendering before the context was provided. `@solidjs/router` is a package I used as an example. Note that it uses a slightly different exports condition. May need to revisit this if we run into other issues:

```json
"exports": {
  ".": {
    "solid": "./dist/index.jsx",
    "default": "./dist/index.js"
  }
}
```
