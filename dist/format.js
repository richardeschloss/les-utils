"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.currency = currency;
exports.date = date;
exports.largeCurrency = largeCurrency;
exports.largeNumber = largeNumber;
exports.number = number;
exports.percentage = percentage;
exports.FormatUtils = void 0;

var _datetime = require("./datetime");

const unitsRegex = new RegExp(/[kKmMbB]/);
const unitsMultiplier = {
  T: 1e12,
  B: 1e9,
  M: 1e6,
  K: 1e3
};
const scaleUpUnits = ['K', 'M', 'B', 'T'];

const preProcess = input => {
  let out = input;

  if (typeof input === 'string') {
    out = parseFloat(input.replace(/[^0-9.]+/, ''));
  }

  return out;
};

const abbreviateNumber = input => {
  let num = input;
  let unit = '';
  Object.entries(unitsMultiplier).some(([u, mult]) => {
    if (num >= mult) {
      num /= mult;
      unit = ` ${u}`;
      return true;
    }
  });
  return {
    num,
    unit
  };
};

function isCurrency(input, {
  currencySymbol
}) {
  if (typeof input !== 'object' || !input.val || !input.fmt || typeof input.val !== 'number' && typeof input.fmt !== 'string' || !input.fmt.includes(currencySymbol)) {
    return false;
  }

  return true;
}

function isDate(input) {
  if (typeof input !== 'object' || !input.val || !input.fmt || typeof input.val !== 'object') {
    return false;
  }

  return true;
}

function isLargeNumber(input) {
  if (typeof input !== 'object' || !input.val || !input.fmt || typeof input.val !== 'number' && typeof input.fmt !== 'string' || !input.fmt.match(/[kKmMbB]/)) {
    return false;
  }

  return true;
}

function isLargeCurrency(input, {
  currencySymbol
}) {
  if (typeof input !== 'object' || !input.val || !input.fmt || typeof input.val !== 'number' && typeof input.fmt !== 'string' || !input.fmt.includes(currencySymbol) || !input.fmt.match(/[kKmMbB]/)) {
    return false;
  }

  return true;
}

function isPercentage(input) {
  if (typeof input !== 'object' || !input.val || !input.fmt || typeof input.val !== 'number' && typeof input.fmt !== 'string' || !input.fmt.includes('%')) {
    return false;
  }

  return true;
}
/* Exports */


function currency(input, opts = {}) {
  const {
    locale = 'en-us',
    currency = 'USD',
    currencySymbol = '$',
    outputFmt = 'json'
  } = opts;
  if (isCurrency(input, {
    currencySymbol
  })) return input;
  const out = {
    val: preProcess(input)
  };
  out.fmt = out.val.toLocaleString(locale, {
    style: 'currency',
    currency
  });
  return outputFmt === 'json' ? out : out[outputFmt];
}

function date(input, opts = {}) {
  const {
    dateFmt,
    outputFmt = 'json'
  } = opts;
  if (isDate(input)) return input;
  const out = {};
  out.val = new Date(input);
  out.fmt = (0, _datetime.fmtDate)(input, dateFmt);
  return outputFmt === 'json' ? out : out[outputFmt];
}

function largeCurrency(input, opts = {}) {
  const {
    locale = 'en-us',
    currency = 'USD',
    currencySymbol = '$',
    outputFmt = 'json'
  } = opts;
  if (isLargeCurrency(input, {
    currencySymbol
  })) return input;
  const out = {
    val: preProcess(input)
  };
  const {
    num,
    unit
  } = abbreviateNumber(out.val);
  out.fmt = num.toLocaleString(locale, {
    style: 'currency',
    currency
  }) + unit;
  return outputFmt === 'json' ? out : out[outputFmt];
}

function largeNumber(input, opts = {}) {
  const {
    precision = 2,
    locale = 'en-us',
    outputFmt = 'json'
  } = opts;
  if (isLargeNumber(input)) return input;
  const out = {
    val: preProcess(input)
  };
  const {
    num,
    unit
  } = abbreviateNumber(out.val);
  out.fmt = num.toLocaleString(locale, {
    maximumFractionDigits: precision
  }) + unit;
  return outputFmt === 'json' ? out : out[outputFmt];
}

function number(input, opts = {}) {
  const {
    locale = 'en-us',
    outputFmt = 'json'
  } = opts;
  const out = {
    input,
    val: preProcess(input)
  };

  if (typeof input === 'string' && input.match(unitsRegex)) {
    scaleUpUnits.forEach(unit => {
      if (input.toUpperCase().includes(unit)) {
        out.val *= unitsMultiplier[unit];
        input = input.replace(/\s*[A-Z]/, ` ${unit}`);
      }
    });
    out.fmt = input;
  } else {
    out.fmt = out.val.toLocaleString(locale);
  }

  return outputFmt === 'json' ? out : out[outputFmt];
}

function percentage(input, opts = {}) {
  const {
    precision = 2,
    scale = 1,
    outputFmt = 'json'
  } = opts;
  if (isPercentage(input)) return input;
  const out = {
    val: input
  };

  if (typeof input === 'string') {
    out.val = parseFloat(out.val.replace(/[A-z]+/, '0').replace(/%/, ''));

    if (input.match('%')) {
      out.val /= 100;
    }
  }

  out.val *= scale;
  out.fmt = out.val.toFixed(precision) + '%';
  return outputFmt === 'json' ? out : out[outputFmt];
}

const FormatUtils = Object.freeze({
  currency,
  date,
  largeCurrency,
  largeNumber,
  number,
  percentage
});
exports.FormatUtils = FormatUtils;