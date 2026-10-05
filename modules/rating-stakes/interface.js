function generateUserEstimateObjects(stakes, status={type: 'ongoing'}) {
    let result = {};
    for(color in stakes) {
        result[color] = '  ' + getSign(stakes[color].win) + stakes[color].win + ' / ' + getSign(stakes[color].draw) + stakes[color].draw + ' / ' + getSign(stakes[color].loss) + stakes[color].loss
    }
    return result;
}

function getSign(x) {
    if(x > 0) return '+';
    if(x < 0) return '';
    else return '±';
}

function getHighlightClass(x) {
    if(x > 0) return 'good';
    if(x < 0) return 'bad';
    else return 'neutral';
}

function extractStatus() {
    try {
        return document.querySelector('section.status').innerText.split('•')[1].trim().split(' ')[0].toLowerCase();
    }
    catch(e) {
        return 'ongoing';
    }
}

function plainSpan(txt=' / ') {
    const obj = document.createElement('span');
    obj.innerText = txt;
    return obj;
}

function buildEstSpan(color_stakes, highlight='none', value=null) {
    const parent = document.createElement('span');
        parent.classList.add('estimates');

        const win = document.createElement('span');
            if(highlight === 'win') {
                win.classList.add(getHighlightClass(value));
                win.innerText = getSign(value) + value;
            }
            else win.innerText = getSign(color_stakes.win) + color_stakes.win;

        const draw = document.createElement('span');
            if(highlight === 'draw') {
                draw.classList.add(getHighlightClass(value));
                draw.innerText = getSign(value) + value;
            }
            else draw.innerText = getSign(color_stakes.draw) + color_stakes.draw;

        const loss = document.createElement('span');
            if(highlight === 'loss') {
                loss.classList.add(getHighlightClass(value));
                loss.innerText = getSign(value) + value;
            }
            else loss.innerText = getSign(color_stakes.loss) + color_stakes.loss;

        parent.appendChild(plainSpan('  '));
        parent.appendChild(win);
        parent.appendChild(plainSpan());
        parent.appendChild(draw);
        parent.appendChild(plainSpan());
        parent.appendChild(loss);
    return parent;
}

function getFinalChangeElement(color) {
    if(color.querySelector('good') !== null) {
        return color.querySelector('good');
    }
    if(color.querySelector('bad') !== null) {
        return color.querySelector('bad');
    }
    return color.querySelectorAll('span')[1];
}