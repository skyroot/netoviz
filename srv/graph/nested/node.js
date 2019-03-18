export default class NestedGraphNode {
  constructor (nodeData) {
    this.operative = false
    this.type = nodeData.type
    this.name = nodeData.name
    this.path = nodeData.path
    this.id = nodeData.id
    this.parents = nodeData.parents
    this.children = nodeData.children
    // this.attribute = nodeData.attribute
    // this.diffState = nodeData.diffState
  }

  isNode () {
    return this.type === 'node'
  }

  isRootNode () {
    return this.isNode() && this.parentNodePaths().length === 0
  }

  isTp () {
    return this.type === 'tp'
  }

  matchTpPath (path) {
    return path.match(/.+\/.+\/.+/)
  }

  matchNodePath (path) {
    return !this.matchTpPath(path) && path.match(/.+\/.+/)
  }

  tpPaths () {
    return this.filterTpPath(this.parents)
  }

  numberOfTps () {
    return this.tpPaths().length
  }

  parentNodePaths () {
    return this.filterNodePath(this.parents)
  }

  parentTpPaths () {
    return this.filterTpPath(this.parents)
  }

  childNodePaths () {
    return this.filterNodePath(this.children)
  }

  childTpPaths () {
    return this.filterTpPath(this.children)
  }

  numberOfParentNodes () {
    return this.parentNodePaths().length
  }

  numberOfChildNodes () {
    return this.childNodePaths().length
  }

  filterTpPath (paths) {
    return paths.filter(path => this.matchTpPath(path))
  }

  filterNodePath (paths) {
    return paths.filter(path => this.matchNodePath(path))
  }

  linkPath () {
    // to make link path
    const pathElements = this.path.split('/')
    pathElements.shift() // discard top(layer)
    return pathElements.join(',')
  }

  setCircle (cx, cy, r) {
    this.operative = true
    this.cx = cx
    this.cy = cy
    this.r = r
  }

  setRect (x, y, width, height) {
    this.operative = true
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  setGridPosition (ordinalPosition) {
    this.grid = ordinalPosition // { i: N, j:M }
  }
}