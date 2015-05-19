var toFn = require('to-function')
var extend = require('extend')

/**
 * Page collection defaults.
 *
 * @type {Object}
 */
var DEFAULTS = {
  perPage: 10
}

/**
 * Paginate based on the collection.
 *
 * @param  {Object}   opts
 * @return {Function}
 */
module.exports = function (opts) {
  var keys = Object.keys(opts)

  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata()

    // Iterate over all the paginate names and match with collections.
    var complete = keys.every(function (name) {
      var collection

      try {
        collection = toFn(name)(metadata)
      } catch (e) {
        done(e)

        return false
      }

      // Throw an error if the collection does not exist.
      if (!collection) {
        done(new TypeError('Collection "' + name + '" does not exist'))

        return false
      }

      var pageOpts = extend({}, DEFAULTS, opts[name])
      var toShow = collection

      if (typeof pageOpts.filter === 'function') {
        toShow = collection.filter(pageOpts.filter)
      } else if (pageOpts.filter) {
        toShow = collection.filter(toFn(pageOpts.filter))
      }

      var perPage = pageOpts.perPage
      var pages = collection.pages = []
      var numPages = Math.ceil(toShow.length / perPage)

      if (!pageOpts.template && !pageOpts.layout) {
        done(new TypeError('Specify a template or layout for "' + name + '" pages'))

        return false
      }

      if (pageOpts.template && pageOpts.layout) {
        done(new TypeError('You should not specify template and layout for "' +
          name + '" pages simultaneosly'))

        return false
      }

      if (!pageOpts.path) {
        done(new TypeError('Specify a path for "' + name + '" pages'))

        return false
      }

      // Iterate over every page and generate a pages array.
      for (var i = 0; i < numPages; i++) {
        var pageFiles = toShow.slice(i * perPage, (i + 1) * perPage)

        // Create the pagination object for the current page.
        var pagination = {
          num: i + 1,
          pages: pages,
          files: extend(pageFiles, { metadata: collection.metadata })
        }

        // Generate a new file based on the filename with correct metadata.
        var page = extend({}, pageOpts.pageMetadata, {
          template: pageOpts.template,
          layout: pageOpts.layout,
          contents: new Buffer(''),
          path: interpolate(pageOpts.path, pagination),
          pagination: pagination
        })

        // Create the file.
        files[page.path] = page

        // Update next/prev references.
        if (i > 0) {
          page.pagination.previous = pages[i - 1]
          pages[i - 1].pagination.next = page
        }

        // When the first page option is set, render it over the top of the
        // canonically generated page.
        if (i === 0 && pageOpts.first) {
          page = extend({}, page, {
            path: interpolate(pageOpts.first, page.pagination)
          })

          files[page.path] = page
        }

        pages.push(page)
      }

      return true
    })

    return complete && done()
  }
}

/**
 * Interpolate the page path with pagination variables.
 *
 * @param  {String} path
 * @param  {Object} opts
 * @return {String}
 */
function interpolate (path, opts) {
  return path.replace(/:num/g, opts.num)
}
