export function randRng(min, max) {
    
    if (isNaN(min) || isNaN(max) ) {
        throw new Error(`Non-numeric min/max arguments: min= ${x1}, max= ${x2}`);
    }

    if( min > max ){
        let temp = max;
        max = min;
        min = temp;
    }
    
    return Math.random() * (max - min) + min;
}
