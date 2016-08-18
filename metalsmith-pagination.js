var toFn = require('to-function')
var extend = require('xtend')

/**
 * Page collection defaults.
 *
 * @type {Object}
 */
var DEFAULTS = {
  perPage: 10,
  noPageOne: false,
  pageContents: new Buffer('')
}

/**
 * Paginate based on the collection.
 *
 * @param  {Object}   options
 * @return {Function}
 */
module.exports = function (options) {
  var keys = Object.keys(options)

  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata()

    // Iterate over all the paginate names and match with collections.
    var complete = keys.every(function (name) {
      var collName = name.replace(/collections\./, '');
      
      // If a metalsmith collection does not exist in the passed in
      // collecttion pagination definitions, skip over it
      if (!metadata.collections.hasOwnProperty(collName)) return true;
          
      var collection = metadata.collections[collName];
      var pageOptions = extend(DEFAULTS, options[name])
      var toShow = collection
      var groupBy = toFn(pageOptions.groupBy || groupByPagination)

      if (pageOptions.filter) {
        toShow = collection.filter(toFn(pageOptions.filter))
      }

      if (!pageOptions.template && !pageOptions.layout) {
        done(new TypeError('A template or layout is required (' + name + ')'))

        return false
      }

      if (pageOptions.template && pageOptions.layout) {
        done(new TypeError(
          'Template and layout can not be used simultaneosly (' + name + ')'
        ))

        return false
      }

      if (!pageOptions.path) {
        done(new TypeError('The path is required (' + name + ')'))

        return false
      }

      // Can't specify both
      if (pageOptions.noPageOne && !pageOptions.first) {
        done(new TypeError(
          'When `noPageOne` is enabled, a first page must be set (' + name + ')'
        ))

        return false
      }

      // Put a `pages` property on the original collection.
      var pages = collection.pages = []
      var pageMap = {}

      // Sort pages into "categories".
      toShow.forEach(function (file, index) {
        var name = String(groupBy(file, index, pageOptions))

        // Keep pages in the order they are returned. E.g. Allows sorting
        // by published year to work.
        if (!pageMap.hasOwnProperty(name)) {
          // Use the index to calculate pagination, page numbers, etc.
          var length = pages.length

          var pagination = {
            name: name,
            index: length,
            num: length + 1,
            pages: pages,
            files: [],
            getPages: createPagesUtility(pages, length)
          }

          // Generate the page data.
          var page = extend(pageOptions.pageMetadata, {
            template: pageOptions.template,
            layout: pageOptions.layout,
            contents: pageOptions.pageContents,
            path: interpolate(pageOptions.path, pagination),
            pagination: pagination
          })

          // Copy collection metadata onto every page "collection".
          pagination.files.metadata = collection.metadata

          if (length === 0) {
            if (!pageOptions.noPageOne) {
              files[page.path] = page
            }

            if (pageOptions.first) {
              // Extend the "first page" over the top of "page one".
              page = extend(page, {
                path: interpolate(pageOptions.first, page.pagination)
              })

              files[page.path] = page
            }
          } else {
            files[page.path] = page

            page.pagination.previous = pages[length - 1]
            pages[length - 1].pagination.next = page
          }

          pages.push(page)
          pageMap[name] = pagination
        }

        // Files are kept sorted within their own category.
        pageMap[name].files.push(file)
      })

      // Add page utilities.
      pages.forEach(function (page, index) {
        page.pagination.first = pages[0]
        page.pagination.last = pages[pages.length - 1]
      })

      return true
    })

    return complete && done()
  }
}

/**
 * Interpolate the page path with pagination variables.
 *
 * @param  {String} path
 * @param  {Object} data
 * @return {String}
 */
function interpolate (path, data) {
  return path.replace(/:(\w+)/g, function (match, param) {
    return data[param]
  })
}

/**
 * Group by pagination by default.
 *
 * @param  {Object} file
 * @param  {number} index
 * @param  {Object} options
 * @return {number}
 */
function groupByPagination (file, index, options) {
  // If options.perPage is a single value, all pages have the same 
  // number of results per page
  if (!Array.isArray(options.perPage)) {
    return Math.ceil((index + 1) / options.perPage)
    
  // Otherwise options.perPage[0] is number of results for 1st page, 
  // options.perPage[1] is number of results for all other pages
  } else {
    return (index < options.perPage[0] ? 1 : (Math.ceil((index - options.perPage[0] + 1) / options.perPage[1]))+1);
  }
}

/**
 * Create a "get pages" utility for people to use when rendering.
 *
 * @param  {Array}    pages
 * @param  {number}   index
 * @return {Function}
 */
function createPagesUtility (pages, index) {
  return function getPages (number) {
    var offset = Math.floor(number / 2)
    var start, end

    if (index + offset >= pages.length) {
      start = Math.max(0, pages.length - number)
      end = pages.length
    } else {
      start = Math.max(0, index - offset)
      end = Math.min(start + number, pages.length)
    }

    return pages.slice(start, end)
  }
}
