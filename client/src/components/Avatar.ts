class Avatar {
  position: [number, number];
  constructor() {
    this.position = [0, 0];
  }

  getPos(): [number, number] {
    return this.position;
  }

  setPos(pos: [number, number]): void {
    this.position = pos;
  }
}

export default Avatar;
