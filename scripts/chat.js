Hooks.on("renderChatMessage", function(message, html, data) {
    if (!game.users.current.isGM) {
        const content = message.data.content;
        
        if (content.includes(":")) {
            const spl = content.split(":")
            const language = spl[0].toLowerCase()
            const msg = spl[1];
            if (language === 'common') {
                html[0].innerHTML = msg;
                return;
            }

            const myCharId = game.users.current.data.character;
            const myChar = game.actors.get(myCharId);
            const myLanguages = myChar.data.data.traits.languages.value;

            html[0].innerHTML = "<p style='font-family: " + spl[0] + "; font-size: 20px;'>" + scramble(msg); + "</p>";

            if(myLanguages.includes(language)) {
                html[0].innerHTML += "Übersetzung: " + msg;
            }
        }
    } 
});

Hooks.on("chatBubble", function(token, html, message, options) {
    const content = message;
        
    console.log(html);
    console.log(options);
    if (content.includes(":")) {
        const spl = content.split(":")
        const language = spl[0].toLowerCase()
        const msg = spl[1];
        console.log(html[0].innerHTML);
        if (language === 'common') {
            return;
        }
        html[0].innerHTML = html[0].innerHTML.replace(content, "<span style='font-family: " + spl[0] + ";'>" + scramble(msg) + "</span>");
        console.log(html[0].innerHTML);
    }
});

function scramble(word) {
    var stringValues = 'ABCDEFGHIJKLMNOabcdefghijklmnopqrstuvwxyzPQRSTUVWXYZ';  
    var sizeOfCharacter = stringValues.length;  
    let scramble = "";
    for (let x in word) {
        if(word[x] === ' ') {
            scramble += word[x];
            continue;
        }
        scramble += stringValues.charAt(Math.floor(Math.random() * sizeOfCharacter));
    }
    return scramble;
}