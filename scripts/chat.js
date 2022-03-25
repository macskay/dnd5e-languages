DND_LANGS = [
    'aarakocra',
    'abyssal',
    'aquan',
    'auran',
    'celestial',
    'deep',
    'common',
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
    'undercommon'
];

function _setupLanguages() {
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
            if (lang === 'cant') {
                return;  // skip Thieve's Can't
            }
            const longCapital = lang.charAt(0).toUpperCase() + lang.slice(1);
            options += '<option value="' + lang + '"' + (lang === 'common' ? ' selected=""' : '') + '>' + longCapital + '</option>';
        });

        let langSelect = $(
            '<div id="dnd5e-languages" class="flexrow" style="flex: 0 0 28px; margin: 0 6px; align-content: center;">' + 
                '<select id="dnd5e-lang" class="roll-type-select" name="language" style="background: rgba(255, 255, 245, 0.8);">' + 
                    '<optgroup label="Language">' + 
                        options + 
                    '</optgroup>'+
                '</select>' + 
            '</div>');
        langSelect.insertAfter(closest);
    }
}

function _scramble(message) {
    var stringValues = 'abcdefghijklmnopqrstuvwxyz';  
    var sizeOfCharacter = stringValues.length;  
    let scramble = '';
    let bCap = true;
    message.split('').forEach((char) => {
        if (char === ' ') {
            scramble += char;
            bCap = true;
            return;
        }
        let scrambledChar = stringValues.charAt(Math.floor(Math.random() * sizeOfCharacter));
        scramble += bCap ? scrambledChar.toUpperCase() : scrambledChar;
        bCap = false;
    });
    return scramble;
}

Hooks.on('ready', () => {
    _setupLanguages();
});

Hooks.on('updateActor', (_, change) => {
    let actorId = change._id;
    const myCharId = game.users.current.data.character;
    if (myCharId === actorId) {
       _setupLanguages();
    }
});

Hooks.on('chatMessage', (chatLog, message, chatData) => {
    console.log(message);
    const cls = ChatMessage.implementation;
    chatData.content = message;

    message = message.replace(/\n/g, '<br>');
    let [command, match] = chatLog.constructor.parse(message);
    
    if ( command === 'invalid' ) throw new Error(game.i18n.format('CHAT.InvalidCommand', {command: match[1]}));
    else if ( command === 'none' ) command = chatData.speaker.token ? 'ic' : 'ooc';

    console.log(command);
    const createOptions = {};
    switch (command) {
      case 'roll': case 'gmroll': case 'blindroll': case 'selfroll': case 'publicroll':
        await chatLog._processDiceCommand(command, match, chatData, createOptions);
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
    chatData.content = langCapital + ': ' + chatData.content;
    cls.create(chatData, createOptions);

    return false;
});

Hooks.on('renderChatMessage', (message, html) => {
    const msg = message.data.content;
    const language = message.data.content.split(':')[0];    
    let messageContent = html.find('.message-content');
    if (!language || language.toLowerCase() === 'common') {
        messageContent[0].innerHTML = msg.split(':')[1];
        return;
    }

    if (language !== 'halfling') {
        messageContent[0].innerHTML = '<p style=\'font-family: ' + language + '; font-size: 20px;\'>' + _scramble(msg.split(':')[1]) + '</p>';
    } else {
        messageContent[0].innerHTML = _scramble(msg.split(':')[1]) + '<br>';
    }
    if (!game.users.current.isGM) {
        const myCharId = game.users.current.data.character;
        const myChar = game.actors.get(myCharId);
        const myLanguages = myChar.data.data.traits.languages.value;

        if(myLanguages.includes(language.toLowerCase())) {
            messageContent[0].innerHTML += msg;
        }
    } else {
        messageContent[0].innerHTML += msg;
    }
});

Hooks.on('chatBubble', (_token, html, message) => {
    const content = message;
        
    if (content.includes(':')) {
        const spl = content.split(':');
        const language = spl[0].toLowerCase();
        const msg = spl[1];
        if (language === 'common') {
            html[0].innerHTML = html[0].innerHTML.replace(content, msg);
            return;
        }
        html[0].innerHTML = html[0].innerHTML.replace(content, '<span style=\'font-family: ' + spl[0] + ';\'>' + _scramble(msg) + '</span>');
    }
});