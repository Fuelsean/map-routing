export function RoundNumber(number, precision) {
    console.log('Rounding:', `number ${number} to ${precision}`);
    if(isNaN(number)){
        return 0;
    }
    let power = Math.pow(10, precision);
    console.log(power);
    let result = Math.round(number * power) / power;
    console.log(result);
    return result;
};