Backbone = require "backbone"
$ = require 'jquery'
Backbone.$ = $
sd = require("sharify").data
Channel = require '../../models/channel.coffee'
ChannelBlocks = require '../../collections/channel_blocks.coffee'
Collaborators = require '../../collections/collaborators.coffee'
CurrentUser = require '../../models/current_user.coffee'
NewBlockView = require '../../components/new_block/client/new_block_view.coffee'
BlockCollectionView = require '../../components/block_collection/client/block_collection_view.coffee'
blockCollectionTemplate = -> require('../../components/block_collection/templates/block_collection.jade') arguments...
collaboratorsTemplate = -> require('./templates/collaborators.jade') arguments...

module.exports = class BlockSkeletonView extends Backbone.View

  initialize: ->
    # @collection.on "sync", @render, @

    @collection.fetch
      reset: true
      data:
        page: 1
        per: 12

    super

  render: ->
    console.log 'rendering'
    @$el.html blockCollectionTemplate(blocks: @collection.models)

module.exports = class CollaborationView extends Backbone.View

  initialize: ->
    @collection.on "sync", @render, @

    @collection.fetch()

    super

  render: ->
    console.log 'rendering collaborators view', @collection
    @$el.html collaboratorsTemplate(collaborators: @collection.models)

module.exports.init = ->
  current_user = new CurrentUser sd.CURRENT_USER
  channel = new Channel sd.CHANNEL
  blocks = new ChannelBlocks sd.BLOCKS,
    channel_slug: sd.CHANNEL.slug

  new BlockCollectionView
    el: 'body'

  new BlockSkeletonView
    collection: blocks
    el: $ ".grid"

  if channel.has('collaboration')
    collaborators = new Collaborators
      channel_slug: channel.get('slug')

    new CollaborationView
      collection: collaborators
      el: $ "#metadata--collaborators"

  if current_user.canEditChannel channel
    new NewBlockView
      el: $ ".grid__block--new-block"
      model: channel
      blocks: blocks
