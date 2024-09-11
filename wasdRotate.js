window.AFRAME.registerComponent('wasd-rotate-controls', {
  schema: {
    adSpeed: {type: 'number', default: 2.5},
    wsAcceleration: {type: 'number', default: 100}
  },

  init: function () {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.keys = {};
    this.velocity = new window.AFRAME.THREE.Vector3();

    this.yawObject = new window.AFRAME.THREE.Object3D();
    this.pitchObject = new window.AFRAME.THREE.Object3D();
    this.pitchObject.add(this.el.object3D);
    this.yawObject.add(this.pitchObject);

    this.el.sceneEl.object3D.add(this.yawObject);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  },

  onKeyDown: function (event) {
    this.keys[event.key.toLowerCase()] = true;
  },

  onKeyUp: function (event) {
    this.keys[event.key.toLowerCase()] = false;
  },

  tick: function (time, deltaTime) {
    var rotationChange = 0;
    var moveX = 0, moveZ = 0;
    var rotationSpeed = (this.data.wsAcceleration / 300) * this.data.adSpeed * (deltaTime / 500);
    var moveSpeed = this.data.wsAcceleration * (deltaTime / 1000);

    // 旋轉控制
    if (this.keys['d']) {
      rotationChange += rotationSpeed;
    }
    if (this.keys['a']) {
      rotationChange -= rotationSpeed;
    }

    // 移動控制
    if (this.keys['w']) {
      moveZ -= moveSpeed;
    }
    if (this.keys['s']) {
      moveZ += moveSpeed;
    }

    // 應用旋轉
    this.yawObject.rotation.y -= rotationChange;

    // 計算移動
    var rotation = this.yawObject.rotation.y;
    this.velocity.x = moveX * Math.cos(rotation) + moveZ * Math.sin(rotation);
    this.velocity.z = moveZ * Math.cos(rotation) - moveX * Math.sin(rotation);

    // 應用移動
    this.yawObject.position.add(this.velocity);
  },

  remove: function () {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    this.el.sceneEl.object3D.remove(this.yawObject);
  }
});
