async function fetchAudioData(location, context) {
    try {
        const response = await fetch(location);
        const arrayBuffer = await response.arrayBuffer();
        return await context.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.warn(e.message, e.name, e.code);
    }
}


export { fetchAudioData };