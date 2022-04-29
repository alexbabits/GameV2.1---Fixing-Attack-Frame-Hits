import MatterEntity from "./MatterEntity.js";

class PlayerState {
    constructor(player) { this.player = player; }

    get anims() { return this.player.anims }; // Allows us to use 'this.anims' rather than 'this.player.anims' in our subclasses
    get touching() { return this.player.touching }; // Like above, but for 'this.player.touching'
    get goto() { return this.player.goto() }; // Like above, but for 'this.player.goto'

    enter() { } // not implemented
    update() { } // not implemented
    handleKeys() { } // not implemented
    exit() { } // not implemented
}

class PlayerIdleState extends PlayerState {
    enter() {
        this.anims.play('hero_idle', true);
        this.player.playerVelocity.x = 0;
        this.player.playerVelocity.y = 0;
    }

    update() { this.handleKeys(); }

    handleKeys() {
        if (this.player.movementKeyIsDown() == true) this.goto(this.player.runningState);
        if (this.player.inputKeys.space.isDown) {
            this.goto(this.player.attackingState);
        }
    }

    exit() { this.anims.stop(); }
};

class PlayerRunningState extends PlayerState {
    enter() { this.anims.play("hero_run", true); }

    update() {
        this.handleKeys();
        const speed = 4;
        this.player.playerVelocity.scale(speed);
        this.player.setVelocity(this.player.playerVelocity.x, this.player.playerVelocity.y);
    }

    handleKeys() {
        if (this.player.inputKeys.left.isDown) {
            this.player.flipX = true;
            this.player.playerVelocity.x = -1;
        }
        if (this.player.inputKeys.right.isDown) {
            this.player.flipX = false;
            this.player.playerVelocity.x = 1;
        }
        if (this.player.inputKeys.up.isDown) {
            this.player.playerVelocity.y = -1;
        }
        if (this.player.inputKeys.down.isDown) {
            this.player.playerVelocity.y = 1;
        }

        if (this.player.movementKeyIsDown() == false) this.goto(this.player.idleState);
    }

    exit() { this.anims.stop(); }
};

class PlayerAttackingState extends PlayerState {
    enter() { this.anims.play("hero_attack", true); this.attack_frame = false; }

    update() {
        this.handleKeys();
        let touchingTargets = this.touching.filter(gameObject.hit && gameObject.alive);

        touchingTargets.forEach(target => {
            if (frame === 'hero_attack_6') {
                this.attack_frame = false;
            } else if (this.anims.currentFrame.textureFrame === 'hero_attack_5' && this.attack_frame === false) {
                this.attack_frame = true;
                target.hit;
            }

            if (target.dead === true) target.destroy();
        });
    }

    handleKeys() {
        if (this.attack_frame === false) {
            if (this.player.movementKeyIsDown() == true) this.goto(this.player.runningState); else this.goto(this.player.idleState);
        }
    }

    exit() { this.anims.stop; this.attack_frame = false; }
};


export default class Player extends MatterEntity {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super({ ...data, health: 20, drops: [], name: 'player' });

        // Bodies
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        let playerCollider = Bodies.rectangle(this.x, this.y, 22, 32,
            {
                chamfer: { radius: 10 }, isSensor: false, label: 'playerCollider'
            }
        );
        let playerSensor = Bodies.rectangle(this.x, this.y, 46, 8,
            {
                isSensor: true, label: 'playerSensor'
            }
        );
        const compoundBody = Body.create(
            {
                parts: [playerCollider, playerSensor],
                frictionAir: 0.35,
            }
        );

        this.playerVelocity = new Phaser.Math.Vector2();

        // For collisions?
        this.setFixedRotation();
        this.touching = [];
        this.heroTouchingTrigger(playerSensor);
        this.createPickupCollisions(playerCollider);
        this.setExistingBody(compoundBody);

        // Instantiating PlayerStates.
        this.idleState = new PlayerIdleState(this);
        this.attackingState = new PlayerAttackingState(this);
        this.runningState = new PlayerRunningState(this);

        // Initializing the default state of idleState, by invoking our goto method which calls the enter method for idleState.
        this.goto(this.idleState);
    };

    static preload(scene) {
        scene.load.atlas('hero', 'assets/images/hero.png', 'assets/images/hero_atlas.json');
        scene.load.animation('hero_anims', 'assets/images/hero_anims.json');
        scene.load.spritesheet('items', 'assets/images/items.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.audio('player', 'assets/audio/player.mp3');
    }

    // Since we have all our states instantiated on the player, we can simply invoke the update method on the currentState.
    update() { this.currentState.update(); };

    // Our goto method handles PlayerState changes.
    goto(state) {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = state;
        this.currentState.enter();
    }

    movementKeyIsDown() {
        let keys = this.inputKeys
        if (keys.left.isDown || keys.right.isDown || keys.down.isDown || keys.up.isDown) {
            return true;
        } else return false
    };

    // Sensor trigger between the player and objects.
    heroTouchingTrigger(playerSensor) {
        this.scene.matterCollision.addOnCollideStart(
            {
                objectA: [playerSensor],
                callback: other => {
                    if (other.bodyB.isSensor) return;
                    this.touching.push(other.gameObjectB);
                    console.log(this.touching.length, other.gameObjectB.name);
                },
                context: this.scene
            }
        );

        this.scene.matterCollision.addOnCollideEnd(
            {
                objectA: [playerSensor],
                callback: other => {
                    this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
                    console.log(this.touching.length);
                },
                context: this.scene,
            }
        );
    };

    //Collision trigger between the player and objects that can be picked up.
    createPickupCollisions(playerCollider) {
        this.scene.matterCollision.addOnCollideStart(
            {
                objectA: [playerCollider],
                callback: other => {
                    if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
                },
                context: this.scene,
            }
        );

        this.scene.matterCollision.addOnCollideActive(
            {
                objectA: [playerCollider],
                callback: other => {
                    if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
                },
                context: this.scene,
            }
        );
    };
};
