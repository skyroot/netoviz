import { select } from 'd3-selection'
import SingleVisualizerBase from '../common/single-visualizer-base'

export default class SingleDep2GraphVisualizer extends SingleVisualizerBase {
  constructor () {
    super()
    // canvas size
    this.width = 800
    this.height = 600
    // constants
    this.layer_xpad1 = 10
    this.layer_xpad2 = 100
    this.layer_ypad = 40
    this.label_xpad = 5
    this.p_ypad = 15
    this.p_xpad = 8
    this.p_r = 5
    this.fontSize = 10
  }

  makeDepGraphSVG () {
    return select('body').select('div#visualizer')
      .append('div') // to keep compatibility with topology visualizer
      .attr('class', 'network-layer')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
  }

  makeDrawNetworkData (nw) {
    return {
      'visible': true,
      'type': 'network',
      'name': nw.name,
      'path': nw.path,
      'x': null, // must be initialized
      'y': null,
      'parents': [], // TODO: support-network (parents/children) is ignored (currently)
      'children': [],
      'attribute': nw.attribute || {}, // TODO: network attribute is ignored
      'diffState': nw.diffState || {} // TODO: network diffState is ignored
    }
  }

  makeDrawGraphData (graphData) {
    const objects = []
    for (const nw of graphData) {
      // head (network)
      const nwObjs = [this.makeDrawNetworkData(nw)]
      for (const node of nw.nodes) {
        // append node
        node.visible = true
        nwObjs.push(node)
        // append tps in node
        const tps = nw.tps.filter(d => d.path.match(new RegExp(`${node.path}__`)))
        if (tps) {
          // initial: nw.tps is not used (all nodes are closed)
          tps.forEach(tp => {
            tp.visible = false
            return tp
          })
          nwObjs.push(tps)
        }
      }
      objects.push(this.flatten(nwObjs))
    }
    return objects
  }

  _deleteUnusedPropsOf (object) {
    delete object.number
    delete object.width
    delete object.height
    delete object.cx
    delete object.cy
    delete object.r
  }

  _deleteUnusedProps (graphData) {
    for (const nwObjs of graphData) {
      for (const nwObj of nwObjs.nodes) {
        this._deleteUnusedPropsOf(nwObj)
      }
      for (const nwObj of nwObjs.tps) {
        this._deleteUnusedPropsOf(nwObj)
      }
    }
  }

  _indentOf (nwObj) {
    const type2indentNum = {
      'network': 0,
      'node': 1,
      'tp': 2
    }
    return type2indentNum[nwObj.type]
  }

  culcPositionOfDrawGraphData () {
    for (let i = 0; i < this.drawGraphData.length; i++) {
      const nwObjects = this.drawGraphData[i] // a list of layer entries
      if (nwObjects[0].x == null || nwObjects[0].y == null) {
        // initialize layer head position (layer head must be type==network)
        nwObjects[0].x = this.layer_xpad1 + i * this.layer_xpad2
        nwObjects[0].y = this.layer_ypad
      }
      let v = 1
      for (let j = 1; j < nwObjects.length; j++) {
        if (!nwObjects[j].visible) {
          continue
        }
        nwObjects[j].x = nwObjects[0].x + this._indentOf(nwObjects[j]) * this.p_xpad
        nwObjects[j].y = nwObjects[0].y + v * this.p_ypad
        v++
      }
    }
  }

  reduceDrawGraphDataToList () {
    return this.drawGraphData.reduce((acc, curr) => acc.concat(curr), [])
  }

  _visibleDrawGraphData () {
    return this.reduceDrawGraphDataToList().filter(d => d.visible)
  }

  makeEntryCircles () {
    const updatedEntries = this.svg.selectAll('circle.dep')
      .data(this._visibleDrawGraphData())
    const enteredEntries = updatedEntries
      .enter()
      .append('circle')
    updatedEntries
      .exit()
      .remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => `dep ${d.type}`)
      .attr('id', d => d.path)
      .attr('cx', d => d.x + this.p_r)
      .attr('cy', d => d.y + this.p_r)
      .attr('r', this.p_r)
  }

  makeEntryLabels () {
    const updatedEntries = this.svg.selectAll('text.dep')
      .data(this._visibleDrawGraphData())
    const enteredEntries = updatedEntries
      .enter()
      .append('text')
    updatedEntries
      .exit()
      .remove()
    const targetEntries = enteredEntries.merge(updatedEntries)
    targetEntries
      .attr('class', d => `dep ${d.type}`)
      .attr('id', d => `${d.path}-lb`)
      .attr('x', d => d.x + 2 * this.p_r + this.label_xpad)
      .attr('y', d => d.y + this.fontSize)
      .attr('font-size', this.fontSize)
      .text(d => d.name)
  }

  refreshGraphObjects () {
    this.culcPositionOfDrawGraphData()
    this.makeEntryCircles()
    this.makeEntryLabels()
  }

  makeGraphObjects (graphData) {
    this._deleteUnusedProps(graphData)
    this.svg = this.makeDepGraphSVG()
    this.tooltip = this.makeToolTip(select('body').select('div#visualizer'))
    this.makeClearButton(this.svg)
    this.makeDiffInactiveToggleButton(this.svg)
    this.drawGraphData = this.makeDrawGraphData(graphData)
    this.refreshGraphObjects()
  }
}