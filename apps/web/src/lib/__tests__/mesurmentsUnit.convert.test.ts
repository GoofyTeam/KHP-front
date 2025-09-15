import { convertMeasurement, MeasurementUnit } from '../mesurmentsUnit'

describe('convertMeasurement', () => {
  test('converts mass units correctly', () => {
    expect(convertMeasurement(1, MeasurementUnit.KILOGRAM, MeasurementUnit.GRAM)).toBe(1000)
    expect(convertMeasurement(500, MeasurementUnit.GRAM, MeasurementUnit.KILOGRAM)).toBe(0.5)
    expect(convertMeasurement(10, MeasurementUnit.DECAGRAM, MeasurementUnit.GRAM)).toBe(100)
  })

  test('converts volume units correctly', () => {
    expect(convertMeasurement(2, MeasurementUnit.LITRE, MeasurementUnit.MILLILITRE)).toBe(2000)
    expect(convertMeasurement(1500, MeasurementUnit.MILLILITRE, MeasurementUnit.LITRE)).toBe(1.5)
  })

  test('returns null for incompatible categories', () => {
    expect(convertMeasurement(1, MeasurementUnit.GRAM, MeasurementUnit.LITRE)).toBeNull()
    expect(convertMeasurement(1, MeasurementUnit.UNIT, MeasurementUnit.GRAM)).toBeNull()
  })

  test('same unit returns same value', () => {
    expect(convertMeasurement(123.45, MeasurementUnit.GRAM, MeasurementUnit.GRAM)).toBe(123.45)
  })
})

