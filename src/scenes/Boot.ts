import { Scene } from 'phaser'
import { PLAYER_COLOR, PLAYER_SIZE } from '../constants'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  init() {
    const bar = this.add
      .rectangle(0, 0, 0, this.cameras.main.height, PLAYER_COLOR)
      .setOrigin(0, 0)
    this.load.on(
      'progress',
      (p: number) => (bar.width = this.cameras.main.width * p),
    )
  }

  preload() {
    this.load.setPath('assets/')
    this.load.bitmapFont('pixel-dan', 'pixel-dan.png', 'pixel-dan.xml')
    this.load.image('title', 'title.png')

    this.load.setPath('assets/audio')
    this.load.audio('game-music-1', 'game1.mp3')
    this.load.audio('game-music-2', 'game2.mp3')
    this.load.audio('game-music-3', 'game3.mp3')
    this.load.audio('game-music-4', 'game4.mp3')

    this.load.audio('start-game', 'start-game.mp3')
    this.load.audio('game-over', 'game-over.mp3')
    this.load.audio('explode-2', 'explode-2.mp3')

    this.load.audio('enemy-hit', 'hit-1.mp3')
    this.load.audio('enemy-kill', 'explode-2.mp3')
    this.load.audio('wall-hit', 'hit-3.mp3')
    this.load.audio('powerup-pickup', 'powerup-2.mp3')
    this.load.audio('powerup-expire', 'error.mp3')
    this.load.audio('combo-expire', 'error.mp3')

    this.load.audio('launch-weak', 'hit-2.mp3')
    this.load.audio('launch-full', 'powerup.mp3')
    this.load.audio('launch-ready', 'beep.mp3')
    this.load.audio('launch-start-drag', 'beep-2.mp3')

    this.add
      .graphics()
      .fillStyle(0xffffff, 1)
      .fillRect(0, 0, 4, 4)
      .generateTexture('particle', 4, 4)
      .destroy()
    const r = PLAYER_SIZE * 3
    this.add
      .graphics()
      .fillStyle(0xffffff, 1)
      .fillCircle(r, r, r)
      .generateTexture('circle', r * 2, r * 2)
      .destroy()
  }

  create() {
    this.sound.volume = 0.3
    this.scene.start('Menu')
  }
}
