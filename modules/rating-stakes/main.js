(async () => {
    const module_name = 'rating_stakes';
    if(await isModuleEnabled(module_name) && await isModuleApplicable(module_name)) {
        const game_type = document.querySelector('div.setup>span').innerText.trim().toLowerCase();
        const white = document.querySelector('div.player.white>a.user-link');
        const black = document.querySelector('div.player.black>a.user-link');
        if (white === null || black === null) {
            return;
        }
        const white_user = white.href.replace(/^(https:\/\/lichess\.org)?\/@\//, '');
        const black_user = black.href.replace(/^(https:\/\/lichess\.org)?\/@\//, '');

        const white_rating = await fetchLichessPerf(white_user, game_type);
        const black_rating = await fetchLichessPerf(black_user, game_type);

        const stakes = calculateRatingStakes(
            white_rating,
            black_rating,
            game_type
        );

        estimatesMain(stakes, white, black);
    }
})();

function estimatesMain(stakes, white, black) {
    const status = extractStatus();
    if(status === 'ongoing') {
        if(document.querySelectorAll('span.estimates').length === 0) {
            white.appendChild(buildEstSpan(stakes.white));
            black.appendChild(buildEstSpan(stakes.black));
        }
        setTimeout(estimatesMain, 500, stakes, white, black);
    }
    else {
        const white = document.querySelector('div.player.white>a.user-link');
        const black = document.querySelector('div.player.black>a.user-link');

        const white_fin_obj = getFinalChangeElement(white);
        const black_fin_obj = getFinalChangeElement(black);

        if(white_fin_obj !== null && black_fin_obj !== null) {
            const white_highlight = status === 'white' ? 'win' : status === 'black' ? 'loss' : 'draw';
            const black_highlight = status === 'black' ? 'win' : status === 'white' ? 'loss' : 'draw';

            const white_fin_value = parseInt(white_fin_obj.innerText.replace('−', '-').replace('±', ''));
            const black_fin_value = parseInt(black_fin_obj.innerText.replace('−', '-').replace('±', ''));

            white_fin_obj.remove();
            black_fin_obj.remove();

            white.appendChild(buildEstSpan(stakes.white, white_highlight, white_fin_value));
            black.appendChild(buildEstSpan(stakes.black, black_highlight, black_fin_value));
        }
        else {
            setTimeout(estimatesMain, 200, stakes, white, black);
        }
    }
}