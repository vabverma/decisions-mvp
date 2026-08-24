import dns from 'dns';
import net from 'net';

const IPV4_BLOCKED_RANGES: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16], // includes 169.254.169.254 cloud metadata
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isBlockedIPv4(ip: string): boolean {
  const ipInt = ipv4ToInt(ip);
  return IPV4_BLOCKED_RANGES.some(([base, prefix]) => {
    const baseInt = ipv4ToInt(base);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (ipInt & mask) === (baseInt & mask);
  });
}

function isBlockedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' ||
    normalized.startsWith('fe80:') || // link-local
    normalized.startsWith('fc') || // unique local fc00::/7
    normalized.startsWith('fd') ||
    normalized.startsWith('::ffff:') // IPv4-mapped, checked separately below
  );
}

/**
 * Resolves the URL's hostname and rejects it if it (or any resolved address)
 * points at a private, loopback, link-local, or cloud-metadata IP range —
 * defends against SSRF including DNS-rebinding, not just literal IP hostnames.
 */
export async function isSafeExternalUrl(urlString: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  if (url.hostname === 'localhost') {
    return false;
  }

  if (net.isIP(url.hostname)) {
    return net.isIP(url.hostname) === 4
      ? !isBlockedIPv4(url.hostname)
      : !isBlockedIPv6(url.hostname);
  }

  try {
    const addresses = await dns.promises.lookup(url.hostname, { all: true });
    return addresses.every((addr) =>
      addr.family === 4 ? !isBlockedIPv4(addr.address) : !isBlockedIPv6(addr.address)
    );
  } catch {
    return false;
  }
}
