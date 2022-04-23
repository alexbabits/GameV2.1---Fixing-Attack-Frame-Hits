import Player from "./Player.js";
import Resource from "./Resource.js";

export default class SecondScene extends Phaser.Scene {
    constructor() {
        super("SecondScene");
    }

    preload() {
        Player.preload(this);
        Resource.preload(this);
        this.load.image('tiles', 'assets/images/RPG Nature Tileset.png');
        this.load.tilemapTiledJSON('map2','assets/images/map2.json');
        this.load.atlas('enemies', 'assets/images/enemies.png', 'assets/images/enemies_atlas.json');
        this.load.animation('enemies_anims', 'assets/images/enemies_anims.json');
        this.load.image('cursor', 'assets/images/cursor.png');
    };

    create(){
        const map2 = this.make.tilemap({key: 'map2'});
        this.map2 = map2;
        const tileset = map2.addTilesetImage('RPG Nature Tileset', 'tiles', 32, 32, 0, 2);
        const background = map2.createStaticLayer('background', tileset, 0, 2);
        background.setCollisionByProperty({collides:true});
        this.matter.world.convertTilemapLayer(background);
    
        //UNCOMMENT WHEN I ADD RESOURCES: this.map2.getObjectLayer('Resources').objects.forEach(resource =>  new Resource({scene:this, resource}));
        
        const villainGroup = this.add.group({ key: 'hero', frame:'hero_idle_5', frameQuantity: 4 });
        const villainSpawnArea = new Phaser.Geom.Rectangle(300, 300, 300, 300);
        Phaser.Actions.RandomRectangle(villainGroup.getChildren(), villainSpawnArea);


        //Attempt to make multiple fully functional player objects - testing for spawning future enemy object groups.
        let a;
        for (a=0;a<5;a++) {
        this.player = new Player({scene:this, x:Phaser.Math.Between(150,400), y:Phaser.Math.Between(150, 350), texture:'hero', frame:'hero_idle_1'});
        
        }

        let camera = this.cameras.main;
        camera.zoom = 1.4;
        camera.startFollow(this.player);
        camera.setLerp(0.1,0.1);
        camera.setBounds(0,0,this.game.config.width,this.game.config.heigth);

        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        });

        this.dragon = new Phaser.Physics.Matter.Sprite(this.matter.world, Phaser.Math.Between(320,540), Phaser.Math.Between(40, 160), 'enemies', 'dragon_idle_1');
        this.add.existing(this.dragon);
        this.dragon.setFixedRotation();
        this.dragon.setStatic(true);

        //create particles
        this.particles = this.add.particles('cursor');
        this.emitter = this.particles.createEmitter({
            x: { min:0, max: 400},
            y: 0,
            lifespan: 2000,
            speedY: {min: 10, max: 200},
            scale: 0.2,
            quantity: 10,
            blendMode: 'ADD'
        })


    };
    
    update(){
        this.player.update();

        if (this.player.x > 400) {
            this.player.setTint(0xff0000);
        }

        if (this.player.x < 40) {
            this.cameras.main.fade(400, 0, 0, 0, false, function(camera, progress) {
                if (progress > .99) {
                    this.scene.stop('SecondScene')
                    this.scene.start('MainScene')
                }
            });

}
        //Finally, we test to see if our Object in our Object Layer is interactable by changing the player's velocity when stepped on.
        //I can't figure out how to extract the object from our object layer, and use it's position to do something.
                //if (this.player.x > this.boundaries.x) {
                    //this.player.y = 200
        //}
        
    };

};