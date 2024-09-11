cc.Class({
    extends: cc.Component,

    properties: {
        sprWood: cc.Node,
        sprKnife: cc.Node,
        knifePrefab: cc.Prefab,
        lblLevel: cc.Label,
        lblKnife: cc.Label,
        lblScore: cc.Label,
        level: {
            default: 1,
            type: cc.Integer,
            tooltip: 'The current level of the game',
        },
        knifeStabAudio: {
            default: null,
            type: cc.AudioClip,
        },
        knifeHitAudio: {
            default: null,
            type: cc.AudioClip,
        },
    },

    statics: {
        canThrow: false,
        sprWoodRotation: null,
        defaultSprKnife: null,
        arrayKnife: [],
        totalScore: 0, // Static variable to store total score across levels
    },

    onLoad: function () {
        // Load the total score from Global
        this.score = Global.totalScore;
        this.updateScore();
        cc.log('onLoad called');

        if (!this.sprWood || !this.sprKnife || !this.lblLevel || !this.lblKnife || !this.knifeStabAudio || !this.knifeHitAudio) {
            cc.error('One or more properties are not assigned!');
            return;
        }

        this.canThrow = true;
        this.sprWood.zIndex = 1;
        this.sprWoodRotation = 2.5; // Default rotation speed
        this.arrayKnife = [];
        this.defaultSprKnife = this.sprKnife.position;
        this.dao = 5; // Default number of knives

        // Initialize counter for reverse rotation
        this.reverseRotationCount = 0;

        // Adjust values based on the level
        this.adjustLevelParameters();

        this.node.on('touchstart', this.knifeThrow, this);

        cc.log("Level: " + this.level);

        setInterval(() => {
            this.changeSpeed();
        }, 2500);
    },

    start: function () {
        if (this.lblLevel) {
            this.lblLevel.string = "Level: " + Global.currentLevel;
        } else {
            cc.error('lblLevel is null or undefined');
        }
        this.updateScoreLabel();

        if (this.lblKnife) {
            this.lblKnife.string = "Knife: " + this.dao;
        } else {
            cc.error('lblKnife is null or undefined');
        }
    },

    onDestroy: function () {
        this.node.off('touchstart', this.knifeThrow, this);
        // Stop the background music when the scene is destroyed
        cc.audioEngine.stopMusic();
    },

    changeSpeed: function () {
        let dir = 1; // Default direction
        let speed = 1 + Math.random() * 2; // Speed from 1 to 3

        if (this.level === 2) {
            if (Math.random() > 0.5 && this.reverseRotationCount < 3) { // Reverse rotation 3 times
                dir = -1;
                this.reverseRotationCount++;
            }
        } else if (this.level === 3) {
            if (Math.random() > 0.3) { // Higher chance of reverse rotation
                dir = -1;
            }
        }

        this.sprWoodRotation = dir * speed;
    },

    updateScore: function () {
        // Save the score to Global
        Global.totalScore = this.score;

        if (this.lblScore) {
            this.lblScore.string = "Score: " + this.score;
        } else {
            cc.error('lblScore is null or undefined');
        }
    },

    knifeThrow: function () {
        if (this.canThrow) {
            this.canThrow = false;
            this.sprKnife.runAction(cc.sequence(
                cc.moveTo(0.25, cc.v2(this.sprKnife.x, this.sprWood.y - this.sprWood.width / 2)),
                cc.callFunc(() => {
                    let gap = 15;
                    let isHit = false;
    
                    for (let knife of this.arrayKnife) {
                        if (Math.abs(knife.angle) < gap || (360 - knife.angle) < gap) {
                            isHit = true;
                            break;
                        }
                    }
    
                    if (isHit) {
                        cc.audioEngine.playEffect(this.knifeHitAudio, false);
                        this.sprKnife.runAction(cc.sequence(
                            cc.spawn(
                                cc.moveTo(0.25, cc.v2(this.sprKnife.x, -cc.winSize.height)),
                                cc.rotateTo(0.25, 30)
                            ),
                            cc.callFunc(() => {
                                cc.log('Game over!');
                                if (Global.totalScore > Global.highScore) {
                                    Global.highScore = Global.totalScore;
                                }
                                cc.director.loadScene('GameOver');
                            })
                        ));
                    } else {
                        let knifeNode = cc.instantiate(this.sprKnife);
                        knifeNode.setPosition(this.sprKnife.position);
                        this.node.addChild(knifeNode);
                        this.arrayKnife.push(knifeNode);
                        this.updateKnife();
                        this.sprKnife.setPosition(this.defaultSprKnife);
                        this.canThrow = true;
    
                        cc.audioEngine.playEffect(this.knifeStabAudio, false);
    
                        // Add the move up action for sprWood
                        this.sprWood.runAction(cc.sequence(
                            cc.moveBy(0.1, cc.v2(0, 20)), // Move up by 20 pixels
                            cc.moveBy(0.1, cc.v2(0, -20)) // Move back down by 20 pixels
                        ));
    
                        this.score += 1;
                        this.updateScore();
                    }
                })
            ));
        }
    },
    

    updateKnife: function () {
        this.dao -= 1;
        if (this.lblKnife) {
            this.lblKnife.string = "Knife: " + this.dao;
        } else {
            cc.error('lblKnife is null or undefined');
        }

        if (this.dao === 0) {
            this.endGame();
        }
    },

    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; // Bao gồm cả min và max
    },
    
    endGame: function () {
        cc.log('No more knives left! Game over!');
        // Load the next level scene
        let nextSceneName = 'GameScene';
        Global.currentLevel++;
        cc.log(Global.currentLevel);
        
        // Nếu currentLevel là bội số của 5, chuyển ngẫu nhiên đến một màn đặc biệt
        if (Global.currentLevel % 5 == 0) {
            let randomSpecial = this.getRandomInt(1, 10); // Random từ 1 đến 10
            cc.director.loadScene('Special' + randomSpecial);
        } else {
            cc.director.loadScene(nextSceneName);
        }
    },

    update: function (dt) {
        this.sprWood.angle = (this.sprWood.angle + this.sprWoodRotation) % 360;

        const woodRadius = this.sprWood.width / 2;
        const knifeBladeOffset = 20; // Ensure the offset matches the initial setup

        for (let knife of this.arrayKnife) {
            knife.angle = (knife.angle + this.sprWoodRotation) % 360;

            let rad = Math.PI * (knife.angle - 90) / 180;
            knife.x = this.sprWood.x + (woodRadius + knifeBladeOffset) * Math.cos(rad);
            knife.y = this.sprWood.y + (woodRadius + knifeBladeOffset) * Math.sin(rad);
        }
    },

    adjustLevelParameters: function () {
        switch (Global.currentLevel) {
            case 1:
                this.sprWoodRotation = 2.5;
                this.dao = 5;
                break;
            case 2:
                this.dao = 5;
                this.sprWoodRotation = 2.5;
                this.reverseRotationCount = 0; // Initialize reverse rotation count for level 2
                break;
            case 3:
                this.sprWoodRotation = 3.5;
                this.dao = 7;
                break;
            // Add more levels as needed
            default:
                this.sprWoodRotation = 2.5;
                this.dao = 5;
                break;
        }
    },

    updateScoreLabel: function () {
        if (this.lblScore) {
            this.lblScore.string = "Score: " + this.score;
        } else {
            cc.error('lblScore is null or undefined');
        }
    },
});
