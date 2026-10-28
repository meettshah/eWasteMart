/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'widechoice-ecommerce.s3.eu-north-1.amazonaws.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
    transpilePackages: ['@nextui-org/react'],
};

export default nextConfig;
