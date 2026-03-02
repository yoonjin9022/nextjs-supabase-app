import { describe, expect, it } from 'vitest'

import type { FeeStructure } from '@/lib/types/parking.types'
import {
  calculateFee,
  calculateFeeResult,
  calculateTimingOptions,
  estimateTimeToBudget,
  formatCountdown,
  formatElapsed,
  msToNextIncrease,
} from '@/lib/utils/parking-fee'

// 테스트용 기본 요금 구조
// 기본: 30분 1000원, 이후 10분마다 500원, 일 최대 5000원
const DEFAULT_FS: FeeStructure = {
  baseDuration: 30,
  baseFee: 1000,
  unitDuration: 10,
  unitFee: 500,
  maxDailyFee: 5000,
}

// 일 최대요금 없는 요금 구조
const NO_MAX_FS: FeeStructure = {
  baseDuration: 30,
  baseFee: 1000,
  unitDuration: 10,
  unitFee: 500,
}

describe('calculateFee', () => {
  it('0ms 경과 시 baseFee를 반환한다', () => {
    expect(calculateFee(0, DEFAULT_FS)).toBe(1000)
  })

  it('baseDuration*60000ms 정확히 경과 시 baseFee를 반환한다', () => {
    // 30분 정확히 = 1800000ms
    expect(calculateFee(30 * 60000, DEFAULT_FS)).toBe(1000)
  })

  it('baseDuration*60000ms + 1ms 경과 시 baseFee를 반환한다 (아직 1분 미만)', () => {
    // 30분 + 1ms = 기본요금 구간 직후지만 floor로 여전히 30분 = baseFee
    expect(calculateFee(30 * 60000 + 1, DEFAULT_FS)).toBe(1000)
  })

  it('(baseDuration+1)*60000ms 경과 시 baseFee + 1*unitFee를 반환한다', () => {
    // 31분 경과: 1000 + ceil(1/10)*500 = 1000 + 1*500 = 1500
    expect(calculateFee(31 * 60000, DEFAULT_FS)).toBe(1500)
  })

  it('(baseDuration+unitDuration)*60000ms 경과 시 baseFee + 1*unitFee를 반환한다 (경계값)', () => {
    // 40분 경과: extraMinutes=10, ceil(10/10)*500 = 1*500 = 500 → 1000+500=1500
    expect(calculateFee(40 * 60000, DEFAULT_FS)).toBe(1500)
  })

  it('(baseDuration+unitDuration+1)*60000ms 경과 시 baseFee + 2*unitFee를 반환한다', () => {
    // 41분 경과: extraMinutes=11, ceil(11/10)*500 = 2*500 = 1000 → 1000+1000=2000
    expect(calculateFee(41 * 60000, DEFAULT_FS)).toBe(2000)
  })

  it('maxDailyFee를 초과하는 경우 maxDailyFee를 반환한다', () => {
    // 100분 경과: extraMinutes=70, ceil(70/10)*500 = 7*500 = 3500 → 1000+3500=4500
    // 하지만 maxDailyFee=5000이므로 4500 반환 (아직 미초과)
    expect(calculateFee(100 * 60000, DEFAULT_FS)).toBe(4500)
    // 110분 경과: extraMinutes=80, ceil(80/10)*500 = 8*500 = 4000 → 1000+4000=5000 = maxDailyFee
    expect(calculateFee(110 * 60000, DEFAULT_FS)).toBe(5000)
    // 150분 경과: extraMinutes=120, ceil(120/10)*500 = 12*500 = 6000 → 1000+6000=7000 > 5000 → 5000
    expect(calculateFee(150 * 60000, DEFAULT_FS)).toBe(5000)
  })

  it('maxDailyFee 없는 경우 요금이 계속 증가한다', () => {
    // 150분 경과: extraMinutes=120, ceil(120/10)*500 = 12*500 = 6000 → 1000+6000=7000
    expect(calculateFee(150 * 60000, NO_MAX_FS)).toBe(7000)
  })
})

describe('msToNextIncrease', () => {
  it('기본 요금 구간 내에서 구간 종료까지 남은 ms를 반환한다', () => {
    // 0ms 경과 시: 30분 남음 = 1800000ms
    expect(msToNextIncrease(0, DEFAULT_FS)).toBeCloseTo(30 * 60000, 0)
  })

  it('추가 요금 구간에서 다음 단위 경계까지 남은 ms를 반환한다', () => {
    // 35분 경과 시: extraMinutes=5, nextBoundary=10, 5분 남음 = 300000ms
    expect(msToNextIncrease(35 * 60000, DEFAULT_FS)).toBeCloseTo(5 * 60000, 0)
  })
})

