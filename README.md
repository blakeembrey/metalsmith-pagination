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

To paginate an array of files, you need to have a property that points to the location of the collection you want to paginate. The value should be an options object that will be used to initialize the plugin.

**P.S.** Make sure the pagination middleware is defined _after_ the files array exists, but _before_ the template middleware renders.

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
* **first** An optional path to use in place of the page one (E.g. Render as the homepage `index.html`, instead of `page/1/index.html`).
* **path** The path to render every page under. Interpolated with the `pagination` object, so you can use `:name`, `:num` or `:index`.
* **filter** A string or function used to filter files in pagination.
* **pageMetadata** The metadata to merge with every page.
* **noPageOne** Set to true to disable rendering of page one, useful in conjunction with first (default: `false`).
* **groupBy** Set the grouping algorithm manually (default: paginated by `perPage`). Useful for paginating by other factors, like year published (E.g. `date.getFullYear()`).
* **empty** Allows empty pages for collections. This will also be used as the `file` passed to `groupBy` to get the page name.
* **template** The template metadata for [metalsmith-templates](https://npmjs.org/package/metalsmith-templates).
* **layout** The layout metadata for [metalsmith-layouts](https://npmjs.org/package/metalsmith-layouts).
* **pageContents** Set the contents of generated pages (default: `Buffer.from('')`). Useful for [metalsmith-in-place](https://npmjs.org/package/metalsmith-in-place) (especially with `pageMetadata`).

### Page Metadata

The `pageMetadata` option is optional. The object passed as `pageMetadata` is merged with the metadata of every page generated. This allows you to add arbitrary metadata to every page, such as a title variable.

### Template Usage

Within the template you specified, you will have access to pagination specific helpers:

* **pagination.num** The current page number.
* **pagination.index** The current page index (`num - 1`).
* **pagination.getPages(num)** Get an array of `num` pages with the current page as centered as possible
* **pagination.name** The page name from `groupBy`. If no `groupBy` was used, it is the current page number as a string.
* **pagination.files** All the files to render in the current page (E.g. array of `x` articles).
* **pagination.pages** References to every page in the collection (E.g. used to render pagination numbers).
* **pagination.next** The next page, if it exists.
* **pagination.previous** The previous page, if it exists.
* **pagination.first** The first page, equal to `pagination.pages[0]`.
* **pagination.last** The last page, equal to `pagination.pages[pagination.pages.length - 1]`.

For example, in Jade:

```jade
block content
  each file in pagination.files
    article.content
      header.header
        small.header-metadata
          time.timestamp(datetime=file.date)= moment(file.date).format('MMMM D, YYYY')
        h2.content-title
          a(href='/' + file.path)= file.title
      section.content-article!= file.snippet
  nav.navigation.cf
    if pagination.previous
      a.btn.pull-right(href='/' + pagination.previous.path)
        | Newer&nbsp;&nbsp;
        i.icon-right-dir
    if pagination.next
      a.btn.pull-left(href='/' + pagination.next.path)
        i.icon-left-dir
        | &nbsp;&nbsp;Older
```

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
