npx -y html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true index.code.html >index.html
git add index.code.html
git add index.html
git commit -m "Publish index.html"
git push
