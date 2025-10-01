export interface CorsFetchProgress {
    loaded: number;
    total?: number;
}

interface CorsFetchOptions {
    onProgress?: (progress: CorsFetchProgress) => void;
}

interface CorsFetchResult {
    blobUrl: string;
    totalBytes: number;
}

export const corsDataFetch = async (url: string, options: CorsFetchOptions = {}): Promise<CorsFetchResult> => {
    if (!url) {
        throw new Error('URL is required');
    }

    const { onProgress } = options;

    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,                 // Fast and stable
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,    // Good uptime
        `https://thingproxy.freeboard.io/fetch/${url}`,                     // Reliable backup
        `https://cors-anywhere.herokuapp.com/${url}`,                       // Often rate-limited, use as fallback
        `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,// Slower but works
        // `https://proxy.cors.sh/${url}`, // Fast, reliable, no rate limits - commented out due to QUIC issues
    ];

    let lastError: Error | null = null;

    for (const proxyUrl of proxies) {
        try {
            const response = await fetch(proxyUrl, {
                signal: AbortSignal.timeout(450000),
                headers: { 'Accept': 'application/octet-stream, */*' }
            });

            if (response.ok) {
                const total = Number(response.headers.get('content-length') ?? '0') || undefined;
                const reader = response.body?.getReader();

                if (!reader) {
                    const arrayBuffer = await response.arrayBuffer();
                    const blob = new Blob([arrayBuffer]);
                    const blobUrl = URL.createObjectURL(blob);
                    const totalBytes = arrayBuffer.byteLength;
                    onProgress?.({ loaded: totalBytes, total });
                    return { blobUrl, totalBytes };
                }

                const chunks: BlobPart[] = [];
                let loaded = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    if (value) {
                        chunks.push(value);
                        loaded += value.byteLength;
                        onProgress?.({ loaded, total });
                    }
                }

                const blob = new Blob(chunks);
                const blobUrl = URL.createObjectURL(blob);
                const totalBytes = loaded;
                onProgress?.({ loaded: totalBytes, total });

                return { blobUrl, totalBytes };
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }

    throw new Error(lastError?.message || 'All CORS proxies failed');
};