describe('calculateFeeResult', () => {
  it('FeeResult 객체를 올바른 구조로 반환한다', () => {
    const result = calculateFeeResult(0, DEFAULT_FS)
    expect(result).toHaveProperty('fee')
    expect(result).toHaveProperty('elapsedMs')
    expect(result).toHaveProperty('msToNextIncrease')
    expect(result).toHaveProperty('isMaxReached')
    expect(result).toHaveProperty('currentSection')
  })

  it('기본 요금 구간에서 isMaxReached가 false이다', () => {
    const result = calculateFeeResult(0, DEFAULT_FS)
    expect(result.isMaxReached).toBe(false)
    expect(result.currentSection).toContain('기본요금 구간')
  })

  it('최대요금 도달 시 isMaxReached가 true이다', () => {
    const result = calculateFeeResult(150 * 60000, DEFAULT_FS)
    expect(result.isMaxReached).toBe(true)
    expect(result.msToNextIncrease).toBe(0)
  })

  it('추가 요금 구간에서 currentSection이 추가요금 구간 정보를 포함한다', () => {
    const result = calculateFeeResult(35 * 60000, DEFAULT_FS)
    expect(result.currentSection).toContain('추가요금 구간')
  })
})

describe('calculateTimingOptions', () => {
  it('4개의 TimingOption을 반환한다', () => {
    const options = calculateTimingOptions(0, DEFAULT_FS)
    expect(options).toHaveLength(4)
  })

  it('첫 번째 옵션은 "지금" 레이블이고 offsetMinutes가 0이다', () => {
    const options = calculateTimingOptions(0, DEFAULT_FS)
    expect(options[0].label).toBe('지금')
    expect(options[0].offsetMinutes).toBe(0)
    expect(options[0].isSame).toBe(true)
    expect(options[0].diff).toBe(0)
  })

  it('순서대로 지금/+5분/+10분/+30분 레이블을 가진다', () => {
    const options = calculateTimingOptions(0, DEFAULT_FS)
    expect(options[0].label).toBe('지금')
    expect(options[1].label).toBe('+5분')
    expect(options[2].label).toBe('+10분')
    expect(options[3].label).toBe('+30분')
  })

  it('시간이 지남에 따라 요금이 증가하거나 동일하다', () => {
    const options = calculateTimingOptions(25 * 60000, DEFAULT_FS)
    // 각 옵션의 요금은 이전 옵션보다 크거나 같아야 한다
    for (let i = 1; i < options.length; i++) {
      expect(options[i].fee).toBeGreaterThanOrEqual(options[i - 1].fee)
    }
  })
})

describe('estimateTimeToBudget', () => {
  it('예산이 baseFee보다 작은 경우 baseDuration*60000을 반환한다', () => {
    // 예산 500원 < baseFee 1000원 → 30분 = 1800000ms
    expect(estimateTimeToBudget(DEFAULT_FS, 500)).toBe(30 * 60000)
  })

  it('예산이 baseFee와 같은 경우 baseDuration*60000을 반환한다', () => {
    // 예산 1000원 = baseFee 1000원 → 30분 = 1800000ms
    expect(estimateTimeToBudget(DEFAULT_FS, 1000)).toBe(30 * 60000)
  })

  it('정상 케이스: 예산 범위 내 최대 주차 가능 시간을 반환한다', () => {
    // 예산 2000원: baseFee 1000 + 2단위(1000원) → 30분 + 20분 = 50분 = 3000000ms
    expect(estimateTimeToBudget(NO_MAX_FS, 2000)).toBe(50 * 60000)
  })

  it('예산이 maxDailyFee 이상인 경우 null을 반환한다', () => {
    // 예산이 maxDailyFee(5000원) 이상이면 사실상 무제한
    expect(estimateTimeToBudget(DEFAULT_FS, 5000)).toBeNull()
  })
})

describe('formatElapsed', () => {
  it('3661000ms를 01:01:01로 변환한다', () => {
    expect(formatElapsed(3661000)).toBe('01:01:01')
  })

  it('0ms를 00:00:00으로 변환한다', () => {
    expect(formatElapsed(0)).toBe('00:00:00')
  })

  it('3600000ms(1시간)를 01:00:00으로 변환한다', () => {
    expect(formatElapsed(3600000)).toBe('01:00:00')
  })

  it('59999ms를 00:00:59로 변환한다 (floor)', () => {
    expect(formatElapsed(59999)).toBe('00:00:59')
  })
})

describe('formatCountdown', () => {
  it('65000ms를 01:05로 변환한다', () => {
    expect(formatCountdown(65000)).toBe('01:05')
  })

  it('0ms를 00:00으로 변환한다', () => {
    expect(formatCountdown(0)).toBe('00:00')
  })

  it('음수 ms는 00:00으로 변환한다', () => {
    expect(formatCountdown(-1000)).toBe('00:00')
  })

  it('60000ms를 01:00으로 변환한다', () => {
    expect(formatCountdown(60000)).toBe('01:00')
  })
})
