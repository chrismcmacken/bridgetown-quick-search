// @ts-check
import { NinjaKeys } from "konnors-ninja-keys/ninja-keys.js"
import SearchEngine from "./search_engine"

/**
 * @typedef {Object} SearchResult
 * @property {string} url
 * @property {string} heading
 * @property {string} preview
 */

/**
 * @typedef {CustomEvent<{search: string, actions: Array<import("konnors-ninja-keys").INinjaAction>}>} NinjaChangeEvent
 */

export class BridgetownNinjaKeys extends NinjaKeys {
  static baseName = "bridgetown-ninja-keys"
  static properties = Object.assign(NinjaKeys.properties, {
		results: { state: true, type: Array },
		snippetLength: { state: true, type: Number },
  })

  constructor () {
    super()
    this.results = []
    this.snippetLength = 142
    this.handleInput = (/** @type {NinjaChangeEvent} */ event) => {
      const query = event.detail.search
      this.showResultsForQuery(query)
      console.log(this.results)
    }
  }

  async connectedCallback () {
    super.connectedCallback()
    await this.updateComplete
    await this.fetchAndGenerateIndex()

    this.data = [
      ...this.data
    ]
  }

  async fetchAndGenerateIndex () {
    const { searchEngine, searchIndex } = await SearchEngine.fetchAndGenerateIndex()

    console.log("GENERATING INDEX")
    this.__searchEngine = searchEngine
    this.__searchIndex = searchIndex
    this.addEventListener('change', this.handleInput)
    this.showResultsForQuery(this._search)
  }

	/**
	 * @param {string} query
	 * @param {number} [maxResults=10]
	 */
  showResultsForQuery(query, maxResults = 10) {
    this.latestQuery = query
    if (query && query.length >= 1) {
      this.showResults = true
      this.results = this.__searchEngine.performSearch(query, this.snippetLength).slice(0, maxResults)
      // console.log("RESULTS", this.results)
      const result = this.results[0]
      if (!result) return

      this.data = [
        ...this.data,
        {
          id: result.heading,
          title: result.heading,
          icon: 'light_mode',
          handler: () => {},
        },
      ]
    } else {
      this.showResults = false
    }
    this.requestUpdate()
  }
}
