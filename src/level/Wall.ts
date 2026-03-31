import { AABB } from '../physics/Collision';

export class Wall implements AABB {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
}
