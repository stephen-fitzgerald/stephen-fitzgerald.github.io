// @ts-check
/*jshint esversion: 6 */

//@ts-ignore
import { decycle } from './serialize.mjs';

let styles = {
    number: 'style="color:darkorange;" ',
    key: 'style="color:rgb(12, 2, 150);" ',
    string: 'style="color:green;" ',
    boolean: 'style="color:darkorange;" ',
    null: 'style="color:magenta;" '
};

let classes = {
    number: 'class="number" ',
    key: 'class="key" ',
    string: 'class="string" ',
    boolean: 'class="boolean" ',
    null: 'class="null" ',
};

function isString(obj) {
    return !!(typeof obj === 'string' || obj instanceof String);
}

export function printToHTML(theText, color, parentElement=document.body ) {
    if (typeof theText != 'string') {
        theText = JSON.stringify(theText, undefined, 4);
    }
    let pre = document.createElement("PRE");
    pre.innerHTML = theText;
    if (color && isString(color)) {
        // @ts-ignore
        pre.style.color = color;
    }
    parentElement.appendChild(pre);
}

export function printHighlightedHTML(theText) {
    printToHTML(syntaxHighlight(theText));
}

export function printArrayToHTML(theArray, parentElement=document.body) {
    if (!Array.isArray(theArray)) {
        return;
    }
    let pre = document.createElement("PRE");
    let theText = "[ ";
    for (let i = 0; i < theArray.length; i++) {
        if (i > 0) {
            theText = theText + ', ';
        }
        theText = theText + theArray[i];
    }
    theText = theText + " ]";
    pre.innerHTML = theText;
    parentElement.appendChild(pre);
}

export function printMatrixToHTML(theMatrix, parentElement=document.body) {
    document.body.appendChild(document.createElement("BR"));
    let table = document.createElement("TABLE");
    for (let r = 0; r < theMatrix[0].length; r++) {
        // @ts-ignore
        let row = table.insertRow();
        for (let c = 0; c < theMatrix[r].length; c++) {
            let cell = row.insertCell();
            cell.innerHTML = theMatrix[r][c].toPrecision(4);
            cell.align = 'right';
            if ((r >= 3 && c < 3) || (r < 3 && c >= 3)) {
                cell.style.background = 'rgb(225,225,225)';
            }
        }
    }
    let tStyle = table.style;
    tStyle.border = '1px solid gray';
    tStyle.borderCollapse = 'collapse';
    tStyle.width = '80%';
    tStyle.tableLayout = "fixed";
    parentElement.appendChild(table);
}

export function applyPrecision(num) {
    return String(Number(num).toPrecision(4));
}


/**
 * Returns a syntax highlighted string of html that contains
 * a stringified Version of the input object.
 *
 * @export
 * @param {string | object} txt
 * @returns {string} an html string
 */
export function syntaxHighlight(txt) {
    if (typeof txt != 'string') {
        txt = JSON.stringify(decycle(txt), undefined, 4);
    }
    txt = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return txt.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        // added
        if (cls === 'number') {
            match = applyPrecision(match);
        }
        // end of added
        return '<span ' + classes[cls] + styles[cls] + '>' + match + '</span>';
    });
}
