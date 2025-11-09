import {
  DEAD_ZONE_SIZE,
  MAX_THUMB_SIZE,
  NUDGE_ZONE_SIZE,
  PLAYER_COLOR,
  PLAYER_CRUSH_COLOR,
} from '../constants'
import { Game } from '../scenes/Game'

export class Line extends Phaser.GameObjects.Graphics {
  declare scene: Game

  constructor(scene: Game) {
    super(scene)
    scene.add.existing(this)
    this.setDepth(10)
  }

  draw(p: Phaser.Input.Pointer) {
    const dx = p.worldX - p.downX
    const dy = p.worldY - p.downY
    const distance = Math.sqrt(dx * dx + dy * dy)

    const ratio = distance > MAX_THUMB_SIZE ? MAX_THUMB_SIZE / distance : 1
    const endX = p.downX + dx * ratio
    const endY = p.downY + dy * ratio

    this.clear()
      .lineStyle(
        2,
        distance <= DEAD_ZONE_SIZE || !this.scene.player.canLaunch
          ? 0x333333
          : distance <= NUDGE_ZONE_SIZE
          ? PLAYER_COLOR
          : PLAYER_CRUSH_COLOR,
        1,
      )
      .moveTo(p.downX, p.downY)
      .lineTo(endX, endY)
      .strokePath()
  }
}
