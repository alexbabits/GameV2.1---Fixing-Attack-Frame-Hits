import MatterEntity from "./MatterEntity.js";

class PlayerState {

    constructor(player) {
        this.player = player
        this.attackingState = new PlayerAttackingState(this)
        this.idleState = new PlayerIdleState(this)
        this.walkingState = new PlayerWalkingState(this)
        this.currentState = this.idleState
    }

    enter() {
        // not implemented
    }

    exit() {
        // not implemented
    }
    
    update() {
        /* not implemented
        In here, place a switch statement (else if) for our different states (idle, walk, attack) we made below.
        For example, we'll say something like, 'if PlayerState is currently idle, then make sure only PlayerIdleState is active.

        Attempt below: (invoking an entire class on this.player seems odd?)

        Switch (PlayerState) {
            case (PlayerIdleState === active):
                this.player.PlayerIdleState();
                break;
            case (PlayerWalkingState === active):
                this.player.PlayerWalkingState();
                break;
            case (PlayerAttackingState === active):
                this.player.AttackingState();
                break;
            default:
                console.log('invalid state');
                break;
        }

        So I also need a gotoState('state here') function that invokes goto'state'() methods via switch 

        Attempt below:

        Switch (goto) {
            case (gotoState(PlayerIdleState)):
                gotoPlayerIdleState();
                break;
            case (gotoState(PlayerWalkingState)):
                gotoPlayerWalkingState();
                break;
            case (gotoState(PlayerAttackingState)):
                gotoPlayerAttackingState();
                break;
            default:
                console.log('invalid goto state);
                break;
        }

        */
    }

    handleKeys() {
        // not implemented
        // Assuming this will handle ALL the key and/or future mouse inputs for ALL the states described below?
    }
}

class PlayerIdleState extends PlayerState {
    
    enter() {
        this.player.anims.play('hero_idle', true);
        this.player.playerVelocity.x = 0
        this.player.playerVelocity.y = 0
    }

    exit() {
        // stop the animation
        this.player.anims.stop();
    }
}

class PlayerWalkingState extends PlayerState {
    enter() {
        this.player.anims.play("hero_run", true);
    }

    update() {
        const speed = 4;
        this.player.playerVelocity = new Phaser.Math.Vector2();
        this.handleKeys();
        this.player.playerVelocity.scale(speed);
        this.player.setVelocity(this.player.playerVelocity.x, this.player.playerVelocity.y);        
    }


    handleKeys() {
        if (this.player.inputKeys.left.isDown) {
            this.player.flipX = true;
            this.player.playerVelocity.x = -1;
        } else if (this.player.inputKeys.right.isDown) {
            this.player.flipX = false;
            this.player.playerVelocity.x = 1;
        } else if (this.player.inputKeys.up.isDown) {
            this.player.playerVelocity.y = -1;
        } else if (this.player.inputKeys.down.isDown) {
            this.player.playerVelocity.y = 1;
        } 
    }
}

class PlayerAttackingState extends PlayerState {
    enter() {
        this.player.anims.play("hero_attack", true);
    }

    update() {
        this.handleKeys();
    }

    handleKeys() {
        if(this.inputKeys.space.isDown && playerVelocity.x === 0 && playerVelocity.y === 0) {
            this.anims.play('hero_attack', true);
            this.whackStuff();
           } else if (Math.abs(playerVelocity.x) !== 0 || (Math.abs(playerVelocity.y !== 0))) {
                this.anims.play('hero_run', true);
           } else {
               this.anims.play('hero_idle', true);
           }
        //This always sets our attack_frame trigger to false while not attacking (spacebar), so the flag always triggers in the correct way for our whackStuff() method.
        if(this.inputKeys.space.isDown === false) {
            this.attack_frame = false
        }
    }
}


