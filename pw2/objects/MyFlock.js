import * as THREE from 'three';
import { MyFish } from './MyFish.js';
import { MyFish2 } from './MyFish2.js';

export class MyFlock {
  constructor(app, options = {}) {
    this.app = app;
    this.fishes = [];
    this.groupSize = options.groupSize || 15;
    this.perceptionRadius = options.perceptionRadius || 3.0;
    this.maxSpeed = options.maxSpeed || 5.0;
    this.maxForce = options.maxForce || 0.2;
    this.separationWeight = options.separationWeight || 1.5;
    this.alignmentWeight = options.alignmentWeight || 1.0;
    this.cohesionWeight = options.cohesionWeight || 1.0;
    this.boundaryWeight = options.boundaryWeight || 1.0;
    this.predatorAvoidanceWeight = options.predatorAvoidanceWeight || 2.5;
    this.dangerousEntities = [];
    this.cubeSize = options.cubeSize || 15;
    this.flockGroup = new THREE.Group();
  }

  init() {
    for (let i = 0; i < this.groupSize; i++) {
      const scale = THREE.MathUtils.randFloat(0.7, 1.0);
      const speed = THREE.MathUtils.randFloat(0.5, 1.1);
      const FishClass = (i % 2 === 0) ? MyFish2 : MyFish;
      
      const fish = new FishClass(this.app, {
        showCurves: false,
        swimSpeed: speed,
        swimAmplitude: 0.20,
        turnSmoothness: 0.05
      });
      
      fish.init();
      const s = this.cubeSize;
      fish.fishGroup.position.x = THREE.MathUtils.randFloat(-s * 0.25, s * 0.25);
      fish.fishGroup.position.y = THREE.MathUtils.randFloat(-s * 0.15, s * 0.15);
      fish.fishGroup.position.z = THREE.MathUtils.randFloat(-s * 0.25, s * 0.25);
      const baseScale = (fish instanceof MyFish2) ? 0.007 : 0.005;
      fish.fishGroup.scale.setScalar(scale * s * baseScale);
      fish.boidVelocity = fish.velocity ? fish.velocity.clone() : new THREE.Vector3(1, 0, 0);
      fish.boidAcceleration = new THREE.Vector3(0, 0, 0);
      
      this.fishes.push(fish);
      this.flockGroup.add(fish.fishGroup);
    }
    
    this.app.scene.add(this.flockGroup);
  }

  update(delta, cubeSize) {
    if (!this.fishes || this.fishes.length === 0) return;
    const dt = (delta && delta > 0 && delta < 1) ? delta : 0.016;
    for (let i = 0; i < this.fishes.length; i++) {
      const fish = this.fishes[i];
      const neighbors = this._getNeighbors(fish, i);
      let separationForce = this._separation(fish, neighbors);
      let alignmentForce = this._alignment(fish, neighbors);
      let cohesionForce = this._cohesion(fish, neighbors);
      let boundaryForce = this._avoidBoundaries(fish, cubeSize);
      let predatorForce = this._avoidPredators(fish);
      separationForce.multiplyScalar(this.separationWeight);
      alignmentForce.multiplyScalar(this.alignmentWeight);
      cohesionForce.multiplyScalar(this.cohesionWeight);
      boundaryForce.multiplyScalar(this.boundaryWeight);
      predatorForce.multiplyScalar(this.predatorAvoidanceWeight);
      fish.boidAcceleration.add(separationForce);
      fish.boidAcceleration.add(alignmentForce);
      fish.boidAcceleration.add(cohesionForce);
      fish.boidAcceleration.add(boundaryForce);
      fish.boidAcceleration.add(predatorForce);
      this._limitVector(fish.boidAcceleration, this.maxForce);
      fish.boidVelocity.add(fish.boidAcceleration);
      this._limitVector(fish.boidVelocity, this.maxSpeed);
      const speed = fish.properties?.swimSpeed ?? 0.8;
      fish.fishGroup.position.x += fish.boidVelocity.x * speed * dt;
      fish.fishGroup.position.y += fish.boidVelocity.y * speed * dt * 0.5;
      fish.fishGroup.position.z += fish.boidVelocity.z * speed * dt;
      this._bounceBoundaries(fish.fishGroup.position, fish.boidVelocity, cubeSize);
      if (fish.boidVelocity.length() > 0.01) {
        const targetRotY = Math.atan2(fish.boidVelocity.z, -fish.boidVelocity.x);
        const currentRotY = fish.fishGroup.rotation.y;
        
        let diff = targetRotY - currentRotY;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        
        fish.fishGroup.rotation.y += diff * 0.05;
      }
      const swimAmplitude = fish.properties?.swimAmplitude ?? 0.25;
      const t = performance.now() * 0.001;
      if (fish.mesh) {
        fish.mesh.rotation.y = Math.sin(t * 6) * 0.15 * swimAmplitude;
        fish.mesh.rotation.z = Math.sin(t * 3) * 0.05 * swimAmplitude;
      }
      fish.boidAcceleration.set(0, 0, 0);
    }
  }

