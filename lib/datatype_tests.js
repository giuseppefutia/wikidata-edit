const wdk = require('wikidata-sdk')
const _ = require('./utils')
const { parseUnit } = require('./claim/quantity')

module.exports = {
  string: _.isNonEmptyString,
  entity: wdk.isEntityId,
  // See https://www.mediawiki.org/wiki/Wikibase/DataModel#Dates_and_times
  // The positive years will be signed later
  time: time => {
    // Parsing as an ISO String should not throw an Invalid time value error
    try {
      new Date(time).toISOString()
    } catch (err) {
      return false
    }
    // Only precision up to the day is handled
    // and minimum 4 years numbers, that is always padded with zeros
    return /^(-|\+)?\d{4,16}(-\d{2}){0,2}$/.test(time.toString())
  },
  monolingualtext: value => {
    const { text, language } = value
    return _.isNonEmptyString(text) && _.isNonEmptyString(language)
  },
  // cf https://www.mediawiki.org/wiki/Wikibase/DataModel#Quantities
  quantity: amount => {
    var unit
    if (_.isPlainObject(amount)) {
      unit = amount.unit
      amount = amount.amount
      if (!wdk.isItemId(parseUnit(unit)) && unit !== '1') return false
    } else {
      unit = '1'
    }
    // Accepting both numbers or string numbers as the amount will be
    // turned as a string lib/claim/builders.js signAmount function anyway
    return _.isNumber(amount) || _.isStringNumber(amount)
  }
}
