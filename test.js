/* global describe, it, beforeEach */

var expect = require('chai').expect
var paginate = require('./')

/**
 * Create a psuedo metalsmith instance from a metadata object.
 *
 * @param  {Object} metadata
 * @return {Object}
 */
function instance (metadata) {
  return {
    metadata: function () {
      return metadata
    }
  }
}

describe('metalsmith collections paginate', function () {
  describe('multiple pages', function () {
    var files

    var metadata = {
      collections: {
        articles: [
          { contents: '' },
          { contents: '' },
          { contents: '' },
          { contents: '' },
          { contents: '' },
          { contents: '' },
          { contents: '' }
        ]
      }
    }

    var metalsmith = instance(metadata)

    beforeEach(function () {
      files = {}
    })

    it('should split a collection into individual files', function (done) {
      return paginate({
        'collections.articles': {
          perPage: 3,
          template: 'index.jade',
          first: 'articles/index.html',
          path: 'articles/page/:num/index.html'
        }
      })(files, metalsmith, function (err) {
        var firstPage = files['articles/index.html']
        var pageOne = files['articles/page/1/index.html']
        var pageTwo = files['articles/page/2/index.html']
        var pageThree = files['articles/page/3/index.html']

        expect(firstPage).to.exist
        expect(firstPage).to.not.equal(pageOne)
        expect(firstPage.pagination.index).to.equal(0)
        expect(firstPage.pagination.num).to.equal(1)
        expect(firstPage.pagination.name).to.equal('1')
        expect(firstPage.pagination.next).to.equal(pageTwo)
        expect(firstPage.pagination.previous).to.not.exist
        expect(firstPage.pagination.first).to.equal(firstPage)
        expect(firstPage.pagination.last).to.equal(pageThree)

        expect(pageOne).to.exist
        expect(pageOne.pagination.index).to.equal(0)
        expect(pageOne.pagination.num).to.equal(1)
        expect(pageOne.pagination.name).to.equal('1')
        expect(pageOne.pagination.next).to.equal(pageTwo)
        expect(pageOne.pagination.previous).to.not.exist
        expect(pageOne.pagination.first).to.equal(firstPage)
        expect(pageOne.pagination.last).to.equal(pageThree)

        expect(pageTwo).to.exist
        expect(pageTwo.pagination.index).to.equal(1)
        expect(pageTwo.pagination.num).to.equal(2)
        expect(pageTwo.pagination.name).to.equal('2')
        expect(pageTwo.pagination.next).to.equal(pageThree)
        expect(pageTwo.pagination.previous).to.equal(firstPage)
        expect(pageTwo.pagination.first).to.equal(firstPage)
        expect(pageTwo.pagination.last).to.equal(pageThree)

        expect(pageThree).to.exist
        expect(pageThree.pagination.index).to.equal(2)
        expect(pageThree.pagination.num).to.equal(3)
        expect(pageThree.pagination.name).to.equal('3')
        expect(pageThree.pagination.next).to.not.exist
        expect(pageThree.pagination.previous).to.equal(pageTwo)
        expect(pageThree.pagination.first).to.equal(firstPage)
        expect(pageThree.pagination.last).to.equal(pageThree)

        expect(metadata.collections.articles.pages).to.have.length(3)

        expect(firstPage.template).to.equal('index.jade')
        expect(firstPage.pagination.num).to.equal(1)
        expect(firstPage.pagination.pages).to.equal(metadata.collections.articles.pages)

        expect(pageOne.pagination.getPages(2)).to.deep.equal([firstPage, pageTwo])
        expect(firstPage.pagination.getPages(2)).to.deep.equal([firstPage, pageTwo])
        expect(pageTwo.pagination.getPages(2)).to.deep.equal([firstPage, pageTwo])
        expect(pageThree.pagination.getPages(2)).to.deep.equal([pageTwo, pageThree])

        expect(pageOne.pagination.getPages(3)).to.deep.equal([firstPage, pageTwo, pageThree])
        expect(pageTwo.pagination.getPages(3)).to.deep.equal([firstPage, pageTwo, pageThree])
        expect(pageThree.pagination.getPages(3)).to.deep.equal([firstPage, pageTwo, pageThree])

        expect(pageTwo.pagination.getPages(100)).to.deep.equal([firstPage, pageTwo, pageThree])

        return done(err)
      })
    })

    it('should add metadata to each page created', function (done) {
      return paginate({
        'collections.articles': {
          perPage: 3,
          template: 'index.jade',
          path: 'articles/page/:num/index.html',
          pageContents: 'foobar',
          pageMetadata: {
            foo: 'bar',
            some: {
              thing: true
            }
          }
        }
      })(files, metalsmith, function (err) {
        var firstPage = files['articles/index.html']
        var pageOne = files['articles/page/1/index.html']
        var pageTwo = files['articles/page/2/index.html']
        var pageThree = files['articles/page/3/index.html']

        expect(firstPage).to.not.exist

        expect(pageOne).to.exist
        expect(pageOne.contents).to.equal('foobar')
        expect(pageOne.foo).to.equal('bar')
        expect(pageOne.some.thing).to.equal(true)

        expect(pageTwo).to.exist
        expect(pageTwo.contents).to.equal('foobar')
        expect(pageTwo.foo).to.equal('bar')
        expect(pageTwo.some.thing).to.equal(true)

        expect(pageThree).to.exist
        expect(pageThree.contents).to.equal('foobar')
        expect(pageThree.foo).to.equal('bar')
        expect(pageThree.some.thing).to.equal(true)

        return done(err)
      })
    })

    it('should omit page one output with `noPageOne` enabled', function (done) {
      return paginate({
        'collections.articles': {
          template: 'index.jade',
          first: 'index.html',
          noPageOne: true,
          path: 'page/:num/index.html'
        }
      })(files, metalsmith, function (err) {
        var firstPage = files['index.html']
        var pageOne = files['page/1/index.html']

        expect(firstPage).to.exist
        expect(firstPage.pagination.files.length).to.equal(7)

        expect(pageOne).to.not.exist

        return done(err)
      })
    })
  })

  describe('group by', function () {
    var files

    var metadata = {
      collections: {
        articles: [
          { contents: '', date: new Date(2014, 10, 7) },
          { contents: '', date: new Date(2014, 11, 12) },
          { contents: '', date: new Date(2015, 9, 23) }
        ]
      }
    }

    var metalsmith = instance(metadata)

    beforeEach(function () {
      files = {}
    })

    it('should allow custom group by functions', function (done) {
      return paginate({
        'collections.articles': {
          groupBy: 'date.getFullYear()',
          template: 'index.jade',
          path: 'articles/:name/index.html'
        }
      })(files, metalsmith, function (err) {
        var pageOne = files['articles/2014/index.html']
        var pageTwo = files['articles/2015/index.html']

        expect(pageOne).to.exist
        expect(pageOne.pagination.num).to.equal(1)
        expect(pageOne.pagination.name).to.equal('2014')
        expect(pageOne.pagination.files.length).to.equal(2)

        expect(pageTwo).to.exist
        expect(pageTwo.pagination.num).to.equal(2)
        expect(pageTwo.pagination.name).to.equal('2015')
        expect(pageTwo.pagination.files.length).to.equal(1)

        return done(err)
      })
    })
  })

  describe('filtering', function () {
    var files

    var metadata = {
      collections: {
        articles: [
          { contents: '', hide: true },
          { contents: '', hide: true },
          { contents: '', hide: true },
          { contents: '', hide: false },
          { contents: '', hide: false },
          { contents: '', hide: false },
          { contents: '', hide: false }
        ]
      }
    }

    var metalsmith = instance(metadata)

    beforeEach(function () {
      files = {}
    })

    it('should use all pages without filters', function (done) {
      return paginate({
        'collections.articles': {
          perPage: 3,
          template: 'index.jade',
          first: 'articles/index.html',
          path: 'articles/page/:num/index.html'
        }
      })(files, metalsmith, function (err) {
        var firstPage = files['articles/index.html']
        var pageOne = files['articles/page/1/index.html']
        var pageTwo = files['articles/page/2/index.html']
        var pageThree = files['articles/page/3/index.html']

        expect(firstPage).to.exist
        expect(firstPage.pagination.files.length).to.equal(3)

        expect(pageOne).to.exist
        expect(pageOne.pagination.files.length).to.equal(3)

        expect(pageTwo).to.exist
        expect(pageTwo.pagination.files.length).to.equal(3)

        expect(pageThree).to.exist
        expect(pageThree.pagination.files.length).to.equal(1)

        return done(err)
      })
    })

    it('should filter using to-function when a string or object is provided', function (done) {
      return paginate({
        'collections.articles': {
          perPage: 3,
          template: 'index.jade',
          first: 'articles/index.html',
          filter: {
            hide: false
          },
          path: 'articles/page/:num/index.html'
        }
      })(files, metalsmith, function (err) {
        var firstPage = files['articles/index.html']
        var pageOne = files['articles/page/1/index.html']
        var pageTwo = files['articles/page/2/index.html']
        var pageThree = files['articles/page/3/index.html']

        expect(firstPage).to.exist
        expect(firstPage.pagination.files.length).to.equal(3)

        expect(pageOne).to.exist
        expect(pageOne.pagination.files.length).to.equal(3)

        expect(pageTwo).to.exist
        expect(pageTwo.pagination.files.length).to.equal(1)

        expect(pageThree).to.not.exist

        return done(err)
      })
    })

    it('should filter using a provided function', function (done) {
      return paginate({
        'collections.articles': {
          perPage: 3,
          template: 'index.jade',
          first: 'articles/index.html',
          filter: function (page) {
            return !page.hide
          },
          path: 'articles/page/:num/index.html'
        }
      })(files, metalsmith, function (err) {
        var firstPage = files['articles/index.html']
        var pageOne = files['articles/page/1/index.html']
        var pageTwo = files['articles/page/2/index.html']
        var pageThree = files['articles/page/3/index.html']

        expect(firstPage).to.exist
        expect(firstPage.pagination.files.length).to.equal(3)

        expect(pageOne).to.exist
        expect(pageOne.pagination.files.length).to.equal(3)

        expect(pageTwo).to.exist
        expect(pageTwo.pagination.files.length).to.equal(1)

        expect(pageThree).to.not.exist

        return done(err)
      })
    })
  })

  describe('missing array error', function () {
    var files = {}
    var metalsmith = instance({})

    it('should error when the collection does not exist', function (done) {
      return paginate({
        articles: {
          template: 'index.jade'
        }
      })(files, metalsmith, function (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Collection not found (articles)')

        return done()
      })
    })

    it('should error when the reference does not exist', function (done) {
      return paginate({
        'collections.articles': {
          template: 'index.jade'
        }
      })(files, metalsmith, function (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Collection not found (collections.articles)')

        return done()
      })
    })
  })

  describe('options error', function () {
    it('should error when a template is not specified', function (done) {
      return paginate({
        'collections.articles': {}
      })({}, instance({
        collections: {
          articles: []
        }
      }), function (err) {
        expect(err).to.exist
        expect(err.message).to.equal('A template or layout is required (collections.articles)')

        return done()
      })
    })

    it('should error when the path is not specified', function (done) {
      return paginate({
        'collections.articles': {
          template: 'index.jade'
        }
      })({}, instance({
        collections: {
          articles: []
        }
      }), function (err) {
        expect(err).to.exist
        expect(err.message).to.equal('The path is required (collections.articles)')

        return done()
      })
    })

    it('should error when layout and template are specified', function (done) {
      return paginate({
        'collections.articles': {
          template: 'index.jade',
          layout: 'index.jade',
          path: 'foobar'
        }
      })({}, instance({
        collections: {
          articles: []
        }
      }), function (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Template and layout can not be used simultaneosly (collections.articles)')

        return done()
      })
    })

    it('should error when `noPageOne` is enabled, but `first` is missing', function (done) {
      return paginate({
        'posts': {
          template: 'index.jade',
          noPageOne: true,
          path: '123'
        }
      })({}, instance({ posts: [] }), function (err) {
        expect(err).to.exist
        expect(err.message).to.equal('When `noPageOne` is enabled, a first page must be set (posts)')

        return done()
      })
    })
  })
})
