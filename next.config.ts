import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

// ANALYZE=true npm run build 실행 시 .next/analyze 폴더에 번들 리포트 생성
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {}

export default withBundleAnalyzer(nextConfig)
