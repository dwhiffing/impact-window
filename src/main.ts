import { Game as GameScene } from './scenes/Game'
import { Boot as BootScene } from './scenes/Boot'
import { Menu as MenuScene } from './scenes/Menu'
import { Game, Types } from 'phaser'

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 180,
  height: 280,
  parent: 'game-container',
  backgroundColor: '#000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: { default: 'arcade', arcade: { fps: 360, debug: false } },
  scene: [BootScene, MenuScene, GameScene],
}

export default new Game(config)
