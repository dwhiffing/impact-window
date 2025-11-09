import {
  DEAD_ZONE_SIZE,
  FULL_LAUNCH_COST,
  MAX_THUMB_SIZE,
  NUDGE_ZONE_SIZE,
  WEAK_LAUNCH_COST,
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
    const dist = Math.sqrt(dx * dx + dy * dy)

    const ratio = dist > MAX_THUMB_SIZE ? MAX_THUMB_SIZE / dist : 1
    const endX = p.downX + dx * ratio
    const endY = p.downY + dy * ratio
    const energy = this.scene.state.get().energy
    const isDisabled =
      energy < WEAK_LAUNCH_COST ||
      dist <= DEAD_ZONE_SIZE ||
      !this.scene.player.canLaunch
    const isWeak = dist <= NUDGE_ZONE_SIZE || energy < FULL_LAUNCH_COST
    const color = isDisabled ? 0x333333 : isWeak ? 0x00ffff : 0xffff00

    this.clear()
      .lineStyle(2, color, 1)
      .moveTo(p.downX, p.downY)
      .lineTo(endX, endY)
      .strokePath()
  }
}
