const fs = require('fs')
const Module = require('module')
const esbuild = require('esbuild')

const cjsTsParseCache = new WeakMap();
Module._extensions['.ts'] = function(module, filename) {
  // If already analyzed the source, then it will be cached.
  const cached = cjsTsParseCache.get(module);
  let content;
  if (cached && cached.source) {
    content = cached.source;
    cached.source = undefined;
  } else {
    // 如果没有缓存，则通过fs读取js文件内容
    content = fs.readFileSync(filename, 'utf8');

    const result = esbuild.transformSync(content, {
        sourcefile: filename,
        sourcemap: 'both',
        loader: 'ts',
        format: 'cjs'
    })
    
    content = result.code
  }
  // 然后在调用module._compile，传入js内容与filename
  module._compile(content, filename);
};