export function extractEventId(urlOrId: string): string | null {
    const match = urlOrId.match(/event\/(\d+)/);
    if(match){
        return match[1];
    }

    if (/^\d+$/.test(urlOrId)){
        return urlOrId;
    }

    return null;
}