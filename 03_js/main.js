let currentScene = "start";

let history = [];

let flags = {
    fairyKey: false,
    holyCharm: false
};

let currentBGM = new Audio();
currentBGM.preload = "auto";

const itemData = {
    fireWand: "炎の杖",
    fairyKey: "妖精の鍵",
    lifeBranch: "折れた生命樹の枝",
    willoWisp:"光の精霊"
};

// 全エンディングID一覧
const endingList = [
    "end_1[穴]",
    "end_2[保存食]",
    "end_3[必要な仕事]",
    "end_4[アーティスト]",
    "end_5[眩しい部屋]",
    "end_6[白と黒]",
    "end_7[柵の向こう]",
    "end_8[ジジイ見参]",
    "end_9[雲の中]",
    "end_10[天罰]",
    "end_11[獣]",
    "end_12[もし異世界転生者だったら]",
    "end_13[問題ない夜]",
    "end_14[神隠し]",
    "end_15[嵐の夜の帰り道]",
    "end_special[陰陽少女は動じない・おしまい]"
];

// 回収済エンディング
let clearedEndings = {};

function hasRequiredItems(requiredItems = []) {
    return requiredItems.every(itemId => flags[itemId] === true);
}

function getItemNames(itemIds = []) {
    return itemIds.map(itemId => itemData[itemId] || itemId);
}

function updateInventoryDisplay() {
    const inventoryList = document.getElementById("inventoryList");
    inventoryList.innerHTML = "";

    const ownedItems = Object.keys(flags).filter(itemId => flags[itemId] === true);

    if (ownedItems.length === 0) {
        const li = document.createElement("li");
        li.textContent = "なし";
        li.className = "empty-inventory";
        inventoryList.appendChild(li);
        return;
    }

     ownedItems.forEach(itemId => {
        const li = document.createElement("li");
        li.textContent = itemData[itemId] || itemId;
        inventoryList.appendChild(li);
    });
}

function updateEndingStatus(){

    const total = endingList.length;

    const cleared = Object.keys(clearedEndings).length;

    const statusDiv = document.getElementById("endingStatus");

    statusDiv.textContent = `END回収 ${cleared} / ${total}`;
}

function showScene(id, addToHistory = true){

    const scene = story[id];

    if (addToHistory) {
        history.push(id);
    }

    if(scene.effect){
        scene.effect();
    }

     if (scene.bgm) {
        currentSceneHasBGM = true;
        playBGM(scene.bgm);
    } else {
        currentSceneHasBGM = false;
        stopBGM();
    }
    
    if(scene.endingId){
    clearedEndings[scene.endingId] = true;
}

    const textDiv = document.getElementById("text");
    const choicesDiv = document.getElementById("choices");
    const backButton = document.getElementById("backButton");

    textDiv.innerText = scene.text;
    choicesDiv.innerHTML = "";

    scene.choices.forEach(choice =>{

        const choiceBlock = document.createElement("div");
        choiceBlock.className = "choice-block";

        const button = document.createElement("button");
        button.className = "choice-button";
        button.innerText = choice.text;

        const requiredItems = choice.requiredItems || [];
        const canSelect = hasRequiredItems(requiredItems);

        if (!canSelect) {
            button.disabled = true;
        } else {
            button.onclick = () => {
                showScene(choice.next);
            };
        }

        choiceBlock.appendChild(button);

        if (requiredItems.length > 0) {
            const requirementText = document.createElement("div");
            requirementText.className = "choice-requirement";
            requirementText.textContent = `必要アイテム: ${getItemNames(requiredItems).join("、")}`;
            choiceBlock.appendChild(requirementText);
        }

        choicesDiv.appendChild(choiceBlock);

    });

    if(history.length <= 1){
        backButton.style.display = "none";
    }else{
        backButton.style.display = "block";
    }

    


    updateInventoryDisplay();
    updateEndingStatus();
    updateMusicPanel();

    window.scrollTo(0, 0);

}


let currentBGMSource = "";
let currentSceneHasBGM = false;

function stopBGM() {
    currentBGM.pause();
    currentBGM.currentTime = 0;
    currentBGM.removeAttribute("src");
    currentBGM.load();
    currentBGMSource = "";
}

function playBGM(src) {
    if (currentBGMSource !== src) {
        stopBGM();
        currentBGM.src = src;
        currentBGMSource = src;
    }

    

     currentBGM.loop = false;
    currentBGM.play().catch(() => {
        console.log("BGMを再生できませんでした");
    });
}

function updateMusicPanel() {
    const musicButton = document.getElementById("musicToggleButton");

    if (!musicButton) {
        return;
    }

    if (!currentSceneHasBGM) {
        musicButton.textContent = "no data";
        musicButton.disabled = true;
        return;
    }

       musicButton.disabled = false;

    if (currentBGM.paused) {
        musicButton.textContent = "▶";
    } else {
        musicButton.textContent = "‖";
    }
}

document.getElementById("musicToggleButton").onclick = () => {
    if (!currentSceneHasBGM) {
        return;
    }

    if (currentBGM.paused) {
        currentBGM.play().catch(() => {
            console.log("BGMを再生できませんでした");
        });
    } else {
        currentBGM.pause();
    }

    updateMusicPanel();
};

currentBGM.addEventListener("ended", () => {
    updateMusicPanel();
});

document.getElementById("backButton").onclick = ()=>{

    if(history.length > 1){
        history.pop(); // 今のシーン削除
        const previous = history.pop(); // 前のシーン
        showScene(previous, true);
    }

};

document.getElementById("title").onclick = () => {
    history = [];
    showScene("start");
};

showScene("start");