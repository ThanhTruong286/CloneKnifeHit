cc.Class({
    extends: cc.Component,

    properties: {
        lblTotalScore: cc.Label, // Reference to the total score label
        lblHighScore: cc.Label,  // Reference to the high score label
        btnContinue: cc.Button,  // Reference to the continue button
        btnHome: cc.Button,
    },

    onLoad() {
        // Display the total score
        if (this.lblTotalScore) {
            this.lblTotalScore.string = "Total Score: " + Global.totalScore;
        } else {
            cc.error('lblTotalScore is null or undefined');
        }

        // Display the high score
        if (this.lblHighScore) {
            this.lblHighScore.string = "High Score: " + Global.highScore;
        } else {
            cc.error('lblHighScore is null or undefined');
        }

        // Set up the continue button
        if (this.btnContinue) {
            this.btnContinue.node.on('click', this.onContinue, this);
        } else {
            cc.error('btnContinue is null or undefined');
        }

        if (this.btnHome) {
            this.btnHome.node.on('click', this.home, this);
        } else {
            cc.error('btnContinue is null or undefined');
        }
    },
    home() {
        // Reset the total score and load level 1
        Global.totalScore = 0;
        cc.director.loadScene('Home');
    },

    onContinue() {
        // Reset the total score and load level 1
        Global.totalScore = 0;
        Global.currentLevel = 1;
        cc.director.loadScene('GameScene');
    },
});
