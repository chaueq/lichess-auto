(async () => {
    const module_name = 'claim_victory';
    if(await isModuleEnabled(module_name) && await isModuleApplicable(module_name)) {
        setInterval(() => {
            const btn = document.querySelector(".suggestion .button:nth-of-type(1)");
            if(btn) {
                btn.click();
            }
        }, 200);
    }
})();