  _separation(fish, neighbors) {
    const steer = new THREE.Vector3(0, 0, 0);
    let count = 0;
    
    for (const neighbor of neighbors) {
      const distance = fish.fishGroup.position.distanceTo(neighbor.fishGroup.position);
      
      if (distance > 0 && distance < this.perceptionRadius * 0.5) {
        const diff = new THREE.Vector3();
        diff.subVectors(fish.fishGroup.position, neighbor.fishGroup.position);
        diff.normalize();
        diff.divideScalar(distance);
        steer.add(diff);
        count++;
      }
    }
    
    if (count > 0) {
      steer.divideScalar(count);
      steer.normalize();
      steer.multiplyScalar(this.maxSpeed);
      steer.sub(fish.boidVelocity);
      this._limitVector(steer, this.maxForce);
    }
    
    return steer;
  }

  _alignment(fish, neighbors) {
    const avg = new THREE.Vector3(0, 0, 0);
    let count = 0;
    
    for (const neighbor of neighbors) {
      avg.add(neighbor.boidVelocity);
      count++;
    }
    
    if (count > 0) {
      avg.divideScalar(count);
      avg.normalize();
      avg.multiplyScalar(this.maxSpeed);
      
      const steer = new THREE.Vector3();
      steer.subVectors(avg, fish.boidVelocity);
      this._limitVector(steer, this.maxForce);
      return steer;
    }
    
    return new THREE.Vector3(0, 0, 0);
  }

  _cohesion(fish, neighbors) {
    const avgLocation = new THREE.Vector3(0, 0, 0);
    let count = 0;
    
    for (const neighbor of neighbors) {
      avgLocation.add(neighbor.fishGroup.position);
      count++;
    }
    
    if (count > 0) {
      avgLocation.divideScalar(count);
      const desired = new THREE.Vector3();
      desired.subVectors(avgLocation, fish.fishGroup.position);
      desired.normalize();
      desired.multiplyScalar(this.maxSpeed);
      
      const steer = new THREE.Vector3();
      steer.subVectors(desired, fish.boidVelocity);
      this._limitVector(steer, this.maxForce);
      return steer;
    }
    
    return new THREE.Vector3(0, 0, 0);
  }

  _avoidBoundaries(fish, cubeSize) {
    const steer = new THREE.Vector3(0, 0, 0);
    const pos = fish.fishGroup.position;
    const limit = cubeSize * 0.45;
    const desiredDistance = 2.0;
    
    if (pos.x > limit - desiredDistance) {
      steer.x = -1;
    } else if (pos.x < -limit + desiredDistance) {
      steer.x = 1;
    }
    
    const topY = cubeSize * 0.35;
    const bottomY = -cubeSize * 0.35;
    
    if (pos.y > topY - desiredDistance) {
      steer.y = -1;
    } else if (pos.y < bottomY + desiredDistance) {
      steer.y = 1;
    }
    
    if (pos.z > limit - desiredDistance) {
      steer.z = -1;
    } else if (pos.z < -limit + desiredDistance) {
      steer.z = 1;
    }
    
    if (steer.length() > 0) {
      steer.normalize();
      steer.multiplyScalar(this.maxSpeed);
      steer.sub(fish.boidVelocity);
      this._limitVector(steer, this.maxForce);
    }
    
    return steer;
  }

