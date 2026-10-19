// Runs after electron-builder copies Electron, BEFORE the app is signed.
// Removes the software-Vulkan fallback (SwiftShader, ~16 MB). The exam app does not use WebGL,
// and Chromium on Mac uses Metal. This keeps the .dmg under GitHub's 100 MB file limit
// so the installer can live inside the website.
const fs = require('node:fs')
const path = require('node:path')

exports.default = async function afterPack(context) {
  const app = `${context.packager.appInfo.productFilename}.app`
  const libs = path.join(context.appOutDir, app, 'Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries')
  for (const file of ['libvk_swiftshader.dylib', 'vk_swiftshader_icd.json']) {
    fs.rmSync(path.join(libs, file), { force: true })
  }
}
