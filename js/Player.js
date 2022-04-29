import MatterEntity from "./MatterEntity.js";

class PlayerState {

    constructor(player) {
        this.player = player
    }
    get anims() {return this.player.anims}; // Allows us to use 'this.anims' rather than 'this.player.anims' in our subclasses
    get touching() {export this.player.touching}; // Like above, but for 'this.player.touching'

    enter() {
        // not implemented
    }

    exit() {
        // not implemented
    }
    
    update() {
        /* not implemented

        if (we are pressing WASD) {
            this.goto(this.runningState)

        } else if (we are pressing spacebar) {
            this.goto(this.attackingState)

        } else (we are doing neither) {
            this.goto(this.idleState) 
        }

        if (we are pressing WASD and pressing shift) {
            this.goto(this.walkingState)

        }

        */
    }

    handleKeys() {
        // not implemented
        /* Assuming this will handle ALL the key and/or future mouse inputs for ALL the states of the player.

        this.runningState.handlekeys();
        this.attackingState.handlekeys();
        this.idleState.handlekeys();


        */
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
};

    //Renamed PlayerWalkingState to PlayerRunningState to accurately describe that the player is running rather than walking.
class PlayerRunningState extends PlayerState {

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
};

// Created PlayerWalkingState to handle the player walking state.

class PlayerWalkingState extends PlayerState {

    enter() {
        this.player.anims.play("hero_walk", true);
    }

    update() {
        const speed = 2;
        this.player.playerVelocity = new Phaser.Math.Vector2();
        this.handleKeys();
        this.player.playerVelocity.scale(speed);
        this.player.setVelocity(this.player.playerVelocity.x, this.player.playerVelocity.y);        
    }


    handleKeys() {
        if (this.player.inputKeys.left.isDown && this.player.inputKeys.shift.isDown) {
            this.player.flipX = true;
            this.player.playerVelocity.x = -1;
        } else if (this.player.inputKeys.right.isDown && this.player.inputKeys.shift.isDown) {
            this.player.flipX = false;
            this.player.playerVelocity.x = 1;
        } else if (this.player.inputKeys.up.isDown && this.player.inputKeys.shift.isDown) {
            this.player.playerVelocity.y = -1;
        } else if (this.player.inputKeys.down.isDown && this.player.inputKeys.shift.isDown) {
            this.player.playerVelocity.y = 1;
        } 
    }
};

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

        if(this.inputKeys.space.isDown === false) {
            this.attack_frame = false
        }
    }

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


export default class Player extends MatterEntity {
    constructor(data){
        let {scene, x , y, texture, frame} = data;

        super({...data, health: 20, drops:[], name:'player'});
        this.touching = [];
        // Instantiating the different player states.
        this.attackingState = new PlayerAttackingState(this)
        this.idleState = new PlayerIdleState(this)
        this.runningState = new PlayerRunningState(this)
        this.walkingState = new PlayerWalkingState(this)
        // Initializing the default state of idleState, by invoking our goto method which calls the enter method for idleState.
        this.goto(this.idleState)

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

        //Since we have all our states instantiated on the player, we can simply invoke the update method on the currentState.
    update(){
        this.currentState.update();
    };

    //Our goto method, it handles the changing of our player's current state (.attackingState, .idleState, .runningState, etc.).
    goto(state) {
        if (this.currentState) {
          this.currentState.exit();
        }
        this.currentState = state;
        this.currentState.enter();
      }

    //Sensor Trigger between the player and objects.

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
    
    //Collider Trigger between the player and objects that can be picked up.

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

};

