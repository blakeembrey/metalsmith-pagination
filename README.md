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

To paginate an array of files, you need to have a property that points to the location of the collection you want to paginate. The value should be an options object that will be used to initialise the plugin. For example:

### CLI

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

### JavaScript

Install via npm, require the module and `.use` the result of the function.

```js
var pagination = require('metalsmith-pagination')

metalsmith.use(pagination({
  'collections.articles': {
    perPage: 5,
    template: 'index.jade',
    // Do not use `layout` in conjunction with `template`.
    // This option is useful if you use `metalsmith-layouts`.
    layout: 'index.jade',
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

### Page Metadata

The `pageMetadata` option is optional. An object passed as `pageMetadata` is used to initialise every pages metadata. This allows you to add arbitrary metadata to every create page, such as a title variable.

### Template Usage

Within the template you specified, you will have access to pagination specific helpers:

| Property              | Description                                    |
|-----------------------|------------------------------------------------|
| `pagination.num`      | The current page number.                       |
| `pagination.files`    | All the files on the current page.             |
| `pagination.pages`    | A link to all the pages in the collection.     |
| `pagination.next`     | Links to the next page file, if it exists.     |
| `pagination.previous` | Links to the previous page file, if it exists. |

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
