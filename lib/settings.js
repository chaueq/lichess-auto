async function getSettings() {
    const def = getDefaultSettings();
    try {
        const settings = await chrome.storage.local.get('settings');
        for(mod in def.modules) {
            if(settings.modules[mod] === undefined) {
                settings.modules[mod] = def.modules[mod];
            }
            else {
                for(attr in def[mod]) {
                    if(settings.modules[mod][attr] === undefined) {
                        settings.modules[mod][attr] = def.modules[mod][attr];
                    }
                }
            }
        }
        return settings;
    }
    catch(e) {
        return def;
    }
}

function getDefaultSettings() {
    return {
        modules: {
            claim_victory: {
                enabled: true,
                url_match: /^https:\/\/lichess.org\//
            },
            computer_analysis: {
                enabled: true,
                url_match: /^https:\/\/lichess.org\/[a-zA-Z0-9]+\/(white|black)/
            },
            rating_stakes: {
                enabled: true,
                url_match: /^https:\/\/lichess.org\/[a-zA-Z0-9]+$/
            }
        }
    };
}
