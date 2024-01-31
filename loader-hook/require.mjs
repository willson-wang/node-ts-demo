import path from 'path'
import esbuild from 'esbuild'

const tsExts = new Set([
  '.tsx',
  '.ts',
  '.mts',
  '.cts',
]);

export async function resolve(specifier, context, nextResolve) {
  const ext = path.extname(specifier);

  // 如果不是.ts，则直接进入后面的逻辑
  if (!tsExts.has(ext)) {return nextResolve(specifier)}

  const { url } = await nextResolve(specifier);

  return {
    url,
    shortCircuit: true,
    format: 'typescript',
  }
}

export async function load(url, context, nextLoad) {
  if (context.format !== 'typescript') return nextLoad(url)
  const { source } = await nextLoad(url, {...context, format: 'module'});
  
  const { code } = await esbuild.transform(source, {
    sourcemap: 'both',
    loader: 'ts',
    format: 'esm'
  })

  return {
    format: 'module',
    shortCircuit: true,
    source: code
  };
} 