pushd packages/core
npm publish
popd

# The `slate-dom-preview` is temporary to aid initial development and should
# eventually be replaced with the `slate-dom` package outside of this repo.
pushd packages/slate-dom-preview
npm publish
popd