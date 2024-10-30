import * as path from 'path'

export function getIconPath(): string {
  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, 'build/icon.icns')
    case 'win32':
      return path.join(__dirname, 'build/icon.ico')
    default:
      return path.join(__dirname, 'build/icon.png')
  }
}
