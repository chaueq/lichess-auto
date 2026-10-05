async function isModuleEnabled(name) {
    const settings = await getSettings();
    if(settings.modules[name] === undefined) {
        return false;
    }
    else {
        return settings.modules[name].enabled;
    }
}

async function isModuleApplicable(name) {
    const settings = await getSettings();
    if(settings.modules[name] === undefined) {
        return false;
    }
    return settings.modules[name].url_match.test(window.location.href);
}