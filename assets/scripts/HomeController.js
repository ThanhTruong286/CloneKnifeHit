cc.Class({
    extends: cc.Component,

    properties: {
        playButton: {
            default: null,
            type: cc.Button,
            tooltip: 'The play button to start the game',
        },
        lblHighScore: {
            default: null,
            type: cc.Label,
            tooltip: 'The label to display the high score',
        },
        bgMusic: {
            default: null,
            type: cc.AudioClip,
            tooltip: 'The background music to play',
        },
        logo: {
            default: null,
            type: cc.Node,
            tooltip: 'The logo node to animate',
        },
        wood: cc.Node, // Reference to your wood node
        rotationSpeed: 1, // Adjust this value to change the rotation speed
    },

    onLoad: function () {
        // Display the high score
        if (this.lblHighScore) {
            this.lblHighScore.string = "High Score: " + Global.highScore;
        } else {
            cc.error('lblHighScore is null or undefined');
        }

        // Ensure the playButton is assigned
        if (!this.playButton) {
            cc.error('playButton is not assigned!');
            return;
        }

        // Add a click event listener to the button
        this.playButton.node.on('click', this.onPlayButtonClick, this);

        // Play background music
        if (this.bgMusic) {
            cc.audioEngine.playMusic(this.bgMusic, true); // Play the music looped
        } else {
            cc.error('bgMusic is not assigned!');
        }

        // Start the logo zoom animation
        this.startLogoAnimation();

        // Load CSS file
        cc.loader.loadRes('styles', cc.TextAsset, (err, res) => {
            if (err) {
                cc.error('Failed to load CSS file:', err);
                return;
            }

            // Create a new style element
            let style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = res.text; // Set the CSS text

            // Append the style element to the document head
            document.head.appendChild(style);

            // Add the custom class to the play button node
            if (this.playButton.node) {
                this.playButton.node.classList.add('play-button');
            } else {
                cc.error('playButton node is not found!');
            }
        });
        this.schedule(this.rotateWood, 0); 
    },

    startLogoAnimation: function () {
        if (!this.logo) {
            cc.error('logo node is not assigned!');
            return;
        }

        // Create the zoom in and zoom out actions
        let zoomIn = cc.scaleTo(1, 1.2).easing(cc.easeCubicActionOut());
        let zoomOut = cc.scaleTo(1, 1).easing(cc.easeCubicActionIn());

        // Create a sequence of zoom in and zoom out actions
        let zoomSequence = cc.sequence(zoomIn, zoomOut);

        // Repeat the sequence forever
        let repeatForever = cc.repeatForever(zoomSequence);

        // Run the animation on the logo node
        this.logo.runAction(repeatForever);
    },

    onDestroy: function () {
        // Stop the background music when the scene is destroyed
        cc.audioEngine.stopMusic();
    },

    onPlayButtonClick: function () {
        // Load Level 1 scene
        Global.currentLevel = 1;
        cc.director.loadScene('GameScene');
    },
    rotateWood: function () {
        // Rotate the wood node by the rotationSpeed value
        this.wood.angle += this.rotationSpeed; // Add rotationSpeed to the current rotation
    },
});
