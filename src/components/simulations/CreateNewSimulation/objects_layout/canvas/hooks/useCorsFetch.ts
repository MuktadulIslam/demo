import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';

export const useCorsFetch = (url: string) => {
    const blobUrlRef = useRef<string | null>(null);

    const query = useQuery({
        queryKey: ['cors-fetch', url],
        queryFn: async (): Promise<string> => {
            if (!url) {
                throw new Error('URL is required');
            }

            const proxies = [
                `https://corsproxy.io/?${encodeURIComponent(url)}`,                 // Fast and stable
                `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,    // Good uptime
                `https://thingproxy.freeboard.io/fetch/${url}`,                     // Reliable backup
                `https://cors-anywhere.herokuapp.com/${url}`,                       // Often rate-limited, use as fallback
                `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,// Slower but works
                // `https://proxy.cors.sh/${meshyUrl}`, // Fast, reliable, no rate limits - commented out due to QUIC issues
            ];

            let lastError: Error | null = null;
            for (const proxyUrl of proxies) {
                try {
                    const response = await fetch(proxyUrl, {
                        signal: AbortSignal.timeout(30000),
                        headers: { 'Accept': 'application/octet-stream, */*' }
                    });

                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const blob = new Blob([arrayBuffer]);

                        if (blobUrlRef.current) {
                            URL.revokeObjectURL(blobUrlRef.current);
                        }

                        const blobUrl = URL.createObjectURL(blob);
                        blobUrlRef.current = blobUrl;
                        return blobUrl;
                    }
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                }
            }

            throw new Error(lastError?.message || 'All CORS proxies failed');
        },
        enabled: !!url,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        staleTime: Infinity,
    });

    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }
        };
    }, [url]);

    return query;
};