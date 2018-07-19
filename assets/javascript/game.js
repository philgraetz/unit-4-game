
// Prototype for static character info
// Do not change the values in these objects
// They will be used again on game restart
function staticCharacter(name, hp, ap, counterAp, imageFile) {
    this.name = name;
    this.baseHealthPoints = parseInt(hp);
    this.baseAttackPower = parseInt(ap);
    this.counterAttackPower = parseInt(counterAp);
    this.imageFile = imageFile;
}
// List of all characters
staticCharacterList = [ //  name    hp  ap cap  image file
    new staticCharacter("C3PO"          , 120,  8, 20, "assets/images/c3po.jpg"),
    new staticCharacter("Obi-Wan Kenobi", 100,  8,  5, "assets/images/obi-wan.jpg"),
    new staticCharacter("Yoda"          , 150,  6, 20, "assets/images/yoda.jpg"),
    new staticCharacter("Darth Vader"   , 180,  6, 25, "assets/images/vader.jpg"),
];

// Prototype used to track each character through the game
function gameCharacter(characterIndex) {
    var staticInfo = staticCharacterList[characterIndex];
    this.staticInfo = staticInfo; // static character info
    this.characterIndex = characterIndex;
    this.name = staticInfo.name;
    this.healthPoints = staticInfo.baseHealthPoints;
    this.attackPower = staticInfo.baseAttackPower;
    this.counterAttackPower = staticInfo.counterAttackPower;
    this.imgBox = null;
    this.role = "INITIAL";

    this.reset = function() {
        this.name = staticInfo.name;
        this.healthPoints = staticInfo.baseHealthPoints;
        this.attackPower = staticInfo.baseAttackPower;
        this.counterAttackPower = staticInfo.counterAttackPower;
        this.imgBox = null;
    };
    this.displayIn = function(parentId) { // Parent ID e.g. "characterImgList"
        parent = $(parentId); // div containing image boxes

        // <div class="imgBox">
        this.boxId = "characterIndex_" + this.characterIndex;
        var imgBox = $("<div>");
        imgBox.addClass("imgBox");
        imgBox.attr("id", this.boxId);
        imgBox.css("visibility", "visible");

        // <div class="imgBoxHeader">Name</div>
        var headerDiv = $("<div>");
        headerDiv.addClass("imgBoxHeader");
        headerDiv.text(this.name);

        // <img src="assets/images/Blank1.png" alt="Blank1" class="characterImg" id="character1">
        var newImage = $("<img>");
        newImage.attr("alt", this.name);
        newImage.addClass("characterImg");
        newImage.attr("src", this.staticInfo.imageFile);
                    
        //<div class="imgBoxFooter">000</div>
        var footerDiv = $("<div>");
        footerDiv.addClass("imgBoxFooter");
        footerDiv.attr("id", this.boxId + "_footer");
        footerDiv.text(this.healthPoints);

        imgBox.append(headerDiv);
        imgBox.append(newImage);
        imgBox.append(footerDiv);
        parent.append(imgBox);
        this.imgBox = imgBox;

        // I just created a new image box,
        // I need to register a callback when it's clicked.
        imgBox.on("click" , function() {
            rpgController.imgClick(imgBox)
        });

    }; 
    this.removeFromDisplay = function() {
        var jqId = "#" + this.boxId;
        $(jqId).remove();
    };
    this.updateHealthDisplay = function() {
        var jqId = "#" + this.boxId + "_footer";
        $(jqId).text(this.healthPoints);
    }


}

