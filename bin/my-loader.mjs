import { fileURLToPath, pathToFileURL } from 'url'
import { readFile } from 'fs/promises'
import path from 'path'

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))
const mockMap = new Map([
  ['kysely', pathToFileURL(path.join(kypanelRoot, 'app/kysely-utils/ImposterKyselyModule.ts'))],
])

// console.log('loader', kyselyMockPath);
export async function resolve(specifier, context, nextResolve) {
  const { parentURL } = context

  // if(specifier.includes('kysely') || parentURL?.includes('_sample')) {
  console.log({
    specifier, context,
    // 'mockURL': mockMap.get('kysely').href
  })
  // }


  if (mockMap.has(specifier)) {
    console.log('===> is kysely');
    const mockURL = mockMap.get(specifier)

    // Don't override if we're inside the mock itself
    if (parentURL === mockURL.href) {
      console.log('===> in the mock');
      return nextResolve(specifier, context)
    }

    return {
      shortCircuit: true,
      url: mockURL.href,
    }
  }

  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  // Just pass through to the default loader (or chained one like TSX)
  return nextLoad(url, context)
}