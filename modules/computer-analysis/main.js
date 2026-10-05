async function computer_analysis() {
    const module_name = 'computer_analysis';
    if(await isModuleEnabled(module_name) && await isModuleApplicable(module_name)) {
        const btn = document.querySelector('.computer-analysis.active form button');
        const chart = document.querySelector('.computer-analysis.active div#acpl-chart-container');
        if(btn) {
            btn.click();
        }
        else if(!chart) {
            setTimeout(computer_analysis, 200);
        }
    }
}

computer_analysis();