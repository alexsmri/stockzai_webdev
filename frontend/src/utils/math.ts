export function calcAverage(list: number[]) {
    return list.reduce(
    (partialSum, a) => 
        (partialSum as number) + (a as number), 0
    ) / list.length;
}