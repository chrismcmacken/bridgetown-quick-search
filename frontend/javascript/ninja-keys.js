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

export class BridgetownNinjaKeys extends NinjaKeys {
  static baseName = "bridgetown-ninja-keys"
  static properties = Object.assign(NinjaKeys.properties, {
		results: { state: true, type: Array },
		snippetLength: { state: true, type: Number },
		staticData: { state: true, type: Array },
		alwaysShowResults: { state: true, type: Boolean }
  })

  constructor () {
    super()
    this.results = []
    this.snippetLength = 142
    this.alwaysShowResults = true
    /** @type {import("konnors-ninja-keys").INinjaAction[]} */
    this.staticData = []
    this.handleInput = (/** @type {NinjaChangeEvent} */ event) => {
      const query = event.detail.search
      this.showResultsForQuery(query)
      this.requestUpdate()
    }
  }

  async connectedCallback () {
    super.connectedCallback()
    await this.updateComplete
    await this.fetchAndGenerateIndex()
  }

  async fetchAndGenerateIndex () {
    const { searchEngine, searchIndex } = await SearchEngine.fetchAndGenerateIndex()

    this.__searchEngine = searchEngine
    this.__searchIndex = searchIndex
    this.addEventListener('change', this.handleInput)
    this.showResultsForQuery(this._search)
  }

	/**
	 * @param {string} query
	 * @param {number} [maxResults=10]
	 */
  showResultsForQuery(query, maxResults = 100) {
    this.latestQuery = query
    if (this.alwaysShowResults === true || (query && query.length >= 1)) {
      this.results = this.__searchEngine.performSearch(query, this.snippetLength).slice(0, maxResults)

      if (this.results?.length <= 0) {
        this.data = [
          ...this.staticData,
        ]

        this.requestUpdate()
        return
      }

      /** @type {import("konnors-ninja-keys").INinjaAction[]} */
      const actions = []

      this.results.forEach((result) => {
        let { id, title, categories, url } = result

        if (url.endsWith(".json")) {
          return
        }

        categories = categories.split(/[-_]/).map(capitalizeFirstLetter).join(" ")
        actions.push({
          id,
          title,
          section: categories,
          href: url,
        })
      })

      /** @type {import("konnors-ninja-keys").INinjaAction[]} */
      this.data = [
        ...this.staticData,
        ...actions
      ]
    }
    this.requestUpdate()
  }
}

/**
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
