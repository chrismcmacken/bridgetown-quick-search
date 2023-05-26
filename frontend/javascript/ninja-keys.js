import { NinjaKeys } from "konnors-ninja-keys"
import SearchEngine from "./search_engine"

export class BridgetownNinjaKeys extends NinjaKeys () {
  static baseName = "bridgetown-ninja-keys"

  connectedCallback () {
    super.connectedCallback()
  }

  fetchAndGenerateIndex () {
    const { searchEngine, searchIndex } = SearchEngine.fetchAndGenerateIndex()

    this.__searchEngine = searchEngine
    this.__searchIndex = searchIndex
  }
}

BridgetownNinjaKeys.define()
