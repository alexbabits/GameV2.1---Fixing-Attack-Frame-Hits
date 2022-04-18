import Player from "./Player.js";
import Resource from "./Resource.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        Player.preload(this);
        Resource.preload(this);
        this.load.image('tiles', 'assets/images/RPG Nature Tileset.png');
        this.load.tilemapTiledJSON('map','assets/images/map.json');
        this.load.atlas('enemies', 'assets/images/enemies.png', 'assets/images/enemies_atlas.json');
        this.load.animation('enemies_anims', 'assets/images/enemies_anims.json');
    };

    create(){
        const map = this.make.tilemap({key: 'map'});
        //did this.map = map; just incase something isn't working
        this.map = map;
        const tileset = map.addTilesetImage('RPG Nature Tileset', 'tiles', 32, 32, 0, 2);
        const background = map.createStaticLayer('background', tileset, 0, 2);
        background.setCollisionByProperty({collides:true});
        this.matter.world.convertTilemapLayer(background);
    
        this.map.getObjectLayer('Resources').objects.forEach(resource =>  new Resource({scene:this, resource}));
        
        /*
        Goal: Import and use our rectangle object we call 'boundarytest' made in our 'Boundary' object layer in Tiled.
        Use it as a zone where when stepped on by the player, takes the player to a new scene.

        Process: Get/import our Object Layer called 'Boundary' with Phaser. 
        Get/Import our rectangular object we made called 'boundarytest' with Phaser.
        Make a new rectangle be the same coordinates as the rectangle object we made in Tiled? 
        Once properly imported, then say 'if the player steps on this invisible rectangle object, take him to the next scene.'
        
        Some attempts at the syntax to import and use the object:
        this.map.getObjectLayer('Boundary');
        let rectCoord = this.map.objects['Boundary']['boundarytest'];
        Or try this: let rectCoord = map.createFromObjects('Boundary','boundarytest');
        Or try this: const boundaryLayer = map.createObjectLayer('Boundary', tileset?, 'boundarytest?');
        Or try this: const boundarything = map.findObject("Boundary", obj => obj.name === "boundarytest");
        if using rectCoord way: this.sceneChange = new Phaser.Rectangle(rectCoord.x, rectCoord.y, rectCoord.width, rectCoord.height);
        if using boundarything way: this.sceneChange = new Phaser.Rectangle(boundarything.x, boundarything.y, boundarything.width, boundarything.height);
        
        or try this: this.boundary = this.phaser
        map.getObjectLayer('Boundary').objects.forEach((test) => {
            const xyz = this.???.create(test.x, test.y, 'boundarytest');
        });

        Finally, with something like this in update:
                if (this.sceneChange.contains(this.player.x)) {
            (change the players velocity to test at first). (Or transition scenes like below:)
            this.scene.stop(this);
            this.scene.start('map2');
        }
        */



        const villainGroup = this.add.group({ key: 'hero', frame:'hero_idle_5', frameQuantity: 4 });
        const villainSpawnArea = new Phaser.Geom.Rectangle(300, 300, 300, 300);
        Phaser.Actions.RandomRectangle(villainGroup.getChildren(), villainSpawnArea);


        //Attempt to make multiple fully functional player objects - testing for spawning future enemy object groups.
        let a;
        for (a=0;a<5;a++) {
        this.player = new Player({scene:this, x:Phaser.Math.Between(150,400), y:Phaser.Math.Between(150, 350), texture:'hero', frame:'hero_idle_1'});
        
        }

        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.dragon = new Phaser.Physics.Matter.Sprite(this.matter.world, Phaser.Math.Between(320,540), Phaser.Math.Between(40, 160), 'enemies', 'dragon_idle_1');
        this.add.existing(this.dragon);
        this.dragon.setFixedRotation();
        this.dragon.setStatic(true);
    };
    
    update(){
        this.player.update();
    };

};