// ============================================================
// Controller
// ============================================================
rpgController = {
    startGame: function() {
        $(".imgBox").css("visibility", "hidden");
        this.gameCharacterList = [];
        this.yourCharacter = null;
        this.enemyList = [];
        this.defender = null;

        var msg = "&nbsp;<br>&nbsp;";
        $("#statusMessage").html(msg);

        $("#attackBtn").css("visibility", "hidden");
        $("#restartBtn").css("visibility", "hidden");
        this.createInitialCharacterImages();
        $("#charcterLabel").text("Select Your Character");
        this.state = "SELECT_YOUR_CHARACTER";
    },
    createInitialCharacterImages: function() {
        // Delete all the current children
        $("#characterImgList").empty();

        // Add each character into a "imgBox"
        for (var ii = 0; ii < staticCharacterList.length; ii++) {
            // Create a new character object
            newCharacter = new gameCharacter(ii);
            this.gameCharacterList.push(newCharacter);

            // Display it in the character image list
            newCharacter.displayIn("#characterImgList");
        }
    },
    selectYourCharacter: function(characterIndex) {
        // Remove all other characters from #characterImgList
        // And add them to #enemyImgList
        this.enemyList = [];
        $("#enemyImgList").empty(); // 1st clear the enemy list
        for (var ii = 0; ii < this.gameCharacterList.length; ii++) {
            var thisGameCharacter = this.gameCharacterList[ii];
            if (ii === characterIndex) {
                this.yourCharacter = thisGameCharacter;
            }
            else {
                thisGameCharacter.removeFromDisplay();
                thisGameCharacter.displayIn("#enemyImgList");
                this.enemyList.push(thisGameCharacter);
            }
        }
    },
    selectDefender: function(characterIndex) {
        // remove any children in defender image list
        $("#defenderImgList").empty();
        for (var ii = 0; ii < this.enemyList.length; ii++) {
            if (this.enemyList[ii].characterIndex === characterIndex) {
                // This is the defender we want
                // Remove it from the enemyList to defender
                this.defender = this.enemyList[ii];
                this.enemyList.splice(ii, 1);
                var boxId = this.defender.boxId;
                var jqId = "#" + boxId;
                $(jqId).remove();
                this.defender.displayIn("#defenderImgList");
            }
        }
    },
    attack: function() {
        // Attack button was clicked
        if (this.state !== "ATTACKING") {
            // Well, something went wrong if we got here
            return;
        }
        this.defender.healthPoints -= this.yourCharacter.attackPower;
        this.defender.updateHealthDisplay();
        if (this.defender.healthPoints <= 0) {
            if (this.enemyList.length === 0) {
                this.state = "YOU_WON";
                this.finishGame();
                return;
            }
            // Otherwise, go to next defender
            var msg = "You defeated '" + this.defender.name + "'<br>";
            msg += "Select the next defender";
            $("#statusMessage").html(msg);

            var jqId = "#" + this.defender.boxId;
            $(jqId).css("visibility", "hidden");
            $("#attackBtn").css("visibility", "hidden");
            $("#enemiesLabel").text("Select Enemy To Attack");
            this.state = "SELECT_DEFENDER";
            return;
        }
        this.yourCharacter.healthPoints -= this.defender.counterAttackPower;
        this.yourCharacter.updateHealthDisplay();
        this.yourCharacter.attackPower += this.yourCharacter.staticInfo.baseAttackPower;
        if (this.yourCharacter.healthPoints <= 0) {
            this.state = "YOU_LOST";
            this.finishGame();
            return;
        }

        var msg = "You attacked '" + this.defender.name;
        msg += "' for " + this.yourCharacter.attackPower + " damage <br>'";
        msg += this.defender.name + "' attacked back for ";
        msg += this.defender.counterAttackPower + " damage";
        $("#statusMessage").html(msg);
    },
    finishGame: function() {
        var msg = this.state === "YOU_WON" ? "You WON!" : "You LOST!";
        msg += "<br>&nbsp;";
        $("#statusMessage").html(msg);
        $("#attackBtn").css("visibility", "hidden");
        $("#restartBtn").css("visibility", "visible");
    },
    restart: function() {
        // Restart button was clicked
        this.startGame();
    },
    imgClick: function(jqueryElt) {
        var id = jqueryElt.attr("id");
        var characterIndex = parseInt(id.slice(id.indexOf("_")+1));

        // Select your character
        if (this.state === "SELECT_YOUR_CHARACTER") {
            this.selectYourCharacter(characterIndex);
            $("#characterLabel").text("Your Character");
            $("#enemiesLabel").text("Select Enemy To Attack");
            this.state = "SELECT_DEFENDER";
        }

        // Select (next) defender
        else if (this.state === "SELECT_DEFENDER") {
            if (characterIndex === this.yourCharacter.characterIndex) {
                // User clicked on "your character" - Ignore
            }
            else {
                this.selectDefender(characterIndex);
                movedBoxes = true;
                $("#enemiesLabel").text("Enemies Left To Attack");
                this.state = "ATTACKING";
                $("#attackBtn").css("visibility", "visible");
                var msg = "&nbsp;<br>&nbsp;";
                $("#statusMessage").html(msg);
        
            }
        }
        else {
            console.log("Wrong state?");
        }
    }
}
