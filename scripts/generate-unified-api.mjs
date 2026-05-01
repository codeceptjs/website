import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'src', 'content', 'docs');
const HELPERS_DIR = path.join(DOCS_DIR, 'helpers');
const WEBAPI_DIR = path.join(DOCS_DIR, 'webapi');

const WEB_HELPERS = {
  Playwright: path.join(HELPERS_DIR, 'playwright.md'),
  WebDriver: path.join(HELPERS_DIR, 'web-driver.md'),
  Puppeteer: path.join(HELPERS_DIR, 'puppeteer.md'),
};
const WEB_HELPER_NAMES = Object.keys(WEB_HELPERS);

const MOBILE_HELPERS = {
  Appium: path.join(HELPERS_DIR, 'appium.md'),
  Detox: path.join(HELPERS_DIR, 'detox.md'),
};

const WEB_OUTPUT = path.join(DOCS_DIR, 'web-api.md');
const MOBILE_OUTPUT = path.join(DOCS_DIR, 'mobile-api.md');
const CHECK_MODE = process.argv.includes('--check');

const WEB_METHOD_OVERRIDES = {
  click: {
    compactDifferences: true,
    notes: [
      'ARIA locators are supported. Update examples to include the new locator type where relevant.',
      '`I.click({ aria: "Select" });`',
      '`I.click("Select");`',
    ],
    helperPrefix: {
      WebDriver:
        'In WebDriver, click can only happen on an actionable element. Use specific locators and wait for element readiness when needed.',
    },
  },
};

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function normalizeForFile(content) {
  return content.replace(/\n/g, '\r\n');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, normalizeForFile(content), 'utf8');
}

function escRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractMethods(helperContent) {
  const methods = [];
  const seen = new Set();
  const re = /^###\s+([A-Za-z][A-Za-z0-9_]*)\s*$/gm;
  let match;

  while ((match = re.exec(helperContent)) !== null) {
    const method = match[1];
    // API methods are declared as lowerCamelCase headings.
    if (!/^[a-z][A-Za-z0-9_]*$/.test(method)) continue;
    if (!method.startsWith('_') && !seen.has(method)) {
      seen.add(method);
      methods.push(method);
    }
  }

  return methods;
}

