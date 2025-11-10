const STORAGE_KEY = 'impact-window-audio-mode'

export class MusicManager {
  scene: Phaser.Scene
  currentMusic: Phaser.Sound.BaseSound | null = null
  musicKeys = ['game-music-1', 'game-music-2', 'game-music-3', 'game-music-4']
  trackIndex = 0
  mode: number = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.mode = Number(localStorage.getItem(STORAGE_KEY) ?? '0')
    this.check()

    scene.input.keyboard!.off('keydown-M')
    scene.input.keyboard!.on('keydown-M', () => {
      this.mode = (this.mode + 1) % 3
      localStorage.setItem(STORAGE_KEY, `${this.mode}`)
      this.check()
    })

    // @ts-ignore
    this.currentMusic = window.currentMusic
    if (this.currentMusic) return

    this.trackIndex = Phaser.Math.Between(0, this.musicKeys.length - 1)
  }

  check() {
    console.log('Music mode:', this.mode)
    this.scene.sound.volume = this.mode !== 2 ? 0.3 : 0
    if (this.currentMusic)
      (this.currentMusic as any).volume = this.mode === 0 ? 0.3 : 0
  }

  playNext = () => {
    const key = this.musicKeys[this.trackIndex]
    this.currentMusic = this.scene.sound.add(key, {
      volume: this.mode === 0 ? 0.3 : 0,
    })

    // @ts-ignore
    window.currentMusic = this.currentMusic

    this.currentMusic.play()
    this.currentMusic.once('complete', () => {
      this.trackIndex = (this.trackIndex + 1) % this.musicKeys.length
      this.playNext()
    })
  }
}
