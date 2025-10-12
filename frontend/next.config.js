/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        viewTransition: true
    },
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.EXS_BASE_URL}/:path*`,
            }
        ];
    },
};

module.exports = nextConfig;
