DND_LANGS = [
    'aarakocra',
    'abyssal',
    'aquan',
    'auran',
    'celestial',
    'common',
    'deep',
    'draconic',
    'druidic',
    'dwarvish',
    'elvish',
    'giant',
    'gith',
    'gnoll',
    'gnomish',
    'goblin',
    'halfling',
    'ignan',
    'infernal',
    'orc',
    'primordial',
    'sylvan',
    'terran',
    'cant',
    'undercommon'
];

Hooks.on('chatMessage', function(chatLog, message, chatData) {

    const cls = ChatMessage.implementation;
    chatData.content = message;

    message = message.replace(/\n/g, '<br>');
    let [command, match] = chatLog.constructor.parse(message);
    
    if ( command === 'invalid' ) throw new Error(game.i18n.format('CHAT.InvalidCommand', {command: match[1]}));
    else if ( command === 'none' ) command = chatData.speaker.token ? 'ic' : 'ooc';

    const createOptions = {};
    switch (command) {
      case 'roll': case 'gmroll': case 'blindroll': case 'selfroll': case 'publicroll':
        chatLog._processDiceCommand(command, match, chatData, createOptions);
        break;
      case 'whisper': case 'reply': case 'gm': case 'players':
        chatLog._processWhisperCommand(command, match, chatData, createOptions);
        break;
      case 'ic': case 'emote': case 'ooc':
         chatLog._processChatCommand(command, match, chatData, createOptions);
        break;
      case 'macro':
        chatLog._processMacroCommand(command, match);
        return;
    }

    const language = $('#dnd5e-lang').val();
    const langCapital = language.charAt(0).toUpperCase() + language.slice(1);
    chatData.content = langCapital + ': ' + message;
    cls.create(chatData, createOptions).then((chatMessage) => {
        if (language) {
            chatMessage.setFlag('world', 'lang', language);
        }
    });

    return false;
});

Hooks.on('ready', function() {
    const closest = $('#chat-form');
    if (closest.length === 1) {

        let options = '';
  
        let myLangs = {};
        if (!game.users.current.isGM) {
            const myCharId = game.users.current.data.character;
            const myChar = game.actors.get(myCharId);
            myLangs = myChar.data.data.traits.languages.value;
        } else {
            myLangs = DND_LANGS;
        }
        
        myLangs.forEach((lang) => {
            const longCapital = lang.charAt(0).toUpperCase() + lang.slice(1);
            options += '<option value="' + lang + '">' + longCapital + '</option>';
        });

        let langSelect = $(
            '<div class="flexrow" style="flex: 0 0 28px; margin: 0 6px; align-content: center;">' + 
                '<select id="dnd5e-lang" class="roll-type-select" name="language" style="background: rgba(255, 255, 245, 0.8);">' + 
                    '<optgroup label="Language">' + 
                        options + 
                    '</optgroup>'+
                '</select>' + 
            '</div>');
        langSelect.insertAfter(closest);
    }
});

Hooks.on('renderChatMessage', function(message, html) {
    const msg = message.data.content;
    const language = message.getFlag('world', 'lang');
    if (!language || language.toLowerCase() === 'common') {
        html[0].innerHTML = msg;
        return;
    }

    html[0].innerHTML = '<p style=\'font-family: ' + language + '; font-size: 20px;\'>' + scramble(msg); + '</p>';
    if (!game.users.current.isGM) {
        const myCharId = game.users.current.data.character;
        const myChar = game.actors.get(myCharId);
        const myLanguages = myChar.data.data.traits.languages.value;

        if(myLanguages.includes(language.toLowerCase())) {
            html[0].innerHTML += msg;
        }
    } else {
        html[0].innerHTML += msg;
    }
});

Hooks.on('chatBubble', function(_token, html, message) {
    const content = message;
        
    if (content.includes(':')) {
        const spl = content.split(':');
        const language = spl[0].toLowerCase();
        const msg = spl[1];
        if (language === 'common') {
            return;
        }
        html[0].innerHTML = html[0].innerHTML.replace(content, '<span style=\'font-family: ' + spl[0] + ';\'>' + scramble(msg) + '</span>');
    }
});

function scramble(word) {
    var stringValues = 'ABCDEFGHIJKLMNOabcdefghijklmnopqrstuvwxyzPQRSTUVWXYZ               ';  
    var sizeOfCharacter = stringValues.length;  
    let scramble = '';
    word.split('').forEach(() => {
        scramble += stringValues.charAt(Math.floor(Math.random() * sizeOfCharacter));
    });
    return scramble;
}