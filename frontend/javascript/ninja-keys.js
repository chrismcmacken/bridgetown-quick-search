// @ts-check
import { NinjaKeys } from "konnors-ninja-keys/ninja-keys.js"
import SearchEngine from "./search_engine.js"

/**
 * @typedef {Object} SearchResult
 * @property {string} url
 * @property {string} heading
 * @property {string} preview
 */

/**
 * @typedef {CustomEvent<{search: string, actions: Array<import("konnors-ninja-keys").INinjaAction>}>} NinjaChangeEvent
 */

/**
 *
 */
export class BridgetownNinjaKeys extends NinjaKeys {
  static baseName = "bridgetown-ninja-keys"
  static properties = Object.assign(NinjaKeys.properties, {
		results: { state: true, type: Array },
		snippetLength: { state: true, type: Number },
		staticData: { state: true, type: Array },
		alwaysShowResults: { state: true, type: Boolean }
  })

  /**
   * @override
   */
  findMatches (flatData) {
    const matches = super.findMatches(flatData)

    this.results.forEach((result) => {
      if (matches.find((match) => match.id === result.id)) {
        return
      }

      matches.push(result)
    })

    return matches
  }

  constructor () {
    super()
    this.snippetLength = 142
    this.alwaysShowResults = true

    this.staticData = []
    this.results = []

    this.handleInput = () => {
      this.data = this.createData()
    }
  }

  async connectedCallback () {
    super.connectedCallback()
    await this.updateComplete
    await this.fetchAndGenerateIndex()
  }

  /**
   * @override
   */
  open () {
    this.data = this.createData()
    super.open()
  }

  async fetchAndGenerateIndex () {
    const { searchEngine, searchIndex } = await SearchEngine.fetchAndGenerateIndex()

    this.__searchEngine = searchEngine
    this.__searchIndex = searchIndex
    this.addEventListener('change', this.handleInput)
    this.data = this.createData()
  }

  createData () {
    this.results = this.showResultsForQuery(this._search)
    return [
      ...this.staticData,
      ...this.results,
    ]
  }

	/**
	 * @param {string} query
	 * @param {number} [maxResults=10]
	 */
  showResultsForQuery(query, maxResults = 100) {
    this.latestQuery = query
    if (this.alwaysShowResults === true || (query && query.length >= 1)) {
      const results = this.__searchEngine.performSearch(query, this.snippetLength).slice(0, maxResults)

      /** @type {import("konnors-ninja-keys").INinjaAction[]} */
      const actions = []

      if (results.length <= 0) {
        return []
      }

      results.forEach((result) => {
        const action = this.transformResult(result)

        if (action) actions.push(action)
      })

      /** @type {import("konnors-ninja-keys").INinjaAction[]} */
      return actions
    }

    return []
  }
  transformResult (result) {
    let { id, title, categories, url, content, collection } = result

    if (url.endsWith(".json")) {
      return
    }

    categories = categories.split(/[-_]/).map(capitalizeFirstLetter).join(" ")

    return {
      id,
      title,
      section: categories,
      href: url,
      // content
    }
  }
}


/**
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
