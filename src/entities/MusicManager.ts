import { Game } from '../scenes/Game'

export class MusicManager {
  private musicKeys = [
    'game-music-1',
    'game-music-2',
    'game-music-3',
    'game-music-4',
  ]
  private trackIndex = 0
  private trackPlays = 0
  private currentMusic: Phaser.Sound.BaseSound | null = null
  private scene: Game

  constructor(scene: Game) {
    this.scene = scene
    // @ts-ignore
    this.currentMusic = window.currentMusic
    if (this.currentMusic) return
    this.trackIndex = Phaser.Math.Between(0, this.musicKeys.length - 1)
    this.trackPlays = 0
    this.playCurrentTrack()
  }

  private playCurrentTrack = () => {
    if (this.trackIndex === null) return

    const key = this.musicKeys[this.trackIndex]
    const music = this.scene.sound.add(key, { loop: false, volume: 0.3 })
    music.play()
    this.currentMusic = music
    // @ts-ignore
    window.currentMusic = music

    music.once('complete', this.onTrackComplete)
  }

  private onTrackComplete = () => {
    this.trackPlays += 1

    if (!this.currentMusic) return

    this.currentMusic?.stop()
    this.trackIndex = (this.trackIndex + 1) % this.musicKeys.length
    this.trackPlays = 0
    this.playCurrentTrack()
  }
}
