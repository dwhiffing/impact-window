const STORAGE_KEY = 'impact-window-audio-mode'

const TARGET_MUSIC_VOLUME = 0.3
const FADE_TIME = 250
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

    scene.input.keyboard!.off('keydown-N')
    scene.input.keyboard!.on('keydown-N', () => {
      // @ts-ignore
      if (window.currentMusic?.volume < TARGET_MUSIC_VOLUME) return
      this.trackIndex = (this.trackIndex + 1) % this.musicKeys.length
      this.playNext(true)
    })

    // @ts-ignore
    this.currentMusic = window.currentMusic
    if (this.currentMusic) return

    this.trackIndex = Phaser.Math.Between(0, this.musicKeys.length - 1)
  }

  check() {
    this.scene.sound.volume = this.mode !== 2 ? TARGET_MUSIC_VOLUME : 0
    if (this.currentMusic)
      (this.currentMusic as any).volume =
        this.mode === 0 ? TARGET_MUSIC_VOLUME : 0
  }

  playNext = (forcePlay = false) => {
    if (this.currentMusic && !forcePlay) return
    let target = { val: TARGET_MUSIC_VOLUME }
    // @ts-ignore
    const updateMusic: Phaser.Types.Tweens.TweenOnUpdateCallback = ( _, __, ___, v, ) => this.currentMusic?.setVolume(v) // prettier-ignore

    this.scene.tweens.add({
      targets: target,
      val: 0,
      onUpdate: updateMusic,
      duration: FADE_TIME,
      onComplete: () => {
        const key = this.musicKeys[this.trackIndex]
        this.currentMusic = this.scene.sound.add(key, { volume: 0 })
        this.currentMusic.play()

        if (this.mode === 0) {
          target = { val: 0 }
          this.scene.tweens.add({
            targets: target,
            val: TARGET_MUSIC_VOLUME,
            duration: FADE_TIME,
            onUpdate: updateMusic,
          })
        }
        // @ts-ignore
        window.currentMusic = this.currentMusic

        this.currentMusic.once('complete', () => {
          this.trackIndex = (this.trackIndex + 1) % this.musicKeys.length
          this.playNext(true)
        })
      },
    })
  }
}