function extractMethodDoc(helperContent, method) {
  const heading = new RegExp(`^###\\s+${escRegExp(method)}\\s*$`, 'm');
  const start = helperContent.search(heading);
  if (start === -1) return null;

  const fromHeading = helperContent.slice(start);
  const firstLineBreak = fromHeading.indexOf('\n');
  if (firstLineBreak === -1) return '';

  const afterHeading = fromHeading.slice(firstLineBreak + 1);
  const nextHeadingIdx = afterHeading.search(/^###\s+/m);
  const section =
    nextHeadingIdx === -1 ? afterHeading : afterHeading.slice(0, nextHeadingIdx);

  return section.trim();
}

function availability(exists) {
  return exists ? 'Supported' : 'Not supported';
}

function normalizeDocForDiff(content) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\[\d+\]/g, '[]')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Prose+code body of a shared mustache snippet (drops the @param/@returns lines).
// The helper docs typically contain this body verbatim, so it can be subtracted.
function commonBodyText(mustache) {
  return mustache
    .split('\n')
    .filter((line) => !/^@(?:param|returns?)\b/.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Strip Parameters / Returns blocks (heading + bullet list + blank lines) and
// inline `Returns **void** ...` lines. Used after subtracting the common body
// so the residue isn't cluttered with cosmetically-different param rendering.
function stripParamsAndReturns(text) {
  const lines = text.split('\n');
  const out = [];
  const isHeading = (l) =>
    /^(?:#{2,5}\s+Parameters?|\*\*Parameters\*\*|#{2,5}\s+Returns?|\*\*Returns\*\*)\s*$/.test(l);
  const isBulletOrIndented = (l) => l.trim() === '' || /^[ \t]*[*\-+]\s/.test(l) || /^[ \t]+\S/.test(l);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isHeading(line)) {
      i += 1;
      while (i < lines.length && isBulletOrIndented(lines[i])) i += 1;
      continue;
    }
    if (/^Returns\s+/.test(line)) { i += 1; continue; }
    if (/^@(?:param|returns?)\b/.test(line.trim())) { i += 1; continue; }
    out.push(line);
    i += 1;
  }
  return out.join('\n');
}

// Normalize formatting that documentation.js renders differently from the raw
// mustache snippet (italic markers, link reference style, blank lines between
// code blocks) so the subtraction fall-back below can still find the common
// body when the only differences are cosmetic.
function normalizeForSubtract(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/_([^_\n]+)_/g, '*$1*')
    .replace(/\[([^\]]+)\]\[\d+\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

// Subtract the shared common body and the params/returns block from a helper's
// method doc. What remains is the helper-specific addition (e.g. an extra note
// about React locators). Empty result ⇒ helper just repeats common behavior.
function helperResidue(helperDoc, commonBody) {
  let text = helperDoc;
  if (commonBody && helperDoc.includes(commonBody)) {
    text = helperDoc.split(commonBody).join('');
  } else if (commonBody) {
    const normCommon = normalizeForSubtract(commonBody);
    const normHelper = normalizeForSubtract(helperDoc);
    text = normCommon && normHelper.includes(normCommon)
      ? normHelper.split(normCommon).join('')
      : helperDoc;
  }
  text = stripParamsAndReturns(text);
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function renderAvailabilityTable(headers, row) {
  const th = headers
    .map((h) => `<th style="border: 1px solid var(--sl-color-hairline); padding: 0.45rem 0.6rem; text-align: left;">${h}</th>`)
    .join('');
  const td = row
    .map((c) => `<td style="border: 1px solid var(--sl-color-hairline); padding: 0.45rem 0.6rem; vertical-align: top;">${c}</td>`)
    .join('');

  return [
    '<table style="border-collapse: collapse; width: 100%;">',
    `  <thead><tr>${th}</tr></thead>`,
    `  <tbody><tr>${td}</tr></tbody>`,
    '</table>',
  ];
}

function normalizeWebUnifiedAnchors(content) {
  return content
    .replace(/#fillfield\b/g, '#ifillfield')
    .replace(/#click\b/g, '#iclick')
    .replace(/\/webdriver#testing-with-webdriver\b/g, '/webdriver#what-is-selenium-webdriver');
}

function normalizeMobileUnifiedAnchors(content) {
  return content
    .replace(/#tap\b/g, '#itap')
    .replace(/#relaunchApp\b/g, '#irelaunchapp')
    .replace(/#relaunchapp\b/g, '#irelaunchapp')
    .replace(/#click\b/g, '#iclick');
}

function parseJSDocParam(line) {
  const match = line.match(/^@param\s+\{([^}]+)\}\s+(\[[^\]]+\]|[^\s]+)\s*(.*)$/);
  if (!match) return null;
  return {
    type: match[1].trim(),
    name: match[2].trim(),
    description: match[3].trim(),
  };
}

function parseJSDocReturn(line) {
  const match = line.match(/^@returns?\s+\{([^}]+)\}\s*(.*)$/);
  if (!match) return null;
  return {
    type: match[1].trim(),
    description: match[2].trim(),
  };
}

function formatSharedBlock(content) {
  const lines = content.split('\n');
  const body = [];
  const params = [];
  const returns = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('@param ')) {
      const param = parseJSDocParam(trimmed);
      if (param) {
        params.push(param);
        continue;
      }
    }
    if (/^@returns?\s+/.test(trimmed)) {
      const ret = parseJSDocReturn(trimmed);
      if (ret) {
        returns.push(ret);
        continue;
      }
    }
    body.push(line);
  }

  while (body.length && body[body.length - 1].trim() === '') {
    body.pop();
  }

  const out = [...body];

  if (params.length) {
    out.push('');
    out.push('**Parameters**');
    out.push('');
    for (const param of params) {
      const desc = param.description ? ` - ${param.description}` : '';
      out.push(`- \`${param.name}\` \`${param.type}\`${desc}`);
    }
  }

  if (returns.length) {
    out.push('');
    out.push('**Returns**');
    out.push('');
    for (const ret of returns) {
      const desc = ret.description ? ` - ${ret.description}` : '';
      out.push(`- \`${ret.type}\`${desc}`);
    }
  }

  return out.join('\n').trim();
}

function normalizeMethodDocHeadings(content) {
  if (!content) return content;
  return content
    .replace(/^#{4,5}\s+Parameters\s*$/gm, '**Parameters**')
    .replace(/^#{4,5}\s+Returns?\s*$/gm, '**Returns**');
}

function generateWebApiContent() {
  for (const [helperName, filePath] of Object.entries(WEB_HELPERS)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Missing helper source for ${helperName}: ${path.relative(ROOT, filePath)}`,
      );
    }
  }

  const helperDocs = Object.fromEntries(
    Object.entries(WEB_HELPERS).map(([name, file]) => [name, readFile(file)]),
  );

  const helperMethods = Object.fromEntries(
    Object.entries(helperDocs).map(([name, content]) => [name, new Set(extractMethods(content))]),
  );

  for (const helperName of WEB_HELPER_NAMES) {
    if (helperMethods[helperName].size === 0) {
      throw new Error(
        `No public methods were extracted for ${helperName}. Check heading format in ${path.relative(
          ROOT,
          WEB_HELPERS[helperName],
        )}.`,
      );
    }
  }

  const webapiFiles = fs
    .readdirSync(WEBAPI_DIR)
    .filter((name) => name.endsWith('.mustache'))
    .sort((a, b) => a.localeCompare(b));

  const lines = [
    '---',
    'title: Web API (Unified)',
    '---',
    '',
    '<!-- Auto-generated by scripts/generate-unified-api.mjs -->',
    '',
    'This page is generated from `docs/webapi` and helper docblocks.',
    '',
    '## Methods',
    '',
  ];

  for (const fileName of webapiFiles) {
    const method = path.basename(fileName, '.mustache');
    const supportedAnywhere = WEB_HELPER_NAMES.some((name) => helperMethods[name].has(method));
    if (!supportedAnywhere) continue;
    const methodCall = `I.${method}()`;
    const rawShared = readFile(path.join(WEBAPI_DIR, fileName)).trim();
    const sharedBlock = formatSharedBlock(rawShared);
    const commonBody = commonBodyText(rawShared);

    lines.push(`### \`${methodCall}\``);
    lines.push('');
    lines.push(
      ...renderAvailabilityTable(
        WEB_HELPER_NAMES,
        WEB_HELPER_NAMES.map((name) => availability(helperMethods[name].has(method))),
      ),
    );
    lines.push('');
    lines.push(sharedBlock || '_No shared snippet found._');
    lines.push('');

    const override = WEB_METHOD_OVERRIDES[method];
    if (override?.notes?.length) {
      lines.push('#### Notes');
      lines.push('');
      for (const note of override.notes) {
        lines.push(`- ${note}`);
      }
      lines.push('');
    }

    const helperDocsByMethod = WEB_HELPER_NAMES.map((helperName) => {
      const methodDoc = extractMethodDoc(helperDocs[helperName], method);
      const prefix = override?.helperPrefix?.[helperName] || '';
      const residue = methodDoc ? helperResidue(methodDoc, commonBody) : '';
      return {
        helperName,
        supported: helperMethods[helperName].has(method),
        methodDoc,
        prefix,
        residue,
        normalized: residue ? normalizeDocForDiff(residue) : '',
      };
    });

    const helpersWithUniqueContent = helperDocsByMethod.filter(
      (item) => item.supported && item.residue,
    );
    const uniqueGroups = new Map();
    for (const item of helpersWithUniqueContent) {
      const key = item.normalized;
      if (!uniqueGroups.has(key)) uniqueGroups.set(key, []);
      uniqueGroups.get(key).push(item.helperName);
    }

    const hasHelperPrefixOverrides = helperDocsByMethod.some((item) => item.prefix);

    const compactDifferences = method === 'click' || Boolean(override?.compactDifferences);
    if (helpersWithUniqueContent.length > 0 || hasHelperPrefixOverrides) {
      lines.push('#### Helper-Specific Differences');
      lines.push('');

      if (compactDifferences) {
        for (const item of helperDocsByMethod) {
          if (!item.prefix) continue;
          lines.push(`**${item.helperName}**`);
          lines.push('');
          lines.push(item.prefix);
          lines.push('');
        }
        continue;
      }

      for (const item of helperDocsByMethod) {
        if (!item.supported) continue;
        if (!item.residue && !item.prefix) continue;

        lines.push(`**${item.helperName}**`);
        lines.push('');
        if (item.prefix) {
          lines.push(item.prefix);
          lines.push('');
        }
        if (item.residue) {
          lines.push(normalizeMethodDocHeadings(item.residue));
          lines.push('');
        }
      }
    }
  }

  return normalizeWebUnifiedAnchors(lines.join('\n').trimEnd() + '\n');
}

function generateMobileApiContent() {
  const helperDocs = Object.fromEntries(
    Object.entries(MOBILE_HELPERS).map(([name, file]) => [name, readFile(file)]),
  );

  const appiumMethods = extractMethods(helperDocs.Appium);
  const detoxMethods = extractMethods(helperDocs.Detox);
  const allMethods = Array.from(new Set([...appiumMethods, ...detoxMethods])).sort((a, b) =>
    a.localeCompare(b),
  );

  const hasMethod = {
    Appium: new Set(appiumMethods),
    Detox: new Set(detoxMethods),
  };

  const lines = [
    '---',
    'title: Mobile API (Unified)',
    '---',
    '',
    '<!-- Auto-generated by scripts/generate-unified-api.mjs -->',
    '',
    'This page is generated from Appium and Detox helper docblocks.',
    'For hybrid/mobile webview flows, ARIA locators such as `{ aria: "Sign in" }` are available in web helpers.',
    '',
    '## Methods',
    '',
  ];

  for (const method of allMethods) {
    const methodCall = `I.${method}()`;
    lines.push(`### \`${methodCall}\``);
    lines.push('');
    lines.push(
      ...renderAvailabilityTable(
        ['Appium', 'Detox'],
        [availability(hasMethod.Appium.has(method)), availability(hasMethod.Detox.has(method))],
      ),
    );
    lines.push('');

    for (const helperName of ['Appium', 'Detox']) {
      const methodDoc = extractMethodDoc(helperDocs[helperName], method);
      lines.push(`**${helperName}**`);
      lines.push('');
      if (methodDoc) {
        lines.push(normalizeMethodDocHeadings(methodDoc));
      } else {
        lines.push('_Not available in this helper._');
      }
      lines.push('');
    }
  }

  return normalizeMobileUnifiedAnchors(lines.join('\n').trimEnd() + '\n');
}

function isFileUpToDate(filePath, generatedContent) {
  if (!fs.existsSync(filePath)) return false;
  const existing = fs.readFileSync(filePath, 'utf8');
  return existing === normalizeForFile(generatedContent);
}

function main() {
  const webContent = generateWebApiContent();
  const mobileContent = generateMobileApiContent();

  if (CHECK_MODE) {
    const webOk = isFileUpToDate(WEB_OUTPUT, webContent);
    const mobileOk = isFileUpToDate(MOBILE_OUTPUT, mobileContent);

    if (webOk && mobileOk) {
      console.log('Unified API docs are up to date.');
      return;
    }

    const outdated = [];
    if (!webOk) outdated.push(path.relative(ROOT, WEB_OUTPUT));
    if (!mobileOk) outdated.push(path.relative(ROOT, MOBILE_OUTPUT));
    console.error(`Unified API docs are outdated: ${outdated.join(', ')}`);
    console.error('Run: npm run generate:unified-api');
    process.exit(1);
  }

  writeFile(WEB_OUTPUT, webContent);
  writeFile(MOBILE_OUTPUT, mobileContent);
  console.log('Generated:', path.relative(ROOT, WEB_OUTPUT), path.relative(ROOT, MOBILE_OUTPUT));
}

main();
