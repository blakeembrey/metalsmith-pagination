# Metalsmith Pagination

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

A [Metalsmith](http://metalsmith.io/) plugin for paginating arrays and [collections](https://github.com/segmentio/metalsmith-collections).

## Installation

```
npm install metalsmith-pagination --save
```

## Usage

To paginate an array of files, you need to have a property that points to the location of the collection you want to paginate. The value should be an options object that will be used to initialize the plugin. For example:

#### CLI

Install via npm and then add `metalsmith-pagination` to your `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-pagination": {
      "collections.articles": {
        "perPage": 5,
        "template": "index.jade",
        "first": "index.html",
        "path": "page/:num/index.html",
        "filter": "private !== true",
        "pageMetadata": {
          "title": "Archive"
        }
      }
    }
  }
}
```

#### JavaScript

Install via npm, require the module and `.use` the result of the function.

```js
var pagination = require('metalsmith-pagination')

metalsmith.use(pagination({
  'collections.articles': {
    perPage: 5,
    template: 'index.jade',
    first: 'index.html',
    path: 'page/:num/index.html',
    filter: function (page) {
      return !page.private
    },
    pageMetadata: {
      title: 'Archive'
    }
  }
}))
```

### Options

* **perPage** The number of files per page (default: `10`).
* **template** The template metadata for [metalsmith-templates](https://npmjs.org/package/metalsmith-templates).
* **layout** The layout metadata for [metalsmith-layouts](https://npmjs.org/package/metalsmith-layouts).
* **first** An optional path to use in place of the page one (E.g. Render as the homepage `index.html`, instead of `page/1/index.html`).
* **path** The path to render every page under.
* **filter** A string or function used to filter files in pagination.
* **pageMetadata** The metadata to merge with every page.

### Page Metadata

The `pageMetadata` option is optional. The object passed as `pageMetadata` is merged with the metadata of every page generated. This allows you to add arbitrary metadata to every page, such as a title variable.

### Template Usage

Within the template you specified, you will have access to pagination specific helpers:

* **pagination.num** The current page number.
* **pagination.files** All the files for the current page (E.g. an array of `x` articles).
* **pagination.pages** Links to every page in the collection (E.g. used to render pagination numbers).
* **pagination.next** The immediately following page, if it exists.
* **pagination.previous** The previous page, if it exists.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/metalsmith-pagination.svg?style=flat
[npm-url]: https://npmjs.org/package/metalsmith-pagination
[downloads-image]: https://img.shields.io/npm/dm/metalsmith-pagination.svg?style=flat
[downloads-url]: https://npmjs.org/package/metalsmith-pagination
[travis-image]: https://img.shields.io/travis/blakeembrey/metalsmith-pagination.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/metalsmith-pagination
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/metalsmith-pagination.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/metalsmith-pagination?branch=master