  _avoidPredators(fish) {
    const steer = new THREE.Vector3(0, 0, 0);
    const dangerRadius = this.perceptionRadius * 1.5;
    
    for (const predator of this.dangerousEntities) {
      const predatorPos = predator.group?.position || predator.fishGroup?.position || predator.position;
      if (!predatorPos) continue;
      
      const distance = fish.fishGroup.position.distanceTo(predatorPos);
      
      if (distance < dangerRadius && distance > 0) {
        const diff = new THREE.Vector3();
        diff.subVectors(fish.fishGroup.position, predatorPos);
        diff.normalize();
        
        const urgency = 1 - (distance / dangerRadius);
        diff.multiplyScalar(urgency * urgency);
        
        steer.add(diff);
      }
    }
    
    if (steer.length() > 0) {
      steer.normalize();
      steer.multiplyScalar(this.maxSpeed);
      steer.sub(fish.boidVelocity);
      this._limitVector(steer, this.maxForce * 1.5);
    }
    
    return steer;
  }

  _getNeighbors(fish, fishIndex) {
    const neighbors = [];
    
    for (let i = 0; i < this.fishes.length; i++) {
      if (i === fishIndex) continue;
      
      const other = this.fishes[i];
      const distance = fish.fishGroup.position.distanceTo(other.fishGroup.position);
      
      if (distance < this.perceptionRadius) {
        neighbors.push(other);
      }
    }
    
    return neighbors;
  }

  _limitVector(vector, max) {
    if (vector.length() > max) {
      vector.normalize();
      vector.multiplyScalar(max);
    }
    return vector;
  }

  _bounceBoundaries(position, velocity, cubeSize) {
    const limit = cubeSize * 0.45;
    const bounce = 0.8;
    
    if (position.x > limit) {
      position.x = limit;
      velocity.x *= -bounce;
    } else if (position.x < -limit) {
      position.x = -limit;
      velocity.x *= -bounce;
    }
    
    const topY = cubeSize * 0.35;
    const bottomY = -cubeSize * 0.35;
    
    if (position.y > topY) {
      position.y = topY;
      velocity.y *= -bounce;
    } else if (position.y < bottomY) {
      position.y = bottomY;
      velocity.y *= -bounce;
    }
    
    if (position.z > limit) {
      position.z = limit;
      velocity.z *= -bounce;
    } else if (position.z < -limit) {
      position.z = -limit;
      velocity.z *= -bounce;
    }
  }

  getFishes() {
    return this.fishes;
  }

  getGroup() {
    return this.flockGroup;
  }

  setParameters(params) {
    if (params.separationWeight !== undefined) this.separationWeight = params.separationWeight;
    if (params.alignmentWeight !== undefined) this.alignmentWeight = params.alignmentWeight;
    if (params.cohesionWeight !== undefined) this.cohesionWeight = params.cohesionWeight;
    if (params.predatorAvoidanceWeight !== undefined) this.predatorAvoidanceWeight = params.predatorAvoidanceWeight;
    if (params.perceptionRadius !== undefined) this.perceptionRadius = params.perceptionRadius;
    if (params.maxSpeed !== undefined) this.maxSpeed = params.maxSpeed;
    if (params.maxForce !== undefined) this.maxForce = params.maxForce;
  }

  addDangerousEntity(entity) {
    if (entity && !this.dangerousEntities.includes(entity)) {
      this.dangerousEntities.push(entity);
    }
  }

  removeDangerousEntity(entity) {
    const index = this.dangerousEntities.indexOf(entity);
    if (index > -1) {
      this.dangerousEntities.splice(index, 1);
    }
  }

  dispose() {
    for (const fish of this.fishes) {
      fish.dispose();
    }
    this.fishes = [];
  }
}
