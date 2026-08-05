/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['widechoice-ecommerce.s3.eu-north-1.amazonaws.com'],
    },
};

export default nextConfig;
