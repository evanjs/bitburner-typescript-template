export function money(value: number): string {
	return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
}

export function ram(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const finalRam = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    return finalRam;
}

export function rightAlign(value: string, colWidth: number): string {
    const spaces = colWidth - (value + "").length;
    return new Array(spaces).fill(" ").join("") + value;
}