export default class Player extends MatterEntity {
    constructor(data){
        let {scene, x , y, texture, frame} = data;

        super({...data, health: 20, drops:[], name:'player'});
        this.touching = [];
        //added PlayerState to our Player Class
        this.playerState = new PlayerState(this);

        //Here we set our default value of our flag associated with our whackStuff method to false.
        this.attack_frame = false;
        const {Body,Bodies} = Phaser.Physics.Matter.Matter;
        let playerCollider = Bodies.rectangle(this.x, this.y, 22, 32, {chamfer: {radius: 10}, isSensor:false, label:'playerCollider'});
        let playerSensor = Bodies.rectangle(this.x, this.y, 46, 8, {isSensor:true, label: 'playerSensor'});
        const compoundBody = Body.create({
            parts:[playerCollider, playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.heroTouchingTrigger(playerSensor);
        this.createPickupCollisions(playerCollider);

    };

    static preload(scene){
        scene.load.atlas('hero', 'assets/images/hero.png', 'assets/images/hero_atlas.json');
        scene.load.animation('hero_anims', 'assets/images/hero_anims.json');
        scene.load.spritesheet('items','assets/images/items.png',{frameWidth:32,frameHeight:32});
        scene.load.audio('player', 'assets/audio/player.mp3');
    }


    update(){
        const speed = 4;
        let playerVelocity = new Phaser.Math.Vector2();
        if(this.inputKeys.left.isDown) {
            this.flipX = true;
            playerVelocity.x = -1;
        } else if (this.inputKeys.right.isDown) {
            this.flipX = false;
            playerVelocity.x = 1;
        } else if (this.inputKeys.up.isDown) {
            playerVelocity.y = -1;
        } else if (this.inputKeys.down.isDown) {
            playerVelocity.y = 1;
        }

        //normalize makes diagonals same speed if needed, if I decide to allow diagonal movement. "playerVelocity.normalize();"

        playerVelocity.scale(speed);

        this.setVelocity(playerVelocity.x,playerVelocity.y);

        if(this.inputKeys.space.isDown && playerVelocity.x === 0 && playerVelocity.y === 0) {
            this.anims.play('hero_attack', true);
            this.whackStuff();
           } else if (Math.abs(playerVelocity.x) !== 0 || (Math.abs(playerVelocity.y !== 0))) {
                this.anims.play('hero_run', true);
           } else {
               this.anims.play('hero_idle', true);
           }
        //This always sets our attack_frame trigger to false while not attacking (spacebar), so the flag always triggers in the correct way for our whackStuff() method.
        if(this.inputKeys.space.isDown === false) {
            this.attack_frame = false
        }
        
    };

        heroTouchingTrigger(playerSensor){

        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: other => {
                if(other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
                    console.log(this.touching.length, other.gameObjectB.name);
                },
            context: this.scene, 
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA:[playerSensor],
            callback: other => {  
                this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
                    console.log(this.touching.length);
                },
            context: this.scene,
        });

    };

        createPickupCollisions(playerCollider){

        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerCollider],
            callback: other => {
                if(other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
                },
            context: this.scene, 
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA:[playerCollider],
            callback: other => {  
                if(other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
                },
            context: this.scene,
        });

    };

         whackStuff(){
            this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
            this.touching.forEach(gameObject =>{

            /* We check if the current animation is hero attack 5 and if the flag is false (default). If it is, we immediately
            turn it to true, and so the hit method gets called just for that first instance of hero attack 5.
            Then we turn it back to false for the next anim and this process loops.
            We found out we needed single '=' to reassign the flag's value. */
            
            if (this.anims.currentFrame.textureFrame === 'hero_attack_5'  && this.attack_frame === false) {
                this.attack_frame = true
                gameObject.hit()
            } else if (this.anims.currentFrame.textureFrame === 'hero_attack_6') {
                this.attack_frame = false
            }         

                if(gameObject.dead) gameObject.destroy();
        });
        //console.log(this.anims) to see what's going on with all things related to our animation state.
      }; 

};

